import { LocalStorageDB, STORAGE_KEYS } from './db';
import { inventoryService } from './inventoryService';
import { db, collection, doc, getDocs, setDoc, query, orderBy } from './firebase';

/**
 * Bill / Transaction Service
 * Manages checkout persistence and stock synchronization with Firebase Firestore.
 */
export const billService = {
  /**
   * Fetches all bills ordered newest first
   * @returns {Promise<Array<Object>>}
   */
  async getBills() {
    LocalStorageDB.init();
    try {
      const snap = await getDocs(query(collection(db, 'bills')));
      if (!snap.empty) {
        const remoteBills = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        remoteBills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        LocalStorageDB.set(STORAGE_KEYS.BILLS, remoteBills);
        return remoteBills;
      }
    } catch (err) {
      console.warn('Firestore bills read failed, falling back to local:', err.message);
    }
    const bills = LocalStorageDB.get(STORAGE_KEYS.BILLS, []);
    return bills.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'bills', newBill.id), newBill);
    } catch (err) {
      console.warn('Firestore bill save failed, saving locally:', err.message);
    }

    // 3. Persist to Local Cache
    bills.unshift(newBill);
    LocalStorageDB.set(STORAGE_KEYS.BILLS, bills);

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
  }
};
