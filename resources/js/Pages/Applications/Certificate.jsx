import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    Download,
    ChevronLeft,
    ShieldCheck,
    CheckCircle2,
    Building2,
    Calendar,
    QrCode,
} from 'lucide-react';

export default function ApplicationCertificate({ application }) {
    const handlePrint = () => {
        window.print();
    };

    const isTrade = application.service?.slug?.includes('trade') || application.service?.name_bn?.includes('ট্রেড');
    const isCharacter = application.service?.slug?.includes('character') || application.service?.name_bn?.includes('চারিত্রিক');

    const businessName = application.form_data?.business_name || application.applicant_name;
    const businessType = application.business_type?.name_bn || application.form_data?.business_type_name || 'সাধারণ ব্যবসা';
    const measurementVal = application.measurement_value || application.form_data?.measurement_value || '—';
    const characterReason = application.form_data?.character_reason || 'সাধারণ নাগরিক পরিচিতি';

    const certDate = application.completed_at || application.approved_at || new Date().toISOString();
    const issueDateStr = new Date(certDate).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const certNumber = application.certificate_number || `CERT-2026-${application.id.toString().padStart(6, '0')}`;

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-slate-800">
            <Head title={`অফিশিয়াল ডিজিটাল সনদপত্র - ${certNumber}`} />

            {/* Top Toolbar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={`/applications/view/${application.tracking_id}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-gov-700 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>আবেদন বিবরণীতে ফিরে যান</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>সনদপত্র প্রিন্ট / PDF সংরক্ষণ করুন</span>
                    </button>
                </div>
            </div>

            {/* Official Certificate Paper Container */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border-4 border-double border-gov-900/30 p-8 sm:p-12 relative overflow-hidden print:shadow-none print:border-2 print:border-slate-800 print:m-0 print:p-8">
                
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
                    <div className="w-[500px] h-[500px] rounded-full border-[30px] border-gov-900 flex items-center justify-center font-black text-6xl text-center text-gov-900 select-none">
                        খুলনা সেবা
                    </div>
                </div>

                {/* Top Header: Bangladesh Seal & Authority */}
                <div className="text-center space-y-2 border-b-2 border-gov-800/20 pb-6 relative z-10">
                    <div className="flex justify-center mb-2">
                        <div className="w-16 h-16 rounded-full bg-emerald-800 text-amber-400 flex items-center justify-center shadow-md font-black text-xs border-2 border-amber-400">
                            বাংলাদেশ
                        </div>
                    </div>

                    <div className="text-sm font-bold text-slate-600 tracking-wide">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gov-900 tracking-tight">
                        খুলনা সিটি কর্পোরেশন ও বিভাগীয় নাগরিক সেবা কর্তৃপক্ষ
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        নগর ভবন, কেডিএ এভিনিউ, খুলনা-৯০০০ • www.khulnaseba.gov.bd
                    </div>

                    {/* Certificate Title Badge */}
                    <div className="pt-4">
                        <span className="inline-block px-8 py-2 rounded-xl bg-gov-800 text-white font-extrabold text-base sm:text-lg tracking-wider shadow-sm">
                            {application.service?.name_bn}
                        </span>
                    </div>
                </div>

                {/* Certificate Meta (Cert No & Date) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-slate-600 py-4 border-b border-slate-100 relative z-10 gap-2">
                    <div>
                        সনদপত্র নং: <span className="font-mono text-gov-800 text-sm">{certNumber}</span>
                    </div>
                    <div>
                        ইস্যুর তারিখ: <span className="text-slate-800">{issueDateStr}</span>
                    </div>
                    <div>
                        ট্র্যাকিং আইডি: <span className="font-mono text-gov-800">{application.tracking_id}</span>
                    </div>
                </div>

                {/* Certificate Core Statement */}
                <div className="py-8 space-y-6 text-sm leading-relaxed text-slate-800 relative z-10">
                    <p className="text-justify indent-8">
                        এতদ্বারা প্রত্যয়ন করা যাইতেছে যে, স্থানীয় সরকার আইন ও বিধিমালা অনুযায়ী আবেদনকারী নাগরিকের যাবতীয় নথিপত্র এবং তথ্য যথাযথভাবে যাচাই-বাছাই ও মাঠপর্যায়ে পর্যালোচনাপূর্বক সন্তোষজনক বিবেচনায় খুলনা নাগরিক সেবা কর্তৃপক্ষের অনুমোদনে এই সনদপত্রটি ডিজিটালভাবে ইস্যু করা হইল।
                    </p>

                    {/* Specific Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 text-xs">
                        <div>
                            <span className="text-slate-500 block">আবেদনকারীর নাম:</span>
                            <span className="font-bold text-slate-900 text-sm">{application.applicant_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">জাতীয় পরিচয়পত্র (NID) নম্বর:</span>
                            <span className="font-mono font-bold text-slate-900">{application.applicant_nid || '—'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">পিতার নাম:</span>
                            <span className="font-bold text-slate-900">{application.father_or_husband_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">মাতার নাম:</span>
                            <span className="font-bold text-slate-900">{application.mother_name}</span>
                        </div>
                        {application.husband_name && (
                            <div>
                                <span className="text-slate-500 block">স্বামীর নাম:</span>
                                <span className="font-bold text-amber-900">{application.husband_name}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-slate-500 block">ওয়ার্ড ও হোল্ডিং:</span>
                            <span className="font-bold text-slate-900">ওয়ার্ড নং {application.ward_no}, হোল্ডিং: {application.holding_no || '—'}</span>
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-slate-500 block">ঠিকানা:</span>
                            <span className="font-semibold text-slate-900">{application.present_address}</span>
                        </div>

                        {/* Trade License Specific Data */}
                        {isTrade && (
                            <>
                                <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-1">
                                    <span className="text-xs font-bold text-gov-800 block mb-2">প্রতিষ্ঠান ও ব্যবসার তথ্য:</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">ব্যবসা প্রতিষ্ঠানের নাম:</span>
                                    <span className="font-bold text-slate-900 text-sm">{businessName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">ব্যবসার ধরন (Business Type):</span>
                                    <span className="font-bold text-gov-800 bg-gov-100 px-2 py-0.5 rounded">
                                        {businessType}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">
                                        {application.business_type?.measurement_label_bn || 'সাইনবোর্ড / স্পেসের পরিমাপ'}:
                                    </span>
                                    <span className="font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                        {measurementVal}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">সরকারি লাইসেন্স ফি:</span>
                                    <span className="font-bold text-emerald-800">৳{parseFloat(application.fee_amount || 0)} (পরিশোধিত)</span>
                                </div>
                            </>
                        )}

                        {/* Character Certificate Specific Data */}
                        {isCharacter && (
                            <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-1">
                                <span className="text-slate-500 block">সনদ ইস্যুর উদ্দেশ্য/কারণ:</span>
                                <span className="font-bold text-slate-900">{characterReason}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-justify text-xs text-slate-600">
                        এই সনদটি খুলনা সেবা ডিজিটাল প্ল্যাটফর্মের স্বয়ংক্রিয় নিরাপত্তা ডাটাবেজে সংরক্ষিত এবং এর সত্যতা কিউআর কোড স্ক্যান করে অনলাইন পোর্টালে অবিলম্বে যাচাইযোগ্য।
                    </p>
                </div>

                {/* Footer Signatures, QR Code & Seal */}
                <div className="pt-8 border-t-2 border-gov-800/20 grid grid-cols-3 items-end relative z-10 text-center">
                    {/* Left: QR Verification */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="w-24 h-24 p-1.5 border-2 border-slate-300 rounded-xl bg-white shadow-2xs flex flex-col items-center justify-center">
                            <QrCode className="w-16 h-16 text-slate-800" />
                            <span className="text-[8px] font-mono text-slate-500 mt-0.5">VERIFIED</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">অনলাইনে সত্যতা যাচাই</span>
                    </div>

                    {/* Middle: Official Authority Seal */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-20 h-20 rounded-full border-4 border-double border-emerald-700 flex flex-col items-center justify-center text-emerald-800 p-1">
                            <ShieldCheck className="w-6 h-6 text-emerald-700" />
                            <span className="text-[8px] font-extrabold tracking-tighter uppercase">OFFICIAL SEAL</span>
                            <span className="text-[7px] font-bold">খুলনা সেবা</span>
                        </div>
                        <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ডিজিটালি অনুমোদিত
                        </span>
                    </div>

                    {/* Right: Signature */}
                    <div className="flex flex-col items-center space-y-1">
                        <div className="h-10 flex items-center justify-center">
                            <span className="font-serif italic text-base font-bold text-gov-800 select-none">
                                Md. Authorized Officer
                            </span>
                        </div>
                        <div className="w-36 border-t border-slate-700"></div>
                        <span className="text-xs font-bold text-slate-800">প্রধান নির্বাহী কর্মকর্তা / সচিব</span>
                        <span className="text-[10px] text-slate-500">খুলনা সিটি কর্পোরেশন</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
