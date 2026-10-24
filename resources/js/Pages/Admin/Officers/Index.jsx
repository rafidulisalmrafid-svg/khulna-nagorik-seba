import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    UserCheck,
    Plus,
    Shield,
    Layers,
    Mail,
    Phone,
    Building2,
    CheckCircle2,
    X,
    Edit2,
    Lock,
    Key,
    User,
    Check,
    AlertCircle,
    Search,
    Eye,
    EyeOff,
    Sparkles,
    Copy,
} from 'lucide-react';

export default function OfficersIndex({ officers = [], services = [], departments = [] }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editServicesOfficer, setEditServicesOfficer] = useState(null);
    const [resetPasswordOfficer, setResetPasswordOfficer] = useState(null);
    const [search, setSearch] = useState('');

    const [showCreatePassword, setShowCreatePassword] = useState(true);
    const [copiedCreatePassword, setCopiedCreatePassword] = useState(false);

    const [showResetPassword, setShowResetPassword] = useState(true);
    const [copiedResetPassword, setCopiedResetPassword] = useState(false);

    // Helper: generate readable, strong password (e.g. Kcc@2026#7x)
    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        const symbols = '!@#$%&*';
        let randomPart = '';
        for (let i = 0; i < 4; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const sym = symbols.charAt(Math.floor(Math.random() * symbols.length));
        return `Kcc@2026${sym}${randomPart}`;
    };

    // 1. Create Officer Form
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'reviewing_officer',
        designation: '',
        department_id: departments[0]?.id || '',
        service_ids: [],
    });

    // 2. Edit Services Form
    const {
        data: editData,
        setData: setEditData,
        post: postEditServices,
        processing: editProcessing,
    } = useForm({
        service_ids: [],
    });

    // 3. Reset Officer Password Form
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPasswordReset,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordForm,
    } = useForm({
        password: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/admin/officers', {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
                setCopiedCreatePassword(false);
            },
        });
    };

    const handleGenerateCreatePassword = () => {
        const pass = generatePassword();
        setData('password', pass);
        setCopiedCreatePassword(false);
        clearErrors('password');
    };

    const handleCopyCreatePassword = () => {
        if (!data.password) return;
        navigator.clipboard.writeText(data.password);
        setCopiedCreatePassword(true);
        setTimeout(() => setCopiedCreatePassword(false), 2500);
    };

    const openEditServicesModal = (officer) => {
        setEditServicesOfficer(officer);
        setEditData({
            service_ids: officer.assigned_services ? officer.assigned_services.map((s) => s.id) : [],
        });
    };

    const handleEditServicesSubmit = (e) => {
        e.preventDefault();
        postEditServices(`/admin/officers/${editServicesOfficer.id}/services`, {
            onSuccess: () => {
                setEditServicesOfficer(null);
            },
        });
    };

    const openResetPasswordModal = (officer) => {
        setResetPasswordOfficer(officer);
        const pass = generatePassword();
        setPasswordData({ password: pass });
        setCopiedResetPassword(false);
    };

    const handleGenerateResetPassword = () => {
        const pass = generatePassword();
        setPasswordData('password', pass);
        setCopiedResetPassword(false);
    };

    const handleCopyResetPassword = () => {
        if (!passwordData.password) return;
        navigator.clipboard.writeText(passwordData.password);
        setCopiedResetPassword(true);
        setTimeout(() => setCopiedResetPassword(false), 2500);
    };

    const handleResetPasswordSubmit = (e) => {
        e.preventDefault();
        postPasswordReset(`/admin/officers/${resetPasswordOfficer.id}/password`, {
            onSuccess: () => {
                setResetPasswordOfficer(null);
                resetPasswordForm();
            },
        });
    };

    const toggleServiceCheckbox = (serviceId) => {
        const current = [...data.service_ids];
        const index = current.indexOf(serviceId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(serviceId);
        }
        setData('service_ids', current);
    };

    const toggleEditServiceCheckbox = (serviceId) => {
        const current = [...editData.service_ids];
        const index = current.indexOf(serviceId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(serviceId);
        }
        setEditData('service_ids', current);
    };

    const roleBadges = {
        super_admin: { label: 'সুপার অ্যাডমিন', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        department_admin: { label: 'বিভাগীয় প্রধান', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        reviewing_officer: { label: 'রিভিউ কর্মকর্তা', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        accounts_officer: { label: 'হিসাবরক্ষণ কর্মকর্তা', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        complaint_officer: { label: 'অভিযোগ কর্মকর্তা', color: 'bg-rose-100 text-rose-800 border-rose-200' },
        helpdesk: { label: 'সিটিজেন কেয়ার অপারেটর', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    };

    const filteredOfficers = officers.filter(
        (o) =>
            o.name.toLowerCase().includes(search.toLowerCase()) ||
            o.email.toLowerCase().includes(search.toLowerCase()) ||
            (o.designation && o.designation.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <Head title="কর্মকর্তা ও দায়িত্ব বণ্টন - খুলনা সেবা" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-black text-navy-950 flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-gov-600" />
                            <span>সেবা অনুযায়ী কর্মকর্তা নিয়োগ ও দায়িত্ব বণ্টন ব্যবস্থা</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            কর্মকর্তাদের অ্যাকাউন্ট পরিচালনা, নিরাপদ পাসওয়ার্ড তৈরি ও বরাদ্দ এবং সেবাভিত্তিক সুনির্দিষ্ট দায়িত্ব অর্পণ
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            reset();
                            setCreateModalOpen(true);
                            // Auto-generate strong initial password
                            const initialPass = generatePassword();
                            setData((prev) => ({ ...prev, password: initialPass }));
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gov-600 text-white hover:bg-gov-700 shadow-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন কর্মকর্তা নিয়োগ করুন</span>
                    </button>
                </div>

                {/* Search & Info Banner */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500 focus:outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            <span>মোট কর্মকর্তা: <strong>{officers.length} জন</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>সুপার অ্যাডমিন: <strong>{officers.filter((o) => o.role === 'super_admin').length} জন</strong></span>
                        </span>
                    </div>
                </div>

                {/* Officers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOfficers.map((officer) => {
                        const badge = roleBadges[officer.role] || {
                            label: officer.role,
                            color: 'bg-slate-100 text-slate-800 border-slate-200',
                        };
                        const assignedList = officer.assigned_services || [];

                        return (
                            <div
                                key={officer.id}
                                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    {/* Top Profile Strip */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gov-100 text-gov-800 font-extrabold flex items-center justify-center shrink-0 border border-gov-200">
                                                {officer.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-navy-950 text-sm">
                                                    {officer.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">{officer.designation || 'দায়িত্বপ্রাপ্ত কর্মকর্তা'}</p>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1 text-slate-600">
                                        <div className="flex items-center gap-2 truncate">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{officer.email}</span>
                                        </div>
                                        {officer.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{officer.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{officer.department?.name_bn || 'কেসিসি কেন্দ্রীয় প্রশাসন'}</span>
                                        </div>
                                    </div>

                                    {/* Assigned Services Tags */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-bold text-slate-700">অনুমোদিত সেবাসমূহ:</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openResetPasswordModal(officer)}
                                                    className="text-amber-700 hover:text-amber-800 hover:underline font-bold inline-flex items-center gap-1 text-[10px]"
                                                    title="পাসওয়ার্ড রিসেট করুন"
                                                >
                                                    <Key className="w-3 h-3" />
                                                    <span>পাসওয়ার্ড</span>
                                                </button>
                                                <button
                                                    onClick={() => openEditServicesModal(officer)}
                                                    className="text-gov-700 hover:underline font-bold inline-flex items-center gap-1 text-[10px]"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    <span>দায়িত্ব পরিবর্তন</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 min-h-[38px]">
                                            {officer.role === 'super_admin' ? (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                    ★ সকল সেবায় পূর্ণ অ্যাক্সেস (Super Admin)
                                                </span>
                                            ) : assignedList.length > 0 ? (
                                                assignedList.map((svc) => (
                                                    <span
                                                        key={svc.id}
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gov-50 text-gov-800 border border-gov-200"
                                                    >
                                                        {svc.name_bn}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">
                                                    কোনো নির্দিষ্ট সেবা বরাদ্দ করা নেই
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Workload Footer */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">বরাদ্দকৃত</div>
                                        <div className="font-extrabold text-slate-800">{officer.total_assigned_apps || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">সম্পন্ন</div>
                                        <div className="font-extrabold text-emerald-600">{officer.completed_apps || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">বাকি</div>
                                        <div className="font-extrabold text-amber-600">{officer.pending_apps || 0}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MODAL 1: Create New Officer & Set Password                     */}
            {/* ------------------------------------------------------------- */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-gov-600" />
                                    <span>নতুন কর্মকর্তা নিয়োগ ও পাসওয়ার্ড তৈরি</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    কর্মকর্তার প্রাথমিক লগইন পাসওয়ার্ড অ্যাডমিন নিজে সেট করবেন
                                </p>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        কর্মকর্তার নাম <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="যেমন: মোঃ কামরুল হাসান"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        required
                                    />
                                    {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        অফিসিয়াল ইমেইল (লগইনের জন্য) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="officer@khulnacity.gov.bd"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        required
                                    />
                                    {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        মোবাইল নম্বর <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="017XXXXXXXX"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        required
                                    />
                                    {errors.phone && <p className="text-rose-600 text-[10px] mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        পদবি (Designation) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.designation}
                                        onChange={(e) => setData('designation', e.target.value)}
                                        placeholder="যেমন: লাইসেন্স ও রাজস্ব পরিদর্শক"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        required
                                    />
                                    {errors.designation && <p className="text-rose-600 text-[10px] mt-1">{errors.designation}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        রোল বা ভূমিকা <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                    >
                                        <option value="reviewing_officer">রিভিউ কর্মকর্তা (Reviewing Officer)</option>
                                        <option value="department_admin">বিভাগীয় প্রধান (Department Admin)</option>
                                        <option value="accounts_officer">হিসাবরক্ষণ কর্মকর্তা (Accounts Officer)</option>
                                        <option value="complaint_officer">অভিযোগ কর্মকর্তা (Complaint Officer)</option>
                                        <option value="helpdesk">সিটিজেন কেয়ার অপারেটর (Helpdesk)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        বিভাগ / শাখা
                                    </label>
                                    <select
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                    >
                                        <option value="">-- কোনো নির্দিষ্ট বিভাগ নয় --</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name_bn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* PROMINENT PASSWORD CREATION BOX */}
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                        <Key className="w-4 h-4 text-amber-700" />
                                        <span>কর্মকর্তার লগইন পাসওয়ার্ড তৈরি করুন <span className="text-rose-600">*</span></span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateCreatePassword}
                                        className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded-md transition"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>স্বয়ংক্রিয় পাসওয়ার্ড জেনারেট</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showCreatePassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => {
                                            setData('password', e.target.value);
                                            setCopiedCreatePassword(false);
                                        }}
                                        placeholder="পাসওয়ার্ড লিখুন বা জেনারেট করুন (কমপক্ষে ৬ অক্ষর)"
                                        className="w-full pl-3 pr-20 py-2 rounded-xl border border-amber-300 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={handleCopyCreatePassword}
                                            disabled={!data.password}
                                            className="p-1 rounded-md text-amber-700 hover:text-amber-950 hover:bg-amber-100 transition disabled:opacity-40"
                                            title="কপি করুন"
                                        >
                                            {copiedCreatePassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                                            className="p-1 rounded-md text-amber-700 hover:text-amber-950 hover:bg-amber-100 transition"
                                            title={showCreatePassword ? 'লুকান' : 'দেখুন'}
                                        >
                                            {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {copiedCreatePassword && (
                                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>পাসওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে! কর্মকর্তাকে এটি সরবরাহ করুন।</span>
                                    </p>
                                )}
                                {errors.password && <p className="text-rose-600 text-[10px] mt-1">{errors.password}</p>}
                                <p className="text-[10px] text-amber-800">
                                    💡 অ্যাডমিন কর্তৃক তৈরিকৃত এই পাসওয়ার্ড দিয়ে কর্মকর্তা প্রথমবার লগইন করবেন। নিরাপত্তা নিশ্চিতে প্রথমবার প্রবেশের পর তিনি এটি পরিবর্তন করতে পারবেন।
                                </p>
                            </div>

                            {/* Service Assignment Checklist */}
                            <div className="pt-2 border-t border-slate-100">
                                <label className="block font-extrabold text-slate-800 mb-2">
                                    অনুমোদিত সেবা বরাদ্দ করুন (এক বা একাধিক নির্বাচন করুন):
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                                    {services.map((svc) => {
                                        const isChecked = data.service_ids.includes(svc.id);
                                        return (
                                            <div
                                                key={svc.id}
                                                onClick={() => toggleServiceCheckbox(svc.id)}
                                                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between border transition text-[11px] ${
                                                    isChecked
                                                        ? 'bg-gov-50 border-gov-500 text-gov-800'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span className="font-bold">{svc.name_bn}</span>
                                                <div
                                                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                                                        isChecked ? 'bg-gov-600 border-gov-600 text-white' : 'border-slate-300'
                                                    }`}
                                                >
                                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold shadow-sm"
                                >
                                    {processing ? 'তৈরি করা হচ্ছে...' : 'কর্মকর্তা যুক্ত করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 2: Edit Services Assignment                             */}
            {/* ------------------------------------------------------------- */}
            {editServicesOfficer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950">
                                    দায়িত্বপ্রাপ্ত সেবা পরিবর্তন করুন
                                </h3>
                                <p className="text-xs text-slate-400">
                                    কর্মকর্তা: <strong>{editServicesOfficer.name}</strong> ({editServicesOfficer.designation})
                                </p>
                            </div>
                            <button
                                onClick={() => setEditServicesOfficer(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditServicesSubmit} className="space-y-4 text-xs">
                            <p className="text-[11px] text-slate-500">
                                যেসব সেবা নির্বাচন করবেন, কর্মকর্তা শুধু সেইসব সেবার আবেদন ও নথি অ্যাক্সেস করতে পারবেন:
                            </p>

                            <div className="space-y-1.5 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                                {services.map((svc) => {
                                    const isChecked = editData.service_ids.includes(svc.id);
                                    return (
                                        <div
                                            key={svc.id}
                                            onClick={() => toggleEditServiceCheckbox(svc.id)}
                                            className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between border transition ${
                                                isChecked
                                                    ? 'bg-gov-50 border-gov-500 text-gov-800'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold">{svc.name_bn}</div>
                                                <div className="text-[10px] text-slate-400">ফি: ৳{svc.fee_amount}</div>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                                    isChecked ? 'bg-gov-600 border-gov-600 text-white' : 'border-slate-300'
                                                }`}
                                            >
                                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditServicesOfficer(null)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold shadow-sm"
                                >
                                    {editProcessing ? 'সংরক্ষণ হচ্ছে...' : 'দায়িত্ব সংরক্ষণ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 3: Reset Officer Password                               */}
            {/* ------------------------------------------------------------- */}
            {resetPasswordOfficer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-amber-600" />
                                    <span>কর্মকর্তার পাসওয়ার্ড রিসেট করুন</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    কর্মকর্তা: <strong>{resetPasswordOfficer.name}</strong> ({resetPasswordOfficer.email})
                                </p>
                            </div>
                            <button
                                onClick={() => setResetPasswordOfficer(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-700">
                                        নতুন পাসওয়ার্ড নির্ধারণ করুন <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateResetPassword}
                                        className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>নতুন পাসওয়ার্ড জেনারেট</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showResetPassword ? 'text' : 'password'}
                                        value={passwordData.password}
                                        onChange={(e) => {
                                            setPasswordData('password', e.target.value);
                                            setCopiedResetPassword(false);
                                        }}
                                        placeholder="পাসওয়ার্ড লিখুন বা জেনারেট করুন"
                                        className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={handleCopyResetPassword}
                                            disabled={!passwordData.password}
                                            className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-40"
                                            title="কপি করুন"
                                        >
                                            {copiedResetPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(!showResetPassword)}
                                            className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                                            title={showResetPassword ? 'লুকান' : 'দেখুন'}
                                        >
                                            {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {copiedResetPassword && (
                                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>পাসওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে!</span>
                                    </p>
                                )}
                                {passwordErrors.password && (
                                    <p className="text-rose-600 text-[10px]">{passwordErrors.password}</p>
                                )}
                                <p className="text-[10px] text-slate-400">
                                    পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে। সেভ করার পর কর্মকর্তাকে এটি প্রদান করুন।
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setResetPasswordOfficer(null)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                                >
                                    {passwordProcessing ? 'হালনাগাদ হচ্ছে...' : 'পাসওয়ার্ড হালনাগাদ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
