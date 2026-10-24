import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Search, Filter, Eye, ArrowRight, RotateCcw, FileText, UserCheck, Shield } from 'lucide-react';

export default function AdminApplicationsIndex({
    applications,
    departments = [],
    services = [],
    officers = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [serviceId, setServiceId] = useState(filters.service_id || '');
    const [dept, setDept] = useState(filters.department || '');

    const handleFilter = (newStatus, newService, newDept, newSearch) => {
        router.get(
            '/admin/applications',
            {
                status: newStatus !== undefined ? newStatus : status,
                service_id: newService !== undefined ? newService : serviceId,
                department: newDept !== undefined ? newDept : dept,
                search: newSearch !== undefined ? newSearch : search,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="আবেদন ব্যবস্থাপনা - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-black text-navy-950 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-gov-600" />
                            <span>নাগরিক আবেদন ব্যবস্থাপনা ও অনুমোদন (RBAC Protected)</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            আপনার দায়িত্বপ্রাপ্ত সেবাসমূহের সকল নাগরিক আবেদন পর্যালোচনা, অনুমোদন ও কর্মকর্তা বরাদ্দ
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gov-50 border border-gov-200 text-gov-800 text-xs font-bold">
                        <Shield className="w-4 h-4 text-gov-600" />
                        <span>সেবাভিত্তিক আইসোলেটেড অ্যাক্সেস</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilter(undefined, undefined, undefined, e.target.value);
                            }}
                            placeholder="ট্র্যাকিং আইডি, নাগরিকের নাম বা ফোন দিয়ে খুঁজুন..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            handleFilter(e.target.value, undefined, undefined, undefined);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                        <option value="">সকল স্ট্যাটাস (All)</option>
                        <option value="submitted">দাখিলকৃত (Submitted)</option>
                        <option value="under_review">পর্যালোচনায় (Under Review)</option>
                        <option value="info_required">তথ্য প্রয়োজন (Info Required)</option>
                        <option value="approved">অনুমোদিত (Approved)</option>
                        <option value="rejected">বাতিলকৃত (Rejected)</option>
                        <option value="completed">সম্পন্ন (Completed)</option>
                    </select>

                    <select
                        value={serviceId}
                        onChange={(e) => {
                            setServiceId(e.target.value);
                            handleFilter(undefined, e.target.value, undefined, undefined);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white max-w-xs truncate"
                    >
                        <option value="">সকল সেবা</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name_bn}
                            </option>
                        ))}
                    </select>

                    <select
                        value={dept}
                        onChange={(e) => {
                            setDept(e.target.value);
                            handleFilter(undefined, undefined, e.target.value, undefined);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                        <option value="">সকল বিভাগ</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name_bn}
                            </option>
                        ))}
                    </select>

                    {(status || serviceId || dept || search) && (
                        <button
                            onClick={() => {
                                setStatus('');
                                setServiceId('');
                                setDept('');
                                setSearch('');
                                router.get('/admin/applications', {}, { replace: true });
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>রিসেট</span>
                        </button>
                    )}
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3.5 px-4">ট্র্যাকিং আইডি</th>
                                    <th className="py-3.5 px-4">সেবা</th>
                                    <th className="py-3.5 px-4">আবেদনকারী</th>
                                    <th className="py-3.5 px-4">ওয়ার্ড</th>
                                    <th className="py-3.5 px-4">পেমেন্ট</th>
                                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                                    <th className="py-3.5 px-4">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.data && applications.data.length > 0 ? (
                                    applications.data.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-gov-700">
                                                {app.tracking_id}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-800 max-w-[200px] truncate">
                                                {app.service?.name_bn}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-800">{app.applicant_name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{app.applicant_phone}</div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-700">
                                                ওয়ার্ড {app.ward_no}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        app.payment_status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {app.payment_status === 'paid' ? 'পরিশোধিত' : 'অনাদায়ী'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="py-3 px-4">
                                                {app.assigned_officer ? (
                                                    <span className="font-semibold text-slate-700">
                                                        {app.assigned_officer.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">অনির্ধারিত</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/admin/applications/${app.tracking_id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gov-50 text-gov-700 hover:bg-gov-100 font-bold transition"
                                                >
                                                    <span>বিস্তারিত</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400">
                                            কোনো আবেদন পাওয়া যায়নি।
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
