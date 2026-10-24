import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Shield, CheckCircle2 } from 'lucide-react';

export default function AdminUsersIndex({ users }) {
    const roleBadges = {
        super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
        department_admin: 'bg-blue-100 text-blue-800 border-blue-200',
        reviewing_officer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        accounts_officer: 'bg-teal-100 text-teal-800 border-teal-200',
        complaint_officer: 'bg-rose-100 text-rose-800 border-rose-200',
        helpdesk: 'bg-amber-100 text-amber-800 border-amber-200',
        citizen: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
        <AdminLayout>
            <Head title="ব্যবহারকারী ও রোল ব্যবস্থাপনা - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-navy-950">
                        ব্যবহারকারী ও পারমিশন (RBAC) নিয়ন্ত্রণ
                    </h1>
                    <p className="text-xs text-slate-500">
                        সিটি কর্পোরেশন কর্মকর্তা ও নিবন্ধিত নাগরিকদের রোল এবং অ্যাক্সেস তালিকা
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                                <tr>
                                    <th className="py-3.5 px-4">নাম</th>
                                    <th className="py-3.5 px-4">ইমেইল</th>
                                    <th className="py-3.5 px-4">মোবাইল</th>
                                    <th className="py-3.5 px-4">রোল (Role)</th>
                                    <th className="py-3.5 px-4">পদবী ও বিভাগ</th>
                                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.data?.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800">
                                            {u.name}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600">
                                            {u.email}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600">
                                            {u.phone || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadges[u.role] || 'bg-slate-100 text-slate-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <div>{u.designation || 'নাগরিক'}</div>
                                            <div className="text-[10px] text-slate-400">{u.department?.name_bn}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                সক্রিয়
                                            </span>
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