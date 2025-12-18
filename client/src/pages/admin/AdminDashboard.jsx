import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Users, ShoppingCart, DollarSign, Ticket, Server, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Sparkles, Activity, Clock,
  CheckCircle, AlertCircle, Zap
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { useCurrencyStore, useThemeStore } from '../../store/useStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import clsx from 'clsx'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900/95 backdrop-blur-xl px-4 py-3 rounded-xl border border-dark-700 shadow-2xl">
        <p className="text-white font-medium">{label}</p>
        <p className="text-primary-400 font-bold text-lg">${payload[0].value?.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const { format } = useCurrencyStore()
  const { themeStyle } = useThemeStore()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(res => res.data)
  })

  const stats = [
    { label: 'Total Users', value: data?.stats?.users?.total || 0, icon: Users, color: 'from-blue-500 to-cyan-400', bgColor: 'from-blue-500/20 to-cyan-500/10', trend: '+12%', up: true },
    { label: 'Total Orders', value: data?.stats?.orders?.total || 0, icon: ShoppingCart, color: 'from-emerald-500 to-green-400', bgColor: 'from-emerald-500/20 to-green-500/10', trend: '+8%', up: true },
    { label: 'Total Revenue', value: format(data?.stats?.revenue?.total || 0), icon: DollarSign, color: 'from-amber-500 to-yellow-400', bgColor: 'from-amber-500/20 to-yellow-500/10', trend: '+23%', up: true },
    { label: 'Open Tickets', value: data?.stats?.tickets?.open || 0, icon: Ticket, color: 'from-rose-500 to-pink-400', bgColor: 'from-rose-500/20 to-pink-500/10', trend: '-5%', up: false },
    { label: 'Active Services', value: data?.stats?.services?.active || 0, icon: Server, color: 'from-violet-500 to-purple-400', bgColor: 'from-violet-500/20 to-purple-500/10', trend: '+15%', up: true },
    { label: 'Monthly Revenue', value: format(data?.stats?.revenue?.monthly || 0), icon: TrendingUp, color: 'from-primary-500 to-indigo-400', bgColor: 'from-primary-500/20 to-indigo-500/10', trend: '+18%', up: true },
  ]

  return (
    <>
      <Helmet><title>Admin Dashboard - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-0 w-48 h-48 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        <div className="relative p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Admin</h1>
            <p className="text-white/60">Here's what's happening with your business today</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/60 text-sm">Today's Date</p>
              <p className="text-white font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 p-6 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
          >
            {/* Background Gradient */}
            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", stat.bgColor)} />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-dark-500 dark:text-dark-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-dark-900 to-dark-600 dark:from-white dark:to-dark-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <div className={clsx("flex items-center gap-1 mt-2 text-sm font-medium", stat.up ? "text-emerald-500" : "text-rose-500")}>
                  {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{stat.trend}</span>
                  <span className="text-dark-400 font-normal">vs last month</span>
                </div>
              </div>
              <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      {data?.revenueChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Revenue Analytics
              </h2>
              <p className="text-dark-500 text-sm mt-1">Monthly revenue performance overview</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +23% Growth
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700"
        >
          <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Recent Orders</h2>
                <p className="text-dark-500 text-xs">Latest customer orders</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg">
              {data?.recentOrders?.length || 0} new
            </span>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {data?.recentOrders?.slice(0, 5).map((order, i) => (
              <motion.div
                key={order.uuid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-4 flex items-center justify-between hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {order.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-dark-500 truncate max-w-[150px]">{order.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-500">{format(order.total)}</p>
                  <p className="text-xs text-dark-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Just now
                  </p>
                </div>
              </motion.div>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <div className="p-8 text-center text-dark-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Tickets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700"
        >
          <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Support Tickets</h2>
                <p className="text-dark-500 text-xs">Requires attention</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-lg">
              {data?.stats?.tickets?.open || 0} open
            </span>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {data?.recentTickets?.slice(0, 5).map((ticket, i) => (
              <motion.div
                key={ticket.uuid}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-4 flex items-center justify-between hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    ticket.status === 'open' ? "bg-amber-100 dark:bg-amber-900/30" : 
                    ticket.status === 'closed' ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    {ticket.status === 'open' ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : ticket.status === 'closed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[180px]">{ticket.subject}</p>
                    <p className="text-sm text-dark-500 truncate max-w-[150px]">{ticket.email}</p>
                  </div>
                </div>
                <span className={clsx(
                  "px-2.5 py-1 text-xs font-medium rounded-lg capitalize",
                  ticket.status === 'open' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                  ticket.status === 'closed' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                  "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                )}>
                  {ticket.status}
                </span>
              </motion.div>
            ))}
            {(!data?.recentTickets || data.recentTickets.length === 0) && (
              <div className="p-8 text-center text-dark-500">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No recent tickets</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 border border-primary-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quick Insights</h3>
              <p className="text-dark-500 text-sm">Your business is performing well this month!</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700">
              <p className="text-xs text-dark-500">Conversion Rate</p>
              <p className="font-bold text-emerald-500">4.2%</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700">
              <p className="text-xs text-dark-500">Avg. Order Value</p>
              <p className="font-bold text-primary-500">{format(data?.stats?.revenue?.total / (data?.stats?.orders?.total || 1) || 0)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
