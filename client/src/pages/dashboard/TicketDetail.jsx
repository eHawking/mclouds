import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, XCircle } from 'lucide-react'
import { ticketsAPI } from '../../lib/api'
import { useAuthStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function TicketDetail() {
  const { uuid } = useParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', uuid],
    queryFn: () => ticketsAPI.getOne(uuid).then(res => res.data)
  })

  const replyMutation = useMutation({
    mutationFn: (msg) => ticketsAPI.reply(uuid, msg),
    onSuccess: () => { queryClient.invalidateQueries(['ticket', uuid]); setMessage(''); toast.success('Reply sent!') }
  })

  if (isLoading) return <div className="text-center py-12">Loading...</div>
  if (!data?.ticket) return <div className="text-center py-12">Ticket not found</div>

  const ticket = data.ticket
  const replies = data.replies || []

  return (
    <>
      <Helmet><title>Ticket #{ticket.ticket_number} - Magnetic Clouds</title></Helmet>
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>
      
      <div className="max-w-3xl">
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
              <p className="text-dark-500 text-sm">#{ticket.ticket_number} • {ticket.department}</p>
            </div>
            <span className={clsx("badge", ticket.status === 'closed' ? 'bg-dark-100 text-dark-500' : 'badge-primary')}>{ticket.status}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {replies.map(reply => (
            <div key={reply.id} className={clsx("card p-4", reply.is_staff_reply && "border-l-4 border-primary-500")}>
              <div className="flex items-center gap-3 mb-2">
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                  reply.is_staff_reply ? "bg-primary-500" : "bg-dark-400")}>
                  {reply.first_name?.[0]}{reply.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium">{reply.first_name} {reply.last_name}</p>
                  <p className="text-xs text-dark-500">{new Date(reply.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-dark-700 dark:text-dark-300 whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>

        {ticket.status !== 'closed' && (
          <div className="card p-6">
            <h3 className="font-bold mb-4">Reply</h3>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              className="input min-h-[120px] mb-4" placeholder="Type your reply..." />
            <button onClick={() => replyMutation.mutate(message)} disabled={!message.trim() || replyMutation.isPending}
              className="btn-primary"><Send className="w-4 h-4 mr-2" /> Send Reply</button>
          </div>
        )}
      </div>
    </>
  )
}
