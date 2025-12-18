import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useState } from 'react'
import clsx from 'clsx'

export default function AdminUsers() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminAPI.getUsers({ search }).then(res => res.data)
  })

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-400',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return colors[status] || colors.pending
  }

  return (
    <>
      <Helmet><title>Users - Admin - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-dark-500 mt-1">{data?.users?.length || 0} total users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input pl-12 w-64" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {data?.users?.length > 0 ? data.users.map(user => (
                <tr key={user.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="p-4">
                    <Link to={`/admin/users/${user.uuid}`} className="flex items-center gap-3 hover:text-primary-500 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-white">
                        {user.first_name?.[0] || 'U'}{user.last_name?.[0] || ''}
                      </div>
                      <div>
                        <span className="font-medium block">{user.first_name || 'Unknown'} {user.last_name || ''}</span>
                        {user.company && <span className="text-xs text-dark-500">{user.company}</span>}
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 text-dark-500">{user.email}</td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>{user.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(user.status))}>{user.status}</span>
                  </td>
                  <td className="p-4 text-dark-500">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-dark-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
