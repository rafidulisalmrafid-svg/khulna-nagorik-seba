import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Layers,
    Ruler,
    X,
} from 'lucide-react';

export default function BusinessTypesIndex({ businessTypes = [] }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const createForm = useForm({
        name_bn: '',
        name_en: '',
        measurement_label_bn: 'দোকানের সাইনবোর্ডের মাপ',
        measurement_unit_bn: 'বর্গফুট',
        display_order: 1,
    });

    const editForm = useForm({
        name_bn: '',
        name_en: '',
        measurement_label_bn: '',
        measurement_unit_bn: 'বর্গফুট',
        display_order: 0,
        is_active: true,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/business-types', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (bt) => {
        setEditItem(bt);
        editForm.setData({
            name_bn: bt.name_bn,
            name_en: bt.name_en || '',
            measurement_label_bn: bt.measurement_label_bn,
            measurement_unit_bn: bt.measurement_unit_bn,
            display_order: bt.display_order,
            is_active: Boolean(bt.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editItem) return;
        editForm.post(`/admin/business-types/${editItem.id}/update`, {
            onSuccess: () => {
                setEditItem(null);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('আপনি কি নিশ্চিত যে এই ব্যবসার ধরনটি মুছে ফেলতে চান?')) {
            router.delete(`/admin/business-types/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="ব্যবসার ধরন ও পরিমাপ ব্যবস্থাপনা - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
                            <Store className="w-6 h-6 text-gov-600" />
                            <span>ই-ট্রেড লাইসেন্স: ব্যবসার ধরন ও পরিমাপ ব্যবস্থাপনা</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            নতুন ব্যবসার ধরন যুক্ত করুন, নাম ও সংশ্লিষ্ট পরিমাপ ফিল্ডের নাম (Label) ও একক কাস্টমাইজ করুন।
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন ব্যবসার ধরন যুক্ত করুন</span>
                    </button>
                </div>

                {/* Table of Business Types */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">ক্রম</th>
                                    <th className="py-3 px-4">ব্যবসার ধরন (বাংলা)</th>
                                    <th className="py-3 px-4">ইংরেজি নাম</th>
                                    <th className="py-3 px-4">পরিমাপের ফিল্ড লেবেল</th>
                                    <th className="py-3 px-4">পরিমাপের একক</th>
                                    <th className="py-3 px-4">অবস্থা</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businessTypes.map((bt, idx) => (
                                    <tr key={bt.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                                            {bt.display_order || idx + 1}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                                            {bt.name_bn}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 font-mono">
                                            {bt.name_en || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-200">
                                                {bt.measurement_label_bn}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold">
                                                {bt.measurement_unit_bn}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    bt.is_active
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {bt.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditOpen(bt)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-gov-700 hover:bg-slate-100"
                                                    title="সম্পাদনা"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bt.id)}
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
            </div>

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Store className="w-5 h-5 text-gov-600" />
                                <span>নতুন ব্যবসার ধরন ও পরিমাপ কনফিগার করুন</span>
                            </h3>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">
                                        ব্যবসার ধরন (বাংলা) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.name_bn}
                                        onChange={(e) => createForm.setData('name_bn', e.target.value)}
                                        placeholder="উদা: হোটেল / ফার্মেসি"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">ইংরেজি নাম (ঐচ্ছিক)</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name_en}
                                        onChange={(e) => createForm.setData('name_en', e.target.value)}
                                        placeholder="উদা: Hotel / Pharmacy"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">
                                    পরিমাপ ফিল্ডের লেবেল (বাংলা) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.measurement_label_bn}
                                    onChange={(e) => createForm.setData('measurement_label_bn', e.target.value)}
                                    placeholder="উদা: হোটেলের আসন সংখ্যা / দোকানের সাইনবোর্ডের মাপ"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gov-600"
                                />
                                <p className="text-[10px] text-slate-500">
                                    * নাগরিক যখন এই ব্যবসার ধরন নির্বাচন করবেন, ফর্মের পরিমাপ ফিল্ডে এই শিরোনামটি দেখাবে।
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">
                                        পরিমাপের একক <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.measurement_unit_bn}
                                        onChange={(e) => createForm.setData('measurement_unit_bn', e.target.value)}
                                        placeholder="বর্গফুট / টি / আসন"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">ক্রমিক নম্বর</label>
                                    <input
                                        type="number"
                                        value={createForm.data.display_order}
                                        onChange={(e) => createForm.setData('display_order', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>
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
                                    className="px-5 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold shadow-sm"
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
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-gov-600" />
                                <span>ব্যবসার ধরন সম্পাদনা</span>
                            </h3>
                            <button
                                onClick={() => setEditItem(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">ব্যবসার ধরন (বাংলা)</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.name_bn}
                                        onChange={(e) => editForm.setData('name_bn', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">ইংরেজি নাম</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name_en}
                                        onChange={(e) => editForm.setData('name_en', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">পরিমাপ ফিল্ডের লেবেল</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.measurement_label_bn}
                                    onChange={(e) => editForm.setData('measurement_label_bn', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">পরিমাপের একক</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.measurement_unit_bn}
                                        onChange={(e) => editForm.setData('measurement_unit_bn', e.target.value)}
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
                                    className="px-5 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold shadow-sm"
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
