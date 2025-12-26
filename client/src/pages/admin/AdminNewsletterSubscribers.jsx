import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
    Mail, Search, Trash2, Download, Filter, Users,
    CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminNewsletterSubscribers() {
    const [loading, setLoading] = useState(true)
    const [subscribers, setSubscribers] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

    useEffect(() => {
        loadSubscribers()
    }, [pagination.page, statusFilter])

    const loadSubscribers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(statusFilter && { status: statusFilter }),
                ...(search && { search })
            })

            const res = await api.get(`/settings/newsletter/subscribers?${params}`)
            setSubscribers(res.data.subscribers || [])
            setPagination(prev => ({ ...prev, ...res.data.pagination }))
        } catch (err) {
            console.error('Failed to load subscribers:', err)
            toast.error('Failed to load subscribers')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
        loadSubscribers()
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subscriber?')) return

        try {
            await api.delete(`/settings/newsletter/subscribers/${id}`)
            toast.success('Subscriber deleted')
            loadSubscribers()
        } catch (err) {
            toast.error('Failed to delete subscriber')
        }
    }

    const handleExport = () => {
        const params = new URLSearchParams()
        if (statusFilter) params.append('status', statusFilter)
        window.open(`/api/settings/newsletter/export?${params}`, '_blank')
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'subscribed':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'unsubscribed':
                return <XCircle className="w-4 h-4 text-red-500" />
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            subscribed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            unsubscribed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status}
            </span>
        )
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <Helmet><title>Newsletter Subscribers - Admin - Magnetic Clouds</title></Helmet>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Mail className="w-7 h-7 text-primary-500" />
                        Newsletter Subscribers
                    </h1>
                    <p className="text-dark-500 mt-1">
                        {pagination.total} total subscribers
                    </p>
                </div>
                <button onClick={handleExport} className="btn-secondary">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by email..."
                                className="input pl-10 w-full"
                            />
                        </div>
                    </form>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                        className="input w-full md:w-48"
                    >
                        <option value="">All Status</option>
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button onClick={loadSubscribers} className="btn-outline">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{subscribers.filter(s => s.status === 'subscribed').length}</p>
                        <p className="text-sm text-dark-500">Active Subscribers</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{subscribers.filter(s => s.status === 'unsubscribed').length}</p>
                        <p className="text-sm text-dark-500">Unsubscribed</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{pagination.total}</p>
                        <p className="text-sm text-dark-500">Total Subscribers</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-100 dark:bg-dark-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-600 dark:text-dark-400 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-600 dark:text-dark-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-600 dark:text-dark-400 uppercase">Source</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-600 dark:text-dark-400 uppercase">Subscribed At</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-600 dark:text-dark-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-dark-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-dark-500">
                                        No subscribers found
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-dark-400" />
                                                <span className="font-medium">{subscriber.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(subscriber.status)}
                                        </td>
                                        <td className="px-4 py-3 text-dark-500 capitalize">
                                            {subscriber.source || 'footer'}
                                        </td>
                                        <td className="px-4 py-3 text-dark-500 text-sm">
                                            {formatDate(subscriber.subscribed_at || subscriber.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(subscriber.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete subscriber"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                        <p className="text-sm text-dark-500">
                            Page {pagination.page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page <= 1}
                                className="btn-outline text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.pages}
                                className="btn-outline text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
