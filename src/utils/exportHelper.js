/**
 * Data Export Utility for Shivam Roy Oils
 * Supports exporting Inventory, Sales, Discounts, Customer Loyalty, and Full Database
 * to standard RFC 4180 CSV (Excel/Sheets compatible) and JSON formats.
 */

/**
 * Escapes and quotes CSV values cleanly
 */
function escapeCSVValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // If string contains quotes, commas, or newlines, escape quotes and wrap in quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

/**
 * Downloads a string content as a file in the browser
 */
function downloadFile(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export const exportHelper = {
  /**
   * Generates and downloads a CSV file from headers and row data
   */
  exportToCSV(headers, rows, baseFilename) {
    const headerLine = headers.map(h => escapeCSVValue(h.label)).join(',');
    const rowLines = rows.map(row => {
      return headers.map(h => {
        const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.key];
        return escapeCSVValue(val);
      }).join(',');
    });

    const csvContent = [headerLine, ...rowLines].join('\r\n');
    downloadFile(csvContent, `${baseFilename}_${getTimestamp()}.csv`, 'text/csv;charset=utf-8;');
  },

  /**
   * Generates and downloads a formatted JSON file
   */
  exportToJSON(data, baseFilename) {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, `${baseFilename}_${getTimestamp()}.json`, 'application/json;charset=utf-8;');
  },

  /**
   * 1. Export Inventory
   */
  exportInventory(inventory = [], format = 'csv') {
    if (format === 'json') {
      this.exportToJSON(inventory, 'shivamroyoils_inventory');
      return;
    }

    const headers = [
      { key: 'id', label: 'Product ID' },
      { key: 'product_name', label: 'Product Name' },
      { key: 'unit', label: 'Unit' },
      { key: 'unit_price', label: 'Unit Price (₹)' },
      { key: 'stock_quantity', label: 'Stock Quantity' },
      { key: 'discount_percent', label: 'Feedback Discount (%)' },
      {
        label: 'Stock Status',
        accessor: (row) => (row.stock_quantity <= 0 ? 'Out of Stock' : row.stock_quantity <= 10 ? 'Low Stock' : 'In Stock')
      }
    ];

    this.exportToCSV(headers, inventory, 'shivamroyoils_inventory');
  },

  /**
   * 2. Export Sales & Transactions
   */
  exportSales(bills = [], format = 'csv') {
    if (format === 'json') {
      this.exportToJSON(bills, 'shivamroyoils_sales_bills');
      return;
    }

    const headers = [
      { key: 'id', label: 'Bill ID' },
      { key: 'created_at', label: 'Date & Time' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'num_items', label: 'Item Count' },
      {
        label: 'Items Summary',
        accessor: (row) => (row.items || []).map(i => `${i.product_name} (${i.quantity} ${i.unit})`).join('; ')
      },
      { key: 'subtotal', label: 'Subtotal (₹)' },
      { key: 'discount_amount', label: 'Discount Amount (₹)' },
      { key: 'total_amount', label: 'Grand Total (₹)' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'cash_given', label: 'Cash Given (₹)' },
      { key: 'change_returned', label: 'Change Returned (₹)' },
      { key: 'feedback', label: 'Feedback Sentiment' },
      { key: 'feedback_source', label: 'Source (self/staff)' }
    ];

    this.exportToCSV(headers, bills, 'shivamroyoils_sales_bills');
  },

  /**
   * 3. Export Discounts Breakdown
   */
  exportDiscounts(bills = [], format = 'csv') {
    // Filter to bills that had discounts or feedback
    const discountedBills = bills.filter(b => Number(b.discount_amount) > 0 || b.feedback !== 'none');

    if (format === 'json') {
      this.exportToJSON(discountedBills, 'shivamroyoils_discounts_breakdown');
      return;
    }

    const headers = [
      { key: 'id', label: 'Bill ID' },
      { key: 'created_at', label: 'Date & Time' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'subtotal', label: 'Gross Subtotal (₹)' },
      { key: 'discount_amount', label: 'Discount Saved (₹)' },
      { key: 'total_amount', label: 'Net Paid (₹)' },
      {
        label: 'Discount Percentage (%)',
        accessor: (row) => {
          const sub = Number(row.subtotal) || 0;
          const disc = Number(row.discount_amount) || 0;
          return sub > 0 ? `${Math.round((disc / sub) * 100)}%` : '0%';
        }
      },
      { key: 'feedback', label: 'Customer Feedback' },
      {
        label: 'Discounted Items Breakdown',
        accessor: (row) => {
          return (row.items || [])
            .filter(i => Number(i.discount_percent) > 0)
            .map(i => `${i.product_name} (${i.discount_percent}% off)`)
            .join('; ') || 'All standard items';
        }
      }
    ];

    this.exportToCSV(headers, discountedBills, 'shivamroyoils_discounts_breakdown');
  },

  /**
   * 4. Export Customer Loyalty & Feedback Data
   */
  exportCustomers(customerLoyaltyData = [], format = 'csv') {
    if (format === 'json') {
      this.exportToJSON(customerLoyaltyData, 'shivamroyoils_customer_loyalty');
      return;
    }

    const headers = [
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'tier', label: 'Loyalty Tier' },
      {
        label: 'Repeat Customer',
        accessor: (row) => (row.isRepeat ? 'Yes (Repeat)' : 'No (First-time)')
      },
      { key: 'total_bills', label: 'Total Visits / Bills' },
      { key: 'total_spend', label: 'Total Spend (₹)' },
      { key: 'total_feedback_submissions', label: 'Total Feedbacks Given' },
      {
        label: 'Positive (Good) Feedbacks',
        accessor: (row) => row.feedback_counts?.good || 0
      },
      {
        label: 'Constructive (Bad) Feedbacks',
        accessor: (row) => row.feedback_counts?.bad || 0
      },
      {
        label: 'Positive Sentiment Ratio',
        accessor: (row) => (row.positiveSentimentRatio !== null ? `${row.positiveSentimentRatio}%` : 'N/A')
      },
      { key: 'last_feedback', label: 'Last Feedback' },
      { key: 'last_visit', label: 'Last Visit Date' },
      { key: 'address', label: 'Customer Address' }
    ];

    this.exportToCSV(headers, customerLoyaltyData, 'shivamroyoils_customer_loyalty');
  },

  /**
   * 5. Full Database JSON Backup
   */
  exportFullBackup(inventory = [], bills = [], settings = {}) {
    const fullBackup = {
      app: 'M/S SHIVAMROY OIL AND COMPANY',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      store_settings: settings,
      total_products: inventory.length,
      total_bills: bills.length,
      inventory,
      bills
    };

    this.exportToJSON(fullBackup, 'shivamroyoils_full_database_backup');
  }
};
