import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Server, ArrowLeft, Settings, RefreshCw } from 'lucide-react'
import { userAPI } from '../../lib/api'
import { useCurrencyStore } from '../../store/useStore'

export default function ServiceDetail() {
  const { uuid } = useParams()
  const { format } = useCurrencyStore()
  
  const { data, isLoading } = useQuery({
    queryKey: ['service', uuid],
    queryFn: () => userAPI.getService(uuid).then(res => res.data)
  })

  if (isLoading) return <div className="text-center py-12">Loading...</div>
  if (!data?.service) return <div className="text-center py-12">Service not found</div>

  const service = data.service

  return (
    <>
      <Helmet><title>{service.name} - Magnetic Clouds</title></Helmet>
      <div className="mb-6">
        <Link to="/dashboard/services" className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Server className="w-7 h-7 text-primary-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{service.name}</h1>
                  <p className="text-dark-500">{service.domain_name}</p>
                </div>
              </div>
              <span className={`badge ${service.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {service.status}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Service Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-dark-500">Type:</span> <span className="font-medium">{service.service_type}</span></div>
              <div><span className="text-dark-500">Billing:</span> <span className="font-medium">{service.billing_cycle}</span></div>
              <div><span className="text-dark-500">Amount:</span> <span className="font-medium">{format(service.amount)}</span></div>
              <div><span className="text-dark-500">Next Due:</span> <span className="font-medium">{service.next_due_date || 'N/A'}</span></div>
              <div><span className="text-dark-500">IP Address:</span> <span className="font-medium">{service.ip_address || 'N/A'}</span></div>
              <div><span className="text-dark-500">Created:</span> <span className="font-medium">{new Date(service.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-secondary w-full justify-start"><Settings className="w-4 h-4 mr-2" /> Manage</button>
              <button className="btn-secondary w-full justify-start"><RefreshCw className="w-4 h-4 mr-2" /> Renew</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
