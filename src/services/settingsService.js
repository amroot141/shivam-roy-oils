import { LocalStorageDB, STORAGE_KEYS, SEED_SETTINGS } from './db';
import { db, doc, getDoc, setDoc } from './firebase';

/**
 * Settings Service
 * Manages store branding, static merchant UPI QR code image link, and thresholds in Firestore.
 */
export const settingsService = {
  /**
   * Fetches current settings from Firestore with local fallback
   * @returns {Promise<Object>}
   */
  async getSettings() {
    LocalStorageDB.init();
    try {
      const snap = await getDoc(doc(db, 'settings', 'store_config'));
      if (snap.exists()) {
        const data = snap.data();
        LocalStorageDB.set(STORAGE_KEYS.SETTINGS, data);
        return data;
      }
    } catch (err) {
      console.warn('Firestore settings fetch failed:', err.message);
    }
    return LocalStorageDB.get(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
  },

  /**
   * Updates store settings in Firestore & local cache
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSettings(updates) {
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...updates,
      id: current.id || 'settings_default'
    };

    try {
      await setDoc(doc(db, 'settings', 'store_config'), updated);
    } catch (err) {
      console.warn('Firestore settings update failed:', err.message);
    }

    LocalStorageDB.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  /**
   * Resets entire store database to fresh seed data
   * @returns {Promise<boolean>}
   */
  async resetToDefaults() {
    LocalStorageDB.resetToSeed();
    try {
      await setDoc(doc(db, 'settings', 'store_config'), SEED_SETTINGS);
    } catch (err) {
      console.warn('Firestore settings reset failed:', err.message);
    }
    return true;
  }
};
