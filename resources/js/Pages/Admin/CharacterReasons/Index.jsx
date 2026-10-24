import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Award,
    Plus,
    Edit2,
    Trash2,
    X,
} from 'lucide-react';

export default function CharacterReasonsIndex({ reasons = [] }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const createForm = useForm({
        reason_bn: '',
        reason_en: '',
        display_order: 1,
    });

    const editForm = useForm({
        reason_bn: '',
        reason_en: '',
        display_order: 0,
        is_active: true,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/character-reasons', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (r) => {
        setEditItem(r);
        editForm.setData({
            reason_bn: r.reason_bn,
            reason_en: r.reason_en || '',
            display_order: r.display_order,
            is_active: Boolean(r.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editItem) return;
        editForm.post(`/admin/character-reasons/${editItem.id}/update`, {
            onSuccess: () => {
                setEditItem(null);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('আপনি কি নিশ্চিত যে এই কারণটি মুছে ফেলতে চান?')) {
            router.delete(`/admin/character-reasons/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="চারিত্রিক সনদ গ্রহণের কারণ ব্যবস্থাপনা - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
                            <Award className="w-6 h-6 text-gov-600" />
                            <span>চারিত্রিক সনদ গ্রহণের কারণ ব্যবস্থাপনা</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            নাগরিকরা চারিত্রিক সনদের আবেদনে যে সকল কারণ নির্বাচন করতে পারবেন তা এখান থেকে পরিচালনা করুন।
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন কারণ যুক্ত করুন</span>
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4">ক্রম</th>
                                <th className="py-3 px-4">সনদ গ্রহণের কারণ (বাংলা)</th>
                                <th className="py-3 px-4">ইংরেজি কারণ (English)</th>
                                <th className="py-3 px-4">অবস্থা</th>
                                <th className="py-3 px-4 text-right">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reasons.map((r, idx) => (
                                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                                        {r.display_order || idx + 1}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                                        {r.reason_bn}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 font-mono">
                                        {r.reason_en || '—'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                r.is_active
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {r.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEditOpen(r)}
                                                className="p-1.5 rounded-lg text-slate-600 hover:text-gov-700 hover:bg-slate-100"
                                                title="সম্পাদনা"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                                title="মুছে ফেলুন"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">নতুন সনদের কারণ যুক্ত করুন</h3>
                            <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">কারণ (বাংলা) *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.reason_bn}
                                    onChange={(e) => createForm.setData('reason_bn', e.target.value)}
                                    placeholder="উদা: ড্রাইভিং লাইসেন্স প্রাপ্তির জন্য"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">ইংরেজি কারণ</label>
                                <input
                                    type="text"
                                    value={createForm.data.reason_en}
                                    onChange={(e) => createForm.setData('reason_en', e.target.value)}
                                    placeholder="উদা: For Driving License"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">ক্রমিক নম্বর</label>
                                <input
                                    type="number"
                                    value={createForm.data.display_order}
                                    onChange={(e) => createForm.setData('display_order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-5 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold"
                                >
                                    {createForm.processing ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">সনদের কারণ সম্পাদনা</h3>
                            <button onClick={() => setEditItem(null)} className="p-1 text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">কারণ (বাংলা) *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.reason_bn}
                                    onChange={(e) => editForm.setData('reason_bn', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">ইংরেজি কারণ</label>
                                <input
                                    type="text"
                                    value={editForm.data.reason_en}
                                    onChange={(e) => editForm.setData('reason_en', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">ক্রমিক নম্বর</label>
                                <input
                                    type="number"
                                    value={editForm.data.display_order}
                                    onChange={(e) => editForm.setData('display_order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditItem(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold"
                                >
                                    {editForm.processing ? 'আপডেট হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
