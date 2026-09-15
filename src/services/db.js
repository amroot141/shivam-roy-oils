/**
 * Local Storage Pluggable Database Layer for Shivam Roy Oils
 * Pre-seeded with authentic store inventory, past 7 days of transactions,
 * and store settings. Can be easily swapped with Supabase, Firebase, or a REST API.
 */

const STORAGE_KEYS = {
  INVENTORY: 'shivamroyoils_inventory_v1',
  BILLS: 'shivamroyoils_bills_v1',
  SETTINGS: 'shivamroyoils_settings_v1',
  USERS: 'shivamroyoils_users_v1',
};

// Default Static UPI QR SVG as data URI
const DEFAULT_UPI_QR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><rect width='200' height='200' fill='%23ffffff'/><rect x='20' y='20' width='50' height='50' fill='%231c1917'/><rect x='30' y='30' width='30' height='30' fill='%23ffffff'/><rect x='35' y='35' width='20' height='20' fill='%23d97706'/><rect x='130' y='20' width='50' height='50' fill='%231c1917'/><rect x='140' y='30' width='30' height='30' fill='%23ffffff'/><rect x='145' y='35' width='20' height='20' fill='%23d97706'/><rect x='20' y='130' width='50' height='50' fill='%231c1917'/><rect x='30' y='140' width='30' height='30' fill='%23ffffff'/><rect x='35' y='145' width='20' height='20' fill='%23d97706'/><rect x='85' y='25' width='30' height='15' fill='%231c1917'/><rect x='95' y='50' width='20' height='25' fill='%23d97706'/><rect x='85' y='85' width='30' height='30' fill='%231c1917'/><rect x='25' y='85' width='45' height='25' fill='%231c1917'/><rect x='130' y='85' width='25' height='40' fill='%231c1917'/><rect x='165' y='85' width='15' height='25' fill='%23d97706'/><rect x='85' y='130' width='20' height='45' fill='%231c1917'/><rect x='120' y='140' width='40' height='20' fill='%231c1917'/><rect x='145' y='165' width='25' height='15' fill='%23d97706'/><text x='100' y='195' font-family='sans-serif' font-size='9' text-anchor='middle' fill='%2378350f' font-weight='bold'>UPI SCAN &amp; PAY</text></svg>";

const SEED_SETTINGS = {
  id: 'settings_default',
  store_name: 'Shivam Roy Oils',
  tagline: 'Farm-Fresh Cold Pressed Oils & Spices',
  upi_vpa: 'shivamroyoils@upi',
  upi_qr_image_url: DEFAULT_UPI_QR,
  address: 'Shop 14, Kisan Mandi Complex, Ring Road',
  phone: '+91 98765 01234',
  low_stock_threshold: 10,
  tax_rate: 0,
  self_checkout_discount_enabled: true,
  custom_upi_deep_link: '',
  // Receipt / Printing Template Customization
  receipt_store_name: 'Shivam Roy Oils',
  receipt_tagline: 'Farm-Fresh Cold Pressed Oils & Spices',
  receipt_address: 'Shop 14, Kisan Mandi Complex, Ring Road',
  receipt_phone: '+91 98765 01234',
  receipt_gstin: '07AAAAA0000A1Z5',
  receipt_fssai_no: '10020051000123',
  receipt_msme_no: 'UDYAM-DL-00-1234567',
  receipt_logo_url: '',
  receipt_show_logo: true,
  receipt_header_note: 'Tax Invoice / Retail Bill',
  receipt_footer_note: 'Thank you for supporting pure & organic produce! Visit again.',
  receipt_show_customer_info: true,
  receipt_show_discounts: true,
  receipt_show_payment_mode: true,
  receipt_show_qr: true,
  receipt_paper_width: '80mm',
  receipt_font_size: 'medium'
};

