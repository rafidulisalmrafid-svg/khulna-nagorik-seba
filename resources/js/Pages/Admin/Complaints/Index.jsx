import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Search, Eye, AlertCircle, RotateCcw } from 'lucide-react';

export default function AdminComplaintsIndex({ complaints, departments = [], filters = {} }) {
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');
    const [ward, setWard] = useState(filters.ward || '');

    const handleFilter = (newStatus, newCat, newWard) => {
        router.get('/admin/complaints', {
            status: newStatus !== undefined ? newStatus : status,
            category: newCat !== undefined ? newCat : category,
            ward: newWard !== undefined ? newWard : ward,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="অভিযোগ ব্যবস্থাপনা - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-navy-950">
                        নাগরিক অভিযোগ ও সমাধান ব্যবস্থাপনা
                    </h1>
                    <p className="text-xs text-slate-500">
                        ওয়ার্ডভিত্তিক জনদুর্ভোগ তদন্ত ও দ্রুত নিষ্পত্তি তদারকি
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            handleFilter(e.target.value, undefined, undefined);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                        <option value="">সকল স্ট্যাটাস</option>
                        <option value="submitted">দাখিলকৃত (Submitted)</option>
                        <option value="assigned">অ্যাসাইনকৃত (Assigned)</option>
                        <option value="under_investigation">তদন্তাধীন (Investigation)</option>
                        <option value="action_in_progress">কাজ চলছে (In Progress)</option>
                        <option value="resolved">সমাধানকৃত (Resolved)</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            handleFilter(undefined, e.target.value, undefined);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                        <option value="">সকল ক্যাটাগরি</option>
                        <option value="road_repair">ভাঙা রাস্তা ও গর্ত</option>
                        <option value="drainage">ড্রেনেজ সমস্যা</option>
                        <option value="waterlogging">জলাবদ্ধতা</option>
                        <option value="waste_management">বর্জ্য ব্যবস্থাপনা</option>
                        <option value="street_light">সড়ক বাতি</option>
                        <option value="cleanliness">মশক নিধন ও পরিচ্ছন্নতা</option>
                    </select>

                    {(status || category || ward) && (
                        <button
                            onClick={() => {
                                setStatus('');
                                setCategory('');
                                setWard('');
                                router.get('/admin/complaints', {}, { replace: true });
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>মুছুন</span>
                        </button>
                    )}
                </div>

                {/* Complaints Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                                <tr>
                                    <th className="py-3.5 px-4">অভিযোগ আইডি</th>
                                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                                    <th className="py-3.5 px-4">ওয়ার্ড ও এলাকা</th>
                                    <th className="py-3.5 px-4">নাগরিক (গোপনীয়)</th>
                                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                                    <th className="py-3.5 px-4">বিভাগ</th>
                                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {complaints.data?.map((cmp) => (
                                    <tr key={cmp.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono font-bold text-rose-700">
                                            {cmp.tracking_id}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-800 capitalize">
                                            {cmp.category.replace(/_/g, ' ')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">ওয়ার্ড {cmp.ward_no}</div>
                                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{cmp.location_landmark}</div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-700">
                                            {cmp.citizen_name} ({cmp.citizen_phone})
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={cmp.status} type="complaint" />
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 font-medium">
                                            {cmp.department?.code || 'REV'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/admin/complaints/${cmp.tracking_id}`}
                                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>তদন্ত ও নিষ্পত্তি</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}