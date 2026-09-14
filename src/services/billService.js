import { LocalStorageDB, STORAGE_KEYS } from './db';
import { inventoryService } from './inventoryService';
import { db, collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, withTimeout } from './firebase';

/**
 * Bill / Transaction Service
 * Instant local cache reads with fast non-blocking Firestore sync.
 */
export const billService = {
  /**
   * Fetches all bills ordered newest first (instant local first, fast sync)
   * @returns {Promise<Array<Object>>}
   */
  async getBills() {
    LocalStorageDB.init();
    const local = LocalStorageDB.get(STORAGE_KEYS.BILLS, []);

    // Try fast Firestore fetch (max 600ms timeout)
    const snap = await withTimeout(getDocs(query(collection(db, 'bills'))), 600, null);
    if (snap && !snap.empty) {
      const remoteBills = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      remoteBills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      LocalStorageDB.set(STORAGE_KEYS.BILLS, remoteBills);
      return remoteBills;
    }

    return local.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Fetches a single bill by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getBillById(id) {
    const bills = await this.getBills();
    return bills.find(b => b.id === id) || null;
  },

  /**
   * Creates a new bill and decrements inventory stock
   * @param {Object} billData
   * @returns {Promise<Object>}
   */
  async createBill(billData) {
    const bills = await this.getBills();
    
    // Generate human-friendly Bill ID
    const nextNum = 1001 + bills.length;
    const billId = `BILL-${nextNum}`;

    const newBill = {
      id: billId,
      customer_name: String(billData.customer_name || 'Walk-in Customer').trim(),
      phone: String(billData.phone || '').trim(),
      address: String(billData.address || '').trim(),
      items: Array.isArray(billData.items) ? billData.items : [],
      num_items: Number(billData.num_items) || (billData.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0),
      subtotal: Math.round((Number(billData.subtotal) || 0) * 100) / 100,
      discount_amount: Math.round((Number(billData.discount_amount) || 0) * 100) / 100,
      total_amount: Math.round((Number(billData.total_amount) || 0) * 100) / 100,
      payment_method: billData.payment_method === 'cash' ? 'cash' : 'upi',
      cash_given: billData.payment_method === 'cash' ? (Number(billData.cash_given) || null) : null,
      change_returned: billData.payment_method === 'cash' ? (Number(billData.change_returned) || 0) : null,
      feedback: ['good', 'bad', 'none'].includes(billData.feedback) ? billData.feedback : 'none',
      feedback_source: billData.feedback_source === 'staff' ? 'staff' : 'self',
      created_at: billData.created_at || new Date().toISOString()
    };

    // 1. Decrement inventory stock for the sold items
    if (newBill.items.length > 0) {
      await inventoryService.decrementStockForBill(newBill.items);
    }

    // 2. Persist to Local Cache immediately (0ms)
    bills.unshift(newBill);
    LocalStorageDB.set(STORAGE_KEYS.BILLS, bills);

    // 3. Non-blocking Firestore write in background
    setDoc(doc(db, 'bills', newBill.id), newBill).catch(err => 
      console.warn('Firestore bill save queued locally:', err.message)
    );

    return newBill;
  },

  /**
   * Fetches the latest N bills (default 50)
   * @param {number} limit
   * @returns {Promise<Array<Object>>}
   */
  async getRecentBills(limit = 50) {
    const bills = await this.getBills();
    return bills.slice(0, limit);
  },

  /**
   * Deletes a bill by ID from local cache and Firestore.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteBill(id) {
    const bills = LocalStorageDB.get(STORAGE_KEYS.BILLS, []);
    const updated = bills.filter(b => b.id !== id);
    LocalStorageDB.set(STORAGE_KEYS.BILLS, updated);

    // Non-blocking Firestore delete in background
    deleteDoc(doc(db, 'bills', id)).catch(err =>
      console.warn('Firestore bill delete queued locally:', err.message)
    );

    return true;
  }
};
