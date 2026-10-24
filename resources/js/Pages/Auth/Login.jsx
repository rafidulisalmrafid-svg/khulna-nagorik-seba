import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    LogIn,
    Key,
    Phone,
    Shield,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    UserPlus,
    Lock,
    Eye,
    EyeOff,
    Mail,
    Sparkles,
} from 'lucide-react';
import axios from 'axios';

export default function Login({ status, canResetPassword, redirect = '' }) {
    // Mode: 'citizen' (phone + pass) or 'official' (email + pass)
    const [loginMode, setLoginMode] = useState('citizen');
    const [phoneState, setPhoneState] = useState({
        checking: false,
        checked: false,
        exists: null,
        userName: '',
        errorMessage: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        phone: '',
        email: '',
        password: '',
        remember: true,
        redirect: redirect || '',
    });

    // Check phone whenever user enters a valid 11 digit number
    const handleCheckPhone = async (phoneNumber) => {
        const cleaned = (phoneNumber || data.phone).replace(/[^0-9]/g, '');
        if (cleaned.length < 11) {
            setPhoneState({
                checking: false,
                checked: false,
                exists: null,
                userName: '',
                errorMessage: '',
            });
            return;
        }

        setPhoneState((prev) => ({ ...prev, checking: true, errorMessage: '' }));
        clearErrors('phone');

        try {
            const res = await axios.post('/auth/check-phone', { phone: cleaned });
            if (res.data.exists) {
                setPhoneState({
                    checking: false,
                    checked: true,
                    exists: true,
                    userName: res.data.name,
                    errorMessage: '',
                });
            } else {
                setPhoneState({
                    checking: false,
                    checked: true,
                    exists: false,
                    userName: '',
                    errorMessage: res.data.message || 'এই নম্বরে কোনো অ্যাকাউন্ট নেই',
                });
            }
        } catch (err) {
            setPhoneState({
                checking: false,
                checked: true,
                exists: false,
                userName: '',
                errorMessage: 'নম্বর যাচাই করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।',
            });
        }
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        setData('phone', val);
        const cleaned = val.replace(/[^0-9]/g, '');
        if (cleaned.length === 11) {
            handleCheckPhone(cleaned);
        } else if (phoneState.checked) {
            setPhoneState({
                checking: false,
                checked: false,
                exists: null,
                userName: '',
                errorMessage: '',
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (loginMode === 'citizen') {
            if (!phoneState.exists) {
                handleCheckPhone(data.phone);
                return;
            }
        }

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    // Quick fill for official/admin test credentials
    const setRoleCredentials = (email, roleName) => {
        setLoginMode('official');
        setData({
            ...data,
            email: email,
            password: 'password123',
        });
    };

    return (
        <GuestLayout>
            <Head title="নাগরিক ও কর্মকর্তা লগইন - খুলনা সেবা" />

            <div className="mb-6 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gov-50 text-gov-700 border border-gov-200 mb-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>খুলনা সিটি কর্পোরেশন ডিজিটাল সেবা</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-navy-950">
                    {loginMode === 'citizen' ? 'নাগরিক লগইন' : 'কর্মকর্তা লগইন'}
                </h3>
                <p className="text-xs text-slate-500">
                    {loginMode === 'citizen'
                        ? 'মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে আপনার অ্যাকাউন্টে প্রবেশ করুন'
                        : 'কর্মকর্তা আইডি/ইমেইল এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
                </p>
            </div>

            {/* Redirect notice if target service is requested */}
            {redirect && (
                <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">সরাসরি সেবায় যেতে:</span> লগইন সম্পন্ন হওয়ামাত্রই আপনি সরাসরি নির্বাচিত সেবার আবেদন ফর্মে পৌঁছে যাবেন।
                    </div>
                </div>
            )}

            {status && (
                <div className="mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{status}</span>
                </div>
            )}

            {/* Login Mode Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                    type="button"
                    onClick={() => {
                        setLoginMode('citizen');
                        clearErrors();
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        loginMode === 'citizen'
                            ? 'bg-white text-gov-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Phone className="w-3.5 h-3.5" />
                    <span>নাগরিক লগইন</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setLoginMode('official');
                        clearErrors();
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        loginMode === 'official'
                            ? 'bg-white text-gov-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Mail className="w-3.5 h-3.5" />
                    <span>অফিসিয়াল লগইন</span>
                </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {loginMode === 'citizen' ? (
                    <>
                        {/* 1. Mobile Phone Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex justify-between">
                                <span>মোবাইল নম্বর</span>
                                <span className="text-slate-400 font-normal">১১ ডিজিট</span>
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="017XXXXXXXX"
                                    maxLength={11}
                                    className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600 font-medium tracking-wide"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCheckPhone(data.phone)}
                                    disabled={phoneState.checking || data.phone.length < 11}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
                                >
                                    {phoneState.checking ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
                                </button>
                            </div>
                            {errors.phone && <p className="text-xs text-rose-500 font-semibold">{errors.phone}</p>}
                        </div>

                        {/* If Phone NOT Registered */}
                        {phoneState.checked && !phoneState.exists && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3 animate-fadeIn">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-xs">
                                            {phoneState.errorMessage || 'এই নম্বরে কোনো অ্যাকাউন্ট নেই'}
                                        </h4>
                                        <p className="text-[11px] text-rose-700 mt-0.5">
                                            সেবা গ্রহণ করতে অনুগ্রহ করে প্রথমে একটি নতুন নাগরিক অ্যাকাউন্ট তৈরি করুন।
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/register?phone=${encodeURIComponent(data.phone)}&redirect=${encodeURIComponent(redirect || '')}`}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition hover:shadow"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>নতুন অ্যাকাউন্ট খুলুন</span>
                                </Link>
                            </div>
                        )}

                        {/* If Phone Registered -> Show Password Field */}
                        {phoneState.checked && phoneState.exists && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>অ্যাকাউন্ট: {phoneState.userName}</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-600 font-medium">যাচাইকৃত</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-bold text-slate-700">পাসওয়ার্ড</label>
                                        {canResetPassword && (
                                            <Link href="/forgot-password" className="text-gov-600 hover:underline">
                                                ভুলে গেছেন?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoFocus
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="আপনার পাসওয়ার্ড দিন"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-rose-500 font-semibold">{errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>{processing ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
                                </button>
                            </div>
                        )}

                        {/* When phone not yet verified, show Next Button */}
                        {!phoneState.checked && (
                            <button
                                type="button"
                                onClick={() => handleCheckPhone(data.phone)}
                                disabled={phoneState.checking || data.phone.length < 11}
                                className="w-full py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <span>{phoneState.checking ? 'যাচাই করা হচ্ছে...' : 'এগিয়ে যান'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    /* Official / Email Login Form */
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">অফিসিয়াল ইমেইল</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="officer@khulnacity.gov.bd"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600 font-medium"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <label className="font-bold text-slate-700">পাসওয়ার্ড</label>
                                {canResetPassword && (
                                    <Link href="/forgot-password" className="text-gov-600 hover:underline">
                                        ভুলে গেছেন?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{processing ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
                        </button>
                    </>
                )}
            </form>

            {/* Quick Demo Credentials Footer (for testing) */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>নতুন নাগরিক?</span>
                    <Link
                        href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                        className="font-bold text-gov-600 hover:underline flex items-center gap-1"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
                    </Link>
                </div>

                {/* Developer Role Switcher */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-2">
                    <div className="font-bold text-slate-700 flex items-center justify-between">
                        <span>🧪 ডেমো লগইন ক্রেডেনশিয়াল:</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ক্লিক করুন</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMode('citizen');
                                setData((prev) => ({
                                    ...prev,
                                    phone: '01711000001',
                                    email: 'citizen@example.com',
                                    password: 'password123',
                                }));
                                handleCheckPhone('01711000001');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-gov-400 transition"
                        >
                            <div className="font-bold text-slate-800">নাগরিক</div>
                            <div className="text-[10px] text-slate-500 font-mono">01711000001</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRoleCredentials('admin@khulnacity.gov.bd', 'Super Admin')}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-left hover:border-gov-400 transition"
                        >
                            <div className="font-bold text-slate-800">সুপার অ্যাডমিন</div>
                            <div className="text-[10px] text-slate-500">admin@khulnacity...</div>
                        </button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
