import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Edit, Trash2, X, Check, Loader2, Search, Star, DollarSign } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useCurrencyStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminProducts() {
  const { format } = useCurrencyStore()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({ 
    queryKey: ['admin-products'], 
    queryFn: () => adminAPI.getProducts().then(res => res.data) 
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories().then(res => res.data)
  })

  const handleDelete = async () => {
    if (!deleteDialog.product) return
    setDeleteLoading(true)
    try {
      await adminAPI.deleteProduct(deleteDialog.product.uuid)
      toast.success('Product deleted')
      refetch()
      setDeleteDialog({ open: false, product: null })
    } catch (err) {
      toast.error('Failed to delete product')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredProducts = (data?.products || []).filter(p => 
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Helmet><title>Products - Admin - Magnetic Clouds</title></Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Products
          </h1>
          <p className="text-dark-500 mt-1">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price (Monthly)</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {filteredProducts.map(product => (
                <tr key={product.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.is_featured && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                            <Star className="w-3 h-3 fill-current" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-dark-500">{product.category_name || 'Uncategorized'}</td>
                  <td className="p-4 font-medium">{product.price_monthly ? format(product.price_monthly) : 'N/A'}</td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      product.is_active 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setEditingProduct(product); setShowModal(true) }}
                      className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteDialog({ open: true, product })}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Products Found</h2>
          <p className="text-dark-500 mb-6">
            {search ? 'No products match your search.' : 'Create your first product to get started.'}
          </p>
          {!search && (
            <button 
              onClick={() => { setEditingProduct(null); setShowModal(true) }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
          )}
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingProduct(null) }}
            product={editingProduct}
            categories={categoriesData?.categories || []}
            onSave={() => { refetch(); setShowModal(false); setEditingProduct(null) }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
        icon={Trash2}
        loading={deleteLoading}
      />
    </>
  )
}

// Product Modal Component
function ProductModal({ isOpen, onClose, product, categories, onSave }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    features: [],
    price_monthly: 0,
    price_annually: 0,
    setup_fee: 0,
    is_featured: false,
    is_active: true,
    ...product
  })
  const [newFeature, setNewFeature] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category_id) {
      toast.error('Name and category are required')
      return
    }

    setLoading(true)
    try {
      if (product?.uuid) {
        await adminAPI.updateProduct(product.uuid, form)
        toast.success('Product updated')
      } else {
        await adminAPI.createProduct(form)
        toast.success('Product created')
      }
      onSave()
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(prev => ({ ...prev, features: [...(prev.features || []), newFeature.trim()] }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-dark-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                className="input"
                required
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price_monthly}
                onChange={(e) => setForm(prev => ({ ...prev, price_monthly: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Annual Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price_annually}
                onChange={(e) => setForm(prev => ({ ...prev, price_annually: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Setup Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.setup_fee}
                onChange={(e) => setForm(prev => ({ ...prev, setup_fee: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Add a feature..."
                className="input flex-1"
              />
              <button type="button" onClick={addFeature} className="btn-secondary">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.features || []).map((feature, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-dark-100 dark:bg-dark-700 rounded-full text-sm">
                  {feature}
                  <button type="button" onClick={() => removeFeature(i)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {product ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
