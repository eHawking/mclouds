import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart } from 'lucide-react'
import { ordersAPI } from '../../lib/api'
import { useCurrencyStore } from '../../store/useStore'
import clsx from 'clsx'

const statusColors = { pending: 'badge-warning', processing: 'badge-primary', active: 'badge-success', completed: 'badge-success', cancelled: 'badge-danger' }

export default function Orders() {
  const { format } = useCurrencyStore()
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => ordersAPI.getAll().then(res => res.data) })

  return (
    <>
      <Helmet><title>Orders - Magnetic Clouds</title></Helmet>
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>
      {isLoading ? <div className="text-center py-12">Loading...</div> : data?.orders?.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {data.orders.map(order => (
                <tr key={order.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4">{format(order.total)}</td>
                  <td className="p-4 text-dark-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><span className={clsx("badge", statusColors[order.status])}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-dark-500">Your order history will appear here</p>
        </div>
      )}
    </>
  )
}
