import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Ticket, Plus } from 'lucide-react'
import { ticketsAPI } from '../../lib/api'
import clsx from 'clsx'

const statusColors = { open: 'badge-primary', answered: 'badge-success', 'customer-reply': 'badge-warning', closed: 'bg-dark-100 text-dark-500' }

export default function Tickets() {
  const { data, isLoading } = useQuery({ queryKey: ['tickets'], queryFn: () => ticketsAPI.getAll().then(res => res.data) })

  return (
    <>
      <Helmet><title>Support Tickets - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Link to="/dashboard/tickets/new" className="btn-primary"><Plus className="w-4 h-4 mr-2" /> Open Ticket</Link>
      </div>
      {isLoading ? <div className="text-center py-12">Loading...</div> : data?.tickets?.length > 0 ? (
        <div className="space-y-4">
          {data.tickets.map(ticket => (
            <Link key={ticket.uuid} to={`/dashboard/tickets/${ticket.uuid}`} className="block card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{ticket.subject}</h3>
                  <p className="text-sm text-dark-500">#{ticket.ticket_number} • {ticket.department}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={clsx("badge", statusColors[ticket.status])}>{ticket.status}</span>
                  <span className="text-sm text-dark-500">{new Date(ticket.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Ticket className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Tickets Yet</h2>
          <p className="text-dark-500 mb-6">Need help? Open a support ticket</p>
          <Link to="/dashboard/tickets/new" className="btn-primary">Open Ticket</Link>
        </div>
      )}
    </>
  )
}
