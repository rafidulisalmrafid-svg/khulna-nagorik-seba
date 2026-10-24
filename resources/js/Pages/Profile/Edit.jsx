import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AddressSelector from '@/Components/AddressSelector';
import {
    User,
    Phone,
    Mail,
    Key,
    Shield,
    CheckCircle2,
    AlertCircle,
    Camera,
    Trash2,
    ArrowRight,
    ArrowLeft,
    RotateCw,
    Lock,
    Eye,
    EyeOff,
    Building2,
    MapPin,
    CreditCard,
    Sparkles,
    Check,
    Save,
    Upload,
    HelpCircle,
    Info,
} from 'lucide-react';
import axios from 'axios';

export default function ProfileEdit({ wards = [], status }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'phone' | 'email' | 'password'

    // Notification toast state
    const [toast, setToast] = useState(null);
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 6000);
    };

    // ==========================================
    // 1. AVATAR & BASIC INFO STATE
    // ==========================================
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [infoData, setInfoData] = useState({
        name: user.name || '',
        ward_no: user.ward_no || (wards[0]?.ward_no || 1),
        division: user.division || 'খুলনা বিভাগ',
        district: user.district || 'খুলনা',
        upazila: user.upazila || 'সোনাডাঙ্গা (কেসিসি মেট্রো)',
        union_ward: user.union_ward || 'কেসিসি ওয়ার্ড নং ১৭',
        road_street: user.road_street || '',
        holding_no: user.holding_no || '',
        permanent_address: user.permanent_address || '',
    });
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoErrors, setInfoErrors] = useState({});

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
            showToast('error', 'শুধুমাত্র JPG, PNG বা WebP ফরম্যাটের ছবি আপলোড করা যাবে।');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('error', 'ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট (2MB) হতে পারে।');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            await router.post('/profile/update-avatar', formData, {
                onSuccess: () => {
                    setAvatarFile(null);
                    showToast('success', 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।');
                },
                onError: (err) => {
                    showToast('error', err.avatar || 'ছবি আপলোড ব্যর্থ হয়েছে।');
                },
                onFinish: () => setAvatarLoading(false),
            });
        } catch (e) {
            setAvatarLoading(false);
            showToast('error', 'ছবি আপলোড করতে সমস্যা হয়েছে।');
        }
    };

    const handleRemoveAvatar = () => {
        if (!confirm('আপনি কি নিশ্চিত যে প্রোফাইল ছবি মুছে ফেলতে চান?')) return;
        setAvatarLoading(true);
        router.delete('/profile/remove-avatar', {
            onSuccess: () => {
                setAvatarFile(null);
                setAvatarPreview(null);
                showToast('success', 'প্রোফাইল ছবি সরিয়ে ফেলা হয়েছে।');
            },
            onFinish: () => setAvatarLoading(false),
        });
    };

    const handleUpdateInfo = (e) => {
        e.preventDefault();
        setInfoLoading(true);
        setInfoErrors({});

        router.post('/profile/update-info', infoData, {
            onSuccess: () => {
                showToast('success', 'ব্যক্তিগত তথ্য ও ঠিকানা সফলভাবে সংরক্ষিত হয়েছে।');
            },
            onError: (errs) => {
                setInfoErrors(errs);
                showToast('error', 'তথ্য সংরক্ষণে ত্রুটি রয়েছে। অনুগ্রহ করে চেক করুন।');
            },
            onFinish: () => setInfoLoading(false),
        });
    };

    // ==========================================
    // 2. PHONE NUMBER CHANGE STATE (2-STEP OTP)
    // ==========================================
    const [phoneFlowStep, setPhoneFlowStep] = useState(1);
    const [phoneVerifyMethod, setPhoneVerifyMethod] = useState('otp');

    const [oldOtpSent, setOldOtpSent] = useState(false);
    const [oldOtpCode, setOldOtpCode] = useState('');
    const [oldDevOtp, setOldDevOtp] = useState('');
    const [oldTimer, setOldTimer] = useState(60);
    const [oldLoading, setOldLoading] = useState(false);

    const [fallbackNid, setFallbackNid] = useState('');
    const [fallbackPassword, setFallbackPassword] = useState('');

    const [newPhone, setNewPhone] = useState('');
    const [newOtpSent, setNewOtpSent] = useState(false);
    const [newOtpCode, setNewOtpCode] = useState('');
    const [newDevOtp, setNewDevOtp] = useState('');
    const [newTimer, setNewTimer] = useState(60);
    const [newLoading, setNewLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        let int = null;
        if (oldOtpSent && oldTimer > 0) {
            int = setInterval(() => setOldTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(int);
    }, [oldOtpSent, oldTimer]);

    useEffect(() => {
        let int = null;
        if (newOtpSent && newTimer > 0) {
            int = setInterval(() => setNewTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(int);
    }, [newOtpSent, newTimer]);

    const handleSendOldOtp = async () => {
        setOldLoading(true);
        setPhoneError('');
        try {
            const res = await axios.post('/profile/phone/step1-send-old-otp');
            if (res.data.success) {
                setOldOtpSent(true);
                setOldDevOtp(res.data.dev_otp);
                setOldTimer(60);
                showToast('success', res.data.message);
            }
        } catch (err) {
            setPhoneError(err.response?.data?.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
        } finally {
            setOldLoading(false);
        }
    };

    const handleVerifyOldOtp = async (e) => {
        e.preventDefault();
        setOldLoading(true);
        setPhoneError('');
        try {
            const res = await axios.post('/profile/phone/step1-verify', { otp_code: oldOtpCode });
            if (res.data.success) {
                setPhoneFlowStep(2);
                showToast('success', res.data.message);
            }
        } catch (err) {
            setPhoneError(err.response?.data?.message || 'ভুল ওটিপি কোড।');
        } finally {
            setOldLoading(false);
        }
    };

    const handleVerifyFallback = async (e) => {
        e.preventDefault();
        setOldLoading(true);
        setPhoneError('');
        try {
            const res = await axios.post('/profile/phone/fallback-verify', {
                nid: fallbackNid,
                password: fallbackPassword,
            });
            if (res.data.success) {
                setPhoneFlowStep(2);
                showToast('success', res.data.message);
            }
        } catch (err) {
            setPhoneError(err.response?.data?.message || 'যাচাইকরণ ব্যর্থ হয়েছে। NID বা পাসওয়ার্ড সঠিক দিন।');
        } finally {
            setOldLoading(false);
        }
    };

    const handleSendNewOtp = async (e) => {
        e?.preventDefault();
        const cleaned = newPhone.replace(/[^0-9]/g, '');
        if (cleaned.length !== 11) {
            setPhoneError('নতুন মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।');
            return;
        }

        setNewLoading(true);
        setPhoneError('');
        try {
            const res = await axios.post('/profile/phone/step2-send-new-otp', { new_phone: cleaned });
            if (res.data.success) {
                setNewOtpSent(true);
                setNewDevOtp(res.data.dev_otp);
                setNewTimer(60);
                showToast('success', res.data.message);
            }
        } catch (err) {
            setPhoneError(err.response?.data?.message || err.response?.data?.errors?.new_phone?.[0] || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।');
        } finally {
            setNewLoading(false);
        }
    };

    const handleVerifyNewOtp = async (e) => {
        e.preventDefault();
        setNewLoading(true);
        setPhoneError('');
        try {
            const res = await axios.post('/profile/phone/step2-verify', {
                new_phone: newPhone.replace(/[^0-9]/g, ''),
                otp_code: newOtpCode,
            });
            if (res.data.success) {
                showToast('success', res.data.message);
                setPhoneFlowStep(1);
                setOldOtpSent(false);
                setOldOtpCode('');
                setNewOtpSent(false);
                setNewOtpCode('');
                setNewPhone('');
                router.reload();
            }
        } catch (err) {
            setPhoneError(err.response?.data?.message || 'ওটিপি যাচাই করা যায়নি।');
        } finally {
            setNewLoading(false);
        }
    };

    // ==========================================
    // 3. EMAIL CHANGE STATE
    // ==========================================
    const [newEmail, setNewEmail] = useState('');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtpCode, setEmailOtpCode] = useState('');
    const [emailDevOtp, setEmailDevOtp] = useState('');
    const [emailTimer, setEmailTimer] = useState(60);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        let int = null;
        if (emailOtpSent && emailTimer > 0) {
            int = setInterval(() => setEmailTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(int);
    }, [emailOtpSent, emailTimer]);

    const handleSendEmailOtp = async (e) => {
        e.preventDefault();
        if (!newEmail.includes('@')) {
            setEmailError('সঠিক ইমেইল ফরম্যাট দিন।');
            return;
        }

        setEmailLoading(true);
        setEmailError('');
        try {
            const res = await axios.post('/profile/email/send-otp', { new_email: newEmail });
            if (res.data.success) {
                setEmailOtpSent(true);
                setEmailDevOtp(res.data.dev_otp);
                setEmailTimer(60);
                showToast('success', res.data.message);
            }
        } catch (err) {
            setEmailError(err.response?.data?.message || err.response?.data?.errors?.new_email?.[0] || 'ইমেইল কোড পাঠাতে সমস্যা হয়েছে।');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailError('');
        try {
            const res = await axios.post('/profile/email/verify-otp', {
                new_email: newEmail,
                otp_code: emailOtpCode,
            });
            if (res.data.success) {
                showToast('success', res.data.message);
                setEmailOtpSent(false);
                setEmailOtpCode('');
                setNewEmail('');
                router.reload();
            }
        } catch (err) {
            setEmailError(err.response?.data?.message || 'ভুল অথবা মেয়াদোত্তীর্ণ কোড।');
        } finally {
            setEmailLoading(false);
        }
    };

    // ==========================================
    // 4. PASSWORD CHANGE STATE
    // ==========================================
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [passErrors, setPassErrors] = useState({});

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPassLoading(true);
        setPassErrors({});

        router.post('/profile/change-password', passwordData, {
            onSuccess: () => {
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                showToast('success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
            },
            onError: (errs) => {
                setPassErrors(errs);
                showToast('error', errs.current_password || errs.password || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি হয়েছে।');
            },
            onFinish: () => setPassLoading(false),
        });
    };

    return (
        <MainLayout>
            <Head title="নাগরিক প্রোফাইল ও সেটিংস - খুলনা সেবা" />

            <div className="bg-slate-50 min-h-screen py-8 md:py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Toast Notification Banner */}
                    {toast && (
                        <div
                            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
                                toast.type === 'success'
                                    ? 'bg-emerald-500 text-white border-emerald-600'
                                    : 'bg-rose-600 text-white border-rose-700'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                {toast.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                )}
                                <span>{toast.message}</span>
                            </div>
                            <button
                                onClick={() => setToast(null)}
                                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-black/10"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    )}

                    {/* Header: Citizen Hero Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gov-800 via-navy-900 to-gov-900 text-white p-6 sm:p-8 shadow-xl border border-gov-700/50">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gov-500/10 blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                            {/* Avatar section */}
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 p-1 shadow-2xl overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={user.name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gov-600 rounded-xl flex items-center justify-center text-3xl font-extrabold text-white">
                                            {user.name?.charAt(0) || 'ন'}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="প্রোফাইল ছবি পরিবর্তন করুন"
                                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gov-500 hover:bg-gov-400 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 border-2 border-navy-900"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarSelect}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                />
                            </div>

                            {/* User details summary */}
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>ভেরিফাইড নাগরিক</span>
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
                                        {user.district || 'খুলনা'} জেলা
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
                                        {user.upazila || 'সোনাডাঙ্গা'}
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    {user.name}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-gov-400" />
                                        <span className="font-mono">{user.phone || 'যুক্ত নেই'}</span>
                                    </div>
                                    <span className="text-white/20">•</span>
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                                        <span>NID: {user.nid ? `${user.nid.slice(0, 4)}••••${user.nid.slice(-3)}` : 'নেই'}</span>
                                    </div>
                                    {user.email && (
                                        <>
                                            <span className="text-white/20">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                                                <span>{user.email}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Formatted Address display */}
                                {user.formatted_address && (
                                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300/90 pt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        <span className="line-clamp-1">{user.formatted_address}</span>
                                    </div>
                                )}

                                {/* Avatar Upload / Remove confirmation buttons if file selected */}
                                {avatarFile && (
                                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 animate-fadeIn">
                                        <button
                                            type="button"
                                            onClick={handleUploadAvatar}
                                            disabled={avatarLoading}
                                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>{avatarLoading ? 'সংরক্ষণ হচ্ছে...' : 'ছবিটি নিশ্চিত করুন'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarFile(null);
                                                setAvatarPreview(user.avatar_url || null);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                                        >
                                            বাতিল
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                                activeTab === 'info'
                                    ? 'bg-gov-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>১. ব্যক্তিগত তথ্য ও ঠিকানা</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('phone')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                                activeTab === 'phone'
                                    ? 'bg-gov-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Phone className="w-4 h-4" />
                            <span>২. ফোন নম্বর পরিবর্তন</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('email')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                                activeTab === 'email'
                                    ? 'bg-gov-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Mail className="w-4 h-4" />
                            <span>৩. ইমেইল অ্যাড্রেস</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                                activeTab === 'password'
                                    ? 'bg-gov-600 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Key className="w-4 h-4" />
                            <span>৪. পাসওয়ার্ড ও নিরাপত্তা</span>
                        </button>
                    </div>

                    {/* ========================================================
                        TAB 1: PERSONAL INFORMATION & DETAILED CASCADING ADDRESS
                    ======================================================== */}
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gov-600" />
                                        <span>ব্যক্তিগত তথ্য ও ঠিকানা সম্পাদনা</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        আপনার নাম, স্থায়ী ও বর্তমান ঠিকানা এবং খুলনা বিভাগের স্তরবিন্যস্ত ভৌগোলিক এলাকা আপডেট করুন।
                                    </p>
                                </div>

                                {user.avatar && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        disabled={avatarLoading}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>ছবি মুছে ফেলুন</span>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdateInfo} className="space-y-6">
                                {/* Name and NID in grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            <span>পুরো নাম</span>
                                            <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={infoData.name}
                                                onChange={(e) => setInfoData({ ...infoData, name: e.target.value })}
                                                placeholder="আপনার পুরো নাম"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600 font-medium"
                                            />
                                        </div>
                                        {infoErrors.name && <p className="text-xs text-rose-500">{infoErrors.name}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                            <span>জাতীয় পরিচয়পত্র (NID) নম্বর</span>
                                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> যাচাইকৃত ও সুরক্ষিত
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                disabled
                                                value={user.nid || 'নিবন্ধনকালে যুক্ত করা হয়নি'}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Cascading Address Selector */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90">
                                    <AddressSelector
                                        values={infoData}
                                        onChange={(updated) => setInfoData(updated)}
                                        errors={infoErrors}
                                        title="খুলনা বিভাগের স্থানীয় ঠিকানা নির্বাচন"
                                    />
                                </div>

                                {/* Permanent Address Textarea */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                                        <span>স্থায়ী ঠিকানা (যদি বর্তমান ঠিকানা থেকে আলাদা হয়)</span>
                                        <span className="text-slate-400 font-normal">ঐচ্ছিক</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={infoData.permanent_address}
                                        onChange={(e) => setInfoData({ ...infoData, permanent_address: e.target.value })}
                                        placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা"
                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-gov-600 font-medium"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={infoLoading}
                                        className="px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{infoLoading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 2: TWO-STEP PHONE NUMBER VERIFICATION WIZARD
                    ======================================================== */}
                    {activeTab === 'phone' && (
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                            <div className="pb-4 border-b border-slate-100">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-gov-600" />
                                    <span>নিরাপদ ফোন নম্বর পরিবর্তন ও যাচাইকরণ</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    অ্যাকাউন্টের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে পুরোনো নম্বর ও নতুন নম্বর—উভয়টিতে OTP কোড যাচাই আবশ্যক।
                                </p>
                            </div>

                            {/* Wizard Progress Steps Indicator */}
                            <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto py-2">
                                <div
                                    className={`p-3 rounded-2xl border text-center transition-all ${
                                        phoneFlowStep === 1
                                            ? 'bg-gov-50 border-gov-500 text-gov-800 font-extrabold shadow-sm'
                                            : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                    }`}
                                >
                                    <div className="text-[11px] uppercase tracking-wider text-slate-500">ধাপ ১</div>
                                    <div className="text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5">
                                        {phoneFlowStep > 1 && <Check className="w-4 h-4 text-emerald-600" />}
                                        <span>পুরোনো নম্বর বা পরিচয় যাচাই</span>
                                    </div>
                                </div>

                                <div
                                    className={`p-3 rounded-2xl border text-center transition-all ${
                                        phoneFlowStep === 2
                                            ? 'bg-gov-50 border-gov-500 text-gov-800 font-extrabold shadow-sm'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                                    }`}
                                >
                                    <div className="text-[11px] uppercase tracking-wider text-slate-500">ধাপ ২</div>
                                    <div className="text-xs sm:text-sm mt-0.5">
                                        <span>নতুন নম্বর প্রদান ও ওটিপি যাচাই</span>
                                    </div>
                                </div>
                            </div>

                            {phoneError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 max-w-xl mx-auto">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{phoneError}</span>
                                </div>
                            )}

                            {phoneFlowStep === 1 && (
                                <div className="max-w-xl mx-auto space-y-6 pt-2">
                                    <div className="flex rounded-xl bg-slate-100 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setPhoneVerifyMethod('otp')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                phoneVerifyMethod === 'otp'
                                                    ? 'bg-white text-gov-700 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            পদ্ধতি ক: পুরোনো সিমে ওটিপি
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPhoneVerifyMethod('fallback')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                phoneVerifyMethod === 'fallback'
                                                    ? 'bg-white text-gov-700 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            পদ্ধতি খ: সিম হারিয়ে গেলে (NID + পাসওয়ার্ড)
                                        </button>
                                    </div>

                                    {phoneVerifyMethod === 'otp' ? (
                                        <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gov-100 text-gov-700 flex items-center justify-center shrink-0">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-800">
                                                        বর্তমান নিবন্ধিত নম্বর: <span className="font-mono text-sm">{user.phone}</span>
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500">
                                                        পরিবর্তন অনুমোদন করতে আপনার এই নম্বরে পাঠানো ৬ ডিজিটের ওটিপি দিন।
                                                    </p>
                                                </div>
                                            </div>

                                            {!oldOtpSent ? (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOldOtp}
                                                    disabled={oldLoading}
                                                    className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                                                >
                                                    <RotateCw className={`w-3.5 h-3.5 ${oldLoading ? 'animate-spin' : ''}`} />
                                                    <span>{oldLoading ? 'ওটিপি পাঠানো হচ্ছে...' : 'বর্তমান নম্বরে ওটিপি পাঠান'}</span>
                                                </button>
                                            ) : (
                                                <form onSubmit={handleVerifyOldOtp} className="space-y-3 pt-2">
                                                    {oldDevOtp && (
                                                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                                                            <span>টেস্টিং ওটিপি: <strong className="font-mono">{oldDevOtp}</strong></span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setOldOtpCode(oldDevOtp)}
                                                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                                                            >
                                                                অটো-বসিয়ে দিন
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-700">৬ ডিজিটের ওটিপি কোড</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            maxLength={6}
                                                            value={oldOtpCode}
                                                            onChange={(e) => setOldOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                            placeholder="______"
                                                            className="w-full py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-slate-200 focus:ring-2 focus:ring-gov-600"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <button
                                                            type="button"
                                                            onClick={handleSendOldOtp}
                                                            disabled={oldTimer > 0 || oldLoading}
                                                            className={`font-bold ${oldTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-gov-600 hover:underline'}`}
                                                        >
                                                            {oldTimer > 0 ? `${oldTimer} সেক পর আবার পাঠান` : 'পুনরায় ওটিপি পাঠান'}
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={oldLoading || oldOtpCode.length !== 6}
                                                        className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>{oldLoading ? 'যাচাই হচ্ছে...' : 'পুরোনো নম্বর যাচাই সম্পন্ন করুন'}</span>
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleVerifyFallback} className="space-y-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
                                            <div className="flex items-start gap-2.5 text-amber-900 text-xs">
                                                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold">সিম কার্ড না থাকলে:</span> আপনার জাতীয় পরিচয়পত্র (NID) নম্বর ও বর্তমান অ্যাকাউন্টের পাসওয়ার্ড দিয়ে মালিকানা নিশ্চিত করুন।
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-700">জাতীয় পরিচয়পত্র (NID) নম্বর</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={fallbackNid}
                                                    onChange={(e) => setFallbackNid(e.target.value)}
                                                    placeholder="আপনার নিবন্ধিত NID নম্বর"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-700">বর্তমান পাসওয়ার্ড</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={fallbackPassword}
                                                    onChange={(e) => setFallbackPassword(e.target.value)}
                                                    placeholder="আপনার অ্যাকাউন্টের বর্তমান পাসওয়ার্ড"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={oldLoading}
                                                className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Shield className="w-4 h-4" />
                                                <span>{oldLoading ? 'যাচাই করা হচ্ছে...' : 'পরিচয় নিশ্চিত করে এগিয়ে যান'}</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {phoneFlowStep === 2 && (
                                <div className="max-w-xl mx-auto space-y-4 pt-2">
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>ধাপ ১ সফল! এবার আপনার নতুন সচল মোবাইল নম্বরটি প্রদান করুন।</span>
                                    </div>

                                    {!newOtpSent ? (
                                        <form onSubmit={handleSendNewOtp} className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-700 flex justify-between">
                                                    <span>নতুন মোবাইল নম্বর</span>
                                                    <span className="text-slate-400 font-normal">১১ ডিজিট</span>
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="tel"
                                                        required
                                                        maxLength={11}
                                                        value={newPhone}
                                                        onChange={(e) => setNewPhone(e.target.value)}
                                                        placeholder="01XXXXXXXXX"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-gov-600"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={newLoading || newPhone.length < 11}
                                                className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <RotateCw className={`w-3.5 h-3.5 ${newLoading ? 'animate-spin' : ''}`} />
                                                <span>{newLoading ? 'ওটিপি পাঠানো হচ্ছে...' : 'নতুন নম্বরে ওটিপি কোড পাঠান'}</span>
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyNewOtp} className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                            <div className="text-xs text-slate-600 flex items-center justify-between">
                                                <span>নতুন নম্বর: <strong className="font-mono text-slate-800">{newPhone}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewOtpSent(false)}
                                                    className="text-gov-600 hover:underline text-[11px] font-bold"
                                                >
                                                    নম্বর সংশোধন
                                                </button>
                                            </div>

                                            {newDevOtp && (
                                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                                                    <span>নতুন নম্বরের টেস্টিং ওটিপি: <strong className="font-mono">{newDevOtp}</strong></span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewOtpCode(newDevOtp)}
                                                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                                                    >
                                                        অটো-বসিয়ে দিন
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-700">৬ ডিজিটের ওটিপি দিন</label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={6}
                                                    value={newOtpCode}
                                                    onChange={(e) => setNewOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                    placeholder="______"
                                                    className="w-full py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-slate-200 focus:ring-2 focus:ring-gov-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <button
                                                    type="button"
                                                    onClick={handleSendNewOtp}
                                                    disabled={newTimer > 0 || newLoading}
                                                    className={`font-bold ${newTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-gov-600 hover:underline'}`}
                                                >
                                                    {newTimer > 0 ? `${newTimer} সেক পর আবার পাঠান` : 'পুনরায় ওটিপি পাঠান'}
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={newLoading || newOtpCode.length !== 6}
                                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{newLoading ? 'যাচাই করা হচ্ছে...' : 'যাচাই সম্পন্ন করে নম্বর কার্যকর করুন'}</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================
                        TAB 3: EMAIL ADDRESS MANAGEMENT (OTP VERIFICATION)
                    ======================================================== */}
                    {activeTab === 'email' && (
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                            <div className="pb-4 border-b border-slate-100">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-gov-600" />
                                    <span>ইমেইল অ্যাড্রেস যুক্ত বা পরিবর্তন</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    আবেদন সংক্রান্ত গুরুত্বপূর্ণ নোটিফিকেশন পেতে আপনার বৈধ ইমেইল অ্যাড্রেস যুক্ত বা পরিবর্তন করুন।
                                </p>
                            </div>

                            <div className="max-w-xl mx-auto space-y-5">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium">বর্তমান ইমেইল:</div>
                                            <div className="text-sm font-bold text-slate-800">
                                                {user.email || 'কোনো ইমেইল যুক্ত নেই'}
                                            </div>
                                        </div>
                                    </div>

                                    {user.email && (
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>যাচাইকৃত</span>
                                        </span>
                                    )}
                                </div>

                                {emailError && (
                                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{emailError}</span>
                                    </div>
                                )}

                                {!emailOtpSent ? (
                                    <form onSubmit={handleSendEmailOtp} className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700">নতুন ইমেইল অ্যাড্রেস</label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    placeholder="new-email@example.com"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={emailLoading || !newEmail}
                                            className="w-full py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            <RotateCw className={`w-3.5 h-3.5 ${emailLoading ? 'animate-spin' : ''}`} />
                                            <span>{emailLoading ? 'যাচাইকরণ কোড পাঠানো হচ্ছে...' : 'ইমেইল যাচাইকরণ কোড পাঠান'}</span>
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyEmailOtp} className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm animate-fadeIn">
                                        <div className="text-xs text-slate-600 flex items-center justify-between">
                                            <span>নতুন ইমেইল: <strong className="text-slate-900">{newEmail}</strong></span>
                                            <button
                                                type="button"
                                                onClick={() => setEmailOtpSent(false)}
                                                className="text-gov-600 hover:underline text-[11px] font-bold"
                                            >
                                                পরিবর্তন
                                            </button>
                                        </div>

                                        {emailDevOtp && (
                                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                                                <span>টেস্টিং কোড: <strong className="font-mono">{emailDevOtp}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEmailOtpCode(emailDevOtp)}
                                                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                                                >
                                                    অটো-বসিয়ে দিন
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700">৬ ডিজিটের ইমেইল ওটিপি কোড</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={emailOtpCode}
                                                onChange={(e) => setEmailOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="______"
                                                className="w-full py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-slate-200 focus:ring-2 focus:ring-gov-600"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <button
                                                type="button"
                                                onClick={handleSendEmailOtp}
                                                disabled={emailTimer > 0 || emailLoading}
                                                className={`font-bold ${emailTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-gov-600 hover:underline'}`}
                                            >
                                                {emailTimer > 0 ? `${emailTimer} সেক পর আবার পাঠান` : 'পুনরায় কোড পাঠান'}
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={emailLoading || emailOtpCode.length !== 6}
                                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>{emailLoading ? 'যাচাই করা হচ্ছে...' : 'ইমেইল যাচাই ও সংরক্ষণ করুন'}</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 4: PASSWORD CHANGE & SECURITY
                    ======================================================== */}
                    {activeTab === 'password' && (
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
                            <div className="pb-4 border-b border-slate-100">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-gov-600" />
                                    <span>পাসওয়ার্ড পরিবর্তন ও সেশন সুরক্ষা</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    অ্যাকাউন্টের সুরক্ষার জন্য নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।
                                </p>
                            </div>

                            <form onSubmit={handlePasswordChange} className="max-w-xl mx-auto space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                        <span>বর্তমান পাসওয়ার্ড</span>
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            placeholder="আপনার বর্তমান পাসওয়ার্ড দিন"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passErrors.current_password && (
                                        <p className="text-xs text-rose-500 font-semibold">{passErrors.current_password}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                        <span>নতুন পাসওয়ার্ড</span>
                                        <span className="text-slate-400 font-normal">কমপক্ষে ৮ অক্ষর</span>
                                    </label>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            required
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                            placeholder="নতুন শক্তিশালী পাসওয়ার্ড লিখুন"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passErrors.password && (
                                        <p className="text-xs text-rose-500 font-semibold">{passErrors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                                    <div className="relative">
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            required
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                            placeholder="একই পাসওয়ার্ড পুনরায় দিন"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-600"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span>
                                        পাসওয়ার্ড সফলভাবে পরিবর্তন হলে বর্তমান ডিভাইস ছাড়া অন্য সব পুরোনো ডিভাইস সেশন নিরাপত্তার স্বার্থে স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passLoading}
                                    className="w-full py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{passLoading ? 'পাসওয়ার্ড আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</span>
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </MainLayout>
    );
}
