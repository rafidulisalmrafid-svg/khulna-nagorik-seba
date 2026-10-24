import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Phone,
    Mail,
    Search,
    Shield,
    FileText,
    AlertTriangle,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    ChevronDown,
    Building2,
    CheckCircle2,
    Clock,
    HeartPulse,
    ExternalLink,
} from 'lucide-react';

export default function MainLayout({ children, title }) {
    const { auth, flash, city_info } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [trackingQuery, setTrackingQuery] = useState('');

        // Requirement 5: Idle timeout auto-lock (Inactivity Logout)
    React.useEffect(() => {
        if (!auth?.user) return;

        const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity
        let idleTimer = null;

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                // Session timeout: log out and return to locked guest state
                router.post('/logout');
            }, IDLE_TIMEOUT_MS);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
        resetTimer();

        return () => {
            if (idleTimer) clearTimeout(idleTimer);
            events.forEach((ev) => window.removeEventListener(ev, resetTimer));
        };
    }, [auth?.user]);

    const handleTrackingSearch = (e) => {
        e.preventDefault();
        if (trackingQuery.trim()) {
            router.post('/track-search', { tracking_id: trackingQuery.trim() });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-gov-600 selection:text-white">
            {/* 1. Top Government Banner */}
            <div className="bg-navy-900 text-slate-300 text-xs py-2 px-4 border-b border-navy-800">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                        </span>
                        <span className="hidden sm:inline text-slate-500">|</span>
                        <span className="hidden sm:inline text-slate-300">
                            {city_info?.name_bn || 'খুলনা সিটি কর্পোরেশন'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Phone className="w-3.5 h-3.5" />
                            <span>নাগরিক হেল্পলাইন: {city_info?.hotline || '১৬১৫২'}</span>
                        </div>
                        <span className="text-slate-600">|</span>
                        <div className="hidden md:flex items-center gap-1 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{city_info?.email || 'info@khulnacity.gov.bd'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & City Title */}
                        <Link href="/" className="flex items-center gap-3.5 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gov-800 via-gov-600 to-gov-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-gov-700 font-extrabold text-xl">
                                    <Building2 className="w-7 h-7 text-gov-700" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-extrabold text-xl md:text-2xl text-navy-900 tracking-tight">
                                        খুলনা<span className="text-gov-600">সেবা</span>
                                    </h1>
                                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gov-50 text-gov-700 rounded-md border border-gov-200">
                                        স্মার্ট সিটি
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">
                                    ডিজিটাল সিটি কর্পোরেশন প্ল্যাটফর্ম
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-700">
                            <Link
                                href="/"
                                className="px-3.5 py-2 rounded-lg hover:text-gov-600 hover:bg-gov-50 transition"
                            >
                                হোম
                            </Link>
                            <Link
                                href="/services"
                                className="px-3.5 py-2 rounded-lg hover:text-gov-600 hover:bg-gov-50 transition"
                            >
                                সকল নাগরিক সেবা
                            </Link>
                            <Link
                                href="/applications/track"
                                className="px-3.5 py-2 rounded-lg hover:text-gov-600 hover:bg-gov-50 transition"
                            >
                                আবেদন ট্র্যাকিং
                            </Link>
                            <Link
                                href="/complaints/new"
                                className="px-3.5 py-2 rounded-lg hover:text-gov-600 hover:bg-gov-50 transition"
                            >
                                অভিযোগ জানান
                            </Link>
                            <Link
                                href="/complaints/track"
                                className="px-3.5 py-2 rounded-lg hover:text-gov-600 hover:bg-gov-50 transition"
                            >
                                অভিযোগের স্থিতি
                            </Link>
                        </nav>

                        {/* Right Auth & Actions */}
                        <div className="hidden lg:flex items-center gap-3">
                            {auth?.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition text-slate-800 font-medium text-sm border border-slate-200"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gov-600 text-white flex items-center justify-center text-xs font-bold">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-bold leading-tight line-clamp-1 max-w-[120px]">
                                                {auth.user.name}
                                            </div>
                                            <div className="text-[10px] text-gov-600 font-semibold uppercase">
                                                {auth.user.role === 'citizen' ? 'নাগরিক' : 'কর্মকর্তা'}
                                            </div>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-xs text-slate-500">লগইন করা হয়েছে:</p>
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {auth.user.email}
                                                </p>
                                            </div>

                                            {auth.user.is_staff ? (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-gov-50 hover:text-gov-700 transition"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-gov-600" />
                                                    <span>কর্মকর্তা ড্যাশবোর্ড</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/citizen/dashboard"
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-gov-50 hover:text-gov-700 transition"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-gov-600" />
                                                    <span>নাগরিক ড্যাশবোর্ড</span>
                                                </Link>
                                            )}

                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                                            >
                                                <User className="w-4 h-4 text-slate-500" />
                                                <span>প্রোফাইল সেটিংস</span>
                                            </Link>

                                            <div className="border-t border-slate-100 my-1"></div>

                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>লগআউট করুন</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-gov-600 rounded-xl hover:bg-slate-100 transition"
                                    >
                                        লগইন
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-bold text-white bg-gov-600 hover:bg-gov-700 rounded-xl shadow-md shadow-gov-600/20 hover:shadow-lg transition-all"
                                    >
                                        নাগরিক নিবন্ধন
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-xl">
                        <nav className="flex flex-col space-y-2 text-base font-semibold text-slate-800">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-gov-50"
                            >
                                হোম
                            </Link>
                            <Link
                                href="/services"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-gov-50"
                            >
                                সকল নাগরিক সেবা
                            </Link>
                            <Link
                                href="/applications/track"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-gov-50"
                            >
                                আবেদন ট্র্যাকিং
                            </Link>
                            <Link
                                href="/complaints/new"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-gov-50"
                            >
                                অভিযোগ জানান
                            </Link>
                            <Link
                                href="/complaints/track"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-gov-50"
                            >
                                অভিযোগের স্থিতি
                            </Link>
                        </nav>

                        <div className="border-t border-slate-100 pt-4">
                            {auth?.user ? (
                                <div className="space-y-2">
                                    <div className="px-3 py-2 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 font-medium">লগইন রয়েছেন:</p>
                                        <p className="text-sm font-bold text-slate-800">{auth.user.name}</p>
                                    </div>

                                    {auth.user.is_staff ? (
                                        <Link
                                            href="/admin"
                                            className="block w-full text-center px-4 py-2.5 rounded-xl bg-gov-600 text-white font-bold"
                                        >
                                            অফিসার ড্যাশবোর্ড
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/citizen/dashboard"
                                            className="block w-full text-center px-4 py-2.5 rounded-xl bg-gov-600 text-white font-bold"
                                        >
                                            নাগরিক ড্যাশবোর্ড
                                        </Link>
                                    )}

                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="block w-full text-center px-4 py-2 text-rose-600 font-semibold"
                                    >
                                        লগআউট করুন
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/login"
                                        className="text-center px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                                    >
                                        লগইন
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="text-center px-4 py-2.5 rounded-xl bg-gov-600 text-white font-bold"
                                    >
                                        নিবন্ধন
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 3. Global Toast / Flash Messages */}
            {flash?.success && (
                <div className="bg-emerald-600 text-white px-4 py-3 shadow-md flex items-center justify-between animate-in fade-in">
                    <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="bg-rose-600 text-white px-4 py-3 shadow-md flex items-center justify-between animate-in fade-in">
                    <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{flash.error}</p>
                    </div>
                </div>
            )}

            {/* 4. Page Main Content */}
            <main className="flex-1">{children}</main>

            {/* 5. Professional Government Footer */}
            <footer className="bg-navy-950 text-slate-300 pt-16 pb-8 border-t border-navy-900 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-800">
                        {/* Col 1: About KCC */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gov-600 flex items-center justify-center text-white">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-white text-lg tracking-tight">
                                    খুলনা সিটি কর্পোরেশন
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                ডিজিটাল বাংলাদেশ থেকে স্মার্ট বাংলাদেশে পদার্পণে খুলনা মহানগরীকে একটি আধুনিক, পরিচ্ছন্ন, বাসযোগ্য এবং নাগরিকবান্ধব গ্রিন সিটিতে রূপান্তরিত করতে আমরা সার্বক্ষণিক প্রতিশ্রুতিবদ্ধ।
                            </p>
                            <div className="pt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                    <Shield className="w-3.5 h-3.5" />
                                    সার্বক্ষণিক সেবা মনিটরিং
                                </span>
                            </div>
                        </div>

                        {/* Col 2: Citizen Services Links */}
                        <div>
                            <h4 className="font-bold text-white text-sm mb-4 border-l-4 border-gov-500 pl-2.5">
                                নাগরিক সেবাসমূহ
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-400">
                                <li>
                                    <Link href="/services/new-trade-license" className="hover:text-white transition">
                                        নতুন ই-ট্রেড লাইসেন্স আবেদন
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services/holding-tax-payment" className="hover:text-white transition">
                                        অনলাইন হোল্ডিং ট্যাক্স পরিশোধ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services/nagorik-sonod" className="hover:text-white transition">
                                        নাগরিকত্ব ও চারিত্রিক সনদপত্র
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services/birth-death-central-portal" className="hover:text-white transition">
                                        জন্ম ও মৃত্যু নিবন্ধন গাইডলাইন
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services/road-drain-repair-request" className="hover:text-white transition">
                                        রাস্তা ও ড্রেনেজ সংস্কার আবেদন
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services/street-light-repair" className="hover:text-white transition">
                                        সড়ক বাতি মেরামত অনুরোধ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Important External Links */}
                        <div>
                            <h4 className="font-bold text-white text-sm mb-4 border-l-4 border-gov-500 pl-2.5">
                                জাতীয় পোর্টাল ও লিংক
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-400">
                                <li>
                                    <a
                                        href="https://bangladesh.gov.bd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition flex items-center gap-1"
                                    >
                                        <span>জাতীয় তথ্য বাতায়ন</span>
                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://lgd.gov.bd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition flex items-center gap-1"
                                    >
                                        <span>স্থানীয় সরকার বিভাগ</span>
                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://bdris.gov.bd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition flex items-center gap-1"
                                    >
                                        <span>জন্ম ও মৃত্যু নিবন্ধন (BDRIS)</span>
                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                    </a>
                                </li>
                                <li>
                                    <Link href="/complaints/new" className="hover:text-white transition">
                                        নাগরিক অভিযোগ ও প্রতিকার (GRS)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/applications/track" className="hover:text-white transition">
                                        আবেদন ট্র্যাকিং ও অনলাইন রসিদ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: Contact & Emergency Helpline */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-white text-sm mb-4 border-l-4 border-gov-500 pl-2.5">
                                জরুরি যোগাযোগ
                            </h4>
                            <div className="bg-navy-900/90 p-4 rounded-xl border border-navy-800 space-y-2">
                                <div className="text-xs text-slate-400">নাগরিক সেবা ও হেল্পলাইন:</div>
                                <div className="text-2xl font-black text-amber-400 tracking-wider">
                                    ১৬১৫২
                                </div>
                                <div className="text-xs text-slate-400">সার্বক্ষণিক কন্ট্রোল রুম: ০৪১-৭২০১০০</div>
                            </div>

                            <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                                কেসিসি প্রধান কার্যালয়: কেডিএ এভিনিউ, শিববাড়ি মোড় সংলগ্ন, খুলনা-৯০০০।
                            </p>
                        </div>
                    </div>

                    {/* Bottom copyright & security bar */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>© ২০২৬ খুলনা সিটি কর্পোরেশন। সর্বস্বত্ব সংরক্ষিত।</p>
                        <div className="flex items-center gap-4 text-slate-400">
                            <span>ডিজিটাল সিকিউরিটি নিশ্চিত</span>
                            <span>•</span>
                            <span>গোপনীয়তা নীতি</span>
                            <span>•</span>
                            <span>ব্যবহারের শর্তাবলী</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}