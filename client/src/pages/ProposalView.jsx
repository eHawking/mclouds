import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  FileText, CheckCircle, XCircle, Clock, Building2, Mail, Phone, Globe,
  Calendar, DollarSign, Shield, Sparkles, Crown, Zap, Star, Download,
  Check, X, Loader2, Lock, CreditCard, AlertCircle, MapPin
} from 'lucide-react'
import { proposalsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Invoice Template Components
// Company Address Constant
const COMPANY_ADDRESS = "3rd Floor, 45 Albemarle Street, Mayfair, London W1S 4JL"

const InvoiceModern = ({ proposal, company }) => (
  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
    {/* Header with premium gradient */}
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-400 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
      </div>
      <div className="relative flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{company?.name || 'Magnetic Clouds'}</h1>
              <p className="text-slate-400 text-sm">{company?.tagline || 'Premium Cloud Solutions'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Proposal</p>
            <p className="text-xl font-bold font-mono">#{proposal.proposal_number || proposal.uuid?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Prepared For
          </h3>
          <p className="font-bold text-lg text-slate-800">{proposal.user_name}</p>
          <p className="text-slate-600">{proposal.user_email}</p>
          {proposal.user_company && <p className="text-slate-500 text-sm mt-1">{proposal.user_company}</p>}
        </div>
        <div className="p-5 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-200 text-right">
          <div className="mb-4">
            <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">Issue Date</p>
            <p className="font-medium text-slate-800">{new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">Valid Until</p>
            <p className="font-medium text-slate-800">{new Date(proposal.valid_until).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-2">{proposal.title}</h2>
        {proposal.description && <p className="text-slate-300">{proposal.description}</p>}
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
              <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposal.items?.map((item, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <p className="font-medium text-slate-800">{item.name}</p>
                  {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                </td>
                <td className="text-center py-4 px-4 text-slate-600">{item.quantity}</td>
                <td className="text-right py-4 px-4 text-slate-600">${parseFloat(item.price).toFixed(2)}</td>
                <td className="text-right py-4 px-4 font-bold text-slate-800">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-slate-400">Subtotal</span>
            <span>${proposal.subtotal?.toFixed(2)}</span>
          </div>
          {proposal.discount_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/10 text-green-400">
              <span>Discount</span>
              <span>-${proposal.discount_amount?.toFixed(2)}</span>
            </div>
          )}
          {proposal.tax_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-slate-400">Tax</span>
              <span>${proposal.tax_amount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-2xl font-bold">
            <span>Total</span>
            <span className="text-primary-400">${proposal.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-8 py-4 border-t border-slate-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>{COMPANY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4" />
          <span>Secured by Magnetic Clouds</span>
        </div>
      </div>
    </div>
  </div>
)

const InvoicePremium = ({ proposal, company }) => (
  <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-300">
    {/* Header */}
    <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-300 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
      </div>
      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{company?.name || 'Magnetic Clouds'}</h1>
            <p className="text-amber-100 flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" /> Premium Proposal
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-5 py-3 bg-white/20 backdrop-blur rounded-xl border border-white/30">
            <p className="text-amber-100 text-xs uppercase tracking-widest">Proposal No.</p>
            <p className="text-2xl font-bold">#{proposal.proposal_number || proposal.uuid?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="p-5 bg-white rounded-xl shadow-lg border border-amber-200">
          <h3 className="text-xs font-bold text-amber-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Prepared For
          </h3>
          <p className="font-bold text-xl text-slate-800">{proposal.user_name}</p>
          <p className="text-slate-600">{proposal.user_email}</p>
          {proposal.user_company && <p className="text-slate-500 text-sm mt-1">{proposal.user_company}</p>}
        </div>
        <div className="p-5 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-lg border border-amber-200 text-right">
          <div className="mb-4">
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Issue Date</p>
            <p className="font-semibold text-slate-800">{new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Valid Until</p>
            <p className="font-semibold text-slate-800">{new Date(proposal.valid_until).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-white shadow-lg">
        <h2 className="text-xl font-bold">{proposal.title}</h2>
        {proposal.description && <p className="text-amber-100 mt-1">{proposal.description}</p>}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-amber-200">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-4 grid grid-cols-12 text-xs font-bold uppercase tracking-wider">
          <div className="col-span-6">Item Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        {proposal.items?.map((item, i) => (
          <div key={i} className="px-6 py-5 grid grid-cols-12 border-b border-amber-100 items-center hover:bg-amber-50 transition-colors">
            <div className="col-span-6">
              <p className="font-semibold text-slate-800">{item.name}</p>
              {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
            </div>
            <div className="col-span-2 text-center text-slate-600">{item.quantity}</div>
            <div className="col-span-2 text-right text-slate-600">${parseFloat(item.price).toFixed(2)}</div>
            <div className="col-span-2 text-right font-bold text-amber-700">${(item.quantity * item.price).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex justify-between py-2 border-b border-white/20">
            <span className="text-amber-100">Subtotal</span>
            <span className="font-medium">${proposal.subtotal?.toFixed(2)}</span>
          </div>
          {proposal.discount_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="text-amber-100">Discount</span>
              <span className="font-medium text-green-200">-${proposal.discount_amount?.toFixed(2)}</span>
            </div>
          )}
          {proposal.tax_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="text-amber-100">Tax</span>
              <span className="font-medium">${proposal.tax_amount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 text-2xl font-bold">
            <span>Total</span>
            <span>${proposal.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-8 py-4 border-t border-amber-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-amber-700">
          <MapPin className="w-4 h-4" />
          <span>{COMPANY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <Crown className="w-4 h-4" />
          <span>Premium Services by Magnetic Clouds</span>
        </div>
      </div>
    </div>
  </div>
)

const InvoiceTech = ({ proposal, company }) => (
  <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden text-white border border-cyan-500/30">
    {/* Header */}
    <div className="p-8 border-b border-cyan-500/30 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {company?.name || 'Magnetic Clouds'}
            </h1>
            <p className="text-slate-400 text-sm font-mono tracking-wider">// PROPOSAL DOCUMENT</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-5 py-3 bg-cyan-500/20 backdrop-blur rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <p className="text-xs text-cyan-400 font-mono">ID://</p>
            <p className="font-mono font-bold text-lg">{proposal.uuid?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-8">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
          <p className="text-xs text-cyan-400 mb-2 font-mono">// CLIENT</p>
          <p className="font-bold text-lg">{proposal.user_name}</p>
          <p className="text-sm text-slate-400">{proposal.user_email}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
          <p className="text-xs text-cyan-400 mb-2 font-mono">// ISSUED</p>
          <p className="font-bold text-lg">{new Date(proposal.created_at).toLocaleDateString()}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
          <p className="text-xs text-cyan-400 mb-2 font-mono">// EXPIRES</p>
          <p className="font-bold text-lg">{new Date(proposal.valid_until).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 backdrop-blur">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{proposal.title}</h2>
        {proposal.description && <p className="text-slate-400 mt-2">{proposal.description}</p>}
      </div>

      {/* Items */}
      <div className="mb-8 space-y-3">
        {proposal.items?.map((item, i) => (
          <div key={i} className="p-5 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-xl border border-slate-700 hover:border-cyan-500/50 flex justify-between items-center transition-all hover:shadow-lg hover:shadow-cyan-500/10">
            <div>
              <p className="font-semibold text-lg">{item.name}</p>
              {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 font-mono">{item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
              <p className="font-bold text-xl text-cyan-400">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 rounded-xl shadow-xl shadow-cyan-500/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-cyan-100 text-sm font-mono">// TOTAL_AMOUNT</p>
            <p className="text-4xl font-bold">${proposal.total?.toFixed(2)}</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p className="text-cyan-100">Subtotal: ${proposal.subtotal?.toFixed(2)}</p>
            {proposal.discount_amount > 0 && (
              <p className="text-green-300">Discount: -${proposal.discount_amount?.toFixed(2)}</p>
            )}
            {proposal.tax_amount > 0 && (
              <p className="text-cyan-100">Tax: ${proposal.tax_amount?.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-slate-800/50 px-8 py-4 border-t border-cyan-500/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{COMPANY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Zap className="w-4 h-4" />
          <span className="font-mono">Powered by Magnetic Clouds</span>
        </div>
      </div>
    </div>
  </div>
)

const InvoiceCorporate = ({ proposal, company }) => (
  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-200">
    {/* Header */}
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-300 rounded-full blur-3xl translate-y-1/2" />
      </div>
      <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{company?.name || 'Magnetic Clouds'}</h1>
            <p className="text-indigo-200 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Business Proposal
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur rounded-xl border border-white/20">
            <p className="text-indigo-200 text-xs uppercase tracking-wider">Proposal</p>
            <p className="text-3xl font-bold">#{proposal.uuid?.slice(0, 6).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-indigo-100">
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <h3 className="text-xs font-bold text-indigo-600 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Bill To
          </h3>
          <p className="font-bold text-xl text-slate-800">{proposal.user_name}</p>
          <p className="text-slate-600">{proposal.user_email}</p>
          {proposal.user_company && <p className="text-indigo-600 font-medium mt-1">{proposal.user_company}</p>}
        </div>
        <div className="p-5 bg-white rounded-xl border border-indigo-200 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-semibold text-slate-800">{new Date(proposal.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Valid Until</p>
              <p className="font-semibold text-slate-800">{new Date(proposal.valid_until).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
        <h2 className="text-2xl font-bold">{proposal.title}</h2>
        {proposal.description && <p className="text-indigo-200 mt-2">{proposal.description}</p>}
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-xl border border-indigo-200 mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <th className="text-left py-4 px-5 text-xs uppercase tracking-wider">Description</th>
              <th className="text-center py-4 px-5 text-xs uppercase tracking-wider">Qty</th>
              <th className="text-right py-4 px-5 text-xs uppercase tracking-wider">Rate</th>
              <th className="text-right py-4 px-5 text-xs uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {proposal.items?.map((item, i) => (
              <tr key={i} className="border-b border-indigo-100 hover:bg-indigo-50 transition-colors">
                <td className="py-5 px-5">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                </td>
                <td className="text-center py-5 px-5 text-slate-600">{item.quantity}</td>
                <td className="text-right py-5 px-5 text-slate-600">${parseFloat(item.price).toFixed(2)}</td>
                <td className="text-right py-5 px-5 font-bold text-indigo-700">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-xl">
          <div className="flex justify-between py-2 border-b border-white/20">
            <span className="text-indigo-200">Subtotal</span>
            <span className="font-medium">${proposal.subtotal?.toFixed(2)}</span>
          </div>
          {proposal.discount_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="text-indigo-200">Discount</span>
              <span className="font-medium text-green-300">-${proposal.discount_amount?.toFixed(2)}</span>
            </div>
          )}
          {proposal.tax_amount > 0 && (
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="text-indigo-200">Tax</span>
              <span className="font-medium">${proposal.tax_amount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 text-2xl font-bold">
            <span>Total</span>
            <span>${proposal.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-t border-indigo-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-indigo-700">
          <MapPin className="w-4 h-4" />
          <span>{COMPANY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-600">
          <Building2 className="w-4 h-4" />
          <span>Enterprise Solutions by Magnetic Clouds</span>
        </div>
      </div>
    </div>
  </div>
)

const InvoiceElegant = ({ proposal, company }) => (
  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl overflow-hidden text-white border border-gray-700">
    {/* Header */}
    <div className="p-10 border-b border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-600 shadow-lg">
            <Star className="w-7 h-7 text-gray-300" />
          </div>
          <div>
            <h1 className="text-3xl font-light tracking-wider">{company?.name || 'MAGNETIC CLOUDS'}</h1>
            <p className="text-gray-500 mt-1 tracking-widest text-sm">EXCLUSIVE PROPOSAL</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-6 py-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700">
            <p className="text-gray-500 text-xs tracking-widest mb-1">NO.</p>
            <p className="text-4xl font-thin">{proposal.uuid?.slice(0, 4).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-10">
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700">
          <p className="text-gray-500 text-xs tracking-widest mb-3 flex items-center gap-2">
            <Star className="w-3 h-3" /> PREPARED FOR
          </p>
          <p className="text-2xl font-light">{proposal.user_name}</p>
          <p className="text-gray-400 mt-1">{proposal.user_email}</p>
          {proposal.user_company && <p className="text-gray-500 text-sm mt-2">{proposal.user_company}</p>}
        </div>
        <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700 text-right">
          <div className="mb-4">
            <p className="text-gray-500 text-xs tracking-widest mb-1">ISSUE DATE</p>
            <p className="font-light text-lg">{new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs tracking-widest mb-1">VALID UNTIL</p>
            <p className="font-light text-lg">{new Date(proposal.valid_until).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-12 p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600">
        <h2 className="text-2xl font-light">{proposal.title}</h2>
        {proposal.description && <p className="text-gray-400 mt-3">{proposal.description}</p>}
      </div>

      {/* Items */}
      <div className="mb-12">
        {proposal.items?.map((item, i) => (
          <div key={i} className="py-6 border-b border-gray-800 flex justify-between hover:bg-gray-800/20 transition-colors px-4 -mx-4 rounded-lg">
            <div>
              <p className="text-xl font-light">{item.name}</p>
              {item.description && <p className="text-sm text-gray-500 mt-2">{item.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">{item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
              <p className="text-xl font-light mt-1">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between py-3 text-gray-400 border-b border-gray-700">
            <span>Subtotal</span>
            <span>${proposal.subtotal?.toFixed(2)}</span>
          </div>
          {proposal.discount_amount > 0 && (
            <div className="flex justify-between py-3 text-green-400 border-b border-gray-700">
              <span>Discount</span>
              <span>-${proposal.discount_amount?.toFixed(2)}</span>
            </div>
          )}
          {proposal.tax_amount > 0 && (
            <div className="flex justify-between py-3 text-gray-400 border-b border-gray-700">
              <span>Tax</span>
              <span>${proposal.tax_amount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 text-3xl">
            <span className="font-light">Total</span>
            <span className="font-light">${proposal.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-gray-800/50 px-10 py-5 border-t border-gray-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="tracking-wide">{COMPANY_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Star className="w-4 h-4" />
          <span className="tracking-widest text-xs uppercase">Exclusive by Magnetic Clouds</span>
        </div>
      </div>
    </div>
  </div>
)

// Template selector
const TEMPLATES = {
  modern: InvoiceModern,
  premium: InvoicePremium,
  tech: InvoiceTech,
  corporate: InvoiceCorporate,
  elegant: InvoiceElegant
}

export default function ProposalView() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [proposal, setProposal] = useState(null)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadProposal()
  }, [uuid])

  const loadProposal = async () => {
    try {
      const res = await proposalsAPI.getProposal(uuid)
      setProposal(res.data.proposal)
    } catch (err) {
      setError('Proposal not found or has expired')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this proposal? You will be enrolled in the services listed.')) return
    
    setProcessing(true)
    try {
      await proposalsAPI.acceptProposal(uuid, {})
      toast.success('Proposal accepted! You have been enrolled in the services.')
      loadProposal()
    } catch (err) {
      toast.error('Failed to accept proposal')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      await proposalsAPI.rejectProposal(uuid, { reason: rejectReason })
      toast.success('Proposal rejected')
      setShowRejectModal(false)
      loadProposal()
    } catch (err) {
      toast.error('Failed to reject proposal')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-900 dark:to-dark-800">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
          <p className="text-dark-500">{error || 'This proposal may have expired or been removed.'}</p>
        </div>
      </div>
    )
  }

  const InvoiceTemplate = TEMPLATES[proposal.template] || TEMPLATES.modern
  const isExpired = new Date(proposal.valid_until) < new Date()
  const canRespond = proposal.status === 'sent' || proposal.status === 'viewed'

  return (
    <>
      <Helmet>
        <title>Proposal: {proposal.title} - Magnetic Clouds</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-900 dark:to-dark-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Status Banner */}
          {proposal.status === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-200">Proposal Accepted</p>
                <p className="text-sm text-green-600 dark:text-green-300">You have been enrolled in the services. Check your email for details.</p>
              </div>
            </motion.div>
          )}

          {proposal.status === 'rejected' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-bold text-red-800 dark:text-red-200">Proposal Rejected</p>
                <p className="text-sm text-red-600 dark:text-red-300">This proposal has been declined.</p>
              </div>
            </motion.div>
          )}

          {isExpired && canRespond && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center gap-3"
            >
              <Clock className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-200">Proposal Expired</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">This proposal has expired. Please contact us for a new quote.</p>
              </div>
            </motion.div>
          )}

          {/* Invoice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <InvoiceTemplate proposal={proposal} company={{}} />
          </motion.div>

          {/* Notes & Terms */}
          {(proposal.notes || proposal.terms) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 p-6 bg-white dark:bg-dark-800 rounded-xl shadow-lg"
            >
              {proposal.notes && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-dark-500 mb-2">NOTES</h3>
                  <p className="text-dark-700 dark:text-dark-300">{proposal.notes}</p>
                </div>
              )}
              {proposal.terms && (
                <div>
                  <h3 className="font-bold text-sm text-dark-500 mb-2">TERMS & CONDITIONS</h3>
                  <p className="text-dark-700 dark:text-dark-300 text-sm">{proposal.terms}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          {canRespond && !isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Accept Proposal
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Reject Proposal
              </button>
            </motion.div>
          )}

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-dark-500">
              <Lock className="w-4 h-4" />
              Secured by Magnetic Clouds
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Reject Proposal</h3>
            <p className="text-dark-500 mb-4">Please let us know why you're declining this proposal (optional):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="input w-full mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
