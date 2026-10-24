import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    AlertCircle,
    Layers,
    Users,
    Shield,
    Building2,
    LogOut,
    Menu,
    X,
    ExternalLink,
    CheckCircle2,
    MapPin,
    BarChart3,
    UserCheck,
    Store,
    Award,
    Image as ImageIcon,
} from 'lucide-react';

export default function AdminLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isSuperAdmin = auth.user?.role === 'super_admin';
    const isComplaintOfficer = auth.user?.role === 'complaint_officer';
    const isAccountsOfficer = auth.user?.role === 'accounts_officer';

    const navLinks = isSuperAdmin ? [
        { name: 'সার্বিক ওভারভিউ', href: '/admin', icon: LayoutDashboard },
        { name: 'আবেদনসমূহ (RBAC)', href: '/admin/applications', icon: FileText },
        { name: 'নাগরিক প্রোফাইল ও ইতিহাস', href: '/admin/citizens', icon: Users },
        { name: 'কর্মকর্তা ও দায়িত্ব বণ্টন', href: '/admin/officers', icon: UserCheck },
        { name: 'সেবা ও ফি ব্যবস্থাপনা', href: '/admin/services', icon: Layers },
        { name: 'হোমপেজ স্লাইডার', href: '/admin/sliders', icon: ImageIcon },
        { name: 'ব্যবসার ধরন ও পরিমাপ', href: '/admin/business-types', icon: Store },
        { name: 'চারিত্রিক সনদ কারণ', href: '/admin/character-reasons', icon: Award },
        { name: 'প্রশাসনিক এলাকা', href: '/admin/geo-areas', icon: MapPin },
        { name: 'রিপোর্ট ও আর্থিক হিসাব', href: '/admin/reports', icon: BarChart3 },
        { name: 'নাগরিক অভিযোগ', href: '/admin/complaints', icon: AlertCircle },
        { name: 'নাগরিক ও ব্যবহারকারী', href: '/admin/users', icon: Users },
        { name: 'অডিট ট্রেইল ও সিকিউরিটি', href: '/admin/audit-logs', icon: Shield },
    ] : [
        { name: 'দায়িত্ব ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard },
        { name: 'দায়িত্বপ্রাপ্ত আবেদনসমূহ', href: '/admin/applications', icon: FileText },
        { name: 'নাগরিক সেবা ইতিহাস', href: '/admin/citizens', icon: Users },
        { name: 'আমার দায়িত্বপ্রাপ্ত সেবা', href: '/admin/services', icon: Layers },
        ...(isComplaintOfficer ? [{ name: 'নাগরিক অভিযোগ', href: '/admin/complaints', icon: AlertCircle }] : []),
        ...(isAccountsOfficer ? [{ name: 'রিপোর্ট ও আর্থিক হিসাব', href: '/admin/reports', icon: BarChart3 }] : []),
    ];

    const roleLabels = {
        super_admin: 'সুপার অ্যাডমিন',
        department_admin: 'বিভাগীয় প্রধান',
        reviewing_officer: 'রিভিউ কর্মকর্তা',
        accounts_officer: 'হিসাবরক্ষণ কর্মকর্তা',
        complaint_officer: 'অভিযোগ কর্মকর্তা',
        helpdesk: 'সিটিজেন কেয়ার অপারেটর',
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden bg-navy-950 text-white px-4 py-3 flex items-center justify-between border-b border-navy-900 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-gov-400" />
                    <span className="font-extrabold text-base tracking-tight">{isSuperAdmin ? 'কেসিসি অ্যাডমিন পোর্টাল' : 'কেসিসি কর্মকর্তা পোর্টাল'}</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-slate-300 hover:text-white"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex flex-col h-full overflow-y-auto">
                        {/* Logo */}
                        <div className="p-5 border-b border-navy-900 flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gov-600 text-white flex items-center justify-center font-black shadow-md">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-white text-base leading-tight">
                                    খুলনা<span className="text-gov-400">সেবা</span>
                                </h2>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    {isSuperAdmin ? 'অ্যাডমিন পোর্টাল' : 'কর্মকর্তা পোর্টাল'}
                                </span>
                            </div>
                        </div>

                        {/* Officer Profile Badge */}
                        <div className="p-3.5 mx-3 my-3 bg-navy-900/90 rounded-2xl border border-navy-800 space-y-1 shrink-0">
                            <div className="text-xs font-bold text-white truncate">
                                {auth.user?.name}
                            </div>
                            <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-gov-500/20 text-gov-300 border border-gov-500/30">
                                {roleLabels[auth.user?.role] || auth.user?.role}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                                {auth.user?.designation || 'খুলনা সিটি কর্পোরেশন'}
                            </div>
                        </div>

                        {/* Nav Items */}
                        <nav className="px-3 space-y-1 flex-1 pb-4">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                                            isActive
                                                ? 'bg-gov-600 text-white shadow-md shadow-gov-600/30'
                                                : 'text-slate-400 hover:text-white hover:bg-navy-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 border-t border-navy-900 space-y-1.5 shrink-0 bg-navy-950">
                        <Link
                            href="/"
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-navy-900 transition"
                        >
                            <span>পাবলিক পোর্টাল</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>লগআউট করুন</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    {/* Flash messages in Admin */}
                    {flash?.success && (
                        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
