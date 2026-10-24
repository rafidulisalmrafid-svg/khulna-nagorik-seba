import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ServiceCard from '@/Components/ServiceCard';
import AuthNoticeBanner from '@/Components/AuthNoticeBanner';
import HeroSlider from '@/Components/HeroSlider';
import {
    Search,
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    Shield,
    Phone,
    Building2,
    Users,
    Receipt,
    Briefcase,
    Home as HomeIcon,
    AlertCircle,
    ChevronRight,
    HelpCircle,
    Bell,
    Layers,
    ChevronDown,
    MapPin,
    ExternalLink,
    Send,
    Sparkles,
} from 'lucide-react';

export default function Home({
    categories = [],
    featuredServices = [],
    notices = [],
    stats = {},
    wards = [],
    sliders = [],
    sliderSetting = {},
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategorySlug, setActiveCategorySlug] = useState('all');
    const [trackingInput, setTrackingInput] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/services', { search: searchQuery.trim() });
        }
    };

    const handleTrackSubmit = (e) => {
        e.preventDefault();
        if (trackingInput.trim()) {
            router.post('/track-search', { tracking_id: trackingInput.trim() });
        }
    };

    const filteredServices = featuredServices.filter((service) => {
        if (activeCategorySlug === 'all') return true;
        return service.category?.slug === activeCategorySlug;
    });

    const faqs = [
        {
            q: 'অনলাইনে ট্রেড লাইসেন্স পেতে কতদিন সময় লাগে?',
            a: 'আবেদন দাখিল ও প্রয়োজনীয় কাগজপত্র যাচাইয়ের পর সাধারণত ৩ কার্যদিবসের মধ্যে নতুন ই-ট্রেড লাইসেন্স অনুমোদিত হয় এবং সরাসরি ড্যাশবোর্ড থেকে ডাউনলোড করা যায়।',
        },
        {
            q: 'হোল্ডিং ট্যাক্স কীভাবে পরিশোধ করব?',
            a: 'আপনার ওয়ার্ড ও হোল্ডিং নম্বর প্রদান করে সরাসরি বকেয়া অনুসন্ধান করতে পারবেন এবং বিকাশ, নগদ, রকেট বা যেকোনো ডেবিট/ক্রেডিট কার্ডের মাধ্যমে তাৎক্ষণিক কর পরিশোধ করতে পারবেন।',
        },
        {
            q: 'জন্ম বা মৃত্যু নিবন্ধনের মূল সনদ কীভাবে পাব?',
            a: 'জন্ম ও মৃত্যু নিবন্ধন স্থানীয় সরকার বিভাগের কেন্দ্রীয় ডাটাবেজ (bdris.gov.bd) দ্বারা পরিচালিত হয়। আমাদের পোর্টালে গাইডলাইন দেখে সরাসরি আবেদন করতে পারবেন এবং স্থানীয় ওয়ার্ড কাউন্সিলর কার্যালয় থেকে মুদ্রিত সনদ সংগ্রহ করতে পারবেন।',
        },
        {
            q: 'অভিযোগ দাখিলের পর কীভাবে ট্র্যাক করব?',
            a: 'অভিযোগ দাখিল করার পর আপনাকে একটি ইউনিক ট্র্যাকিং নম্বর (যেমন: CMP-2026-XXXXX) প্রদান করা হবে। "আবেদন ট্র্যাকিং" বক্সে এই নম্বর দিয়ে যে কোনো সময় তদন্ত ও কাজের অগ্রগতি দেখতে পারবেন। আপনার পরিচয় সম্পূর্ণ গোপন রাখা হয়।',
        },
    ];

    return (
        <MainLayout>
            <Head title="সব নাগরিক সেবা, এখন আপনার হাতেই - খুলনা সেবা" />

            {/* 1. Full Hero Section with Background Scenic Slider */}
            <HeroSlider sliders={sliders} setting={sliderSetting}>
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    {/* Govt Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-semibold text-emerald-300 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        স্মার্ট সিটিজেন পোর্টাল • খুলনা সিটি কর্পোরেশন
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
                        সব নাগরিক সেবা,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-teal-200 to-emerald-300">
                            এখন আপনার হাতেই
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
                        কোনো ভোগান্তি বা দীর্ঘ লাইন ছাড়াই খুলনা সিটি কর্পোরেশনের ট্রেড লাইসেন্স, পৌরকর, নাগরিক সনদ ও জনদুর্ভোগ সংক্রান্ত সকল সেবা ঘরে বসেই গ্রহণ ও ট্র্যাক করুন।
                    </p>

                    {/* Smart Service Search Bar */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="pt-2 max-w-2xl mx-auto relative flex items-center"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="কী সেবা খুঁজছেন? (যেমন: ট্রেড লাইসেন্স, হোল্ডিং ট্যাক্স, নাগরিক সনদ...)"
                                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm md:text-base font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-gov-400/40 border-0"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
                            >
                                <span>খুঁজুন</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Quick suggestions */}
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-200 font-medium">
                        <span className="text-slate-300 font-semibold drop-shadow">জনপ্রিয় সার্চ:</span>
                        <Link
                            href="/services/new-trade-license"
                            className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-md transition border border-white/10"
                        >
                            নতুন ট্রেড লাইসেন্স
                        </Link>
                        <Link
                            href="/services/holding-tax-payment"
                            className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-md transition border border-white/10"
                        >
                            হোল্ডিং ট্যাক্স
                        </Link>
                        <Link
                            href="/services/nagorik-sonod"
                            className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-md transition border border-white/10"
                        >
                            নাগরিক সনদ
                        </Link>
                        <Link
                            href="/complaints/new"
                            className="px-2.5 py-1 rounded-md bg-rose-500/30 hover:bg-rose-500/45 backdrop-blur-md transition border border-rose-400/30 text-rose-200"
                        >
                            ড্রেনেজ অভিযোগ
                        </Link>
                    </div>
                </div>
            </HeroSlider>

            {/* 2. Key Metrics Strip (Overlapping Hero exactly at -mt-14) */}
            <section className="-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-800">
                                {stats.total_services || '২৫+'}
                            </div>
                            <div className="text-xs font-semibold text-slate-500">অনলাইন নাগরিক সেবা</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-800">
                                {stats.completed_applications || '১,৪২০+'}
                            </div>
                            <div className="text-xs font-semibold text-slate-500">নিষ্পত্তিকৃত আবেদন</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-800">৩১টি</div>
                            <div className="text-xs font-semibold text-slate-500">ডিজিটাল ওয়ার্ড কাভারেজ</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-800">১৬১৫২</div>
                            <div className="text-xs font-semibold text-slate-500">২৪/৭ নাগরিক হেল্পলাইন</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Instant Live Application & Complaint Tracking Section */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-gov-700 to-navy-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 max-w-xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-300">
                            <Clock className="w-3.5 h-3.5" />
                            লাইভ স্ট্যাটাস ট্র্যাকার
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold">
                            আবেদন বা অভিযোগের অবস্থা জানতে চান?
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            দাখিলকৃত আবেদনের ট্র্যাকিং নম্বর (যেমন: <span className="text-amber-300 font-mono">KCC-2026-10023</span>) অথবা অভিযোগ নম্বর (যেমন: <span className="text-amber-300 font-mono">CMP-2026-00842</span>) দিয়ে তাৎক্ষণিক লাইভ অগ্রগতি দেখুন।
                        </p>
                    </div>

                    <form
                        onSubmit={handleTrackSubmit}
                        className="w-full lg:w-auto flex-1 max-w-md bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 flex gap-2"
                    >
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="ট্র্যাকিং আইডি লিখুন..."
                            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-navy-950 font-extrabold text-sm shrink-0 transition shadow-md flex items-center gap-1.5"
                        >
                            <span>ট্র্যাক</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </section>

            {/* 4. Notice Board & Announcements */}
            {notices.length > 0 && (
                <section className="pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm shrink-0">
                            <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                                <Bell className="w-4 h-4 animate-bounce" />
                            </span>
                            <span>জরুরি নোটিশ:</span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs md:text-sm text-slate-700 font-medium truncate">
                                {notices[0].title_bn} — {notices[0].content_bn}
                            </p>
                        </div>

                        <span className="text-xs text-amber-700 font-bold shrink-0">
                            {new Date(notices[0].published_at || notices[0].created_at).toLocaleDateString('bn-BD')}
                        </span>
                    </div>
                </section>
            )}

            {/* 5. Popular Citizen Services */}
            <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AuthNoticeBanner />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="text-xs font-bold text-gov-600 uppercase tracking-wider mb-1">
                            সর্বাধিক ব্যবহৃত
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                            জনপ্রিয় নাগরিক সেবাসমূহ
                        </h2>
                    </div>

                    <Link
                        href="/services"
                        className="inline-flex items-center gap-1 text-sm font-bold text-gov-600 hover:text-gov-700 hover:underline"
                    >
                        <span>সকল সেবা ডিরেক্টরি দেখুন</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </section>

            {/* 6. Quick Action Cards: Tax & Trade License */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1: Holding Tax */}
                    <div className="rounded-3xl bg-gradient-to-br from-blue-900 to-gov-800 p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-extrabold">পৌরকর (হোল্ডিং ট্যাক্স) পরিশোধ</h3>
                            <p className="text-sm text-slate-200 leading-relaxed">
                                হোল্ডিং নম্বর দ্বারা বকেয়া অনুসন্ধান করে বিকাশ, নগদ বা কার্ডে অনলাইনে পরিশোধ করুন। সময়মতো কর পরিশোধে বিশেষ ১০% রিবেট সুবিধা গ্রহণ করুন।
                            </p>
                        </div>
                        <div className="pt-6 relative z-10">
                            <Link
                                href="/services/holding-tax-payment"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gov-900 font-bold text-sm shadow-md hover:bg-slate-100 transition"
                            >
                                <span>ট্যাক্স অনুসন্ধান ও পরিশোধ</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: E-Trade License */}
                    <div className="rounded-3xl bg-gradient-to-br from-teal-900 to-emerald-800 p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-extrabold">নতুন ই-ট্রেড লাইসেন্স আবেদন</h3>
                            <p className="text-sm text-slate-200 leading-relaxed">
                                কাগজপত্রের ঝামেলা ছাড়াই ঘরে বসেই নির্ভুল তথ্যে নতুন ট্রেড লাইসেন্স বা বাৎসরিক নবায়নের আবেদন করুন এবং ডিজিটাল সনদ সংগ্রহ করুন।
                            </p>
                        </div>
                        <div className="pt-6 relative z-10">
                            <Link
                                href="/services/new-trade-license"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-slate-100 transition"
                            >
                                <span>ট্রেড লাইসেন্স আবেদন</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Citizen Complaint Redressal Banner */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-8 sm:p-12 border border-rose-200/80 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>নাগরিক অভিযোগ ও প্রতিকার ব্যবস্থাপনা</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                                আপনার এলাকার সমস্যা জানান, আমরা সমাধানের প্রতিশ্রুতিবদ্ধ
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                ড্রেনেজ বন্ধ, জলাবদ্ধতা, ভাঙা রাস্তা, ময়লা আবর্জনা বা সড়ক বাতি অচল? ছবি ও ওয়ার্ডের তথ্য দিয়ে অভিযোগ জমা দিন। আপনার নাম-পরিচয় সম্পূর্ণ গোপন রাখা হবে এবং দ্রুত সমাধান নিশ্চিত করা হবে।
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>নাম ও নম্বর গোপনীয়</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>সরাসরি সংশ্লিষ্ট বিভাগে প্রেরণ</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>লাইভ সমাধান টাইমলাইন</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>নাগরিক রেটিং ও মতামত</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                            <Link
                                href="/complaints/new"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-center shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>অভিযোগ দাখিল করুন</span>
                            </Link>

                            <Link
                                href="/complaints/track"
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center transition"
                            >
                                অভিযোগের অগ্রগতি দেখুন
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. How to Apply: 4 Steps */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                    <div className="text-xs font-bold text-gov-600 uppercase tracking-wider">
                        সহজ ৪টি ধাপ
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                        কীভাবে অনলাইনে সেবা গ্রহণ করবেন?
                    </h2>
                    <p className="text-sm text-slate-600">
                        কোনো ঝামেলা ছাড়াই মাত্র কয়েক মিনিটেই সম্পন্ন করুন আপনার আবেদন
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        {
                            step: '১',
                            title: 'সেবা নির্বাচন করুন',
                            desc: 'সার্ভিস ডিরেক্টরি থেকে আপনার কাঙ্ক্ষিত সেবা বেছে নিন এবং শর্তাবলী পড়ুন।',
                        },
                        {
                            step: '২',
                            title: 'তথ্য ও ফাইল দিন',
                            desc: 'আবেদন ফর্ম পূরণ করুন এবং জাতীয় পরিচয়পত্র ও প্রয়োজনীয় কাগজপত্র আপলোড করুন।',
                        },
                        {
                            step: '৩',
                            title: 'ফি পরিশোধ করুন',
                            desc: 'প্রযোজ্য ক্ষেত্রে বিকাশ, নগদ বা কার্ডের মাধ্যমে সরকারি ফি অনলাইনে পরিশোধ করুন।',
                        },
                        {
                            step: '৪',
                            title: 'সনদ ডাউনলোড করুন',
                            desc: 'কর্মকর্তার অনুমোদনের পর ডিজিটাল কিউআর কোডযুক্ত বৈধ সনদ ও রসিদ ডাউনলোড করুন।',
                        },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 border border-slate-200 text-center relative space-y-3"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gov-100 text-gov-700 font-black text-xl flex items-center justify-center mx-auto">
                                {item.step}
                            </div>
                            <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 9. FAQs Section */}
            <section className="py-14 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 space-y-2">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-gov-600 uppercase">
                            <HelpCircle className="w-4 h-4" />
                            সহায়তা কেন্দ্র
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = activeFaq === index;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setActiveFaq(isOpen ? null : index)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-gov-700 transition"
                                    >
                                        <span className="text-base sm:text-lg">{faq.q}</span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                                                isOpen ? 'rotate-180 text-gov-600' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
