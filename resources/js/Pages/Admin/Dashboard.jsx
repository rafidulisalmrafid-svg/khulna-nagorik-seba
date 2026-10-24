import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Receipt,
    Users,
    Shield,
    ArrowRight,
    TrendingUp,
    Filter,
    Layers,
    UserCheck,
    CreditCard,
    DollarSign,
    RefreshCw,
    Calendar,
    ChevronRight,
    Building2,
    Eye,
} from 'lucide-react';

export default function AdminDashboard({
    stats = {},
    topServices = [],
    topComplaints = [],
    officersPerformance = [],
    serviceRequirements = [],
    recentApplications = [],
    recentComplaints = [],
    auditLogs = [],
    servicesList = [],
    filters = {},
}) {
    const [dateRange, setDateRange] = useState(filters.date_range || 'all');
    const [serviceFilter, setServiceFilter] = useState(filters.service_id || '');
    const [wardFilter, setWardFilter] = useState(filters.ward_no || '');

    const handleFilterChange = (newDate, newService, newWard) => {
        router.get(
            '/admin',
            {
                date_range: newDate !== undefined ? newDate : dateRange,
                service_id: newService !== undefined ? newService : serviceFilter,
                ward_no: newWard !== undefined ? newWard : wardFilter,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const kpiCards = [
        {
            title: 'মোট নিবন্ধিত নাগরিক',
            value: stats.total_citizens || 0,
            sub: `সক্রিয়: ${stats.active_citizens || 0} জন`,
            icon: Users,
            color: 'from-blue-600 to-indigo-700 text-white',
            borderColor: 'border-blue-200',
        },
        {
            title: 'মোট নাগরিক আবেদন',
            value: stats.total_applications || 0,
            sub: `অনুমোদিত: ${stats.approved_applications || 0} টি`,
            icon: FileText,
            color: 'from-emerald-600 to-teal-700 text-white',
            borderColor: 'border-emerald-200',
        },
        {
            title: 'অপেক্ষমাণ ও প্রক্রিয়াধীন',
            value: stats.pending_applications || 0,
            sub: `বাতিল: ${stats.rejected_applications || 0} টি`,
            icon: Clock,
            color: 'from-amber-500 to-orange-600 text-white',
            borderColor: 'border-amber-200',
        },
        {
            title: 'আদায়কৃত রাজস্ব',
            value: `৳${Number(stats.total_collected || 0).toLocaleString('en-BD')}`,
            sub: `বকেয়া: ৳${Number(stats.total_pending_fee || 0).toLocaleString('en-BD')}`,
            icon: Receipt,
            color: 'from-gov-700 to-navy-950 text-white',
            borderColor: 'border-gov-300',
        },
    ];

    return (
        <AdminLayout>
            <Head title="অ্যাডমিন ও সুপারভাইজরি ড্যাশবোর্ড - খুলনা সেবা" />

            <div className="space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight flex items-center gap-2">
                            <span>কেসিসি সেন্ট্রাল গভর্নেন্স ও অ্যাডমিন ড্যাশবোর্ড</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            সার্বিক নাগরিক পর্যবেক্ষণ, সেবা পরিচালনা, আর্থিক হিসাব ও কর্মকর্তা দায়িত্ব বণ্টন
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                        <Filter className="w-4 h-4 text-slate-400 ml-2" />
                        <select
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value);
                                handleFilterChange(e.target.value, serviceFilter, wardFilter);
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-50 border-0 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-gov-500"
                        >
                            <option value="all">সকল সময়</option>
                            <option value="today">আজকের দিন</option>
                            <option value="week">চলতি সপ্তাহ</option>
                            <option value="month">চলতি মাস</option>
                        </select>

                        <select
                            value={serviceFilter}
                            onChange={(e) => {
                                setServiceFilter(e.target.value);
                                handleFilterChange(dateRange, e.target.value, wardFilter);
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-50 border-0 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-gov-500 max-w-[160px] truncate"
                        >
                            <option value="">সকল সেবা</option>
                            {servicesList.map((s) => (
                                <option key={s.id} value={s.id}>{s.name_bn}</option>
                            ))}
                        </select>

                        <select
                            value={wardFilter}
                            onChange={(e) => {
                                setWardFilter(e.target.value);
                                handleFilterChange(dateRange, serviceFilter, e.target.value);
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-50 border-0 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-gov-500"
                        >
                            <option value="">সকল ওয়ার্ড</option>
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>ওয়ার্ড {i + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 1. Primary KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={i}
                                className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} shadow-sm relative overflow-hidden flex flex-col justify-between`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-white/80">{card.title}</span>
                                    <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        {card.value}
                                    </h3>
                                    <p className="text-[11px] font-semibold text-white/70 mt-1">{card.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. Top Applied Services & Top Complaints Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Services */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-gov-600" />
                                    <span>সর্বাধিক চাহিদাসম্পন্ন সেবা (Top Applied Services)</span>
                                </h3>
                                <p className="text-xs text-slate-400">নাগরিক আবেদনের পরিমাণ ও শতকরা হার</p>
                            </div>
                            <Link href="/admin/services" className="text-xs font-bold text-gov-700 hover:underline">
                                সকল সেবা
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {topServices.length > 0 ? (
                                topServices.map((service) => (
                                    <div key={service.id} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-700">{service.name_bn}</span>
                                            <span className="text-gov-700">{service.count} টি ({service.percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gov-600 rounded-full transition-all duration-500"
                                                style={{ width: `${service.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-4 text-center">এখনো কোনো আবেদন জমা পড়েনি</p>
                            )}
                        </div>
                    </div>

                    {/* Top Complaints */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600" />
                                    <span>জনদুর্ভোগ ও অভিযোগের ট্রেন্ড (Top Complaints)</span>
                                </h3>
                                <p className="text-xs text-slate-400">বিভাগভিত্তিক দাখিলকৃত অভিযোগ ও সমস্যার বিবরণ</p>
                            </div>
                            <Link href="/admin/complaints" className="text-xs font-bold text-rose-600 hover:underline">
                                অভিযোগ পোর্টাল
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {topComplaints.length > 0 ? (
                                topComplaints.map((dept) => (
                                    <div key={dept.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                                                {dept.complaints_count}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">{dept.name_bn}</h4>
                                                <p className="text-[10px] text-slate-400">সংশ্লিষ্ট বিভাগ</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">
                                            {dept.complaints_count} টি অভিযোগ
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-4 text-center">কোনো অভিযোগ জমা নেই</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Officer Workload & Responsibility Matrix Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-gov-600" />
                                <span>কর্মকর্তাদের দায়িত্ব ও পারফরম্যান্স (Officer Workload & Resolution Matrix)</span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                কোন কর্মকর্তা কোন সেবার দায়িত্বে আছেন, কতটি আবেদন পেয়েছেন এবং কতটি সম্পন্ন করেছেন
                            </p>
                        </div>
                        <Link
                            href="/admin/officers"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gov-50 text-gov-700 hover:bg-gov-100 transition"
                        >
                            <span>কর্মকর্তা নিয়োগ ও দায়িত্ব বণ্টন</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">কর্মকর্তার নাম ও পদবি</th>
                                    <th className="py-3 px-4">দায়িত্বপ্রাপ্ত সেবাসমূহ</th>
                                    <th className="py-3 px-3 text-center">প্রাপ্ত আবেদন</th>
                                    <th className="py-3 px-3 text-center">সম্পন্ন</th>
                                    <th className="py-3 px-3 text-center">বাকি (Pending)</th>
                                    <th className="py-3 px-4">নিষ্পত্তির হার (Rate)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {officersPerformance.map((officer) => (
                                    <tr key={officer.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">{officer.name}</div>
                                            <div className="text-[11px] text-slate-400">{officer.designation} • {officer.department || 'সাধারণ প্রশাসন'}</div>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {officer.assigned_services && officer.assigned_services.length > 0 ? (
                                                    officer.assigned_services.map((svc, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gov-50 text-gov-700 border border-gov-200"
                                                        >
                                                            {svc}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">সার্বিক নজরদারি / আন-অ্যাসাইনড</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                                            {officer.total_assigned}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                                            {officer.completed}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-amber-600">
                                            {officer.pending}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-600 rounded-full"
                                                        style={{ width: `${officer.resolution_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-700">
                                                    {officer.resolution_rate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Service Requirements & Fee Directory Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gov-600" />
                                <span>সেবা বিবরণী, প্রয়োজনীয় কাগজপত্র ও ফি তালিকা (Service Config & Fees)</span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                প্রতিটি সেবার জন্য নির্ধারিত ফি, প্রয়োজনীয় কাগজপত্র ও বর্তমান পরিসংখ্যান
                            </p>
                        </div>
                        <Link
                            href="/admin/services"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gov-50 text-gov-700 hover:bg-gov-100 transition"
                        >
                            <span>নতুন সেবা যুক্ত / পরিচালনা</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">সেবার নাম ও বিভাগ</th>
                                    <th className="py-3 px-3 text-center">নির্ধারিত ফি</th>
                                    <th className="py-3 px-3 text-center">ডেলিভারি সময়</th>
                                    <th className="py-3 px-4">প্রয়োজনীয় কাগজপত্র ও শর্ত</th>
                                    <th className="py-3 px-3 text-center">মোট আবেদন</th>
                                    <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {serviceRequirements.map((svc) => (
                                    <tr key={svc.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">{svc.name_bn}</div>
                                            <div className="text-[11px] text-slate-400">{svc.category || 'সাধারণ সেবা'}</div>
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold">
                                            {svc.is_free ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                                    বিনামূল্যে
                                                </span>
                                            ) : (
                                                <span className="text-slate-800">৳{svc.fee_amount}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-600">
                                            {svc.estimated_days} কার্যদিবস
                                        </td>
                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {svc.required_documents && svc.required_documents.length > 0 ? (
                                                    svc.required_documents.slice(0, 3).map((doc, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600"
                                                        >
                                                            {typeof doc === "object" && doc !== null ? (doc.title_bn || doc.title || doc.name || "কাগজপত্র") : doc}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">সাধারণ তথ্য প্রযোজ্য</span>
                                                )}
                                                {svc.required_documents?.length > 3 && (
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        +{svc.required_documents.length - 3} টি
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                                            {svc.stats.total}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    svc.is_active
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}
                                            >
                                                {svc.is_active ? 'সক্রিয়' : 'বন্ধ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Recent Applications & Live Audit Trail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Applications (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gov-600" />
                                    <span>সাম্প্রতিক নাগরিক আবেদন (Recent Submissions)</span>
                                </h3>
                                <p className="text-xs text-slate-400">সর্বশেষ প্রাপ্ত আবেদন ও বর্তমান অবস্থা</p>
                            </div>
                            <Link href="/admin/applications" className="text-xs font-bold text-gov-700 hover:underline">
                                সকল আবেদন দেখুন
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-xs text-gov-700">
                                                {app.tracking_id}
                                            </span>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-800">{app.service?.name_bn}</p>
                                        <p className="text-[11px] text-slate-400">
                                            আবেদনকারী: {app.applicant_name} ({app.applicant_phone}) • ওয়ার্ড নং {app.ward_no}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/applications/${app.tracking_id}`}
                                        className="p-2 rounded-xl text-slate-400 hover:text-gov-700 hover:bg-gov-50 transition"
                                        title="বিস্তারিত দেখুন"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Audit Trail (1 col) */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gov-600" />
                                    <span>অডিট ট্রেইল (Live Activity)</span>
                                </h3>
                                <p className="text-xs text-slate-400">কর্মকর্তাদের নিরাপত্তা ও কার্যক্রম লগ</p>
                            </div>
                            <Link href="/admin/audit-logs" className="text-xs font-bold text-gov-700 hover:underline">
                                বিস্তারিত
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-700">{log.user?.name || 'সিস্টেম'}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(log.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="font-mono text-[10px] text-gov-700 font-semibold uppercase">
                                        {log.action}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                        IP: {log.ip_address}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
