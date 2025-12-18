import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Send } from 'lucide-react'
import { ticketsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function NewTicket() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ subject: '', department: 'general', priority: 'medium', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ticketsAPI.create(form)
      toast.success('Ticket created successfully!')
      navigate('/dashboard/tickets')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Open Ticket - Magnetic Clouds</title></Helmet>
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-2 text-dark-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8">Open Support Ticket</h1>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                className="input" placeholder="Brief description of your issue" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input">
                  <option value="general">General</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                className="input min-h-[200px]" placeholder="Describe your issue in detail..." required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
