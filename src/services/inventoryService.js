import { LocalStorageDB, STORAGE_KEYS } from './db';
import { db, collection, doc, getDocs, setDoc, deleteDoc, withTimeout } from './firebase';

/**
 * Inventory Service
 * Instant local cache reads with fast non-blocking Firestore sync.
 */
export const inventoryService = {
  /**
   * Fetches all inventory items (instant local first, background sync)
   * @returns {Promise<Array<Object>>}
   */
  async getInventory() {
    LocalStorageDB.init();
    const local = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);

    // Try fast Firestore fetch (max 600ms timeout)
    const snap = await withTimeout(getDocs(collection(db, 'inventory')), 600, null);
    if (snap && !snap.empty) {
      const remoteItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      LocalStorageDB.set(STORAGE_KEYS.INVENTORY, remoteItems);
      return remoteItems;
    }

    return local;
  },

  /**
   * Fetches single product by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getProductById(id) {
    const list = await this.getInventory();
    return list.find(item => item.id === id) || null;
  },

  /**
   * Adds a new product to inventory
   * @param {Object} product
   * @returns {Promise<Object>}
   */
  async addProduct(product) {
    const list = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    const newProduct = {
      id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      product_name: String(product.product_name || '').trim(),
      unit: product.unit || 'bottle',
      stock_quantity: Math.max(0, parseInt(product.stock_quantity, 10) || 0),
      unit_price: Math.max(0, parseFloat(product.unit_price) || 0),
      discount_type: product.discount_type === 'flat' ? 'flat' : 'percent',
      discount_percent: Math.min(100, Math.max(0, parseFloat(product.discount_percent) || 0)),
      discount_flat: Math.max(0, parseFloat(product.discount_flat) || 0)
    };

    if (!newProduct.product_name) {
      throw new Error('Product name is required');
    }

    // Instant local save
    list.unshift(newProduct);
    LocalStorageDB.set(STORAGE_KEYS.INVENTORY, list);

    // Non-blocking Firestore write
    setDoc(doc(db, 'inventory', newProduct.id), newProduct).catch(err => 
      console.warn('Firestore write queued locally:', err.message)
    );

    return newProduct;
  },

  /**
   * Updates an existing product
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProduct(id, updates) {
    const list = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    const index = list.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID "${id}" not found`);
    }

    const current = list[index];
    const updated = {
      ...current,
      ...updates,
      id: current.id,
      product_name: updates.product_name !== undefined ? String(updates.product_name).trim() : current.product_name,
      unit: updates.unit || current.unit,
      stock_quantity: updates.stock_quantity !== undefined ? Math.max(0, parseInt(updates.stock_quantity, 10)) : current.stock_quantity,
      unit_price: updates.unit_price !== undefined ? Math.max(0, parseFloat(updates.unit_price)) : current.unit_price,
      discount_type: updates.discount_type !== undefined ? (updates.discount_type === 'flat' ? 'flat' : 'percent') : (current.discount_type || 'percent'),
      discount_percent: updates.discount_percent !== undefined ? Math.min(100, Math.max(0, parseFloat(updates.discount_percent))) : current.discount_percent,
      discount_flat: updates.discount_flat !== undefined ? Math.max(0, parseFloat(updates.discount_flat)) : (current.discount_flat || 0)
    };

    // Instant local save
    list[index] = updated;
    LocalStorageDB.set(STORAGE_KEYS.INVENTORY, list);

    // Non-blocking Firestore update
    setDoc(doc(db, 'inventory', id), updated).catch(err => 
      console.warn('Firestore update queued locally:', err.message)
    );

    return updated;
  },

  /**
   * Deletes a product by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteProduct(id) {
    const list = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length === list.length) {
      return false;
    }

    // Instant local update
    LocalStorageDB.set(STORAGE_KEYS.INVENTORY, filtered);

    // Non-blocking Firestore delete
    deleteDoc(doc(db, 'inventory', id)).catch(err => 
      console.warn('Firestore delete queued locally:', err.message)
    );

    return true;
  },

  /**
   * Adjusts stock quantity for a product
   * @param {string} id
   * @param {number} delta
   * @returns {Promise<Object>}
   */
  async adjustStock(id, delta) {
    const list = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    const product = list.find(p => p.id === id);
    if (!product) throw new Error('Product not found');

    const newStock = Math.max(0, (product.stock_quantity || 0) + delta);
    return this.updateProduct(id, { stock_quantity: newStock });
  },

  /**
   * Decrements stock for items purchased in a bill
   * @param {Array<{ product_id: string, quantity: number }>} items
   * @returns {Promise<boolean>}
   */
  async decrementStockForBill(items = []) {
    const list = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, []);
    const map = new Map(list.map(p => [p.id, { ...p }]));

    for (const item of items) {
      const prod = map.get(item.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - (Number(item.quantity) || 0));
        setDoc(doc(db, 'inventory', prod.id), prod).catch(err => 
          console.warn('Firestore stock sync queued:', err.message)
        );
      }
    }

    LocalStorageDB.set(STORAGE_KEYS.INVENTORY, Array.from(map.values()));
    return true;
  }
};
