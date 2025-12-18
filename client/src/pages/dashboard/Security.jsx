import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
    Shield, Key, Lock, Eye, EyeOff, Loader2, Check, X,
    Smartphone, QrCode, AlertTriangle, CheckCircle
} from 'lucide-react'
import { authAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function UserSecurity() {
    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [passwordLoading, setPasswordLoading] = useState(false)

    // 2FA state
    const [twoFAStatus, setTwoFAStatus] = useState(false)
    const [twoFALoading, setTwoFALoading] = useState(true)
    const [setupData, setSetupData] = useState(null)
    const [verifyCode, setVerifyCode] = useState('')
    const [disableCode, setDisableCode] = useState('')
    const [showDisableDialog, setShowDisableDialog] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        load2FAStatus()
    }, [])

    const load2FAStatus = async () => {
        try {
            const res = await authAPI.get2FAStatus()
            setTwoFAStatus(res.data.enabled)
        } catch (err) {
            console.error('Failed to load 2FA status:', err)
        } finally {
            setTwoFALoading(false)
        }
    }

    // Password change handler
    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('Passwords do not match')
            return
        }

        if (passwordForm.new_password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setPasswordLoading(true)
        try {
            await authAPI.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            })
            toast.success('Password changed successfully!')
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    // 2FA Setup
    const handleSetup2FA = async () => {
        setActionLoading(true)
        try {
            const res = await authAPI.setup2FA()
            setSetupData(res.data)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to setup 2FA')
        } finally {
            setActionLoading(false)
        }
    }

    // 2FA Verify
    const handleVerify2FA = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            toast.error('Please enter a 6-digit code')
            return
        }

        setActionLoading(true)
        try {
            await authAPI.verify2FA(verifyCode)
            toast.success('2FA enabled successfully!')
            setTwoFAStatus(true)
            setSetupData(null)
            setVerifyCode('')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid verification code')
        } finally {
            setActionLoading(false)
        }
    }

    // 2FA Disable
    const handleDisable2FA = async () => {
        if (!disableCode || disableCode.length !== 6) {
            toast.error('Please enter your current 2FA code')
            return
        }

        setActionLoading(true)
        try {
            await authAPI.disable2FA(disableCode)
            toast.success('2FA disabled successfully')
            setTwoFAStatus(false)
            setShowDisableDialog(false)
            setDisableCode('')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid code')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Security - Magnetic Clouds</title>
            </Helmet>

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Security Settings</h1>
                    <p className="text-dark-500 mt-1">Manage your password and two-factor authentication</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
                    {/* Password Change */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Change Password</h2>
                                <p className="text-sm text-dark-500">Update your account password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        className="input pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                    >
                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        className="input pl-10 pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                    >
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-dark-400 mt-1">Minimum 8 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        className="input pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                                Change Password
                            </button>
                        </form>
                    </motion.div>

                    {/* Two-Factor Authentication */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className={clsx(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                twoFAStatus
                                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                            )}>
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Two-Factor Authentication</h2>
                                <p className="text-sm text-dark-500">
                                    {twoFAStatus ? 'Currently enabled' : 'Add an extra layer of security'}
                                </p>
                            </div>
                            {!twoFALoading && (
                                <div className={clsx(
                                    "ml-auto px-3 py-1 rounded-full text-sm font-medium",
                                    twoFAStatus
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                )}>
                                    {twoFAStatus ? 'Enabled' : 'Disabled'}
                                </div>
                            )}
                        </div>

                        {twoFALoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            </div>
                        ) : twoFAStatus ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        <div>
                                            <p className="font-medium text-emerald-700 dark:text-emerald-400">2FA is Active</p>
                                            <p className="text-sm text-emerald-600 dark:text-emerald-500">Your account is protected</p>
                                        </div>
                                    </div>
                                </div>

                                {showDisableDialog ? (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 space-y-4">
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="font-medium">Disable 2FA</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={disableCode}
                                            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="input text-center text-2xl tracking-widest"
                                            maxLength={6}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowDisableDialog(false)} className="btn-secondary flex-1">Cancel</button>
                                            <button
                                                onClick={handleDisable2FA}
                                                disabled={actionLoading || disableCode.length !== 6}
                                                className="btn-danger flex-1 flex items-center justify-center gap-2"
                                            >
                                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                Disable
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowDisableDialog(true)} className="btn-secondary w-full text-red-500">
                                        Disable Two-Factor Authentication
                                    </button>
                                )}
                            </div>
                        ) : setupData ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                    <p className="text-sm text-primary-700 dark:text-primary-400 mb-4">Scan this QR code with your authenticator app</p>
                                    <div className="flex justify-center mb-4">
                                        <img src={setupData.qrCode} alt="2FA QR Code" className="rounded-xl" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-dark-500 mb-1">Manual entry key:</p>
                                        <code className="text-sm bg-dark-100 dark:bg-dark-800 px-3 py-1 rounded font-mono">{setupData.secret}</code>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="input text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setSetupData(null)} className="btn-secondary flex-1">Cancel</button>
                                    <button
                                        onClick={handleVerify2FA}
                                        disabled={actionLoading || verifyCode.length !== 6}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            We recommend enabling 2FA for enhanced security
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSetup2FA}
                                    disabled={actionLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                                    Setup Two-Factor Authentication
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    )
}