const SEED_INVENTORY = [
  {
    id: 'prod-mustard-yellow-1l',
    product_name: 'Pure Yellow Mustard Oil (Kachi Ghani)',
    unit: 'bottle',
    stock_quantity: 50,
    unit_price: 210,
    discount_type: 'percent',
    discount_percent: 10,
    discount_flat: 0
  },
  {
    id: 'prod-mustard-black-1l',
    product_name: 'Black Mustard Oil (Cold Pressed)',
    unit: 'bottle',
    stock_quantity: 40,
    unit_price: 190,
    discount_type: 'percent',
    discount_percent: 8,
    discount_flat: 0
  },
  {
    id: 'prod-groundnut-1l',
    product_name: 'Groundnut Oil (Wood Pressed)',
    unit: 'bottle',
    stock_quantity: 35,
    unit_price: 240,
    discount_type: 'percent',
    discount_percent: 5,
    discount_flat: 0
  },
  {
    id: 'prod-sesame-500ml',
    product_name: 'Pure Sesame (Til) Oil',
    unit: 'bottle',
    stock_quantity: 25,
    unit_price: 180,
    discount_type: 'percent',
    discount_percent: 5,
    discount_flat: 0
  },
  {
    id: 'prod-flaxseed-250ml',
    product_name: 'Flaxseed (Alsi) Oil',
    unit: 'bottle',
    stock_quantity: 20,
    unit_price: 150,
    discount_type: 'percent',
    discount_percent: 0,
    discount_flat: 0
  },
  {
    id: 'prod-mustard-seeds-1kg',
    product_name: 'Organic Yellow Mustard Seeds',
    unit: 'kg',
    stock_quantity: 60,
    unit_price: 120,
    discount_type: 'percent',
    discount_percent: 0,
    discount_flat: 0
  },
  {
    id: 'prod-turmeric-500g',
    product_name: 'Pure Turmeric Powder (Haldi)',
    unit: 'piece',
    stock_quantity: 45,
    unit_price: 140,
    discount_type: 'percent',
    discount_percent: 5,
    discount_flat: 0
  }
];

// Helper to generate ISO timestamps for past N days
function getPastDate(daysAgo, hour = 14, min = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const SEED_BILLS = [];

const SEED_USERS = [
  {
    id: 'user_1',
    name: 'Store Admin',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    email: 'admin@shivamroyoils.com',
    phone: '+91 98765 01234',
    security_question: 'What is your favorite color?',
    security_answer: 'blue',
    created_at: new Date().toISOString()
  }
];

export class LocalStorageDB {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (err) {
      console.error(`Error reading ${key} from storage:`, err);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing ${key} to storage:`, err);
    }
  }

  /**
   * Initializes local database with seed data if not present
   */
  static init() {
    const existingSettings = LocalStorageDB.get(STORAGE_KEYS.SETTINGS, null);
    if (!existingSettings) {
      LocalStorageDB.set(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    } else {
      // Merge new template settings if missing
      const merged = { ...SEED_SETTINGS, ...existingSettings };
      if (existingSettings.self_checkout_discount_enabled === undefined) {
        merged.self_checkout_discount_enabled = true;
      }
      LocalStorageDB.set(STORAGE_KEYS.SETTINGS, merged);
    }

    const existingInventory = LocalStorageDB.get(STORAGE_KEYS.INVENTORY, null);
    if (existingInventory === null) {
      LocalStorageDB.set(STORAGE_KEYS.INVENTORY, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
      LocalStorageDB.set(STORAGE_KEYS.BILLS, SEED_BILLS);
    }
    const existingUsers = LocalStorageDB.get(STORAGE_KEYS.USERS, null);
    if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
      LocalStorageDB.set(STORAGE_KEYS.USERS, SEED_USERS);
    }
  }

  /**
   * Resets database back to default seed data
   */
  static resetToSeed() {
    LocalStorageDB.set(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    LocalStorageDB.set(STORAGE_KEYS.INVENTORY, SEED_INVENTORY);
    LocalStorageDB.set(STORAGE_KEYS.BILLS, SEED_BILLS);
    LocalStorageDB.set(STORAGE_KEYS.USERS, SEED_USERS);
    return true;
  }
}

export { STORAGE_KEYS, SEED_SETTINGS, SEED_INVENTORY, SEED_BILLS, SEED_USERS, DEFAULT_UPI_QR };
