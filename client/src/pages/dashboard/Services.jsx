import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { 
  Server, Plus, Bot, Globe, Shield, HardDrive, Cloud, Mail, Database, Inbox, Settings,
  MonitorPlay
} from 'lucide-react'
import { userAPI, nobotAPI } from '../../lib/api'
import clsx from 'clsx'

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  suspended: 'bg-red-500/20 text-red-400 border border-red-500/30',
  cancelled: 'bg-dark-500/20 text-dark-400 border border-dark-500/30',
}

const serviceIcons = {
  nobot: { icon: Bot, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20' },
  hosting: { icon: Server, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20' },
  vps: { icon: Cloud, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500/20' },
  dedicated: { icon: HardDrive, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20' },
  domain: { icon: Globe, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20' },
  ssl: { icon: Shield, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/20' },
  email: { icon: Mail, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20' },
  backup: { icon: Database, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/20' },
}

// Check if service is a NoBot service
const isNoBotService = (service) => {
  const name = (service.name || '').toLowerCase()
  return name.includes('nobot') || name.includes('no bot') || name.includes('ai bot') || name.includes('chatbot')
}

// Get service icon config
const getServiceConfig = (service) => {
  if (isNoBotService(service)) return serviceIcons.nobot
  return serviceIcons[service.service_type] || serviceIcons.hosting
}

// Get service link
const getServiceLink = (service) => {
  if (isNoBotService(service)) return `/dashboard/nobot?service=${service.uuid}`
  return `/dashboard/services/${service.uuid}`
}

// Check if service is a hosting/server type (exclude NoBot)
const isHostingService = (service) => {
  const type = (service.service_type || '').toLowerCase()
  const name = (service.name || '').toLowerCase()
  
  // Exclude NoBot services
  if (name.includes('nobot') || name.includes('no bot') || name.includes('ai bot') || name.includes('chatbot')) {
    return false
  }
  
  return ['hosting', 'vps', 'dedicated', 'cloud', 'server', 'reseller'].some(t => 
    type.includes(t) || name.includes(t)
  )
}

export default function Services() {
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => userAPI.getServices().then(res => res.data)
  })

  // Fetch NoBot services to check setup status
  const { data: nobotData } = useQuery({
    queryKey: ['nobots'],
    queryFn: () => nobotAPI.getBots().then(res => res.data)
  })

  // Check if NoBot setup is complete for a service
  const getNoBotStatus = (serviceUuid) => {
    const bot = nobotData?.bots?.find(b => b.service_uuid === serviceUuid)
    return bot ? { setup_step: bot.setup_step, botUuid: bot.uuid } : null
  }

  return (
    <>
      <Helmet><title>My Services - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Services</h1>
        <Link to="/hosting" className="btn-primary"><Plus className="w-4 h-4 mr-2" /> New Service</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading services...</p>
        </div>
      ) : data?.services?.length > 0 ? (
        <div className="grid gap-4">
          {data.services.map(service => {
            const config = getServiceConfig(service)
            const IconComponent = config.icon
            const link = getServiceLink(service)
            const isNoBot = isNoBotService(service)
            const nobotStatus = isNoBot ? getNoBotStatus(service.uuid) : null
            const isSetupComplete = nobotStatus?.setup_step >= 4
            
            return (
              <div key={service.uuid} className="group card p-6 flex items-center justify-between hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50">
                <Link to={link} className="flex items-center gap-4 flex-1">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                    config.color,
                    "shadow-lg group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary-500 transition-colors">{service.name}</h3>
                    <p className="text-sm text-dark-500">
                      {isNoBot ? 'AI Chatbot Service' : (service.domain_name || service.service_type)}
                    </p>
                    {isNoBot && !isSetupComplete && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-400">
                        <Bot className="w-3 h-3" /> Click to setup or manage
                      </span>
                    )}
                    {isNoBot && isSetupComplete && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-400">
                        <Bot className="w-3 h-3" /> Setup complete
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  {/* Manage button for hosting/server services */}
                  {isHostingService(service) && service.status === 'active' && (
                    <Link
                      to={`/dashboard/services/${service.uuid}/manage`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all mr-4"
                    >
                      <MonitorPlay className="w-4 h-4" /> Manage
                    </Link>
                  )}
                  {/* NoBot Inbox & Settings buttons when setup is complete */}
                  {isNoBot && isSetupComplete && (
                    <div className="flex items-center gap-2 mr-4">
                      <Link 
                        to={`/dashboard/nobot?service=${service.uuid}&tab=inbox`}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Inbox className="w-4 h-4" /> Inbox
                      </Link>
                      <Link 
                        to={`/dashboard/nobot?service=${service.uuid}`}
                        className="p-2 bg-dark-100 dark:bg-dark-700 rounded-xl hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="w-4 h-4 text-dark-500" />
                      </Link>
                    </div>
                  )}
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-medium", statusColors[service.status])}>
                    {service.status}
                  </span>
                  <div className="text-right">
                    <p className="text-dark-500 text-sm">Next Due</p>
                    <p className="font-medium">
                      {service.next_due_date ? new Date(service.next_due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center bg-gradient-to-br from-dark-50 to-dark-100 dark:from-dark-800 dark:to-dark-900">
          <div className="w-20 h-20 rounded-full bg-dark-200 dark:bg-dark-700 flex items-center justify-center mx-auto mb-6">
            <Server className="w-10 h-10 text-dark-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Services Yet</h2>
          <p className="text-dark-500 mb-6">Get started with our hosting solutions</p>
          <Link to="/hosting" className="btn-primary">Browse Hosting Plans</Link>
        </div>
      )}
    </>
  )
}
