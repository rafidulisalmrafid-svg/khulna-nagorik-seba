import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import Timeline from '@/Components/Timeline';
import {
    FileText,
    Users,
    Check,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Download,
    ChevronLeft,
    Shield,
    Clock,
    UserCheck,
    Receipt,
    Eye,
    Store,
    Layers,
    Award,
    HeartHandshake,
    X,
    ExternalLink,
} from 'lucide-react';

export default function AdminApplicationShow({ application, officers = [] }) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [flaggedDocs, setFlaggedDocs] = useState(() => {
        const initial = {};
        if (application.documents) {
            application.documents.forEach((d) => {
                if (d.status === 'needs_correction') {
                    initial[d.id] = { flagged: true, reason: d.correction_reason || '' };
                }
            });
        }
        return initial;
    });

    const commonCorrectionReasons = [
        'ছবি অস্পষ্ট / প্রয়োজনীয় অংশ দেখা যাচ্ছে না',
        'ভুল ডকুমেন্ট আপলোড করা হয়েছে',
        'নথির তথ্য অসম্পূর্ণ',
        'মেয়াদোত্তীর্ণ বা অগ্রহণযোগ্য ফাইল',
    ];

    const toggleFlagDoc = (docId) => {
        setFlaggedDocs((prev) => {
            const current = prev[docId];
            if (current && current.flagged) {
                const next = { ...prev };
                delete next[docId];
                return next;
            } else {
                return {
                    ...prev,
                    [docId]: { flagged: true, reason: commonCorrectionReasons[0] },
                };
            }
        });
    };

    const updateDocReason = (docId, reason) => {
        setFlaggedDocs((prev) => ({
            ...prev,
            [docId]: { ...(prev[docId] || { flagged: true }), reason },
        }));
    };

    const statusForm = useForm({
        status: application.status || 'under_review',
        comment: '',
    });

    const assignForm = useForm({
        assigned_to: application.assigned_to || '',
    });

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        const flaggedList = Object.entries(flaggedDocs)
            .filter(([id, data]) => data.flagged)
            .map(([id, data]) => ({
                id: parseInt(id),
                reason: data.reason || 'সংশোধন প্রয়োজন',
            }));

        statusForm.transform((data) => ({
            ...data,
            flagged_documents: flaggedList,
        }));

        statusForm.post(`/admin/applications/${application.id}/status`);
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        assignForm.post(`/admin/applications/${application.id}/assign`);
    };

    const setQuickAction = (status, defaultComment) => {
        statusForm.setData({
            status: status,
            comment: defaultComment,
        });
    };

    const isTrade = application.service?.slug?.includes('trade') || application.service?.name_bn?.includes('ট্রেড');
    const isPdf = previewDoc?.file_name?.toLowerCase().endsWith('.pdf') || previewDoc?.mime_type === 'application/pdf';

    return (
        <AdminLayout>
            <Head title={`আবেদন পর্যালোচনা: ${application.tracking_id} - খুলনা সেবা অ্যাডমিন`} />

            <div className="space-y-6">
                {/* Back button */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/applications"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-gov-700"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>আবেদন তালিকায় ফিরে যান</span>
                    </Link>
                    <span className="font-mono text-xs font-bold text-slate-500">
                        {application.tracking_id}
                    </span>
                </div>

                {/* Top Summary Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-gov-700 bg-gov-50 px-2.5 py-1 rounded-md border border-gov-100">
                                {application.tracking_id}
                            </span>
                            <StatusBadge status={application.status} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-navy-950">
                            {application.service?.name_bn}
                        </h1>
                        <p className="text-xs text-slate-500">
                            দাখিলকৃত সময়: {new Date(application.created_at).toLocaleDateString('bn-BD', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 text-xs">
                        <span className="font-semibold text-slate-500">পেমেন্ট স্থিতি:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            application.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                            {application.payment_status === 'paid' ? 'পরিশোধিত (PAID)' : 'অপরিশোধিত (UNPAID)'}
                        </span>
                        
                        {application.assigned_officer && (
                            <span className="text-[11px] font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-gov-200 flex items-center gap-1 mt-1">
                                <UserCheck className="w-3.5 h-3.5 text-gov-600" />
                                <span>দায়িত্বপ্রাপ্ত: {application.assigned_officer.name}</span>
                            </span>
                        )}

                        {application.certificate_number && (
                            <span className="font-bold text-emerald-700 font-mono mt-1 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                <span>সনদ নং: {application.certificate_number}</span>
                            </span>
                        )}
                        {application.certificate_number && (
                            <a
                                href={`/applications/certificate/${application.tracking_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-gov-700 font-bold underline hover:text-gov-800"
                            >
                                ইস্যুকৃত সনদ দেখুন
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Cols: Details & Documents */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Applicant details */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <User className="w-4 h-4 text-gov-600" />
                                    <span>আবেদনকারী ও পরিবারের তথ্য</span>
                                </h3>
                                {application.user_id && (
                                    <Link
                                        href={`/admin/citizens/${application.user_id}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gov-50 hover:bg-gov-100 text-gov-800 border border-gov-200 text-xs font-bold transition shadow-2xs"
                                        title="এই নাগরিকের অতীত ও বর্তমান সকল সেবার আবেদন পরিসংখ্যান ও ইতিহাস দেখুন"
                                    >
                                        <Users className="w-3.5 h-3.5 text-gov-600" />
                                        <span>নাগরিকের সকল আবেদন ও পরিসংখ্যান দেখুন</span>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs md:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-xs">নাম:</span>
                                    <span className="font-bold text-slate-800">{application.applicant_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">মোবাইল:</span>
                                    <span className="font-bold text-slate-800 font-mono">{application.applicant_phone}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">এনআইডি (NID):</span>
                                    <span className="font-bold text-slate-800 font-mono">{application.applicant_nid || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">পিতার নাম:</span>
                                    <span className="font-bold text-slate-800">{application.father_or_husband_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">মাতার নাম:</span>
                                    <span className="font-bold text-slate-800">{application.mother_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">জেন্ডার ও বৈবাহিক অবস্থা:</span>
                                    <span className="font-bold text-slate-800">
                                        {application.gender === 'female' ? 'মহিলা' : application.gender === 'male' ? 'পুরুষ' : application.gender || '—'}, {' '}
                                        {application.marital_status === 'married' ? 'বিবাহিত' : application.marital_status === 'single' ? 'অবিবাহিত' : application.marital_status || '—'}
                                    </span>
                                </div>
                                {application.husband_name && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 col-span-2 sm:col-span-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                            <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
                                            <span>স্বামীর নাম: {application.husband_name}</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-slate-400 block text-xs">ওয়ার্ড নম্বর:</span>
                                    <span className="font-bold text-slate-800">ওয়ার্ড নং {application.ward_no}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">হোল্ডিং নং:</span>
                                    <span className="font-bold text-slate-800">{application.holding_no || '—'}</span>
                                </div>
                                <div className="col-span-2 sm:col-span-3">
                                    <span className="text-slate-400 block text-xs">ঠিকানা:</span>
                                    <span className="font-semibold text-slate-800">{application.present_address}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Service Specific Info */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gov-600" />
                                <span>সেবার সুনির্দিষ্ট তথ্য বিবরণী</span>
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                {isTrade && (
                                    <>
                                        <div>
                                            <span className="text-slate-400 block text-xs">ব্যবসার ধরন (Business Type):</span>
                                            <span className="font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-gov-200 inline-block mt-0.5">
                                                {application.business_type?.name_bn || application.form_data?.business_type_name || 'সাধারণ ব্যবসা'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-xs">
                                                {application.business_type?.measurement_label_bn || 'সাইনবোর্ড / স্পেসের মাপ'}:
                                            </span>
                                            <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                                                {application.measurement_value || application.form_data?.measurement_value || '—'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-xs">প্রতিষ্ঠানের নাম:</span>
                                            <span className="font-bold text-slate-800 text-sm">{application.form_data?.business_name || '—'}</span>
                                        </div>
                                        {application.form_data?.business_capital && (
                                            <div>
                                                <span className="text-slate-400 block text-xs">বিনিয়োগকৃত মূলধন:</span>
                                                <span className="font-bold text-slate-800">৳{application.form_data?.business_capital}</span>
                                            </div>
                                        )}
                                        {application.form_data?.business_address && (
                                            <div className="col-span-2">
                                                <span className="text-slate-400 block text-xs">ব্যবসার ঠিকানা:</span>
                                                <span className="font-semibold text-slate-800">{application.form_data?.business_address}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {application.form_data && Object.keys(application.form_data).length > 0 && !isTrade && (
                                    Object.entries(application.form_data).map(([k, v]) => (
                                        <div key={k} className="p-2.5 bg-slate-50 rounded-xl">
                                            <span className="text-slate-400 block capitalize">{k.replace(/_/g, ' ')}:</span>
                                            <span className="font-bold text-slate-800">{v || '—'}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. Uploaded Documents Verification */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gov-600" />
                                    <span>নাগরিকের জমাকৃত নথিপত্র ও ফাইল যাচাই ({application.documents?.length || 0})</span>
                                </span>
                            </h3>

                            {application.documents && application.documents.length > 0 ? (
                                <div className="space-y-3.5">
                                    {/* Flagged Summary Alert */}
                                    {Object.values(flaggedDocs).filter(d => d.flagged).length > 0 && (
                                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>
                                                    <strong>{Object.values(flaggedDocs).filter(d => d.flagged).length}টি নথিতে সমস্যা চিহ্নিত করা হয়েছে।</strong> সংশোধনে ফেরত পাঠানোর সময় নাগরিক শুধু এই ফাইলগুলো পুনরায় আপলোড করবেন।
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuickAction('info_required', `আবেদনের ${Object.values(flaggedDocs).filter(d => d.flagged).length}টি নথিতে ত্রুটি পাওয়া গেছে। অনুগ্রহ করে সঠিক নথিপত্র পুনরায় আপলোড করুন।`);
                                                }}
                                                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition shrink-0"
                                            >
                                                সংশোধনে ফেরত সেট করুন
                                            </button>
                                        </div>
                                    )}

                                    {application.documents.map((doc) => {
                                        const isFlagged = !!flaggedDocs[doc.id]?.flagged;
                                        const currentReason = flaggedDocs[doc.id]?.reason || '';

                                        return (
                                            <div
                                                key={doc.id}
                                                className={`p-4 rounded-2xl border transition text-xs space-y-3 ${
                                                    isFlagged
                                                        ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                                                        : doc.status === 'needs_correction'
                                                        ? 'bg-amber-50/60 border-amber-300'
                                                        : 'bg-slate-50 border-slate-200'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
                                                            <FileText className="w-4 h-4 text-gov-600" />
                                                            <span>{doc.document_title}</span>

                                                            {isFlagged ? (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                                    ত্রুটি চিহ্নিত (সংশোধন প্রয়োজন)
                                                                </span>
                                                            ) : doc.status === 'needs_correction' ? (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                                    সংশোধনের অপেক্ষায়
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    সঠিক আছে
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-500 font-mono text-[11px]">
                                                            ফাইল: {doc.file_name} • সাইজ: {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                        {/* Flag toggle button */}
                                                        {application.status !== 'approved' && application.status !== 'completed' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleFlagDoc(doc.id)}
                                                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                                                                    isFlagged
                                                                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                                                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                                                }`}
                                                            >
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span>{isFlagged ? 'চিহ্নিত বাতিল করুন' : 'সমস্যা চিহ্নিত করুন'}</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="px-3 py-1.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>প্রিভিউ</span>
                                                        </button>

                                                        <a
                                                            href={doc.file_path}
                                                            download={doc.file_name}
                                                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span>ডাউনলোড</span>
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Flagged Issue Details Input Box */}
                                                {isFlagged && (
                                                    <div className="pt-3 border-t border-rose-200/80 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold text-rose-900">
                                                                এই ডকুমেন্টে সমস্যার নির্দিষ্ট কারণ নির্বাচন বা লিখুন:
                                                            </span>
                                                        </div>

                                                        {/* Quick Reason Chips */}
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {commonCorrectionReasons.map((r) => (
                                                                <button
                                                                    key={r}
                                                                    type="button"
                                                                    onClick={() => updateDocReason(doc.id, r)}
                                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                                                        currentReason === r
                                                                            ? 'bg-rose-700 text-white'
                                                                            : 'bg-white hover:bg-rose-100 text-rose-800 border border-rose-200'
                                                                    }`}
                                                                >
                                                                    {r}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Custom Reason Text */}
                                                        <input
                                                            type="text"
                                                            value={currentReason}
                                                            onChange={(e) => updateDocReason(doc.id, e.target.value)}
                                                            placeholder="সমস্যার কারণ ও নাগরিকের প্রতি স্পষ্ট নির্দেশনা লিখুন..."
                                                            className="w-full px-3 py-2 rounded-xl border border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-xs text-slate-800 bg-white"
                                                        />
                                                    </div>
                                                )}

                                                {/* If already in correction status from past */}
                                                {!isFlagged && doc.status === 'needs_correction' && doc.correction_reason && (
                                                    <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-200 text-xs text-amber-900">
                                                        <strong>পূর্বে প্রেরিত কারণ:</strong> {doc.correction_reason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-500 text-xs">
                                    কোনো সংযুক্তি আপলোড করা হয়নি।
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right 1 Col: Actions & Officer Assignment */}
                    <div className="space-y-6">
                        {/* 1. Status Action Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gov-600" />
                                <span>কর্মকর্তা পর্যালোচনা ও সিদ্ধান্ত</span>
                            </h3>

                            {/* Preset Quick Buttons */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 block">দ্রুত সিদ্ধান্ত নির্ধারণ:</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuickAction('approved', 'সকল কাগজপত্র ও তথ্য যাচাইপূর্বক আবেদনটি অনুমোদন করা হলো। সরকারি ফি পরিশোধ সাপেক্ষে সনদ ইস্যু করা যাবে।')}
                                        className="p-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>অনুমোদন দিন</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickAction('info_required', 'সংযুক্ত নথিপত্র/তথ্যের ঘাটতি রয়েছে। অনুগ্রহ করে অতিরিক্ত সঠিক কাগজপত্র জমা দিন।')}
                                        className="p-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>সংশোধনে ফেরত</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickAction('rejected', 'প্রদত্ত তথ্য ও নথিপত্র অসম্পূর্ণ বা অগ্রহণযোগ্য হওয়ায় আবেদনটি বাতিল করা হলো।')}
                                        className="p-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>বাতিল করুন</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setQuickAction('under_review', 'আবেদনটি মাঠপর্যায়ে ও সংশ্লিষ্ট নথিপত্র যাচাই-বাছাই প্রক্রিয়াধীন রয়েছে।')}
                                        className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>পর্যালোচনাধীন</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">নির্বাচিত স্থিতি (Status)</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={(e) => statusForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-gov-600 bg-white"
                                    >
                                        <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                                        <option value="info_required">সংশোধনের জন্য ফেরত / তথ্য প্রয়োজন (Info Required)</option>
                                        <option value="approved">অনুমোদন (Approved - নাগরিক পেমেন্ট করতে পারবেন)</option>
                                        <option value="rejected">বাতিল (Rejected)</option>
                                        <option value="completed">সম্পন্ন (Completed)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">মন্তব্য বা আদেশের বিবরণ <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={statusForm.data.comment}
                                        onChange={(e) => statusForm.setData('comment', e.target.value)}
                                        placeholder="নাগরিকের জন্য আদেশের বিবরণ বা প্রয়োজনীয় নির্দেশনা লিখুন..."
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                                >
                                    {statusForm.processing ? 'হালনাগাদ হচ্ছে...' : 'সিদ্ধান্ত নিশ্চিত করুন'}
                                </button>
                            </form>
                        </div>

                        {/* 2. Assign Officer Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-gov-600" />
                                <span>দায়িত্বপ্রাপ্ত কর্মকর্তা পুনর্বণ্টন</span>
                            </h3>

                            <form onSubmit={handleAssignSubmit} className="space-y-3">
                                <select
                                    value={assignForm.data.assigned_to}
                                    onChange={(e) => assignForm.setData('assigned_to', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-gov-600 bg-white"
                                >
                                    <option value="">কর্মকর্তা নির্বাচন করুন</option>
                                    {officers.map((off) => (
                                        <option key={off.id} value={off.id}>
                                            {off.name} ({off.designation || off.role})
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="submit"
                                    disabled={assignForm.processing}
                                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                                >
                                    {assignForm.processing ? 'নির্ধারণ হচ্ছে...' : 'কর্মকর্তা দায়িত্ব প্রদান'}
                                </button>
                            </form>
                        </div>

                        {/* 3. Timeline Log */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gov-600" />
                                <span>কার্যক্রম টাইমলাইন</span>
                            </h3>

                            <Timeline items={application.timelines || []} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Lightbox Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{previewDoc.document_title}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">{previewDoc.file_name}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={previewDoc.file_path}
                                    download={previewDoc.file_name}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>ডাউনলোড</span>
                                </a>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/50 min-h-[300px]">
                            {isPdf ? (
                                <iframe
                                    src={previewDoc.file_path}
                                    title={previewDoc.document_title}
                                    className="w-full h-[600px] rounded-xl border border-slate-200"
                                />
                            ) : (
                                <img
                                    src={previewDoc.file_path}
                                    alt={previewDoc.document_title}
                                    className="max-h-[600px] max-w-full object-contain rounded-xl shadow-sm border border-slate-200"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
