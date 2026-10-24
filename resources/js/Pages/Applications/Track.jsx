import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import StatusBadge from '@/Components/StatusBadge';
import Timeline from '@/Components/Timeline';
import {
    Search,
    Clock,
    FileText,
    Receipt,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Building2,
    User,
    Download,
    CreditCard,
    Upload,
} from 'lucide-react';

export default function ApplicationTrack({ application, searchedId = '' }) {
    const [trackingInput, setTrackingInput] = useState(searchedId);

    const handleSearch = (e) => {
        e.preventDefault();
        if (trackingInput.trim()) {
            router.get('/applications/track', { tracking_id: trackingInput.trim() });
        }
    };

    return (
        <MainLayout>
            <Head title="আবেদন ট্র্যাকিং - খুলনা সেবা" />

            {/* Header banner */}
            <div className="bg-gradient-to-r from-navy-950 via-gov-900 to-gov-800 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        অনলাইন অ্যাপ্লিকেশন স্ট্যাটাস ট্র্যাকার
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        নাগরিক আবেদনের বর্তমান অবস্থা জানুন
                    </h1>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto">
                        আপনার আবেদনের ট্র্যাকিং নম্বর (যেমন: KCC-2026-10023) প্রদান করে ফাইল পর্যালোচনা ও অনুমোদনের লাইভ অগ্রগতি পর্যবেক্ষণ করুন।
                    </p>

                    {/* Search Form */}
                    <form
                        onSubmit={handleSearch}
                        className="max-w-xl mx-auto pt-4 flex items-center gap-2"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                placeholder="উদা: KCC-2026-10023"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-mono text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-400/40"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-navy-950 font-extrabold text-sm shadow-md transition shrink-0 flex items-center gap-1.5"
                        >
                            <span>অনুসন্ধান</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Tracking Result View */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!application ? (
                    searchedId ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-800">আবেদন খুঁজে পাওয়া যায়নি</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                প্রদত্ত ট্র্যাকিং নম্বর <span className="font-mono font-bold text-slate-700">{searchedId}</span> দিয়ে কোনো আবেদন রেকর্ড পাওয়া যায়নি। সঠিক নম্বর টাইপ করে পুনরায় চেষ্টা করুন।
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                            <Clock className="w-12 h-12 text-gov-600 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-800">ট্র্যাকিং নম্বর প্রদান করুন</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                আবেদন দাখিলের পর প্রাপ্ত ৭ বা ১০ ডিজিটের ট্র্যাকিং কোডটি ওপরে লিখে অনুসন্ধান বাটনে চাপ দিন।
                            </p>
                        </div>
                    )
                ) : (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500">ট্র্যাকিং নম্বর:</span>
                                        <span className="font-mono font-extrabold text-base text-gov-700 bg-gov-50 px-2.5 py-0.5 rounded-lg border border-gov-100">
                                            {application.tracking_id}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-800 mt-1">
                                        {application.service?.name_bn}
                                    </h2>
                                </div>

                                <div className="flex flex-col sm:items-end gap-1.5">
                                    <StatusBadge status={application.status} />
                                    <span className="text-xs text-slate-400">
                                        দাখিল: {new Date(application.created_at).toLocaleDateString('bn-BD')}
                                    </span>
                                </div>
                            </div>

                            {/* Officer remarks banner if present */}
                            {application.status_note && (
                                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        কর্মকর্তার মন্তব্য / স্থিতি বিবরণ:
                                    </span>
                                    <p className="pl-5.5 text-slate-700">{application.status_note}</p>
                                </div>
                            )}

                            {/* Key Meta Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">আবেদনকারী</span>
                                    <span className="font-bold text-slate-800">{application.applicant_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">কেসিসি ওয়ার্ড</span>
                                    <span className="font-bold text-slate-800">ওয়ার্ড নং {application.ward_no}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">সরকারি ফি</span>
                                    <span className="font-bold text-slate-800">
                                        {parseFloat(application.fee_amount) > 0 ? `৳${Math.round(application.fee_amount)}` : 'বিনামূল্যে'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">পেমেন্ট স্ট্যাটাস</span>
                                    <span className={`font-bold ${application.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {application.payment_status === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                                    </span>
                                </div>
                            </div>

                            {/* Action CTA Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <Link
                                    href={`/applications/view/${application.tracking_id}`}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-gov-600 hover:text-gov-700 hover:underline"
                                >
                                    <span>সম্পূর্ণ আবেদনের বিস্তারিত দেখুন</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>

                                <div className="flex items-center gap-2">
                                    {/* Only show payment button if approved by authority AND unpaid */}
                                    {application.status === 'approved' && application.payment_status === 'unpaid' && parseFloat(application.fee_amount) > 0 && (
                                        <Link
                                            href={`/payments/checkout/${application.tracking_id}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md animate-pulse"
                                        >
                                            <CreditCard className="w-3.5 h-3.5" />
                                            <span>অনুমোদিত • ফি পরিশোধ করুন (৳{Math.round(application.fee_amount)})</span>
                                        </Link>
                                    )}

                                    {/* Locked hint if not approved yet */}
                                    {application.status !== 'approved' && application.status !== 'completed' && application.status !== 'rejected' && parseFloat(application.fee_amount) > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                            <span>অনুমোদনের পর ফি পরিশোধ অপশন সক্রিয় হবে</span>
                                        </span>
                                    )}

                                    {application.status === 'approved' && (
                                        <Link
                                            href={`/applications/view/${application.tracking_id}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>অনুমোদিত সনদপত্র দেখুন</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Clock className="w-5 h-5 text-gov-600" />
                                <span>আবেদনের পর্যালোচনা ও অগ্রগতির সময়ক্রম</span>
                            </h3>

                            <Timeline items={application.timelines || []} />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}