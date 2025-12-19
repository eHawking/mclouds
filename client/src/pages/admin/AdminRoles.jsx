import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, Plus, Edit2, Trash2, Users, Check, X,
    Loader2, AlertTriangle, ChevronDown, ChevronUp, Lock
} from 'lucide-react'
import { rolesAPI, adminAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PERMISSION_CATEGORIES = {
    users: { label: 'Users', actions: ['view', 'create', 'edit', 'delete'] },
    orders: { label: 'Orders', actions: ['view', 'create', 'edit', 'delete'] },
    tickets: { label: 'Support Tickets', actions: ['view', 'reply', 'close', 'delete'] },
    settings: { label: 'Settings', actions: ['view', 'edit', 'manage_roles'] },
    pricing: { label: 'Pricing & Plans', actions: ['view', 'edit'] },
    content: { label: 'Pages & Content', actions: ['view', 'edit', 'delete'] },
    invoices: { label: 'Invoices', actions: ['view', 'create', 'edit', 'delete'] },
    proposals: { label: 'Proposals', actions: ['view', 'create', 'edit', 'delete'] },
    domains: { label: 'Domains', actions: ['view', 'edit'] },
    email: { label: 'Email', actions: ['view', 'send'] },
    server: { label: 'Server Management', actions: ['view', 'manage'] }
}

export default function AdminRoles() {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRole, setEditingRole] = useState(null)
    const [saving, setSaving] = useState(false)
    const [expandedRole, setExpandedRole] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [showAssignModal, setShowAssignModal] = useState(null)
    const [adminUsers, setAdminUsers] = useState([])
    const [roleUsers, setRoleUsers] = useState([])

    const [form, setForm] = useState({
        name: '',
        description: '',
        permissions: {}
    })

    useEffect(() => {
        loadRoles()
    }, [])

    const loadRoles = async () => {
        try {
            const res = await rolesAPI.getAll()
            setRoles(res.data.roles || [])
        } catch (err) {
            toast.error('Failed to load roles')
        } finally {
            setLoading(false)
        }
    }

    const loadAdminUsers = async () => {
        try {
            const res = await adminAPI.getUsers({ role: 'admin', limit: 100 })
            setAdminUsers(res.data.users || [])
        } catch (err) {
            console.error('Failed to load admin users:', err)
        }
    }

    const loadRoleUsers = async (uuid) => {
        try {
            const res = await rolesAPI.getUsers(uuid)
            setRoleUsers(res.data.users || [])
        } catch (err) {
            console.error('Failed to load role users:', err)
        }
    }

    const openCreateModal = () => {
        setEditingRole(null)
        setForm({ name: '', description: '', permissions: {} })
        setShowModal(true)
    }

    const openEditModal = (role) => {
        setEditingRole(role)
        setForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || {}
        })
        setShowModal(true)
    }

    const openAssignModal = async (role) => {
        setShowAssignModal(role)
        await loadAdminUsers()
        await loadRoleUsers(role.uuid)
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error('Role name is required')
            return
        }

        setSaving(true)
        try {
            if (editingRole) {
                await rolesAPI.update(editingRole.uuid, form)
                toast.success('Role updated successfully')
            } else {
                await rolesAPI.create(form)
                toast.success('Role created successfully')
            }
            setShowModal(false)
            loadRoles()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save role')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (uuid) => {
        try {
            await rolesAPI.delete(uuid)
            toast.success('Role deleted successfully')
            setShowDeleteConfirm(null)
            loadRoles()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete role')
        }
    }

    const handleAssign = async (userUuid, assign) => {
        try {
            await rolesAPI.assignRole(userUuid, assign ? showAssignModal.uuid : null)
            toast.success(assign ? 'Role assigned' : 'Role removed')
            loadRoleUsers(showAssignModal.uuid)
            loadRoles()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to assign role')
        }
    }

    const togglePermission = (category, action) => {
        const currentPerms = form.permissions[category] || []
        const hasPermission = currentPerms.includes(action)

        setForm({
            ...form,
            permissions: {
                ...form.permissions,
                [category]: hasPermission
                    ? currentPerms.filter(a => a !== action)
                    : [...currentPerms, action]
            }
        })
    }

    const toggleAllCategory = (category) => {
        const allActions = PERMISSION_CATEGORIES[category].actions
        const currentPerms = form.permissions[category] || []
        const hasAll = allActions.every(a => currentPerms.includes(a))

        setForm({
            ...form,
            permissions: {
                ...form.permissions,
                [category]: hasAll ? [] : [...allActions]
            }
        })
    }

    return (
        <>
            <Helmet>
                <title>Roles Management - Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
                        <p className="text-dark-500 mt-1">Manage admin roles and their access permissions</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Role
                    </button>
                </div>

                {/* Roles List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : roles.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Shield className="w-16 h-16 mx-auto text-dark-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Roles Found</h3>
                        <p className="text-dark-500 mb-4">Create your first role to manage admin permissions</p>
                        <button onClick={openCreateModal} className="btn-primary">Create First Role</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roles.map((role) => (
                            <motion.div
                                key={role.uuid}
                                layout
                                className="card overflow-hidden"
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800/50"
                                    onClick={() => setExpandedRole(expandedRole === role.uuid ? null : role.uuid)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            role.is_system
                                                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                : "bg-gradient-to-br from-primary-500 to-purple-600"
                                        )}>
                                            {role.is_system ? <Lock className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{role.name}</h3>
                                                {role.is_system && (
                                                    <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-dark-500">{role.description || 'No description'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-dark-500">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm">{role.user_count || 0} users</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openAssignModal(role); }}
                                                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 hover:text-primary-500"
                                                title="Assign Users"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(role); }}
                                                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 hover:text-primary-500"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {!role.is_system && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(role); }}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-dark-500 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {expandedRole === role.uuid ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedRole === role.uuid && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 border-t border-dark-200 dark:border-dark-700 pt-4">
                                                <h4 className="text-sm font-medium mb-3">Permissions</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => {
                                                        const perms = role.permissions?.[key] || []
                                                        return (
                                                            <div key={key} className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
                                                                <div className="font-medium text-sm mb-1">{cat.label}</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {cat.actions.map(action => (
                                                                        <span
                                                                            key={action}
                                                                            className={clsx(
                                                                                "px-2 py-0.5 text-xs rounded",
                                                                                perms.includes(action)
                                                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                                    : "bg-dark-200 text-dark-500 dark:bg-dark-700"
                                                                            )}
                                                                        >
                                                                            {action}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
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
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-dark-200 dark:border-dark-700">
                                <h2 className="text-xl font-bold">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Role Name *</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="input"
                                            placeholder="e.g., Content Manager"
                                            disabled={editingRole?.is_system}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="input"
                                            placeholder="Brief description of this role"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-4">Permissions</label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => {
                                            const categoryPerms = form.permissions[key] || []
                                            const hasAll = cat.actions.every(a => categoryPerms.includes(a))

                                            return (
                                                <div key={key} className="p-4 bg-dark-50 dark:bg-dark-900 rounded-xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-medium">{cat.label}</span>
                                                        <button
                                                            onClick={() => toggleAllCategory(key)}
                                                            className={clsx(
                                                                "px-2 py-1 text-xs rounded-lg",
                                                                hasAll
                                                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                                                    : "bg-dark-200 text-dark-600 dark:bg-dark-700"
                                                            )}
                                                        >
                                                            {hasAll ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cat.actions.map(action => {
                                                            const isActive = categoryPerms.includes(action)
                                                            return (
                                                                <button
                                                                    key={action}
                                                                    onClick={() => togglePermission(key, action)}
                                                                    className={clsx(
                                                                        "px-3 py-1.5 text-sm rounded-lg border transition-all",
                                                                        isActive
                                                                            ? "bg-primary-500 border-primary-500 text-white"
                                                                            : "bg-white dark:bg-dark-800 border-dark-300 dark:border-dark-600 hover:border-primary-500"
                                                                    )}
                                                                >
                                                                    {isActive && <Check className="w-3 h-3 inline mr-1" />}
                                                                    {action}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-dark-200 dark:border-dark-700 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Delete Role</h3>
                                    <p className="text-sm text-dark-500">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-dark-600 dark:text-dark-400 mb-6">
                                Are you sure you want to delete the role <strong>{showDeleteConfirm.name}</strong>?
                                Users with this role will lose their assigned permissions.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary">Cancel</button>
                                <button onClick={() => handleDelete(showDeleteConfirm.uuid)} className="btn-danger flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assign Users Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAssignModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-dark-200 dark:border-dark-700">
                                <h2 className="text-xl font-bold">Assign Users to {showAssignModal.name}</h2>
                                <p className="text-sm text-dark-500 mt-1">Select admin users to assign this role</p>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {adminUsers.length === 0 ? (
                                    <p className="text-center text-dark-500 py-8">No admin users found</p>
                                ) : (
                                    <div className="space-y-2">
                                        {adminUsers.map(user => {
                                            const isAssigned = roleUsers.some(u => u.uuid === user.uuid)
                                            return (
                                                <div
                                                    key={user.uuid}
                                                    className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-900 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                            <div className="text-sm text-dark-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssign(user.uuid, !isAssigned)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                            isAssigned
                                                                ? "bg-primary-500 text-white"
                                                                : "bg-dark-200 dark:bg-dark-700 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                                                        )}
                                                    >
                                                        {isAssigned ? (
                                                            <><Check className="w-4 h-4 inline mr-1" /> Assigned</>
                                                        ) : 'Assign'}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-dark-200 dark:border-dark-700">
                                <button onClick={() => setShowAssignModal(null)} className="btn-secondary w-full">Done</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
