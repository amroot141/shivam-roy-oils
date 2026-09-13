# MustardPay — Deployment & Backend Architecture Guide

This guide explains where data is currently stored, how to plug in a cloud database (Supabase, Firebase, or Node/REST), and how to deploy MustardPay to production.

---

## 1. Where the Backend Data is Stored

Currently, MustardPay uses a **browser-persistent LocalStorage database adapter** ([`src/services/db.js`](file:///C:/Users/BITXS/.gemini/antigravity-ide/scratch/mustardpay/src/services/db.js)).

### Storage Keys & Schemas:
| Storage Key | Data Contained | Description |
|---|---|---|
| `mustardpay_inventory_v1` | Array of Product objects | Product ID, name, unit, unit price (₹), stock quantity, feedback discount % |
| `mustardpay_bills_v1` | Array of Bill transactions | Bill ID, customer details, line items, totals, discount saved, payment type, feedback |
| `mustardpay_settings_v1` | Settings object | Store name, address, static merchant UPI QR image data URL, UPI VPA address |
| `mustardpay_auth_session_v1` | Auth Session object | Logged in user name, email, role (`admin` or `staff`) |

### Pluggable Architecture (How to Connect a Real Backend):
Because all data operations are strictly decoupled inside [`src/services/`](file:///C:/Users/BITXS/.gemini/antigravity-ide/scratch/mustardpay/src/services/):
- `inventoryService.js`
- `billService.js`
- `settingsService.js`
- `analyticsService.js`

To switch to **Supabase** or **Firebase Firestore** or **Express REST API**:
1. Simply replace the `LocalStorageDB.get()` / `LocalStorageDB.set()` calls inside the service files with your database client (e.g. `supabase.from('inventory').select('*')`).
2. Zero changes are required in your UI components, router, or math utilities (`cart.js`).

---

## 2. How to Export Data

You can export store data at any time from the **Admin Dashboard (`/dashboard`)**:
- **Export Data Center (Modal)**: Click the **"Export Data"** button in the dashboard top header or on the Overview card.
- **Available Export Datasets**:
  1. **Inventory**: CSV (Excel-ready) or JSON (Product ID, Name, Unit, Price, Stock, Discount %).
  2. **Sales & Bills**: CSV or JSON (Bill ID, Date, Customer Name, Phone, Items, Subtotal, Discount, Grand Total, Payment Mode, Change).
  3. **Discounts Breakdown**: CSV or JSON (Feedback-triggered discounts, savings amount, discount %).
  4. **Customer Loyalty & Feedback**: CSV or JSON (Phone, Name, Visits, Total Spend, Feedback Counts, Sentiment %, Loyalty Tier).
  5. **Full System Backup**: Complete JSON snapshot of all tables and settings.
- **Contextual One-Click CSV Buttons**:
  - In **Inventory Manager Table**: Click `Export CSV`.
  - In **Recent Bills Table**: Click `Export Sales CSV` or `Export Discounts`.
  - In **Customer Loyalty Widget**: Click `Export Loyalty CSV`.

---

## 3. How to Deploy MustardPay

### Option A: Vercel (Fastest & Recommended)
1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   vercel
   ```
2. Or push the code to GitHub and import the repository into [Vercel](https://vercel.com):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - SPA routing is already pre-configured via `vercel.json`.

### Option B: Netlify
1. Run:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```
   SPA routing is pre-configured via `public/_redirects`.

### Option C: Firebase Hosting
1. Install Firebase CLI and initialize:
   ```bash
   npx -y firebase-tools login
   npx -y firebase-tools init hosting
   ```
   - Public directory: `dist`
   - Configure as single-page app: `Yes`
2. Build and deploy:
   ```bash
   npm run build
   npx -y firebase-tools deploy --only hosting
   ```

### Option D: Self-Hosted (VPS / Nginx / Node)
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Serve using Node:
   ```bash
   npx serve -s dist -l 3000
   ```
3. Or configure Nginx with:
   ```nginx
   server {
       listen 80;
       server_name yourstore.com;
       root /var/www/mustardpay/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
