import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Server, Shield, Zap, Navigation, Globe, ArrowRight, Wifi, Clock, Lock } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { settingsAPI } from '../lib/api'
import { useThemeStore } from '../store/useStore'
import clsx from 'clsx'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Active/selected marker icon
const activeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41"><path fill="#8b5cf6" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 29 12 29s12-20 12-29c0-6.6-5.4-12-12-12z"/><circle fill="white" cx="12" cy="12" r="5"/></svg>`),
  iconSize: [24, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -34]
})

// Map controller component
function MapController({ selectedLocation, locations }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedLocation) {
      const loc = locations.find(l => l.id === selectedLocation)
      if (loc) {
        map.flyTo([loc.latitude, loc.longitude], 5, {
          duration: 1.5
        })
      }
    } else {
      // Reset to world view
      map.flyTo([20, 0], 2, {
        duration: 1.5
      })
    }
  }, [selectedLocation, locations, map])
  
  return null
}

// Static datacenter locations as fallback
const staticDatacenters = [
  { id: 1, name: 'New York', location: 'USA', latitude: 40.7128, longitude: -74.0060, description: 'East Coast USA datacenter' },
  { id: 2, name: 'Los Angeles', location: 'USA', latitude: 34.0522, longitude: -118.2437, description: 'West Coast USA datacenter' },
  { id: 3, name: 'London', location: 'UK', latitude: 51.5074, longitude: -0.1278, description: 'European datacenter' },
  { id: 4, name: 'Frankfurt', location: 'Germany', latitude: 50.1109, longitude: 8.6821, description: 'Central Europe datacenter' },
  { id: 5, name: 'Singapore', location: 'Singapore', latitude: 1.3521, longitude: 103.8198, description: 'Southeast Asia datacenter' },
  { id: 6, name: 'Tokyo', location: 'Japan', latitude: 35.6762, longitude: 139.6503, description: 'East Asia datacenter' },
  { id: 7, name: 'Sydney', location: 'Australia', latitude: -33.8688, longitude: 151.2093, description: 'Oceania datacenter' },
  { id: 8, name: 'Mumbai', location: 'India', latitude: 19.0760, longitude: 72.8777, description: 'South Asia datacenter' },
  { id: 9, name: 'São Paulo', location: 'Brazil', latitude: -23.5505, longitude: -46.6333, description: 'South America datacenter' },
  { id: 10, name: 'Dubai', location: 'UAE', latitude: 25.2048, longitude: 55.2708, description: 'Middle East datacenter' },
]

export default function Datacenters() {
  const { themeStyle, theme } = useThemeStore()
  const isGradient = themeStyle === 'gradient'
  const isDark = theme === 'dark'
  const [selectedLocation, setSelectedLocation] = useState(null)

  const { data: datacenters } = useQuery({
    queryKey: ['datacenters'],
    queryFn: () => settingsAPI.getDatacenters().then(res => res.data.datacenters)
  })

  // Use API data if available and not empty, otherwise use static data
  const locations = (datacenters && datacenters.length > 0) ? datacenters : staticDatacenters
  
  // Tile layer URLs for light and dark themes
  const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

  return (
    <>
      <Helmet>
        <title>Global Datacenters - Magnetic Clouds</title>
        <meta name="description" content="10+ datacenter locations worldwide for optimal performance and low latency." />
      </Helmet>

      {/* Ultra Premium Hero */}
      <section className={clsx(
        "relative py-20 overflow-hidden",
        isDark ? "bg-dark-950" : "bg-gradient-to-b from-indigo-50 via-white to-blue-50"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-dark-950 to-blue-950/50" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-indigo-500/10 via-transparent to-blue-500/10 rounded-full blur-2xl" />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                isDark ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" : "bg-indigo-100 border border-indigo-200 text-indigo-600"
              )}
            >
              <Globe className="w-4 h-4" />
              Global Infrastructure
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                "text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6",
                isDark ? "text-white" : "text-dark-900"
              )}
            >
              Global{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Datacenters
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("text-lg max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Deploy your applications closer to your users with our worldwide datacenter network.
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            {[
              { value: '10+', label: 'Locations' },
              { value: '<50ms', label: 'Latency' },
              { value: '99.99%', label: 'Uptime' },
              { value: 'Tier-4', label: 'Security' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">{stat.value}</div>
                <div className={clsx("text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white dark:bg-dark-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className={clsx(
            "rounded-3xl overflow-hidden shadow-2xl relative z-0",
            isDark ? "border-2 border-indigo-500/30" : "border-2 border-indigo-200"
          )} style={{ height: '450px' }}>
            <MapContainer 
              key={`map-${isDark}`}
              center={[20, 0]} 
              zoom={2} 
              style={{ height: '100%', width: '100%' }} 
              scrollWheelZoom={false}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer url={isDark ? darkTileUrl : lightTileUrl} />
              <MapController selectedLocation={selectedLocation} locations={locations} />
              {locations.map((dc) => (
                <Marker 
                  key={dc.id} 
                  position={[dc.latitude, dc.longitude]} 
                  icon={selectedLocation === dc.id ? activeIcon : customIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(dc.id)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <div className="font-bold text-gray-900 text-base">{dc.name}</div>
                      <div className="text-sm text-gray-600">{dc.location}</div>
                      <div className="text-xs text-gray-500 mt-1">{dc.description}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2 mx-auto"
              >
                <Navigation className="w-4 h-4" />
                Reset Map View
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-display"
            >
              Our{' '}
              <span className="text-gradient">Locations</span>
            </motion.h2>
            <p className="mt-4 text-dark-500">Click on a location to view it on the map</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((dc, i) => (
              <motion.button
                key={dc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedLocation(dc.id)
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
                className={clsx(
                  "group p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]",
                  selectedLocation === dc.id
                    ? "bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border-2 border-indigo-500/50"
                    : "bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-indigo-500/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg",
                    selectedLocation === dc.id
                      ? "bg-gradient-to-br from-indigo-500 to-blue-500 scale-110"
                      : "bg-gradient-to-br from-indigo-500 to-blue-600 group-hover:scale-110"
                  )}>
                    <Server className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-dark-900 dark:text-white">{dc.name}</h3>
                    <p className="text-dark-500">{dc.location}</p>
                    <p className="text-sm text-dark-400 mt-2">{dc.description}</p>
                  </div>
                </div>
                {selectedLocation === dc.id && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-500 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    Currently viewing on map
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-display"
            >
              Enterprise-Grade{' '}
              <span className="text-gradient">Infrastructure</span>
            </motion.h2>
            <p className="mt-4 text-dark-500 max-w-2xl mx-auto">
              Built for reliability, performance, and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Low Latency', desc: 'Sub-millisecond response times worldwide', color: 'from-yellow-500 to-orange-500' },
              { icon: Shield, title: 'Tier-4 Security', desc: 'Enterprise-grade protection', color: 'from-green-500 to-emerald-500' },
              { icon: Server, title: '99.99% Uptime', desc: 'Redundant infrastructure', color: 'from-blue-500 to-cyan-500' },
              { icon: Wifi, title: '10Gbps Network', desc: 'Premium network connectivity', color: 'from-purple-500 to-pink-500' }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-indigo-500/30 transition-all text-center"
              >
                <div className={clsx(
                  "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg",
                  item.color
                )}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-dark-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-white"
          >
            Deploy Closer to Your Users
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-white/80"
          >
            Choose from 10+ strategic locations worldwide for optimal performance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/vps" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
              Deploy Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
