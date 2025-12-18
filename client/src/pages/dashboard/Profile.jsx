import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Phone, Building, MapPin, Save } from 'lucide-react'
import { authAPI } from '../../lib/api'
import { useAuthStore } from '../../store/useStore'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateProfile(form)
      updateUser(form)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Profile - Magnetic Clouds</title></Helmet>
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      <div className="max-w-2xl">
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                    className="input pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="email" value={user?.email || ''} disabled className="input pl-12 bg-dark-50 dark:bg-dark-800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="input pl-12" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input pl-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="input" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
