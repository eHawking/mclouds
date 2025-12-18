import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, Plus, Edit2, Trash2, Users, Check, X, Loader2,
    ChevronDown, ChevronRight, Lock, AlertTriangle, Crown
} from 'lucide-react'
import { rolesAPI } from '../../lib/api'
import { useAuthStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEPARTMENT_LABELS = {
    users: 'Users',
    orders: 'Orders',
    tickets: 'Support Tickets',
    services: 'Services',
    billing: 'Billing & Invoices',
    settings: 'Settings',
    roles: 'Role Management',
    ai: 'AI & Bots',
    dashboard: 'Dashboard',
    domains: 'Domains',
    pricing: 'Pricing'
}

export default function AdminRoles() {
    const { user } = useAuthStore()
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState({})
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRole, setEditingRole] = useState(null)
    const [saving, setSaving] = useState(false)
    const [expandedDepts, setExpandedDepts] = useState({})
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [form, setForm] = useState({
        name: '',
        description: '',
        department: '',
        can_create_roles: false,
        permissions: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                rolesAPI.getRoles(),
                rolesAPI.getPermissions()
            ])
            setRoles(rolesRes.data.roles)
            setPermissions(permsRes.data.grouped)

            // Expand all departments by default
            const expanded = {}
            Object.keys(permsRes.data.grouped).forEach(dept => {
                expanded[dept] = true
            })
            setExpandedDepts(expanded)
        } catch (err) {
            toast.error('Failed to load roles')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingRole(null)
        setForm({
            name: '',
            description: '',
            department: '',
            can_create_roles: false,
            permissions: []
        })
        setShowModal(true)
    }

    const openEditModal = async (role) => {
        try {
            const res = await rolesAPI.getRole(role.uuid)
            setEditingRole(res.data.role)
            setForm({
                name: res.data.role.name,
                description: res.data.role.description || '',
                department: res.data.role.department || '',
                can_create_roles: res.data.role.can_create_roles,
                permissions: res.data.role.permission_ids || []
            })
            setShowModal(true)
        } catch (err) {
            toast.error('Failed to load role details')
        }
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error('Role name is required')
            return
        }

        setSaving(true)
        try {
            if (editingRole) {
                await rolesAPI.updateRole(editingRole.uuid, form)
                toast.success('Role updated successfully')
            } else {
                await rolesAPI.createRole(form)
                toast.success('Role created successfully')
            }
            setShowModal(false)
            loadData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save role')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (role) => {
        try {
            await rolesAPI.deleteRole(role.uuid)
            toast.success('Role deleted successfully')
            setDeleteConfirm(null)
            loadData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete role')
        }
    }

    const togglePermission = (permId) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(id => id !== permId)
                : [...prev.permissions, permId]
        }))
    }

    const toggleDepartment = (dept) => {
        setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }))
    }

    const selectAllDept = (dept) => {
        const deptPermIds = permissions[dept].map(p => p.id)
        const allSelected = deptPermIds.every(id => form.permissions.includes(id))

        if (allSelected) {
            setForm(prev => ({
                ...prev,
                permissions: prev.permissions.filter(id => !deptPermIds.includes(id))
            }))
        } else {
            setForm(prev => ({
                ...prev,
                permissions: [...new Set([...prev.permissions, ...deptPermIds])]
            }))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>Roles & Permissions - Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
                        <p className="text-dark-500 mt-1">Manage admin roles and access control</p>
                    </div>
                    {(user?.isSuperAdmin || user?.canCreateRoles) && (
                        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Role
                        </button>
                    )}
                </div>

                {/* Roles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => (
                        <motion.div
                            key={role.uuid}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        role.is_system
                                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                            : "bg-gradient-to-br from-primary-500 to-purple-600"
                                    )}>
                                        {role.is_system ? <Crown className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{role.name}</h3>
                                        <p className="text-sm text-dark-500">{role.user_count || 0} users</p>
                                    </div>
                                </div>
                                {role.is_system && (
                                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                        System
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-dark-500 mb-4 line-clamp-2">
                                {role.description || 'No description'}
                            </p>

                            <div className="text-sm text-dark-400 mb-4">
                                <span className="font-medium">{role.permissions?.length || 0}</span> permissions
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(role)}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {role.is_system && !user?.isSuperAdmin ? 'View' : 'Edit'}
                                </button>
                                {user?.isSuperAdmin && !role.is_system && (
                                    <button
                                        onClick={() => setDeleteConfirm(role)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {roles.length === 0 && (
                    <div className="text-center py-12 text-dark-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No roles found. Create your first role to get started.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-dark-200 dark:border-dark-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">
                                        {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Role Name *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="input"
                                                placeholder="e.g. Sales Manager"
                                                disabled={editingRole?.is_system}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Department</label>
                                            <select
                                                value={form.department}
                                                onChange={e => setForm({ ...form, department: e.target.value })}
                                                className="input"
                                            >
                                                <option value="">No specific department</option>
                                                {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="input"
                                            rows={2}
                                            placeholder="Brief description of this role..."
                                        />
                                    </div>

                                    {/* Super Admin Options */}
                                    {user?.isSuperAdmin && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.can_create_roles}
                                                    onChange={e => setForm({ ...form, can_create_roles: e.target.checked })}
                                                    className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                                                />
                                                <div>
                                                    <span className="font-medium text-amber-700 dark:text-amber-400">Allow Role Creation</span>
                                                    <p className="text-sm text-amber-600 dark:text-amber-500">Users with this role can create new roles</p>
                                                </div>
                                            </label>
                                        </div>
                                    )}

                                    {/* Permissions */}
                                    <div>
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <Lock className="w-5 h-5" />
                                            Permissions
                                        </h3>

                                        <div className="space-y-2">
                                            {Object.entries(permissions).map(([dept, perms]) => (
                                                <div key={dept} className="border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => toggleDepartment(dept)}
                                                        className="w-full flex items-center justify-between p-4 bg-dark-50 dark:bg-dark-900 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {expandedDepts[dept] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                            <span className="font-medium">{DEPARTMENT_LABELS[dept] || dept}</span>
                                                            <span className="text-sm text-dark-500">
                                                                ({perms.filter(p => form.permissions.includes(p.id)).length}/{perms.length})
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); selectAllDept(dept) }}
                                                            className="text-xs text-primary-500 hover:text-primary-600"
                                                        >
                                                            {perms.every(p => form.permissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </button>

                                                    <AnimatePresence>
                                                        {expandedDepts[dept] && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: 'auto' }}
                                                                exit={{ height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 grid sm:grid-cols-2 gap-3">
                                                                    {perms.map(perm => (
                                                                        <label
                                                                            key={perm.id}
                                                                            className={clsx(
                                                                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                                                                                form.permissions.includes(perm.id)
                                                                                    ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                                                                                    : "bg-dark-50 dark:bg-dark-800 border border-transparent hover:border-dark-200 dark:hover:border-dark-700"
                                                                            )}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={form.permissions.includes(perm.id)}
                                                                                onChange={() => togglePermission(perm.id)}
                                                                                className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                                                                            />
                                                                            <div>
                                                                                <span className="font-medium text-sm">{perm.name}</span>
                                                                                <p className="text-xs text-dark-500">{perm.slug}</p>
                                                                            </div>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-dark-200 dark:border-dark-700 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || (editingRole?.is_system && !user?.isSuperAdmin)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingRole ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Delete Role</h3>
                                    <p className="text-dark-500">Are you sure you want to delete "{deleteConfirm.name}"?</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
