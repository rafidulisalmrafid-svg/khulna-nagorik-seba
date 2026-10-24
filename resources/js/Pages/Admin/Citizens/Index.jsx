import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Shield,
    Search,
    FileText,
    ArrowRight,
    Phone,
    Mail,
    IdCard,
    MapPin,
    Calendar,
    ChevronRight,
    UserCheck,
} from 'lucide-react';

export default function CitizensIndex({ citizens, filters = {}, isSuperAdmin = false }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/citizens', { search: search.trim() }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/admin/citizens');
    };

    return (
        <AdminLayout>
            <Head title="নাগরিক সেবা প্রোফাইল ও আবেদন ইতিহাস - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                {!isSuperAdmin && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-amber-950 block">আইসোলেটেড নাগরিক সেবা তালিকা (Role Scoped):</span>
                            <span>
                                আপনি শুধুমাত্র আপনার দায়িত্বপ্রাপ্ত সেবাসমূহে আবেদনকারী নাগরিকদের ডাটা ও ইতিহাস দেখতে পাচ্ছেন। ‘আবেদন সংখ্যা’ কলামে কেবলমাত্র আপনার অর্পিত সেবার আবেদন সংখ্যা গণনা করা হয়েছে।
                            </span>
                        </div>
                    </div>
                )}
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-gov-800 to-navy-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-500/30 text-gov-200 text-xs font-bold mb-3 border border-gov-400/20 backdrop-blur-xs">
                            <Users className="w-3.5 h-3.5" />
                            নাগরিক ডাটাবেজ ও সেবা বিশ্লেষণ
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                            নাগরিকের অ্যাকাউন্টভিত্তিক আবেদন ইতিহাস ও সেবার পরিসংখ্যান
                        </h1>
                        <p className="text-gov-100 text-xs sm:text-sm leading-relaxed">
                            নির্দিষ্ট নাগরিকের অতীতে দাখিলকৃত সকল সেবার আবেদন সংখ্যা, সেবার ধরন অনুযায়ী পরিসংখ্যান ও বর্তমান অগ্রগতি পর্যবেক্ষণ করুন।
                        </p>
                    </div>
                </div>

                {/* Search Bar Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="নাগরিকের নাম, মোবাইল নম্বর, ইমেইল, NID অথবা আবেদনের ট্র্যাকিং আইডি দিয়ে খুঁজুন..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-gov-500 focus:ring-2 focus:ring-gov-500/20 text-xs sm:text-sm text-slate-800 transition"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>অনুসন্ধান করুন</span>
                            </button>
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                >
                                    রিসেট
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Citizens Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-gov-600" />
                            <span>নিবন্ধিত নাগরিক তালিকা ({citizens.total || citizens.data?.length || 0})</span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="py-3.5 px-4">নাগরিক পরিচিতি</th>
                                    <th className="py-3.5 px-4">যোগাযোগ</th>
                                    <th className="py-3.5 px-4">ঠিকানা ও এনআইডি</th>
                                    <th className="py-3.5 px-4 text-center">মোট সেবা আবেদন</th>
                                    <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {citizens.data && citizens.data.length > 0 ? (
                                    citizens.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gov-100 text-gov-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                        {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                                                        <div className="text-[11px] text-slate-400">আইডি: #{c.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{c.phone || 'অনুপলব্ধ'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{c.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 space-y-1">
                                                <div className="text-slate-700">
                                                    {c.nid ? `NID: ${c.nid}` : 'NID যুক্ত নেই'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {c.ward_no ? `ওয়ার্ড নং: ${c.ward_no}` : 'খুলনা সিটি কর্পোরেশন'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                                                    (c.applications_count || 0) > 0
                                                        ? 'bg-gov-50 text-gov-700 border border-gov-200'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    <FileText className="w-3 h-3" />
                                                    <span>{c.applications_count || 0} টি আবেদন</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/admin/citizens/${c.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-2xs transition"
                                                >
                                                    <span>ইতিহাস ও পরিসংখ্যান</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            কোনো নাগরিক তথ্য পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {citizens.links && citizens.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                প্রদর্শন করা হচ্ছে: {citizens.from || 0} থেকে {citizens.to || 0} (মোট {citizens.total || 0} জন)
                            </div>
                            <div className="flex items-center gap-1">
                                {citizens.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-gov-600 text-white'
                                                : link.url
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}