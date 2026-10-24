import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Shield, Clock } from 'lucide-react';

export default function AdminAuditLogsIndex({ logs }) {
    return (
        <AdminLayout>
            <Head title="অডিট লগ ও নিরাপত্তা ট্রেইল - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-navy-950">
                        সিস্টেম অডিট লগ ও নিরাপত্তা ট্রেইল
                    </h1>
                    <p className="text-xs text-slate-500">
                        প্রতিটি আবেদন, অনুমোদন, বাতিল ও পেমেন্ট ইভেন্টের অপরিবর্তনযোগ্য ইতিহাস
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                                <tr>
                                    <th className="py-3.5 px-4">আইডি</th>
                                    <th className="py-3.5 px-4">অ্যাকশন (Action)</th>
                                    <th className="py-3.5 px-4">ব্যবহারকারী</th>
                                    <th className="py-3.5 px-4">মডেল / বিষয়</th>
                                    <th className="py-3.5 px-4">আইপি এড্রেস</th>
                                    <th className="py-3.5 px-4 text-right">সময়</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data?.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono text-slate-400">
                                            #{log.id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-800">
                                            {log.user?.name || 'গেস্ট / নাগরিক'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {log.model_type} (#{log.model_id})
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-500">
                                            {log.ip_address}
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-500">
                                            {new Date(log.created_at).toLocaleDateString('bn-BD', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
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