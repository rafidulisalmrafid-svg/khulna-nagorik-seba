import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import Timeline from '@/Components/Timeline';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    MapPin,
    Shield,
    Camera,
    ChevronLeft,
    Send,
    UserCheck,
    Star,
} from 'lucide-react';

export default function AdminComplaintShow({ complaint, officers = [] }) {
    const { data, setData, post, processing } = useForm({
        status: complaint.status,
        assigned_to: complaint.assigned_to || '',
        internal_notes: complaint.internal_notes || '',
        resolution_summary: complaint.resolution_summary || '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        post(`/admin/complaints/${complaint.id}/status`);
    };

    return (
        <AdminLayout>
            <Head title={`অভিযোগ তদন্ত: ${complaint.tracking_id} - খুলনা সেবা অ্যাডমিন`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/complaints"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-gov-700"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>অভিযোগ তালিকায় ফিরে যান</span>
                    </Link>
                    <span className="font-mono text-xs font-bold text-slate-500">
                        {complaint.tracking_id}
                    </span>
                </div>

                {/* Top Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                                {complaint.tracking_id}
                            </span>
                            <StatusBadge status={complaint.status} type="complaint" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-navy-950 capitalize">
                            {complaint.category.replace(/_/g, ' ')} সংক্রান্ত জনদুর্ভোগ
                        </h1>
                        <p className="text-xs text-slate-500">
                            দাখিলের তারিখ: {new Date(complaint.created_at).toLocaleDateString('bn-BD')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-xs">
                        <span className="font-bold text-slate-700">দায়িত্বপ্রাপ্ত বিভাগ:</span>
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold">
                            {complaint.department?.name_bn || 'প্রকৌশল ও জনস্বাস্থ্য'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Cols: Complaint details & Evidence */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Citizen info & location */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <span>নাগরিকের তথ্য (কর্মকর্তাদের জন্য সুরক্ষিত)</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-xs">নাগরিকের নাম:</span>
                                    <span className="font-bold text-slate-800">{complaint.citizen_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">যোগাযোগ নম্বর:</span>
                                    <span className="font-bold text-slate-800 font-mono">{complaint.citizen_phone}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">কেসিসি ওয়ার্ড:</span>
                                    <span className="font-bold text-slate-800">ওয়ার্ড নং {complaint.ward_no}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">নির্দিষ্ট স্থান / ল্যান্ডমার্ক:</span>
                                    <span className="font-bold text-slate-800">{complaint.location_landmark}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block text-xs mb-1">সমস্যার পূর্ণ বিবরণ:</span>
                                    <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-xs md:text-sm">
                                        {complaint.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Photo */}
                        {complaint.evidence_file_path && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
                                <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-rose-600" />
                                    <span>নাগরিকের আপলোডকৃত প্রমাণক</span>
                                </h3>

                                <div className="max-w-md">
                                    <img
                                        src={complaint.evidence_file_path}
                                        alt="Complaint evidence"
                                        className="rounded-2xl border border-slate-200 shadow-sm max-h-72 object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Citizen Feedback & Rating if resolved */}
                        {complaint.citizen_rating && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span>নাগরিকের রেটিং: {complaint.citizen_rating} / ৫ স্টার</span>
                                </h3>
                                <p className="text-xs text-slate-600 italic">
                                    "{complaint.citizen_feedback || 'কোনো মন্তব্য করেননি।'}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Officer Action & Timeline */}
                    <div className="space-y-6">
                        {/* Investigation & Action Form */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                                তদন্ত ও সমাধান হালনাগাদ
                            </h3>

                            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">বর্তমান স্থিতি</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                                    >
                                        <option value="assigned">অ্যাসাইনকৃত (Assigned)</option>
                                        <option value="under_investigation">সরেজমিনে তদন্তাধীন (Investigation)</option>
                                        <option value="action_in_progress">কাজ চলছে (Action in Progress)</option>
                                        <option value="resolved">সমাধান সম্পন্ন (Resolved)</option>
                                        <option value="rejected">বাতিল (Rejected)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">তদন্তকারী কর্মকর্তা</label>
                                    <select
                                        value={data.assigned_to}
                                        onChange={(e) => setData('assigned_to', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                                    >
                                        <option value="">কর্মকর্তা নির্বাচন করুন</option>
                                        {officers.map((off) => (
                                            <option key={off.id} value={off.id}>
                                                {off.name} ({off.designation || off.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">অভ্যন্তরীণ নোট (গোপনীয়)</label>
                                    <textarea
                                        rows={2}
                                        value={data.internal_notes}
                                        onChange={(e) => setData('internal_notes', e.target.value)}
                                        placeholder="দাপ্তরিক তদন্ত বা ফিল্ড নোট লিখুন..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700">সমাধানের সারাংশ (নাগরিক দেখতে পাবেন)</label>
                                    <textarea
                                        rows={3}
                                        value={data.resolution_summary}
                                        onChange={(e) => setData('resolution_summary', e.target.value)}
                                        placeholder="কী পদক্ষেপ নিয়ে সমাধান করা হয়েছে তা লিখুন..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? 'সংরক্ষণ হচ্ছে...' : 'হালনাগাদ সম্পন্ন করুন'}
                                </button>
                            </form>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-rose-600" />
                                <span>তদন্তের অগ্রগতি টাইমলাইন</span>
                            </h3>
                            <Timeline items={complaint.timelines || []} />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}