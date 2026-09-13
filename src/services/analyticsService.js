/**
 * Analytics Service for Shivam Roy Oils
 * Aggregates sales metrics, Recharts datasets, and Repeat Customer Feedback & Loyalty.
 */

export const analyticsService = {
  /**
   * Computes top stat cards for "Today":
   * - Today's Sales (₹)
   * - Today's Discounts (₹)
   * - Items Sold Today (count)
   * - Low Stock Alert Count
   */
  getTodayStats(bills = [], inventory = [], lowStockThreshold = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBills = bills.filter(b => {
      const billDate = new Date(b.created_at);
      return billDate >= today;
    });

    const todaySales = todayBills.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
    const todayDiscounts = todayBills.reduce((acc, b) => acc + (Number(b.discount_amount) || 0), 0);
    const itemsSoldToday = todayBills.reduce((acc, b) => acc + (Number(b.num_items) || 0), 0);

    const lowStockCount = inventory.filter(item => (Number(item.stock_quantity) || 0) <= lowStockThreshold).length;

    return {
      todaySales: Math.round(todaySales * 100) / 100,
      todayDiscounts: Math.round(todayDiscounts * 100) / 100,
      itemsSoldToday,
      lowStockCount,
      totalBillsToday: todayBills.length
    };
  },

  /**
   * Generates 7-day sales and discount trend for Recharts AreaChart
   */
  getLast7DaysTrend(bills = []) {
    const daysMap = new Map();
    const now = new Date();

    // Initialize 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
      
      daysMap.set(dateKey, {
        date: dateKey,
        day: displayLabel,
        sales: 0,
        discount: 0,
        billsCount: 0
      });
    }

    bills.forEach(bill => {
      const dateKey = (bill.created_at || '').split('T')[0];
      if (daysMap.has(dateKey)) {
        const entry = daysMap.get(dateKey);
        entry.sales = Math.round((entry.sales + (Number(bill.total_amount) || 0)) * 100) / 100;
        entry.discount = Math.round((entry.discount + (Number(bill.discount_amount) || 0)) * 100) / 100;
        entry.billsCount += 1;
      }
    });

    return Array.from(daysMap.values());
  },

  /**
   * Computes top products by revenue for Horizontal BarChart
   */
  getTopProductsByRevenue(bills = [], limit = 5) {
    const productRevenueMap = new Map();

    bills.forEach(bill => {
      (bill.items || []).forEach(item => {
        const name = item.product_name || 'Item';
        const lineTotal = Number(item.line_total) || ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0));
        const qty = Number(item.quantity) || 0;

        if (!productRevenueMap.has(name)) {
          productRevenueMap.set(name, {
            name: name.length > 22 ? name.substring(0, 20) + '...' : name,
            fullName: name,
            revenue: 0,
            quantity: 0
          });
        }
        const current = productRevenueMap.get(name);
        current.revenue = Math.round((current.revenue + lineTotal) * 100) / 100;
        current.quantity += qty;
      });
    });

    return Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  /**
   * Computes payment method distribution (UPI vs Cash) for Donut Chart
   */
  getPaymentBreakdown(bills = []) {
    let upiTotal = 0;
    let upiCount = 0;
    let cashTotal = 0;
    let cashCount = 0;

    bills.forEach(bill => {
      const amount = Number(bill.total_amount) || 0;
      if (bill.payment_method === 'cash') {
        cashTotal += amount;
        cashCount += 1;
      } else {
        upiTotal += amount;
        upiCount += 1;
      }
    });

    return [
      { name: 'UPI', value: Math.round(upiTotal), count: upiCount, color: '#d97706' }, // Amber
      { name: 'Cash', value: Math.round(cashTotal), count: cashCount, color: '#16a34a' } // Emerald
    ];
  },

  /**
   * Computes inventory stock distribution for Bar Chart
   */
  getStockLevels(inventory = []) {
    return inventory.map(item => ({
      name: item.product_name.length > 18 ? item.product_name.substring(0, 16) + '...' : item.product_name,
      fullName: item.product_name,
      stock: Number(item.stock_quantity) || 0,
      unit: item.unit || 'unit',
      isLow: (Number(item.stock_quantity) || 0) <= 10
    }));
  },

  /**
   * REPEAT CUSTOMER FEEDBACK & LOYALTY ANALYTICS
   * Groups bills by customer `phone`, calculates repeat counts,
   * sentiment distribution ('good' vs 'bad'), loyalty tier, and last visit.
   * 
   * @param {Array<Object>} bills
   * @returns {Array<Object>} Sorted list of customers with repeat stats
   */
  getCustomerFeedbackAnalytics(bills = []) {
    const customerMap = new Map();

    bills.forEach(bill => {
      // Normalize phone as unique identifier
      const rawPhone = String(bill.phone || '').trim().replace(/\D/g, '');
      const phoneKey = rawPhone || `walkin-${bill.id}`;
      const customerName = bill.customer_name || 'Valued Customer';
      const feedback = bill.feedback; // 'good', 'bad', 'none'
      const billDate = new Date(bill.created_at || Date.now());

      if (!customerMap.has(phoneKey)) {
        customerMap.set(phoneKey, {
          phone: rawPhone || 'N/A',
          phoneKey,
          customer_name: customerName,
          address: bill.address || '',
          total_bills: 0,
          total_spend: 0,
          total_feedback_submissions: 0,
          feedback_counts: {
            good: 0,
            bad: 0,
            none: 0
          },
          last_visit: bill.created_at,
          last_feedback: feedback,
          bills: []
        });
      }

      const record = customerMap.get(phoneKey);
      record.total_bills += 1;
      record.total_spend += Number(bill.total_amount) || 0;
      record.bills.push(bill);

      // Keep latest customer name if updated
      if (customerName && customerName !== 'Walk-in Customer') {
        record.customer_name = customerName;
      }

      // Track feedback
      if (feedback === 'good') {
        record.feedback_counts.good += 1;
        record.total_feedback_submissions += 1;
      } else if (feedback === 'bad') {
        record.feedback_counts.bad += 1;
        record.total_feedback_submissions += 1;
      } else {
        record.feedback_counts.none += 1;
      }

      // Track most recent visit timestamp
      if (new Date(record.last_visit) < billDate) {
        record.last_visit = bill.created_at;
        record.last_feedback = feedback;
      }
    });

    // Transform into enriched analytics list
    const customers = Array.from(customerMap.values()).map(cust => {
      const isRepeat = cust.total_bills > 1;
      
      // Loyalty Score calculation:
      // Base: total_bills * 10 + good feedback * 5 - bad feedback * 2
      const loyaltyPoints = (cust.total_bills * 10) + (cust.feedback_counts.good * 5) - (cust.feedback_counts.bad * 2);
      
      let tier = 'New Shopper';
      let tierColor = 'stone';
      if (cust.total_bills >= 4) {
        tier = 'Gold VIP';
        tierColor = 'amber';
      } else if (cust.total_bills >= 2) {
        tier = 'Silver Regular';
        tierColor = 'yellow';
      }

      const positiveSentimentRatio = cust.total_feedback_submissions > 0
        ? Math.round((cust.feedback_counts.good / cust.total_feedback_submissions) * 100)
        : null;

      return {
        ...cust,
        total_spend: Math.round(cust.total_spend * 100) / 100,
        isRepeat,
        loyaltyPoints: Math.max(0, loyaltyPoints),
        tier,
        tierColor,
        positiveSentimentRatio
      };
    });

    // Sort by repeat customers first, then by total bills descending
    return customers.sort((a, b) => {
      if (b.isRepeat !== a.isRepeat) {
        return b.isRepeat ? 1 : -1;
      }
      return b.total_bills - a.total_bills;
    });
  }
};
