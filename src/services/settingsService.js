import { LocalStorageDB, STORAGE_KEYS, SEED_SETTINGS } from './db';
import { db, doc, getDoc, setDoc, withTimeout } from './firebase';

/**
 * Settings Service
 * Instant local cache reads with fast non-blocking Firestore sync.
 */
export const settingsService = {
  /**
   * Fetches current settings from Firestore with instant local fallback
   * @returns {Promise<Object>}
   */
  async getSettings() {
    LocalStorageDB.init();
    const local = LocalStorageDB.get(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);

    // Fast Firestore fetch (max 600ms timeout)
    const snap = await withTimeout(getDoc(doc(db, 'settings', 'store_config')), 600, null);
    if (snap && snap.exists()) {
      const data = snap.data();
      LocalStorageDB.set(STORAGE_KEYS.SETTINGS, data);
      return data;
    }

    return local;
  },

  /**
   * Updates store settings in Firestore & local cache
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSettings(updates) {
    const current = LocalStorageDB.get(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    const updated = {
      ...current,
      ...updates,
      id: current?.id || 'settings_default'
    };

    // Instant local save (0ms)
    LocalStorageDB.set(STORAGE_KEYS.SETTINGS, updated);

    // Non-blocking Firestore update in background
    setDoc(doc(db, 'settings', 'store_config'), updated).catch(err => 
      console.warn('Firestore settings update queued locally:', err.message)
    );

    return updated;
  },

  /**
   * Resets entire store database to fresh seed data
   * @returns {Promise<boolean>}
   */
  async resetToDefaults() {
    LocalStorageDB.resetToSeed();

    setDoc(doc(db, 'settings', 'store_config'), SEED_SETTINGS).catch(err => 
      console.warn('Firestore settings reset queued locally:', err.message)
    );

    return true;
  }
};
