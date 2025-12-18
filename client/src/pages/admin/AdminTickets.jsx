import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../lib/api'
import clsx from 'clsx'

const statusColors = { open: 'badge-primary', answered: 'badge-success', 'customer-reply': 'badge-warning', 'in-progress': 'badge-primary', closed: 'bg-dark-100 text-dark-500' }

export default function AdminTickets() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-tickets'], queryFn: () => adminAPI.getTickets().then(res => res.data) })

  return (
    <>
      <Helmet><title>Tickets - Admin - Magnetic Clouds</title></Helmet>
      <h1 className="text-2xl font-bold mb-8">Support Tickets</h1>
      {isLoading ? <div className="text-center py-12">Loading...</div> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="text-left p-4 font-medium">Ticket</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Department</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
              {data?.tickets?.map(ticket => (
                <tr key={ticket.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer">
                  <td className="p-4">
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-dark-500">#{ticket.ticket_number}</p>
                  </td>
                  <td className="p-4 text-dark-500">{ticket.email}</td>
                  <td className="p-4 capitalize">{ticket.department}</td>
                  <td className="p-4 capitalize">{ticket.priority}</td>
                  <td className="p-4"><span className={clsx("badge", statusColors[ticket.status])}>{ticket.status}</span></td>
                  <td className="p-4 text-dark-500">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
