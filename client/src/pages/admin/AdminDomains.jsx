import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Globe, Plus, Edit } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useCurrencyStore } from '../../store/useStore'

export default function AdminDomains() {
  const { format } = useCurrencyStore()
  const { data, isLoading } = useQuery({ queryKey: ['admin-tlds'], queryFn: () => adminAPI.getTLDs().then(res => res.data) })

  return (
    <>
      <Helmet><title>Domain TLDs - Admin - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Domain TLDs</h1>
        <button className="btn-primary"><Plus className="w-4 h-4 mr-2" /> Add TLD</button>
      </div>
      {isLoading ? <div className="text-center py-12">Loading...</div> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">TLD</th>
                <th className="text-left p-4 font-medium">Register</th>
                <th className="text-left p-4 font-medium">Renew</th>
                <th className="text-left p-4 font-medium">Transfer</th>
                <th className="text-left p-4 font-medium">Popular</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {data?.tlds?.map(tld => (
                <tr key={tld.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-bold text-primary-500">{tld.tld}</td>
                  <td className="p-4">{format(tld.price_register)}</td>
                  <td className="p-4">{format(tld.price_renew)}</td>
                  <td className="p-4">{format(tld.price_transfer)}</td>
                  <td className="p-4"><span className={`badge ${tld.is_popular ? 'badge-primary' : 'bg-dark-100 text-dark-500'}`}>{tld.is_popular ? 'Yes' : 'No'}</span></td>
                  <td className="p-4"><span className={`badge ${tld.is_active ? 'badge-success' : 'badge-danger'}`}>{tld.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4 text-right"><button className="p-2 hover:bg-dark-100 rounded-lg"><Edit className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
