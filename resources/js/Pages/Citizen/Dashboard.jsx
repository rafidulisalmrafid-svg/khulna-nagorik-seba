import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    LayoutDashboard,
    FileText,
    Receipt,
    AlertCircle,
    User,
    Clock,
    CheckCircle2,
    ArrowRight,
    CreditCard,
    Download,
    Eye,
    Plus,
    Building2,
    Shield,
} from 'lucide-react';

export default function CitizenDashboard({ applications = [], complaints = [], payments = [], stats = {} }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('applications');

    return (
        <MainLayout>
            <Head title="নাগরিক ড্যাশবোর্ড - খুলনা সেবা" />

            {/* Profile banner */}
            <div className="bg-gradient-to-r from-navy-950 via-gov-900 to-gov-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-navy-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gov-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border border-white/20">
                            {auth.user?.name?.charAt(0) || 'ন'}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold">{auth.user?.name}</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    নাগরিক আইডি
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                <span>ইমেইল: {auth.user?.email}</span>
                                <span>•</span>
                                <span>মোবাইল: {auth.user?.phone || '০১৮১২-৩৪৫৬৭৮'}</span>
                                <span>•</span>
                                <span>কেসিসি ওয়ার্ড: {auth.user?.ward_no || '১৭'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/services"
                            className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>নতুন সেবা আবেদন</span>
                        </Link>
                        <Link
                            href="/complaints/new"
                            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>অভিযোগ জানান</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md">
                        <span className="text-xs text-slate-500 font-medium block mb-1">মোট আবেদন</span>
                        <span className="text-2xl font-extrabold text-slate-800">{stats.total_applications || 0}</span>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md">
                        <span className="text-xs text-slate-500 font-medium block mb-1">প্রক্রিয়াধীন</span>
                        <span className="text-2xl font-extrabold text-amber-600">{stats.pending_applications || 0}</span>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md">
                        <span className="text-xs text-slate-500 font-medium block mb-1">অনুমোদিত সেবা</span>
                        <span className="text-2xl font-extrabold text-emerald-600">{stats.approved_applications || 0}</span>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md">
                        <span className="text-xs text-slate-500 font-medium block mb-1">দাখিলকৃত অভিযোগ</span>
                        <span className="text-2xl font-extrabold text-rose-600">{stats.total_complaints || 0}</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Tab buttons */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                            activeTab === 'applications'
                                ? 'bg-gov-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>আমার আবেদনসমূহ ({applications.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                            activeTab === 'complaints'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>আমার অভিযোগসমূহ ({complaints.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
                            activeTab === 'payments'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <Receipt className="w-4 h-4" />
                        <span>পেমেন্ট হিস্ট্রি ও রসিদ ({payments.length})</span>
                    </button>
                </div>

                {/* Tab 1: Applications */}
                {activeTab === 'applications' && (
                    <div className="space-y-4">
                        {applications.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-800">এখনো কোনো আবেদন করেননি</h3>
                                <p className="text-xs text-slate-500">
                                    ট্রেড লাইসেন্স, পৌরকর বা নাগরিক সনদের জন্য সরাসরি অনলাইন আবেদন করুন।
                                </p>
                                <Link
                                    href="/services"
                                    className="inline-block px-5 py-2 rounded-xl bg-gov-600 text-white font-bold text-xs"
                                >
                                    সেবা তালিকা দেখুন
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {applications.map((app) => (
                                    <div
                                        key={app.id}
                                        className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5 max-w-xl">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xs font-black text-gov-700 bg-gov-50 px-2.5 py-0.5 rounded-md border border-gov-100">
                                                    {app.tracking_id}
                                                </span>
                                                <StatusBadge status={app.status} />
                                                {app.certificate_number && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        সনদ নং: {app.certificate_number}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-slate-800 text-base">
                                                {app.service?.name_bn}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                <span>আবেদনকারী: {app.applicant_name}</span>
                                                <span>•</span>
                                                <span>ওয়ার্ড নং {app.ward_no}</span>
                                                <span>•</span>
                                                <span>তারিখ: {new Date(app.created_at).toLocaleDateString('bn-BD')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {/* Only show payment button if approved by authority AND unpaid */}
                                            {app.status === 'approved' && app.payment_status === 'unpaid' && parseFloat(app.fee_amount) > 0 && (
                                                <Link
                                                    href={`/payments/checkout/${app.tracking_id}`}
                                                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 animate-pulse"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>অনুমোদিত • ফি দিন (৳{Math.round(app.fee_amount)})</span>
                                                </Link>
                                            )}

                                            {/* Info Required / Needs Correction CTA */}
                                            {app.status === 'info_required' && (
                                                <Link
                                                    href={`/applications/view/${app.tracking_id}`}
                                                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 animate-pulse"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>সংশোধন করুন (নথি আপলোড)</span>
                                                </Link>
                                            )}

                                            {/* Locked hint if fee applicable but not approved yet */}
                                            {app.status !== 'approved' && app.status !== 'completed' && app.status !== 'rejected' && app.status !== 'info_required' && parseFloat(app.fee_amount) > 0 && (
                                                <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium text-[11px] flex items-center gap-1.5" title="কর্তৃপক্ষ যাচাই শেষে অনুমোদন দিলে ফি পরিশোধের অপশন সক্রিয় হবে">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>অনুমোদনের পর ফি প্রযোজ্য</span>
                                                </span>
                                            )}

                                            <Link
                                                href={`/applications/view/${app.tracking_id}`}
                                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>বিস্তারিত দেখুন</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Complaints */}
                {activeTab === 'complaints' && (
                    <div className="space-y-4">
                        {complaints.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-800">কোনো অভিযোগ দাখিল করেননি</h3>
                                <p className="text-xs text-slate-500">
                                    এলাকার রাস্তা, ড্রেন, ময়লা বা সড়ক বাতি সংক্রান্ত সমস্যা থাকলে অভিযোগ জানান।
                                </p>
                                <Link
                                    href="/complaints/new"
                                    className="inline-block px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                                >
                                    অভিযোগ দাখিল করুন
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {complaints.map((cmp) => (
                                    <div
                                        key={cmp.id}
                                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
                                                    {cmp.tracking_id}
                                                </span>
                                                <StatusBadge status={cmp.status} type="complaint" />
                                            </div>

                                            <h3 className="font-bold text-slate-800 text-sm md:text-base capitalize">
                                                {cmp.category.replace(/_/g, ' ')} • ওয়ার্ড নং {cmp.ward_no}
                                            </h3>

                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                {cmp.location_landmark} — {cmp.description}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/complaints/track?tracking_id=${cmp.tracking_id}`}
                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>অগ্রগতি দেখুন</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Payments */}
                {activeTab === 'payments' && (
                    <div className="space-y-4">
                        {payments.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-800">কোনো পেমেন্ট রেকর্ড নেই</h3>
                                <p className="text-xs text-slate-500">অনলাইনে ফি পরিশোধের পর সকল রসিদ এখানে পাওয়া যাবে।</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {payments.map((p) => (
                                    <div
                                        key={p.id}
                                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                    রসিদ নং: {p.receipt_number}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 font-mono">
                                                    TRX: {p.transaction_id}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-800 text-sm">
                                                {p.purpose_bn}
                                            </h4>

                                            <p className="text-xs text-slate-500">
                                                তারিখ: {new Date(p.paid_at || p.created_at).toLocaleDateString('bn-BD')} • মাধ্যম: {p.payment_method.toUpperCase()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-base text-slate-900 font-mono">
                                                ৳{parseFloat(p.amount).toFixed(2)}
                                            </span>

                                            <Link
                                                href={`/payments/receipt/${p.receipt_number}`}
                                                className="px-4 py-2 rounded-xl bg-gov-50 text-gov-700 hover:bg-gov-100 font-bold text-xs transition flex items-center gap-1.5"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>রসিদ প্রিন্ট</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}