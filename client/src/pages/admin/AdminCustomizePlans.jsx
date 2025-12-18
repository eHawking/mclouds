import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Save, Cpu, HardDrive, Gauge, Globe, Server, DollarSign } from 'lucide-react'
import { settingsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const defaultPricing = {
  // Base prices per unit
  cpu_price_per_core: 3.00,
  ram_price_per_gb: 1.50,
  storage_price_per_gb: 0.05,
  bandwidth_price_per_tb: 1.00,
  
  // Minimum values
  min_cpu: 1,
  min_ram: 1,
  min_storage: 20,
  min_bandwidth: 1,
  
  // Maximum values
  max_cpu: 32,
  max_ram: 128,
  max_storage: 2000,
  max_bandwidth: 100,
  
  // Step values
  cpu_step: 1,
  ram_step: 1,
  storage_step: 10,
  bandwidth_step: 1,
  
  // Base fee (setup/management)
  base_fee: 2.00,
  
  // Feature add-ons
  ddos_protection_price: 5.00,
  backup_price: 3.00,
  managed_support_price: 10.00,
}

export default function AdminCustomizePlans() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricing, setPricing] = useState(defaultPricing)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      const res = await settingsAPI.getCustomVPSPricing()
      if (res.data.pricing) {
        setPricing(prev => ({ ...prev, ...res.data.pricing }))
      }
    } catch (err) {
      console.error('Failed to load pricing:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.updateCustomVPSPricing(pricing)
      toast.success('Custom VPS pricing saved!')
    } catch (err) {
      toast.error('Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  const calculateExample = () => {
    const cpu = 4
    const ram = 8
    const storage = 100
    const bandwidth = 5
    return (
      pricing.base_fee +
      (cpu * pricing.cpu_price_per_core) +
      (ram * pricing.ram_price_per_gb) +
      (storage * pricing.storage_price_per_gb) +
      (bandwidth * pricing.bandwidth_price_per_tb)
    ).toFixed(2)
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      <Helmet><title>Customize Plans - Admin - Magnetic Clouds</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Customize VPS Plans</h1>
          <p className="text-dark-500 mt-1">Set pricing for custom VPS configurations</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Per-Unit Pricing */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Per-Unit Pricing
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                Price per vCPU ($/month)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.cpu_price_per_core}
                onChange={(e) => setPricing(prev => ({ ...prev, cpu_price_per_core: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Gauge className="w-4 h-4 text-purple-500" />
                Price per GB RAM ($/month)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.ram_price_per_gb}
                onChange={(e) => setPricing(prev => ({ ...prev, ram_price_per_gb: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <HardDrive className="w-4 h-4 text-pink-500" />
                Price per GB Storage ($/month)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={pricing.storage_price_per_gb}
                onChange={(e) => setPricing(prev => ({ ...prev, storage_price_per_gb: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                Price per TB Bandwidth ($/month)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.bandwidth_price_per_tb}
                onChange={(e) => setPricing(prev => ({ ...prev, bandwidth_price_per_tb: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Server className="w-4 h-4 text-amber-500" />
                Base Fee ($/month)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.base_fee}
                onChange={(e) => setPricing(prev => ({ ...prev, base_fee: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
              <p className="text-xs text-dark-500 mt-1">Fixed monthly fee added to all custom VPS</p>
            </div>
          </div>
        </div>

        {/* Limits Configuration */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            Resource Limits
          </h2>
          
          <div className="space-y-6">
            {/* CPU Limits */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> vCPU
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Min</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.min_cpu}
                    onChange={(e) => setPricing(prev => ({ ...prev, min_cpu: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Max</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.max_cpu}
                    onChange={(e) => setPricing(prev => ({ ...prev, max_cpu: parseInt(e.target.value) || 32 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Step</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.cpu_step}
                    onChange={(e) => setPricing(prev => ({ ...prev, cpu_step: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* RAM Limits */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> RAM (GB)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Min</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.min_ram}
                    onChange={(e) => setPricing(prev => ({ ...prev, min_ram: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Max</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.max_ram}
                    onChange={(e) => setPricing(prev => ({ ...prev, max_ram: parseInt(e.target.value) || 128 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Step</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.ram_step}
                    onChange={(e) => setPricing(prev => ({ ...prev, ram_step: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Storage Limits */}
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <h3 className="font-medium text-pink-800 dark:text-pink-200 mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Storage (GB)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Min</label>
                  <input
                    type="number"
                    min="10"
                    value={pricing.min_storage}
                    onChange={(e) => setPricing(prev => ({ ...prev, min_storage: parseInt(e.target.value) || 20 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Max</label>
                  <input
                    type="number"
                    min="10"
                    value={pricing.max_storage}
                    onChange={(e) => setPricing(prev => ({ ...prev, max_storage: parseInt(e.target.value) || 2000 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Step</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.storage_step}
                    onChange={(e) => setPricing(prev => ({ ...prev, storage_step: parseInt(e.target.value) || 10 }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bandwidth Limits */}
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <h3 className="font-medium text-cyan-800 dark:text-cyan-200 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Bandwidth (TB)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Min</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.min_bandwidth}
                    onChange={(e) => setPricing(prev => ({ ...prev, min_bandwidth: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Max</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.max_bandwidth}
                    onChange={(e) => setPricing(prev => ({ ...prev, max_bandwidth: parseInt(e.target.value) || 100 }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Step</label>
                  <input
                    type="number"
                    min="1"
                    value={pricing.bandwidth_step}
                    onChange={(e) => setPricing(prev => ({ ...prev, bandwidth_step: parseInt(e.target.value) || 1 }))}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add-on Features */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6">Add-on Features Pricing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">DDoS Protection ($/month)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.ddos_protection_price}
                onChange={(e) => setPricing(prev => ({ ...prev, ddos_protection_price: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Automated Backups ($/month)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.backup_price}
                onChange={(e) => setPricing(prev => ({ ...prev, backup_price: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Managed Support ($/month)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.managed_support_price}
                onChange={(e) => setPricing(prev => ({ ...prev, managed_support_price: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-lg font-bold mb-4">Example Calculation</h2>
          <p className="text-sm text-dark-600 dark:text-dark-300 mb-4">
            A VPS with 4 vCPU, 8GB RAM, 100GB Storage, 5TB Bandwidth:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Fee:</span>
              <span>${pricing.base_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>4 vCPU × ${pricing.cpu_price_per_core}:</span>
              <span>${(4 * pricing.cpu_price_per_core).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>8 GB RAM × ${pricing.ram_price_per_gb}:</span>
              <span>${(8 * pricing.ram_price_per_gb).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>100 GB Storage × ${pricing.storage_price_per_gb}:</span>
              <span>${(100 * pricing.storage_price_per_gb).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>5 TB Bandwidth × ${pricing.bandwidth_price_per_tb}:</span>
              <span>${(5 * pricing.bandwidth_price_per_tb).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary-600">${calculateExample()}/mo</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
