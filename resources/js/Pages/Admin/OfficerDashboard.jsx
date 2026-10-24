import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Users,
    Layers,
    ArrowRight,
    ExternalLink,
    Building2,
    Shield,
    Sparkles,
    Calendar,
    Filter,
    Search,
    Eye,
    Briefcase,
    Phone,
} from 'lucide-react';

export default function OfficerDashboard({
    officer = {},
    stats = {},
    assignedServices = [],
    recentApplications = [],
    filters = {},
}) {
    const [dateRange, setDateRange] = useState(filters.date_range || 'all');

    const handleDateFilterChange = (newRange) => {
        setDateRange(newRange);
        router.get(
            '/admin',
            { date_range: newRange },
            { preserveState: true, preserveScroll: true }
        );
    };

    const kpiCards = [
        {
            title: 'মোট অর্পিত আবেদন',
            value: stats.total_applications || 0,
            icon: FileText,
            color: 'from-blue-600 to-indigo-700',
            textColor: 'text-blue-700',
            bgSoft: 'bg-blue-50 border-blue-200',
            subtext: 'আপনার দায়িত্বপ্রাপ্ত সেবাসমূহের সর্বমোট আবেদন',
        },
        {
            title: 'অপেক্ষমাণ পর্যালোচনা',
            value: stats.pending_applications || 0,
            icon: Clock,
            color: 'from-amber-500 to-amber-600',
            textColor: 'text-amber-700',
            bgSoft: 'bg-amber-50 border-amber-200',
            subtext: 'দাখিলকৃত ও সরাসরি যাচাইযোগ্য আবেদন',
            highlight: true,
        },
        {
            title: 'নাগরিক সংশোধনে প্রেরিত',
            value: stats.info_required || 0,
            icon: AlertCircle,
            color: 'from-sky-500 to-cyan-600',
            textColor: 'text-sky-700',
            bgSoft: 'bg-sky-50 border-sky-200',
            subtext: 'অতিরিক্ত তথ্যের জন্য নাগরিকের কাছে অপেক্ষমাণ',
        },
        {
            title: 'অনুমোদিত ও সম্পন্ন',
            value: stats.approved_applications || 0,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-teal-600',
            textColor: 'text-emerald-700',
            bgSoft: 'bg-emerald-50 border-emerald-200',
            subtext: 'সফলভাবে সনদ/লাইসেন্স প্রদানকৃত',
        },
        {
            title: 'বাতিলকৃত আবেদন',
            value: stats.rejected_applications || 0,
            icon: XCircle,
            color: 'from-rose-500 to-red-600',
            textColor: 'text-rose-700',
            bgSoft: 'bg-rose-50 border-rose-200',
            subtext: 'শর্ত পূরণ না হওয়ায় বাতিলকৃত আবেদন',
        },
        {
            title: 'সেবাগ্রহীতা নাগরিক',
            value: stats.unique_citizens || 0,
            icon: Users,
            color: 'from-purple-600 to-violet-700',
            textColor: 'text-purple-700',
            bgSoft: 'bg-purple-50 border-purple-200',
            subtext: 'আপনার সেবাসমূহে আবেদনকারী স্বতন্ত্র নাগরিক',
        },
    ];

    return (
        <AdminLayout>
            <Head title="দায়িত্বপ্রাপ্ত কর্মকর্তা ড্যাশবোর্ড - খুলনা সেবা" />

            <div className="space-y-6">
                {/* Hero / Officer Greeting Banner */}
                <div className="bg-gradient-to-r from-gov-800 via-gov-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gov-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-500/30 text-gov-200 text-xs font-bold border border-gov-400/20 backdrop-blur-xs">
                                    <Shield className="w-3.5 h-3.5 text-gov-300" />
                                    দায়িত্বপ্রাপ্ত কর্মকর্তা ড্যাশবোর্ড (RBAC)
                                </span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
                                    {assignedServices.length}টি নির্ধারিত সেবা
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                                <span>স্বাগতম, {officer.name || 'কর্মকর্তা'}</span>
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                                {officer.designation || 'রিভিউ কর্মকর্তা'} &bull; {officer.department || 'খুলনা সিটি কর্পোরেশন'} &bull; {officer.email}
                            </p>
                        </div>

                        {/* Date Filter & Fast Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="bg-navy-900/80 p-1.5 rounded-2xl border border-navy-700/80 flex items-center gap-1">
                                {[
                                    { key: 'all', label: 'সর্বকালের' },
                                    { key: 'month', label: 'এই মাস' },
                                    { key: 'week', label: 'এই সপ্তাহ' },
                                    { key: 'today', label: 'আজকের' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleDateFilterChange(item.key)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                            dateRange === item.key
                                                ? 'bg-gov-600 text-white shadow-xs'
                                                : 'text-slate-300 hover:text-white hover:bg-navy-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <Link
                                href="/admin/applications?status=submitted"
                                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0"
                            >
                                <Clock className="w-4 h-4" />
                                <span>নতুন আবেদন পর্যালোচনা করুন</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Privacy & Isolation Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-amber-950 block">আইসোলেটেড সার্ভিস ম্যানেজমেন্ট নীতি সক্রিয়:</span>
                        <span>
                            আপনি শুধুমাত্র আপনার দায়িত্বপ্রাপ্ত সেবাসমূহের ({assignedServices.map(s => s.name_bn).join(', ')}) আবেদন, নথি এবং সংশ্লিষ্ট নাগরিক আবেদন হিস্ট্রি পর্যালোচনা করতে পারবেন। অন্যান্য বিভাগের ডেটা আপনার অ্যাকাউন্ট থেকে সুরক্ষিত ও সম্পূর্ণ অপ্রবেশ্য।
                        </span>
                    </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {kpiCards.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={idx}
                                className={`p-4 rounded-3xl border bg-white transition duration-200 hover:shadow-md flex flex-col justify-between ${
                                    kpi.highlight ? 'ring-2 ring-amber-400/80 border-amber-300 bg-amber-50/20' : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-xs`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    {kpi.highlight && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                            অ্যাকশন প্রয়োজন
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                                        {kpi.value}
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 leading-snug mt-0.5">
                                        {kpi.title}
                                    </div>
                                    <div className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">
                                        {kpi.subtext}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Assigned Services Overview Cards */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-gov-600" />
                            <span>আমার দায়িত্বপ্রাপ্ত সেবাসমূহ ({assignedServices.length}টি)</span>
                        </h2>
                        <Link
                            href="/admin/services"
                            className="text-xs font-bold text-gov-600 hover:text-gov-700 flex items-center gap-1 hover:underline"
                        >
                            <span>সব সেবার নির্দেশিকা ও ফি দেখুন</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedServices.length === 0 ? (
                            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                                <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                                <h3 className="font-bold text-slate-800 text-sm">কোনো সেবা অর্পিত নেই</h3>
                                <p className="text-xs text-slate-500 mt-1">সুপার অ্যাডমিনের সাথে যোগাযোগ করে আপনার অ্যাকাউন্টে সেবা বরাদ্দ নিন।</p>
                            </div>
                        ) : (
                            assignedServices.map((srv) => (
                                <div
                                    key={srv.id}
                                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-gov-300 hover:shadow-md transition flex flex-col justify-between gap-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gov-50 text-gov-700 border border-gov-100">
                                                {srv.category?.name_bn || 'নাগরিক সেবা'}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 font-mono">
                                                {parseFloat(srv.fee_amount) > 0 ? `৳${Math.round(srv.fee_amount)}` : 'ফ্রি'}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                                            {srv.name_bn}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                            {srv.short_description_bn || srv.department?.name_bn || 'খুলনা সিটি কর্পোরেশন নাগরিক সেবা'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="p-2 rounded-xl bg-slate-50">
                                                <span className="block text-[10px] text-slate-400 font-medium">মোট</span>
                                                <span className="font-black text-slate-800">{srv.applications_count || 0}</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-amber-50">
                                                <span className="block text-[10px] text-amber-600 font-medium">অপেক্ষমাণ</span>
                                                <span className="font-black text-amber-800">{srv.pending_count || 0}</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-emerald-50">
                                                <span className="block text-[10px] text-emerald-600 font-medium">অনুমোদিত</span>
                                                <span className="font-black text-emerald-800">{srv.approved_count || 0}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/admin/applications?service_id=${srv.id}`}
                                            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-gov-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                                        >
                                            <span>আবেদনগুলো দেখুন</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Queue of Applications Requiring Review */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gov-600" />
                                <span>সাম্প্রতিক অর্পিত আবেদনসমূহ (Queue)</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                শুধুমাত্র আপনার অর্পিত সেবাসমূহের দাখিলকৃত ও প্রক্রিয়াকরণযোগ্য আবেদন
                            </p>
                        </div>

                        <Link
                            href="/admin/applications"
                            className="px-4 py-2 rounded-xl bg-gov-50 hover:bg-gov-100 text-gov-700 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <span>সকল আবেদন দেখুন</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                                <tr>
                                    <th className="py-3.5 px-4">ট্র্যাকিং আইডি</th>
                                    <th className="py-3.5 px-4">আবেদনকারী</th>
                                    <th className="py-3.5 px-4">সেবা</th>
                                    <th className="py-3.5 px-4">তারিখ ও সময়</th>
                                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            <span>আপনার অর্পিত সেবায় কোনো আবেদন পাওয়া যায়নি</span>
                                        </td>
                                    </tr>
                                ) : (
                                    recentApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="font-mono font-bold text-gov-700">
                                                    {app.tracking_id}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-800">
                                                    {app.applicant_name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    {app.applicant_phone}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-800">
                                                    {app.service?.name_bn}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                {new Date(app.created_at).toLocaleDateString('bn-BD', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/admin/applications/${app.tracking_id}`}
                                                    className="px-3 py-1.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>পর্যালোচনা</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Navigation Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/applications"
                        className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-gov-400 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-gov-700 transition">
                                    আবেদন ব্যবস্থাপনা
                                </h4>
                                <span className="text-xs text-slate-400">দাখিলকৃত সকল আবেদন পরীক্ষা ও অনুমোদন</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-gov-600 transition" />
                    </Link>

                    <Link
                        href="/admin/citizens"
                        className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-gov-400 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-gov-700 transition">
                                    নাগরিক সেবা ইতিহাস
                                </h4>
                                <span className="text-xs text-slate-400">নাগরিকভিত্তিক সেবা গ্রহণ ও রেকর্ড নিরীক্ষণ</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-gov-600 transition" />
                    </Link>

                    <Link
                        href="/admin/services"
                        className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-gov-400 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-gov-700 transition">
                                    সেবার নিয়মাবলী ও ফি
                                </h4>
                                <span className="text-xs text-slate-400">অর্পিত সেবাসমূহের নথিপত্র নির্দেশিকা</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-gov-600 transition" />
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
