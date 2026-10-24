import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import StatusBadge from '@/Components/StatusBadge';
import Timeline from '@/Components/Timeline';
import {
    FileText,
    Send,
    FileCheck,
    RefreshCw,
    Receipt,
    Download,
    Printer,
    Upload,
    CheckCircle2,
    AlertCircle,
    Building2,
    ChevronLeft,
    Clock,
    CreditCard,
    Shield,
    Lock,
    Store,
    Layers,
    User,
    Award,
    Eye,
} from 'lucide-react';

export default function ApplicationShow({ application }) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [correctionFiles, setCorrectionFiles] = useState({});
    const [correctionPreviews, setCorrectionPreviews] = useState({});
    const [applicantNote, setApplicantNote] = useState('');
    const [submittingCorrection, setSubmittingCorrection] = useState(false);

    const handleCorrectionFileChange = (docId, file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('ফাইলের সাইজ ১০ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১০ MB বা তার কম সাইজের ফাইল আপলোড করুন।');
            return;
        }
        setCorrectionFiles((prev) => ({ ...prev, [docId]: file }));
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setCorrectionPreviews((prev) => ({ ...prev, [docId]: url }));
        } else {
            setCorrectionPreviews((prev) => ({ ...prev, [docId]: 'pdf' }));
        }
    };

    const handleResubmitCorrection = (e) => {
        e.preventDefault();
        const uploadedCount = Object.keys(correctionFiles).length;
        if (uploadedCount === 0) {
            alert('অনুগ্রহ করে চিহ্নিত নথির সংশোধিত ফাইল নির্বাচন করুন।');
            return;
        }

        const formData = new FormData();
        Object.entries(correctionFiles).forEach(([docId, file]) => {
            formData.append(`correction_files[${docId}]`, file);
        });
        if (applicantNote.trim()) {
            formData.append('applicant_note', applicantNote.trim());
        }

        setSubmittingCorrection(true);
        router.post(`/applications/${application.id}/resubmit-corrections`, formData, {
            onFinish: () => setSubmittingCorrection(false),
        });
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        document_title: '',
        file: null,
    });

    const handleUploadAdditional = (e) => {
        e.preventDefault();
        post(`/applications/${application.id}/additional-doc`, {
            onSuccess: () => {
                setUploadModalOpen(false);
                reset();
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const isApproved = application.status === 'approved';
    const isCompleted = application.status === 'completed';
    const isPaid = application.payment_status === 'paid';
    const canPay = (isApproved || isCompleted) && !isPaid && parseFloat(application.fee_amount) > 0;
    const canDownloadCert = (isApproved || isCompleted) && isPaid;

    const isTrade = application.service?.slug?.includes('trade') || application.service?.name_bn?.includes('ট্রেড');

    return (
        <MainLayout>
            <Head title={`আবেদন বিবরণী: ${application.tracking_id} - খুলনা সেবা`} />

            {/* Top Navigation Bar */}
            <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 print:hidden">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link
                        href="/citizen/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-600 hover:text-gov-700 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>ড্যাশবোর্ডে ফিরে যান</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {canDownloadCert && (
                            <Link
                                href={`/applications/certificate/${application.tracking_id}`}
                                className="px-3.5 py-1.5 rounded-lg bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                            >
                                <Award className="w-4 h-4 text-amber-300" />
                                <span>সনদপত্র ডাউনলোড</span>
                            </Link>
                        )}

                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>প্রিন্ট করুন</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Correction Notice & Selective Re-upload Panel */}
                {application.status === 'info_required' && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-xs font-bold border border-amber-300">
                                        ⚠️ সংশোধনের জন্য ফেরত
                                    </span>
                                    <span className="text-xs text-amber-800 font-medium">
                                        সম্পূর্ণ ফর্ম নতুন করে পূরণের প্রয়োজন নেই
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                                    আবেদন সংশোধনের জন্য ফেরত পাঠানো হয়েছে
                                </h2>
                                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                                    দায়িত্বপ্রাপ্ত কর্মকর্তা আপনার আবেদনটি যাচাই করার সময় নির্দিষ্ট কিছু নথিপত্রে সমস্যা পেয়েছেন। যেসব ফাইল সঠিক আছে সেগুলো অপরিবর্তিত থাকবে; <strong>শুধুমাত্র নিচে চিহ্নিত নথিপত্রগুলো পুনরায় আপলোড করে জমা দিন।</strong>
                                </p>
                                {application.status_note && (
                                    <div className="mt-3 p-4 rounded-2xl bg-white border border-amber-200/90 text-xs sm:text-sm text-slate-800 shadow-2xs">
                                        <strong className="text-amber-950 block mb-1 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                            কর্মকর্তার সামগ্রিক নির্দেশনা ও মন্তব্য:
                                        </strong>
                                        <span className="text-slate-700 leading-relaxed">{application.status_note}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selective Re-upload Document Cards */}
                        <form onSubmit={handleResubmitCorrection} className="space-y-5 pt-2">
                            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2 border-b border-amber-200 pb-2">
                                <FileCheck className="w-4 h-4 text-amber-700" />
                                <span>চিহ্নিত ত্রুটিপূর্ণ নথিসমূহ ও আপলোড অপশন:</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {application.documents && application.documents.map((doc) => {
                                    const needsFix = doc.status === 'needs_correction';
                                    const preview = correctionPreviews[doc.id];
                                    const selectedFile = correctionFiles[doc.id];

                                    if (needsFix) {
                                        return (
                                            <div
                                                key={doc.id}
                                                className="bg-white rounded-2xl p-5 border-2 border-rose-300 shadow-sm space-y-3.5 relative overflow-hidden"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                            সংশোধন আবশ্যক
                                                        </span>
                                                        <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                                                            {doc.document_title}
                                                        </h4>
                                                    </div>
                                                </div>

                                                {/* Officer's Specific Reason */}
                                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                                                    <strong className="block text-rose-950 font-bold mb-0.5">কর্মকর্তার চিহ্নিত কারণ:</strong>
                                                    <span>{doc.correction_reason || 'ছবি অস্পষ্ট বা তথ্যে সমস্যা রয়েছে। অনুগ্রহ করে সঠিক ফাইল আপলোড করুন।'}</span>
                                                </div>

                                                {/* File Upload Dropzone */}
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-slate-700">
                                                        নতুন পরিষ্কার ফাইল নির্বাচন করুন (JPG, PNG, WEBP বা PDF • সর্বোচ্চ ফাইল সাইজ ১০ MB):
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                        onChange={(e) => handleCorrectionFileChange(doc.id, e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer"
                                                    />
                                                </div>

                                                {/* Live Preview if chosen */}
                                                {selectedFile && (
                                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                                        {preview === 'pdf' ? (
                                                            <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                                PDF
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={preview}
                                                                alt="Preview"
                                                                className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                                                            />
                                                        )}
                                                        <div className="text-xs truncate">
                                                            <span className="font-bold text-slate-800 block truncate">{selectedFile.name}</span>
                                                            <span className="text-slate-400 text-[11px]">
                                                                {(selectedFile.size / 1024).toFixed(1)} KB • প্রস্তুত
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Correct / unchanged docs
                                    return (
                                        <div
                                            key={doc.id}
                                            className="bg-white/80 rounded-2xl p-5 border border-emerald-200 space-y-2 opacity-90"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-slate-800 text-sm">{doc.document_title}</h4>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    সঠিক আছে
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                এই ফাইলটিতে কোনো সমস্যা পাওয়া যায়নি (পরিবর্তন অপ্রয়োজনীয়)।
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Applicant Comment Box */}
                            <div className="space-y-1.5 pt-2">
                                <label className="block text-xs font-bold text-amber-950">
                                    সংশোধনের বিষয়ে আপনার কোনো বক্তব্য বা ব্যাখ্যা (ঐচ্ছিক):
                                </label>
                                <textarea
                                    value={applicantNote}
                                    onChange={(e) => setApplicantNote(e.target.value)}
                                    placeholder="উদাহরণ: নতুন ও পরিষ্কার জাতীয় পরিচয়পত্রের রঙিন কপি আপলোড করা হলো..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-slate-800 bg-white"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submittingCorrection || Object.keys(correctionFiles).length === 0}
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gov-700 hover:bg-gov-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>
                                        {submittingCorrection ? 'দাখিল করা হচ্ছে...' : 'সংশোধিত নথিপত্র পুনরায় দাখিল করুন'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 1. Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-gov-700 bg-gov-50 px-2.5 py-1 rounded-md border border-gov-100">
                                {application.tracking_id}
                            </span>
                            <StatusBadge status={application.status} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
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

                    {/* Action Buttons based on Approval & Payment Rules */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {/* Case 1: Approved and unpaid -> Can pay now */}
                        {canPay && (
                            <Link
                                href={`/payments/checkout/${application.tracking_id}`}
                                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 animate-bounce"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>অনলাইন সরকারি ফি পরিশোধ করুন (৳{Math.round(application.fee_amount)})</span>
                            </Link>
                        )}

                        {/* Case 2: Not approved yet -> Payment Locked */}
                        {!isApproved && !isCompleted && !isPaid && parseFloat(application.fee_amount) > 0 && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 max-w-sm">
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>কর্মকর্তা কর্তৃক আবেদনটি যাচাই ও অনুমোদন করার পর সরকারি ফি পরিশোধ বাটন সক্রিয় হবে।</span>
                            </div>
                        )}

                        {/* Case 3: Paid & Approved/Completed -> Download Certificate & Receipt */}
                        {canDownloadCert && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href={`/applications/certificate/${application.tracking_id}`}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                                >
                                    <Award className="w-4 h-4 text-amber-300" />
                                    <span>ডিজিটাল সনদপত্র দেখুন ও ডাউনলোড করুন</span>
                                </Link>

                                {application.payment && (
                                    <Link
                                        href={`/payments/receipt/${application.payment.receipt_number}`}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                                    >
                                        <Receipt className="w-4 h-4 text-slate-500" />
                                        <span>মানি রসিদ</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Notice Box */}
                {isApproved && !isPaid && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <span className="font-bold">অভিনন্দন! আপনার আবেদনটি সংশ্লিষ্ট কর্মকর্তা কর্তৃক অনুমোদিত হয়েছে।</span>
                            <p className="text-xs text-emerald-800 mt-0.5">
                                আপনার সরকারি ফি পরিশোধের অপশন সক্রিয় করা হয়েছে। ফি পরিশোধ সম্পন্ন হলেই অবিলম্বে আপনার অফিশিয়াল ডিজিটাল সনদপত্র সংগ্রহ করতে পারবেন।
                            </p>
                        </div>
                    </div>
                )}

                {application.status === 'info_required' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <span className="font-bold">কর্মকর্তা কর্তৃক অতিরিক্ত কাগজপত্র বা তথ্যের জন্য নির্দেশ দেওয়া হয়েছে।</span>
                                {application.status_note && (
                                    <p className="text-xs text-amber-800 mt-0.5">মন্তব্য: {application.status_note}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm"
                        >
                            নথি জমা দিন
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2 Cols: Details & Documents */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Applicant & Family Details */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-gov-600" />
                                <span>আবেদনকারীর ব্যক্তিগত ও ঠিকানা বিবরণী</span>
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-xs">আবেদনকারীর নাম:</span>
                                    <span className="font-bold text-slate-800">{application.applicant_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">মোবাইল নম্বর:</span>
                                    <span className="font-bold text-slate-800 font-mono">{application.applicant_phone}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">জাতীয় পরিচয়পত্র (NID):</span>
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
                                    <div>
                                        <span className="text-slate-400 block text-xs">স্বামীর নাম:</span>
                                        <span className="font-bold text-amber-900">{application.husband_name}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-slate-400 block text-xs">ওয়ার্ড নম্বর:</span>
                                    <span className="font-bold text-slate-800">ওয়ার্ড নং {application.ward_no}</span>
                                </div>
                                {application.holding_no && (
                                    <div>
                                        <span className="text-slate-400 block text-xs">হোল্ডিং নং:</span>
                                        <span className="font-bold text-slate-800 font-mono">{application.holding_no}</span>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <span className="text-slate-400 block text-xs">বর্তমান ঠিকানা:</span>
                                    <span className="font-semibold text-slate-800">{application.present_address}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Service Specific Info (e.g. Trade License Details) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gov-600" />
                                <span>সেবা সম্পর্কিত সুনির্দিষ্ট তথ্য</span>
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
                                {isTrade && (
                                    <>
                                        <div>
                                            <span className="text-slate-400 block text-xs">ব্যবসার ধরন (Business Type):</span>
                                            <span className="font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                                                {application.business_type?.name_bn || application.form_data?.business_type_name || 'সাধারণ ব্যবসা'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-xs">
                                                {application.business_type?.measurement_label_bn || 'সাইনবোর্ড / স্পেসের মাপ'}:
                                            </span>
                                            <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                {application.measurement_value || application.form_data?.measurement_value || '—'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-xs">প্রতিষ্ঠানের নাম:</span>
                                            <span className="font-bold text-slate-800">{application.form_data?.business_name || '—'}</span>
                                        </div>
                                        {application.form_data?.business_capital && (
                                            <div>
                                                <span className="text-slate-400 block text-xs">মূলধন:</span>
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

                                {application.form_data?.character_reason && (
                                    <div className="col-span-2">
                                        <span className="text-slate-400 block text-xs">সনদ গ্রহণের কারণ:</span>
                                        <span className="font-bold text-slate-800">{application.form_data.character_reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Uploaded Documents */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gov-600" />
                                    <span>জমা দেওয়া নথিপত্র ({application.documents?.length || 0})</span>
                                </span>
                                <button
                                    onClick={() => setUploadModalOpen(true)}
                                    className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>নতুন নথি যোগ করুন</span>
                                </button>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {application.documents?.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-800 truncate">{doc.document_title}</div>
                                            <div className="text-[10px] text-slate-400 truncate">{doc.file_name}</div>
                                        </div>
                                        <a
                                            href={doc.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 shrink-0 flex items-center gap-1 transition"
                                        >
                                            <Eye className="w-3 h-3 text-gov-600" />
                                            <span>দেখুন</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Timeline & Payment Summary */}
                    <div className="space-y-6">
                        {/* Financial Box */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-teal-600" />
                                <span>সরকারি ফি ও হিসাব</span>
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">সরকারি সার্ভিস ফি:</span>
                                    <span className="font-bold text-slate-800">৳{parseFloat(application.fee_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">পরিশোধের স্থিতি:</span>
                                    <span className={`font-bold ${
                                        isPaid ? 'text-emerald-700' : 'text-amber-700'
                                    }`}>
                                        {isPaid ? 'পরিশোধিত (PAID)' : 'অপরিশোধিত (UNPAID)'}
                                    </span>
                                </div>
                                {canPay ? (
                                    <div className="pt-2">
                                        <Link
                                            href={`/payments/checkout/${application.tracking_id}`}
                                            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <CreditCard className="w-3.5 h-3.5" />
                                            <span>ফি পরিশোধ করুন</span>
                                        </Link>
                                    </div>
                                ) : !isPaid && parseFloat(application.fee_amount) > 0 && !isCompleted && (
                                    <div className="pt-2 text-[11px] text-amber-700 bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-center font-medium">
                                        কর্তৃপক্ষের অনুমোদনের পর ফি পরিশোধ সক্রিয় হবে
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Timeline */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gov-600" />
                                <span>আবেদনের সর্বশেষ অগ্রগতি ট্র্যাকিং</span>
                            </h3>

                            <Timeline items={application.timelines || []} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Doc Upload Modal */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-base font-bold text-slate-900">অতিরিক্ত নথি জমা দিন</h3>
                        <p className="text-xs text-slate-500">
                            কর্মকর্তা কর্তৃক চাওয়া যেকোনো সংযুক্তি বা নথির বিবরণ লিখে ফাইল আপলোড করুন।
                        </p>

                        <form onSubmit={handleUploadAdditional} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">নথির শিরোনাম / বিবরণ</label>
                                <input
                                    type="text"
                                    required
                                    value={data.document_title}
                                    onChange={(e) => setData('document_title', e.target.value)}
                                    placeholder="উদা: হালনাগাদ চুক্তিপত্র বা অতিরিক্ত প্রমাণক"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">ফাইল সংযুক্ত করুন</label>
                                    <span className="text-[10px] font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
                                        সর্বোচ্চ ফাইল সাইজ ১০ MB
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    required
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        if (f && f.size > 10 * 1024 * 1024) {
                                            alert('ফাইলের সাইজ ১০ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১০ MB বা তার কম সাইজের ফাইল আপলোড করুন।');
                                            e.target.value = '';
                                            setData('file', null);
                                            return;
                                        }
                                        setData('file', f);
                                    }}
                                    className="w-full text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold shadow-sm"
                                >
                                    {processing ? 'আপলোড হচ্ছে...' : 'জমা দিন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
