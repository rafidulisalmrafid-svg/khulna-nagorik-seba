import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Users,
    FileText,
    ArrowLeft,
    Phone,
    Mail,
    IdCard,
    MapPin,
    Calendar,
    Layers,
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Search,
    ExternalLink,
    Filter,
    Building2,
    Lock,
    Eye,
} from 'lucide-react';

export default function CitizenShow({
    citizen,
    applications = [],
    serviceStats = [],
    statusCounts = {},
    selectedServiceId = null,
    selectedStatus = null,
    search = '',
    isSuperAdmin = false,
}) {
    const [searchInput, setSearchInput] = useState(search || '');

    const handleFilter = (serviceId, status) => {
        router.get(
            `/admin/citizens/${citizen.id}`,
            {
                service_id: serviceId !== undefined ? serviceId : selectedServiceId,
                status: status !== undefined ? status : selectedStatus,
                search: searchInput.trim(),
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilter(selectedServiceId, selectedStatus);
    };

    const handleReset = () => {
        setSearchInput('');
        router.get(`/admin/citizens/${citizen.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`নাগরিক ইতিহাস: ${citizen.name} - খুলনা সেবা`} />

            <div className="space-y-6">
                {!isSuperAdmin && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-amber-950 block">আইসোলেটেড নাগরিক সেবা ইতিহাস (Strict Isolation):</span>
                            <span>
                                দায়িত্ব বণ্টন ও তথ্যের নিরাপত্তা নীতি অনুসারে, এই নাগরিকের শুধুমাত্র আপনার দায়িত্বপ্রাপ্ত সেবাসমূহের আবেদন ও পরিসংখ্যান প্রদর্শিত হচ্ছে। অন্যান্য বিভাগের কোনো আবেদন বা তথ্য এখানে সম্পূর্ণ গোপন ও সুরক্ষিত।
                            </span>
                        </div>
                    </div>
                )}
                {/* Back button & Title */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/citizens"
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                                <span>{citizen.name}</span>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gov-100 text-gov-800 border border-gov-200">
                                    নাগরিক আইডি: #{citizen.id}
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500">
                                নাগরিকের পূর্ণাঙ্গ অ্যাকাউন্টভিত্তিক আবেদন ইতিহাস, সেবার পরিসংখ্যান ও ট্র্যাকিং
                            </p>
                        </div>
                    </div>
                </div>

                {/* Citizen Profile Overview Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gov-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-400 block font-medium">মোবাইল নম্বর</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-800">{citizen.phone || 'অনুপলব্ধ'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gov-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <span className="text-[11px] text-slate-400 block font-medium">ইমেইল ঠিকানা</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-800 truncate block">{citizen.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gov-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <IdCard className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-400 block font-medium">জাতীয় পরিচয়পত্র (NID)</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-800">{citizen.nid || 'তথ্য নেই'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gov-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-400 block font-medium">ঠিকানা ও ওয়ার্ড</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-800">
                                    {citizen.ward_no ? `ওয়ার্ড ${citizen.ward_no}` : 'খুলনা মহানগরী'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service-wise Breakdown & Analytics Grid */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-gov-600" />
                            <span>সেবার ধরন অনুযায়ী আবেদন পরিসংখ্যান ({serviceStats.length} ধরনের সেবা)</span>
                        </h2>
                        {selectedServiceId && (
                            <button
                                onClick={() => handleFilter(null, selectedStatus)}
                                className="text-xs text-gov-600 hover:text-gov-700 font-bold hover:underline"
                            >
                                সব সেবার আবেদন দেখুন
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {/* All Services Total Card */}
                        <div
                            onClick={() => handleFilter(null, selectedStatus)}
                            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                                selectedServiceId === null
                                    ? 'bg-gov-700 text-white border-gov-800 shadow-md ring-2 ring-gov-500'
                                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${selectedServiceId === null ? 'text-gov-100' : 'text-slate-500'}`}>
                                    {isSuperAdmin ? 'মোট সকল সেবা' : 'দায়িত্বপ্রাপ্ত সকল সেবা'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    selectedServiceId === null ? 'bg-gov-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    সর্বমোট
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-black">{statusCounts.total || 0}</span>
                                <span className="text-xs font-medium opacity-80">টি আবেদন</span>
                            </div>
                        </div>

                        {/* Each Service Card */}
                        {serviceStats.map((stat) => {
                            const isSelected = selectedServiceId === stat.service_id;
                            return (
                                <div
                                    key={stat.service_id}
                                    onClick={() => handleFilter(isSelected ? null : stat.service_id, selectedStatus)}
                                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-gov-700 text-white border-gov-800 shadow-md ring-2 ring-gov-500'
                                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                            {stat.service_name}
                                        </h3>
                                        {stat.can_manage ? (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                আওতাধীন
                                            </span>
                                        ) : (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                isSelected ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                                অন্যান্য বিভাগ
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl font-black">{stat.count}</span>
                                        <span className={`text-xs font-medium ${isSelected ? 'text-gov-100' : 'text-slate-400'}`}>
                                            টি আবেদন
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Breakdown Pills & Search Bar */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" />
                            স্ট্যাটাস ফিল্টার:
                        </span>
                        {[
                            { label: 'সকল অবস্থা', value: null, count: statusCounts.total },
                            { label: 'নতুন দাখিল', value: 'submitted', count: statusCounts.submitted },
                            { label: 'পর্যালোচনাধীন', value: 'under_review', count: statusCounts.under_review },
                            { label: 'সংশোধনে ফেরত', value: 'info_required', count: statusCounts.info_required },
                            { label: 'অনুমোদিত', value: 'approved', count: statusCounts.approved },
                            { label: 'সম্পন্ন', value: 'completed', count: statusCounts.completed },
                            { label: 'বাতিল', value: 'rejected', count: statusCounts.rejected },
                        ].map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleFilter(selectedServiceId, item.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    selectedStatus === item.value
                                        ? 'bg-gov-600 text-white shadow-2xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                <span>{item.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                    selectedStatus === item.value ? 'bg-gov-700 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {item.count || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search inside citizen's applications */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="এই নাগরিকের ট্র্যাকিং আইডি অথবা সেবার নাম দিয়ে খুঁজুন..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-gov-500 focus:ring-2 focus:ring-gov-500/20 text-xs sm:text-sm text-slate-800 transition"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>খুঁজুন</span>
                            </button>
                            {(selectedServiceId || selectedStatus || search) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                >
                                    ফিল্টার মুছুন
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gov-600" />
                            <span>আবেদনের বিস্তারিত ইতিহাস ({applications.length} টি আবেদন)</span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-bold">
                                <tr>
                                    <th className="py-3.5 px-4">ট্র্যাকিং আইডি</th>
                                    <th className="py-3.5 px-4">সেবার নাম</th>
                                    <th className="py-3.5 px-4">আবেদনের তারিখ</th>
                                    <th className="py-3.5 px-4">বর্তমান স্থিতি</th>
                                    <th className="py-3.5 px-4">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                                    <th className="py-3.5 px-4 text-right">পদক্ষেপ / অনুমোদন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.length > 0 ? (
                                    applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-gov-700">
                                                {app.tracking_id}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                                    {app.service?.name_bn}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {app.service?.slug}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 space-y-0.5">
                                                <div className="font-medium text-slate-700">
                                                    {new Date(app.created_at).toLocaleDateString('bn-BD')}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {new Date(app.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={app.status} />
                                                {app.status === 'info_required' && (
                                                    <span className="block mt-1 text-[10px] text-amber-700 font-semibold">
                                                        ⚠️ সংশোধনে ফেরত পাঠানো
                                                    </span>
                                                )}
                                                {app.certificate_number && (
                                                    <span className="block mt-1 text-[10px] text-emerald-700 font-mono font-bold">
                                                        সনদ: {app.certificate_number}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {app.assigned_officer ? (
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs">
                                                            {app.assigned_officer.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">
                                                            {app.assigned_officer.designation || 'দায়িত্বপ্রাপ্ত কর্মকর্তা'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">অনির্ধারিত</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {app.can_manage ? (
                                                    <Link
                                                        href={`/admin/applications/${app.tracking_id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-2xs transition"
                                                    >
                                                        <span>পর্যালোচনা ও সিদ্ধান্ত</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Link>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium text-[11px]" title="এই সেবার প্রশাসনিক অনুমতি আপনার অ্যাকাউন্টে নেই (শুধুমাত্র দর্শনযোগ্য)">
                                                        <Lock className="w-3 h-3 text-slate-400" />
                                                        <span>রিড-অনলি (অনুমতি নেই)</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            নির্বাচিত ফিল্টারে এই নাগরিকের কোনো আবেদন পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}