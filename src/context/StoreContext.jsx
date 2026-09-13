import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';
import { billService } from '../services/billService';
import { settingsService } from '../services/settingsService';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invData, billsData, settData] = await Promise.all([
        inventoryService.getInventory(),
        billService.getBills(),
        settingsService.getSettings()
      ]);
      setInventory(invData);
      setBills(billsData);
      setSettings(settData);
      setError(null);
    } catch (err) {
      console.error('Failed to load store data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleCreateBill = async (billData) => {
    const created = await billService.createBill(billData);
    // Reload state so inventory counts and bills sync across all views
    await loadData();
    return created;
  };

  const handleAddProduct = async (productData) => {
    const created = await inventoryService.addProduct(productData);
    await loadData();
    return created;
  };

  const handleUpdateProduct = async (id, updates) => {
    const updated = await inventoryService.updateProduct(id, updates);
    await loadData();
    return updated;
  };

  const handleDeleteProduct = async (id) => {
    const res = await inventoryService.deleteProduct(id);
    await loadData();
    return res;
  };

  const handleAdjustStock = async (id, delta) => {
    const updated = await inventoryService.adjustStock(id, delta);
    await loadData();
    return updated;
  };

  const handleUpdateSettings = async (updates) => {
    const updated = await settingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  const handleResetStore = async () => {
    await settingsService.resetToDefaults();
    await loadData();
  };

  return (
    <StoreContext.Provider
      value={{
        inventory,
        bills,
        settings,
        loading,
        error,
        refresh: loadData,
        createBill: handleCreateBill,
        addProduct: handleAddProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        adjustStock: handleAdjustStock,
        updateSettings: handleUpdateSettings,
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
