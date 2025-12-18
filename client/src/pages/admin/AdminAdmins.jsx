import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
    Users, Shield, Crown, Loader2, Check, Search,
    UserPlus, Edit2, X
} from 'lucide-react'
import { rolesAPI } from '../../lib/api'
import { useAuthStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminAdmins() {
    const { user: currentUser } = useAuthStore()
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editingUser, setEditingUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                rolesAPI.getAdminUsers(),
                rolesAPI.getRoles()
            ])
            setUsers(usersRes.data.users)
            setRoles(rolesRes.data.roles)
        } catch (err) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleAssignRole = async () => {
        if (!editingUser) return

        setSaving(true)
        try {
            await rolesAPI.assignRole(editingUser.uuid, selectedRole)
            toast.success('Role assigned successfully')
            setEditingUser(null)
            loadData()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to assign role')
        } finally {
            setSaving(false)
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setSelectedRole(user.role_id || null)
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    )

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
                <title>Admin Users - Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Users</h1>
                        <p className="text-dark-500 mt-1">Manage admin users and their roles</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search admin users..."
                        className="input pl-12"
                    />
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                                    <th className="text-left p-4 font-medium">User</th>
                                    <th className="text-left p-4 font-medium">Email</th>
                                    <th className="text-left p-4 font-medium">Role</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.uuid} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-900/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                                                    user.role_slug === 'super_admin'
                                                        ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                        : "bg-gradient-to-br from-primary-500 to-purple-600"
                                                )}>
                                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                                                    <p className="text-sm text-dark-500">#{user.uuid}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-dark-600 dark:text-dark-400">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.role_slug === 'super_admin' ? (
                                                    <Crown className="w-4 h-4 text-amber-500" />
                                                ) : (
                                                    <Shield className="w-4 h-4 text-primary-500" />
                                                )}
                                                <span className={clsx(
                                                    "text-sm font-medium",
                                                    user.role_slug === 'super_admin' ? "text-amber-600 dark:text-amber-400" : ""
                                                )}>
                                                    {user.role_name || 'No Role'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2 py-1 text-xs rounded-full font-medium",
                                                user.status === 'active'
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                disabled={user.role_slug === 'super_admin' && !currentUser?.isSuperAdmin}
                                                className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-dark-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No admin users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Assignment Modal */}
            {editingUser && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setEditingUser(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Assign Role</h2>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-dark-500 mb-4">
                                Assign a role to <strong>{editingUser.first_name} {editingUser.last_name}</strong>
                            </p>

                            <div className="space-y-2">
                                {roles.map(role => (
                                    <label
                                        key={role.id}
                                        className={clsx(
                                            "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                                            selectedRole === role.id
                                                ? "bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500"
                                                : "bg-dark-50 dark:bg-dark-900 border-2 border-transparent hover:border-dark-200 dark:hover:border-dark-700",
                                            role.is_system && !currentUser?.isSuperAdmin && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={selectedRole === role.id}
                                            onChange={() => setSelectedRole(role.id)}
                                            disabled={role.is_system && !currentUser?.isSuperAdmin}
                                            className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {role.is_system ? <Crown className="w-4 h-4 text-amber-500" /> : <Shield className="w-4 h-4 text-primary-500" />}
                                                <span className="font-medium">{role.name}</span>
                                            </div>
                                            <p className="text-sm text-dark-500 mt-1">{role.description}</p>
                                        </div>
                                    </label>
                                ))}

                                <label
                                    className={clsx(
                                        "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                                        selectedRole === null
                                            ? "bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500"
                                            : "bg-dark-50 dark:bg-dark-900 border-2 border-transparent hover:border-dark-200 dark:hover:border-dark-700"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        checked={selectedRole === null}
                                        onChange={() => setSelectedRole(null)}
                                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="font-medium text-red-500">Remove Admin Access</span>
                                        <p className="text-sm text-dark-500 mt-1">Convert to regular user</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleAssignRole} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}
