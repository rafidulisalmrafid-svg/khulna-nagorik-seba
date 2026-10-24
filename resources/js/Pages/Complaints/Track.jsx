import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import StatusBadge from '@/Components/StatusBadge';
import Timeline from '@/Components/Timeline';
import {
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    Building2,
    Shield,
    Star,
    Send,
    ArrowRight,
    MapPin,
    Camera,
} from 'lucide-react';

export default function ComplaintTrack({ complaint, searchedId = '' }) {
    const [trackingInput, setTrackingInput] = useState(searchedId);

    const { data, setData, post, processing } = useForm({
        citizen_rating: complaint?.citizen_rating || 5,
        citizen_feedback: complaint?.citizen_feedback || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (trackingInput.trim()) {
            router.get('/complaints/track', { tracking_id: trackingInput.trim() });
        }
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        post(`/complaints/${complaint.id}/feedback`);
    };

    return (
        <MainLayout>
            <Head title="অভিযোগের অগ্রগতি ও ট্র্যাকিং - খুলনা সেবা" />

            {/* Header banner */}
            <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-rose-950 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-rose-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        অভিযোগ সমাধান মনিটরিং
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        নাগরিক অভিযোগের বর্তমান অগ্রগতি ট্র্যাক করুন
                    </h1>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto">
                        আপনার অভিযোগ ট্র্যাকিং নম্বর (যেমন: CMP-2026-00842) দিয়ে অনুসন্ধান করে সংশ্লিষ্ট বিভাগের সমাধান কার্যক্রম পর্যবেক্ষণ করুন।
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4 flex items-center gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                placeholder="উদা: CMP-2026-00842"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-mono text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-rose-400/40"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition shrink-0 flex items-center gap-1.5"
                        >
                            <span>অনুসন্ধান</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!complaint ? (
                    searchedId ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-800">অভিযোগ রেকর্ড পাওয়া যায়নি</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                প্রদত্ত নম্বর <span className="font-mono font-bold text-slate-700">{searchedId}</span> দিয়ে কোনো অভিযোগ পাওয়া যায়নি।
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                            <Clock className="w-12 h-12 text-rose-600 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-800">অভিযোগ নম্বর লিখুন</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                অভিযোগ দাখিলের সময় এসএমএস বা পেজে প্রদর্শিত CMP ট্র্যাকিং নম্বরটি ওপরে লিখুন।
                            </p>
                        </div>
                    )
                ) : (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500">অভিযোগ আইডি:</span>
                                        <span className="font-mono font-extrabold text-sm text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100">
                                            {complaint.tracking_id}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-800 mt-1 capitalize">
                                        {complaint.category.replace(/_/g, ' ')} সংক্রান্ত সমস্যা
                                    </h2>
                                </div>

                                <div className="flex flex-col sm:items-end gap-1.5">
                                    <StatusBadge status={complaint.status} type="complaint" />
                                    <span className="text-xs text-slate-400">
                                        তারিখ: {new Date(complaint.created_at).toLocaleDateString('bn-BD')}
                                    </span>
                                </div>
                            </div>

                            {/* Location & Details */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs md:text-sm">
                                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>ওয়ার্ড নং {complaint.ward_no} • {complaint.location_landmark}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                                    {complaint.description}
                                </p>
                            </div>

                            {/* Masked Citizen Info (Privacy) */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>নাগরিক পরিচয়: <strong>{complaint.citizen_name}</strong> ({complaint.citizen_phone}) • সম্পূর্ণ সুরক্ষিত ও এনক্রিপ্টেড</span>
                            </div>

                            {/* Resolution Summary if resolved */}
                            {complaint.status === 'resolved' && (
                                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-2">
                                    <div className="font-bold flex items-center gap-2 text-emerald-800">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span>সমস্যা সমাধান সম্পন্ন হয়েছে</span>
                                    </div>
                                    {complaint.resolution_summary && (
                                        <p className="text-slate-700 pl-7">{complaint.resolution_summary}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Citizen Feedback Form (if resolved) */}
                        {complaint.status === 'resolved' && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    <span>সমাধানের মান সম্পর্কে আপনার মূল্যবান রেটিং ও মতামত</span>
                                </h3>

                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setData('citizen_rating', star)}
                                                className="p-1 text-2xl transition hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-7 h-7 ${
                                                        data.citizen_rating >= star
                                                            ? 'text-amber-500 fill-amber-500'
                                                            : 'text-slate-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="text-xs font-bold text-slate-600 ml-2">
                                            {data.citizen_rating} / ৫ স্টার
                                        </span>
                                    </div>

                                    <textarea
                                        rows={3}
                                        value={data.citizen_feedback}
                                        onChange={(e) => setData('citizen_feedback', e.target.value)}
                                        placeholder="কেসিসি দলের কাজের গতি ও মান নিয়ে আপনার মন্তব্য লিখুন..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                                    />

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>মতামত জমা দিন</span>
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Clock className="w-5 h-5 text-rose-600" />
                                <span>তদন্ত ও সমাধান কার্যক্রমের সময়ক্রম</span>
                            </h3>

                            <Timeline items={complaint.timelines || []} />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}