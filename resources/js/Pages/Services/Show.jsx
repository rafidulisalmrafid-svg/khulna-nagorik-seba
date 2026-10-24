import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ServiceCard from '@/Components/ServiceCard';
import {
    Clock,
    Receipt,
    CheckCircle2,
    FileCheck,
    AlertCircle,
    ArrowRight,
    ExternalLink,
    Building2,
    ChevronLeft,
    Shield,
    HelpCircle,
} from 'lucide-react';

export default function ServicesShow({ service, relatedServices = [] }) {
    const isExternal = service.authority_type === 'external_gov_link';

    return (
        <MainLayout>
            <Head title={`${service.name_bn} - খুলনা সেবা`} />

            {/* Back button & Breadcrumb */}
            <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-600 hover:text-gov-700 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>সকল সেবায় ফিরে যান</span>
                    </Link>

                    <div className="text-xs text-slate-500 font-medium">
                        {service.category?.name_bn} / {service.name_bn}
                    </div>
                </div>
            </div>

            {/* Service Header Section */}
            <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gov-50 text-gov-700 border border-gov-200">
                                    {service.category?.name_bn}
                                </span>

                                {isExternal ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        কেন্দ্রীয় সরকারি প্রতিষ্ঠান পরিচালিত
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        খুলনা সিটি কর্পোরেশন নিজস্ব সেবা
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
                                {service.name_bn}
                            </h1>

                            <p className="text-base text-slate-600 leading-relaxed">
                                {service.short_description_bn}
                            </p>
                        </div>

                        {/* Top Action Box */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 w-full lg:w-80 shrink-0 space-y-4">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500">সরকারি ফি:</span>
                                <div className="text-2xl font-black text-gov-700">
                                    {parseFloat(service.fee_amount) > 0 ? `৳${Math.round(service.fee_amount)} টাকা` : 'সম্পূর্ণ বিনামূল্যে'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <Clock className="w-4 h-4 text-gov-600 shrink-0" />
                                <span>আনুমানিক নিষ্পত্তির সময়: {service.estimated_days} কার্যদিবস</span>
                            </div>

                            {isExternal ? (
                                <a
                                    href={service.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                                >
                                    <span>কেন্দ্রীয় পোর্টালে যান</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            ) : (
                                <Link
                                    href={`/apply/${service.slug}`}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-md shadow-gov-600/20 transition flex items-center justify-center gap-2"
                                >
                                    <span>অনলাইনে আবেদন করুন</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Authority Transparency Notice if external */}
            {isExternal && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 flex items-start gap-3.5">
                        <Shield className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-900 leading-relaxed">
                            <p className="font-bold">কর্তৃপক্ষ সংক্রান্ত তথ্য:</p>
                            <p className="text-xs text-purple-800 mt-0.5">
                                এই সেবাটি সরাসরি <span className="font-bold underline">{service.external_authority_name_bn}</span> কর্তৃক পরিচালিত ও সংরক্ষিত। খুলনা সিটি কর্পোরেশনের সংশ্লিষ্ট ওয়ার্ড কাউন্সিলর কার্যালয় স্থানীয় যাচাইকারী ও সহায়তাকারী নিবন্ধক হিসেবে কাজ করে।
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left 2 Cols: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Description */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <FileCheck className="w-5 h-5 text-gov-600" />
                                <span>সেবার বিস্তারিত বিবরণ</span>
                            </h2>
                            <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                                {service.description_bn}
                            </p>
                        </div>

                        {/* 2. Eligibility */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <span>আবেদনের যোগ্যতা ও শর্তাবলী</span>
                            </h2>
                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                {service.eligibility_bn}
                            </div>
                        </div>

                        {/* 3. Required Documents */}
                        {service.required_documents_bn && service.required_documents_bn.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <Receipt className="w-5 h-5 text-amber-600" />
                                    <span>প্রয়োজনীয় কাগজপত্রসমূহ</span>
                                </h2>
                                <ul className="space-y-2.5">
                                    {service.required_documents_bn.map((doc, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                ✓
                                            </div>
                                            <span>{typeof doc === "object" && doc !== null ? (doc.title_bn || doc.title || doc.name || "কাগজপত্র") : doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 4. Process Steps */}
                        {service.process_steps_bn && service.process_steps_bn.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <Clock className="w-5 h-5 text-teal-600" />
                                    <span>আবেদন ও অনুমোদন প্রক্রিয়া</span>
                                </h2>
                                <div className="space-y-4">
                                    {service.process_steps_bn.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-3.5">
                                            <div className="w-8 h-8 rounded-xl bg-gov-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="text-sm text-slate-700 font-medium pt-1">
                                                {step}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Department info & Apply CTA */}
                    <div className="space-y-6">
                        {/* Responsible Department */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gov-600" />
                                <span>সংশ্লিষ্ট বিভাগ</span>
                            </h3>

                            <div className="p-4 bg-gov-50/60 rounded-2xl border border-gov-100 space-y-2">
                                <div className="font-bold text-gov-800 text-sm">
                                    {service.department?.name_bn || 'রাজস্ব ও সাধারণ শাখা'}
                                </div>
                                <p className="text-xs text-slate-600">
                                    {service.department?.description_bn || 'খুলনা সিটি কর্পোরেশন'}
                                </p>
                                <div className="text-xs font-semibold text-gov-700 pt-1">
                                    ফোন: {service.department?.phone || '০৪১-৭২০১০০'}
                                </div>
                            </div>
                        </div>

                        {/* Direct Apply Card */}
                        <div className="bg-gradient-to-br from-navy-950 to-gov-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
                            <h3 className="font-extrabold text-lg">এখনই আবেদন করবেন?</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                প্রয়োজনীয় কাগজপত্র স্ক্যান বা ছবি তুলে প্রস্তুত রাখুন এবং নিচের বাটনে ক্লিক করে ফর্ম পূরণ শুরু করুন।
                            </p>

                            {isExternal ? (
                                <a
                                    href={service.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                                >
                                    <span>কেন্দ্রীয় পোর্টালে যান</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            ) : (
                                <Link
                                    href={`/apply/${service.slug}`}
                                    className="w-full py-3.5 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-navy-950 font-extrabold text-sm transition flex items-center justify-center gap-2"
                                >
                                    <span>অনলাইনে আবেদন করুন</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* Helpline */}
                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                            <div className="font-bold flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4" />
                                কোনো সহায়তার প্রয়োজন?
                            </div>
                            <p>
                                আবেদন সংক্রান্ত যেকোনো প্রশ্নের জন্য সরাসরি কেসিসি হেল্পলাইন <span className="font-bold text-sm">১৬১৫২</span> নম্বরে যোগাযোগ করুন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-slate-200 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">
                            একই বিভাগের অন্যান্য সেবাসমূহ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedServices.map((rel) => (
                                <ServiceCard key={rel.id} service={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}