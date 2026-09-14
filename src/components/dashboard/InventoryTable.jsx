import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Package, 
  ArrowUpDown,
  Download
} from 'lucide-react';
import { UnitBadge, StockBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { exportHelper } from '../../utils/exportHelper';

export function InventoryTable({ 
  inventory = [], 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onAdjustStock 
}) {
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    product_name: '',
    unit: 'bottle',
    stock_quantity: 20,
    unit_price: 150,
    discount_type: 'percent',
    discount_percent: 10,
    discount_flat: 0
  });

  const [formErrors, setFormErrors] = useState({});

  const filtered = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || item.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const resetForm = () => {
    setFormData({
      product_name: '',
      unit: 'bottle',
      stock_quantity: 20,
      unit_price: 150,
      discount_type: 'percent',
      discount_percent: 10,
      discount_flat: 0
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      product_name: prod.product_name,
      unit: prod.unit || 'bottle',
      stock_quantity: prod.stock_quantity,
      unit_price: prod.unit_price,
      discount_type: prod.discount_type || 'percent',
      discount_percent: prod.discount_percent || 0,
      discount_flat: prod.discount_flat || 0
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.product_name || !formData.product_name.trim()) {
      errs.product_name = 'Product name is required';
    }
    if (formData.stock_quantity === '' || isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0) {
      errs.stock_quantity = 'Valid non-negative stock quantity required';
    }
    if (formData.unit_price === '' || isNaN(formData.unit_price) || Number(formData.unit_price) <= 0) {
      errs.unit_price = 'Unit price must be greater than 0';
    }
    if (formData.discount_type === 'percent') {
      if (formData.discount_percent < 0 || formData.discount_percent > 100) {
        errs.discount_percent = 'Discount must be between 0% and 100%';
      }
    } else {
      if (formData.discount_flat < 0) {
        errs.discount_flat = 'Flat discount cannot be negative';
      }
      if (formData.discount_flat > Number(formData.unit_price)) {
        errs.discount_flat = 'Flat discount cannot exceed unit price';
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productPayload = {
      product_name: formData.product_name.trim(),
      unit: formData.unit,
      stock_quantity: parseInt(formData.stock_quantity, 10),
      unit_price: parseFloat(formData.unit_price),
      discount_type: formData.discount_type,
      discount_percent: formData.discount_type === 'percent' ? (parseFloat(formData.discount_percent) || 0) : 0,
      discount_flat: formData.discount_type === 'flat' ? (parseFloat(formData.discount_flat) || 0) : 0
    };

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productPayload);
      setEditingProduct(null);
    } else {
      await onAddProduct(productPayload);
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      setDeletingId(id);
      try {
        await onDeleteProduct(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
            <span>Inventory Manager</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {inventory.length} products
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            Manage store stock, pricing, and customer feedback discount triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHelper.exportInventory(inventory, 'csv')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl border border-stone-300 transition-colors cursor-pointer"
            title="Export inventory list to Excel CSV"
          >
            <Download size={14} className="text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'bottle', 'kg', 'liter', 'piece'].map(u => (
            <button
              key={u}
              type="button"
              onClick={() => setSelectedUnit(u)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedUnit === u
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-y border-stone-200">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-3 text-right">Unit Price</th>
              <th className="py-3 px-3 text-center">Stock Level</th>
              <th className="py-3 px-3 text-center">Feedback Discount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400">
                  No products found. Add a product or clear your search query.
                </td>
              </tr>
            ) : (
              filtered.map(product => {
                const isLow = (Number(product.stock_quantity) || 0) <= 10;
                return (
                  <tr key={product.id} className="hover:bg-amber-50/20 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900 text-sm">{product.product_name}</p>
                      <span className="text-[10px] font-mono text-stone-400">{product.id}</span>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3">
                      <UnitBadge unit={product.unit} />
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 text-right font-extrabold text-stone-900 text-sm">
                      {formatCurrency(product.unit_price)}
                    </td>

                    {/* Stock with quick adjust */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, -1)}
                          disabled={product.stock_quantity <= 0}
                          className="w-5 h-5 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer disabled:opacity-40"
                          title="Decrease 1"
                        >
                          -
                        </button>
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          isLow ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {product.stock_quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
                          title="Increase 1"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Feedback Discount */}
                    <td className="py-3 px-3 text-center">
                      {((product.discount_type || 'percent') === 'flat' && Number(product.discount_flat) > 0) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Sparkles size={11} className="text-emerald-600" />
                          <span>₹{product.discount_flat} OFF</span>
                        </span>
                      ) : Number(product.discount_percent) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles size={11} className="text-amber-600" />
                          <span>{product.discount_percent}% OFF</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 font-medium">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product.id, product.product_name)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Inventory Product' : 'Add New Inventory Product'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g. Pure Sarson Oil (1L)"
              className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 ${
                formErrors.product_name ? 'border-rose-400' : 'border-stone-200'
              }`}
            />
            {formErrors.product_name && (
              <p className="text-rose-500 text-[11px] mt-1">{formErrors.product_name}</p>
            )}
          </div>

          {/* Unit & Stock Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                Unit Type
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="bottle">Bottle</option>
                <option value="liter">Liter</option>
                <option value="kg">Kg</option>
                <option value="piece">Piece</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 ${
                  formErrors.stock_quantity ? 'border-rose-400' : 'border-stone-200'
                }`}
              />
              {formErrors.stock_quantity && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.stock_quantity}</p>
              )}
            </div>
          </div>

          {/* Price & Discount Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                Unit Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 ${
                  formErrors.unit_price ? 'border-rose-400' : 'border-stone-200'
                }`}
              />
              {formErrors.unit_price && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.unit_price}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-stone-600 block mb-1">
                Feedback Discount
              </label>

              {/* Discount Type Toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discount_type: 'percent' })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                    formData.discount_type === 'percent'
                      ? 'bg-white text-amber-800 shadow-xs'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  % Percent
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discount_type: 'flat' })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                    formData.discount_type === 'flat'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  ₹ Flat Amount
                </button>
              </div>

              {/* Discount Value Input */}
              {formData.discount_type === 'percent' ? (
                <>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      placeholder="e.g. 10"
                      className={`w-full px-3 py-2 pr-8 bg-stone-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 ${
                        formErrors.discount_percent ? 'border-rose-400' : 'border-stone-200'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">%</span>
                  </div>
                  {formErrors.discount_percent && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.discount_percent}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.discount_flat}
                      onChange={(e) => setFormData({ ...formData, discount_flat: e.target.value })}
                      placeholder="e.g. 15"
                      className={`w-full pl-7 pr-3 py-2 bg-stone-50 border rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 ${
                        formErrors.discount_flat ? 'border-rose-400' : 'border-stone-200'
                      }`}
                    />
                  </div>
                  {formErrors.discount_flat && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.discount_flat}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong>Note on Feedback Discount:</strong> This discount ({formData.discount_type === 'percent' ? 'percentage off' : 'flat ₹ off per unit'}) will ONLY be triggered when customers submit self-checkout feedback. Counter staff sales apply no item-level discount.
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
