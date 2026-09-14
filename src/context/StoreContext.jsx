import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalStorageDB, STORAGE_KEYS, SEED_SETTINGS } from '../services/db';
import { inventoryService } from '../services/inventoryService';
import { billService } from '../services/billService';
import { settingsService } from '../services/settingsService';
import { db, collection, doc, query, onSnapshot } from '../services/firebase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Initialize LocalStorage database
  LocalStorageDB.init();

  // Instant 0ms hydration from local persistent cache
  const [inventory, setInventory] = useState(() => LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []));
  const [bills, setBills] = useState(() => LocalStorageDB.get(STORAGE_KEYS.BILLS, []));
  const [settings, setSettings] = useState(() => LocalStorageDB.get(STORAGE_KEYS.SETTINGS, SEED_SETTINGS));
  
  // NEVER block the screen with full-page loader if we already have local cache
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fast background sync without blocking the user interface
  const loadData = useCallback(async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      const [invData, billsData, settData] = await Promise.all([
        inventoryService.getInventory((remoteInv) => {
          if (Array.isArray(remoteInv) && remoteInv.length > 0) {
            setInventory(remoteInv);
          }
        }),
        billService.getBills(),
        settingsService.getSettings()
      ]);
      setInventory(invData);
      setBills(billsData);
      setSettings(settData);
      setError(null);
    } catch (err) {
      console.warn('Background sync note:', err.message);
      setError(err.message);
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Non-blocking background sync on initial mount
    loadData(false);

    // Realtime bidirectional sync for Inventory
    const unsubInv = onSnapshot(collection(db, 'inventory'), (snap) => {
      if (snap && !snap.empty) {
        const remoteItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const localItems = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
        const remoteMap = new Map(remoteItems.map(i => [i.id, i]));
        
        // Combine remote items with any unsynced local items
        const merged = [...remoteItems];
        for (const localItem of localItems) {
          if (!remoteMap.has(localItem.id)) {
            merged.push(localItem);
            inventoryService.addProduct(localItem).catch(() => {});
          }
        }

        setInventory(merged);
        LocalStorageDB.set(STORAGE_KEYS.INVENTORY, merged);
      }
    }, (err) => {
      console.warn('Firestore realtime inventory sync error:', err.message);
    });

    // Realtime bidirectional sync for Bills
    const unsubBills = onSnapshot(query(collection(db, 'bills')), (snap) => {
      if (snap && !snap.empty) {
        const remoteBills = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        remoteBills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setBills(remoteBills);
        LocalStorageDB.set(STORAGE_KEYS.BILLS, remoteBills);
      }
    }, (err) => {
      console.warn('Firestore realtime bills sync error:', err.message);
    });

    // Realtime sync for Settings (UPI, QR, store name, etc.)
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (snap) => {
      if (snap && snap.exists()) {
        const data = snap.data();
        setSettings(data);
        LocalStorageDB.set(STORAGE_KEYS.SETTINGS, data);
      }
    }, (err) => {
      console.warn('Firestore realtime settings sync error:', err.message);
    });

    return () => {
      unsubInv();
      unsubBills();
      unsubSettings();
    };
  }, [loadData]);

  // Actions with Instant Optimistic UI Updates (0ms response time)
  const handleCreateBill = async (billData) => {
    const created = await billService.createBill(billData);
    // Instant optimistic update in React state
    setBills(prev => [created, ...prev.filter(b => b.id !== created.id)]);
    const currentInv = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    setInventory(currentInv);
    return created;
  };

  const handleAddProduct = async (productData) => {
    const created = await inventoryService.addProduct(productData);
    setInventory(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    return created;
  };

  const handleUpdateProduct = async (id, updates) => {
    const updated = await inventoryService.updateProduct(id, updates);
    setInventory(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const handleDeleteProduct = async (id) => {
    const res = await inventoryService.deleteProduct(id);
    setInventory(prev => prev.filter(p => p.id !== id));
    return res;
  };

  const handleDeleteBill = async (id) => {
    const res = await billService.deleteBill(id);
    setBills(prev => prev.filter(b => b.id !== id));
    return res;
  };

  const handleUpdateBillFeedback = async (id, feedback) => {
    const res = await billService.updateBillFeedback(id, feedback);
    setBills(prev => prev.map(b => b.id === id ? { ...b, feedback } : b));
    return res;
  };

  const handleAdjustStock = async (id, delta) => {
    const updated = await inventoryService.adjustStock(id, delta);
    setInventory(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const handleUpdateSettings = async (updates) => {
    const updated = await settingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  const handleSyncInventoryToCloud = async () => {
    const count = await inventoryService.syncAllToFirestore();
    await loadData(false);
    return count;
  };

  const handleResetStore = async () => {
    await settingsService.resetToDefaults();
    setInventory(LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []));
    setBills(LocalStorageDB.get(STORAGE_KEYS.BILLS, []));
    setSettings(LocalStorageDB.get(STORAGE_KEYS.SETTINGS, SEED_SETTINGS));
  };

  return (
    <StoreContext.Provider
      value={{
        inventory,
        bills,
        settings,
        loading,
        error,
        refresh: () => loadData(false),
        createBill: handleCreateBill,
        deleteBill: handleDeleteBill,
        updateBillFeedback: handleUpdateBillFeedback,
        addProduct: handleAddProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        adjustStock: handleAdjustStock,
        updateSettings: handleUpdateSettings,
        syncInventoryToCloud: handleSyncInventoryToCloud,
        resetStore: handleResetStore
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
