import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart3,
    Printer,
    Download,
    Receipt,
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    Building2,
    ArrowUpRight,
} from 'lucide-react';

export default function ReportsIndex({
    summary = {},
    serviceStats = [],
    wardStats = [],
    servicesList = [],
    filters = {},
}) {
    const [dateRange, setDateRange] = useState(filters.date_range || 'month');
    const [serviceFilter, setServiceFilter] = useState(filters.service_id || '');

    const handleFilterChange = (newDate, newService) => {
        router.get(
            '/admin/reports',
            {
                date_range: newDate !== undefined ? newDate : dateRange,
                service_id: newService !== undefined ? newService : serviceFilter,
            },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ['সেবার নাম', 'মোট আবেদন', 'অনুমোদিত', 'অপেক্ষমাণ', 'আদায়কৃত রাজস্ব (৳)'];
        const rows = serviceStats.map((s) => [
            s.name_bn,
            s.total,
            s.approved,
            s.pending,
            s.collected_revenue,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `kcc_service_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <Head title="প্রতিবেদন ও আর্থিক হিসাব - খুলনা সেবা" />

            <div className="space-y-6">
                {/* Print Header (Visible only on print) */}
                <div className="hidden print:block text-center pb-4 mb-4 border-b-2 border-slate-900">
                    <h2 className="text-xl font-black">খুলনা সিটি কর্পোরেশন</h2>
                    <h3 className="text-base font-bold">ডিজিটাল নাগরিক সেবা ব্যবস্থাপনা ও আর্থিক হিসাব বিবরণী</h3>
                    <p className="text-xs text-slate-600">
                        তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Screen Header & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 print:hidden">
                    <div>
                        <h1 className="text-2xl font-black text-navy-950 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-gov-600" />
                            <span>আর্থিক হিসাব ও সামগ্রিক সেবা প্রতিবেদন (Reports & Analytics)</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            সেবাভিত্তিক আয়, বকেয়া, নিষ্পত্তির হার এবং এলাকাভিত্তিক পূর্ণাঙ্গ হিসাব বিবরণী
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            <span>CSV এক্সপোর্ট</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-gov-600 text-white hover:bg-gov-700 shadow-sm transition"
                        >
                            <Printer className="w-4 h-4" />
                            <span>প্রিন্ট / PDF সেভ</span>
                        </button>
                    </div>
                </div>

                {/* Filter Toolbar (Hidden on print) */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Filter className="w-4 h-4 text-gov-600" />
                        <span>ফিল্টার করুন:</span>
                    </div>

                    <select
                        value={dateRange}
                        onChange={(e) => {
                            setDateRange(e.target.value);
                            handleFilterChange(e.target.value, serviceFilter);
                        }}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-gov-500"
                    >
                        <option value="today">আজকের দিন</option>
                        <option value="week">চলতি সপ্তাহ</option>
                        <option value="month">চলতি মাস</option>
                        <option value="all">সর্বমোট সময়কাল</option>
                    </select>

                    <select
                        value={serviceFilter}
                        onChange={(e) => {
                            setServiceFilter(e.target.value);
                            handleFilterChange(dateRange, e.target.value);
                        }}
                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-gov-500 max-w-xs truncate"
                    >
                        <option value="">সকল সেবা</option>
                        {servicesList.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_bn}</option>
                        ))}
                    </select>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">মোট আদায়কৃত রাজস্ব</span>
                            <h3 className="text-2xl font-black text-emerald-600">
                                ৳{Number(summary.total_revenue || 0).toLocaleString('en-BD')}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">ট্রেজারি ও ডিজিটাল পেমেন্ট</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">বকেয়া / অনিষ্পন্ন ফি</span>
                            <h3 className="text-2xl font-black text-amber-600">
                                ৳{Number(summary.pending_revenue || 0).toLocaleString('en-BD')}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">পেন্ডিং আবেদনের ফি</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">মোট দাখিলকৃত আবেদন</span>
                            <h3 className="text-2xl font-black text-navy-950">
                                {summary.total_apps || 0} টি
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                অনুমোদিত: {summary.approved_apps || 0} • বাতিল: {summary.rejected_apps || 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">আবেদন নিষ্পত্তির হার</span>
                            <h3 className="text-2xl font-black text-gov-700">
                                {summary.resolution_rate || 0}%
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">সাফল্য ও অনুমোদনের সূচক</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gov-50 text-gov-700 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Table 1: Service Performance & Financial Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h3 className="text-base font-extrabold text-navy-950">
                        সেবাভিত্তিক আবেদন নিষ্পত্তি ও রাজস্ব আদায় বিবরণী
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">সেবার নাম</th>
                                    <th className="py-3 px-3 text-center">মোট আবেদন</th>
                                    <th className="py-3 px-3 text-center">অনুমোদিত</th>
                                    <th className="py-3 px-3 text-center">অপেক্ষমাণ</th>
                                    <th className="py-3 px-4 text-right">আদায়কৃত রাজস্ব (৳)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {serviceStats.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800">
                                            {s.name_bn}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                                            {s.total}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                                            {s.approved}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-amber-600">
                                            {s.pending}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                            ৳{Number(s.collected_revenue || 0).toLocaleString('en-BD')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: Ward Distribution of Applications */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h3 className="text-base font-extrabold text-navy-950">
                        ওয়ার্ডভিত্তিক আবেদনের ভৌগোলিক বণ্টন (Top Wards)
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {wardStats.map((w, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                <span className="text-[11px] text-slate-500 font-bold">কেসিসি ওয়ার্ড {w.ward_no}</span>
                                <h4 className="text-xl font-black text-navy-950 mt-0.5">{w.total} টি</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
