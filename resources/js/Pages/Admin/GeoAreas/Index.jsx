import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MapPin,
    Plus,
    Building2,
    Shield,
    Check,
    X,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    Search,
    AlertCircle,
} from 'lucide-react';

export default function GeoAreasIndex({
    divisions = [],
    districts = [],
    selectedDistrictId = null,
    upazilas = [],
    counts = {},
}) {
    const [addModal, setAddModal] = useState({ open: false, type: 'upazila' }); // 'district', 'upazila', 'union'
    const [targetUpazilaId, setTargetUpazilaId] = useState(null);

    // Form to create new area
    const { data, setData, post, processing, reset } = useForm({
        type: 'upazila',
        division_id: divisions[0]?.id || 1,
        district_id: selectedDistrictId || districts[0]?.id || 1,
        upazila_id: '',
        name_bn: '',
        union_type: 'ward',
    });

    const handleDistrictChange = (distId) => {
        router.get('/admin/geo-areas', { district_id: distId }, { preserveState: true });
    };

    const handleOpenAddModal = (type, upazilaId = null) => {
        setAddModal({ open: true, type });
        setTargetUpazilaId(upazilaId);
        setData({
            ...data,
            type,
            district_id: selectedDistrictId || districts[0]?.id || 1,
            upazila_id: upazilaId || (upazilas[0]?.id || ''),
            name_bn: '',
        });
    };

    const handleCreateAreaSubmit = (e) => {
        e.preventDefault();
        post('/admin/geo-areas', {
            onSuccess: () => {
                setAddModal({ open: false, type: 'upazila' });
                reset();
            },
        });
    };

    const handleToggleStatus = (type, id) => {
        post(`/admin/geo-areas/${type}/${id}/toggle`, {
            preserveScroll: true,
        });
    };

    const selectedDistrictObj = districts.find((d) => d.id === selectedDistrictId) || districts[0];

    return (
        <AdminLayout>
            <Head title="প্রশাসনিক এলাকা ও ওয়ার্ড ব্যবস্থাপনা - খুলনা সেবা" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-black text-navy-950 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-gov-600" />
                            <span>প্রশাসনিক এলাকা ও ঠিকানা ব্যবস্থাপনা (Geo Administrative Matrix)</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            বিভাগ, জেলা, উপজেলা/মেট্রোপলিটন থানা এবং ওয়ার্ড/ইউনিয়ন ড্রপডাউন ডাটাবেস থেকে ডাইনামিক পরিচালনা
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleOpenAddModal('upazila')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-gov-600 text-white hover:bg-gov-700 shadow-sm transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>নতুন উপজেলা/থানা</span>
                        </button>
                        <button
                            onClick={() => handleOpenAddModal('union')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-navy-950 text-white hover:bg-navy-900 shadow-sm transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>নতুন ওয়ার্ড/ইউনিয়ন</span>
                        </button>
                    </div>
                </div>

                {/* Counts Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase">খুলনা বিভাগের মোট জেলা</span>
                            <h3 className="text-2xl font-black text-navy-950">{counts.total_districts || 10} টি</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase">মোট উপজেলা ও মেট্রো থানা</span>
                            <h3 className="text-2xl font-black text-navy-950">{counts.total_upazilas || 46} টি</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase">মোট ওয়ার্ড ও ইউনিয়ন পরিষদ</span>
                            <h3 className="text-2xl font-black text-navy-950">{counts.total_unions || 224} টি</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Safe Soft Deactivation Notice */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                        <strong>নিরাপদ ব্যবস্থাপনা নীতি:</strong> এলাকা মুছে ফেলার পরিবর্তে নিষ্ক্রিয় (Inactive) করা যাবে। এর ফলে অতীতে নিবন্ধিত নাগরিক বা আবেদনের কোনো ক্ষতি হবে না, কিন্তু রেজিস্ট্রেশন ফর্মে নতুন ড্রপডাউনে তা আর দেখাবে না।
                    </span>
                </div>

                {/* District Selector Horizontal Tabs */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                        জেলা নির্বাচন করুন (খুলনা বিভাগ):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {districts.map((dist) => {
                            const isSelected = dist.id === selectedDistrictId;
                            return (
                                <button
                                    key={dist.id}
                                    onClick={() => handleDistrictChange(dist.id)}
                                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                                        isSelected
                                            ? 'bg-gov-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {dist.name_bn}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Upazilas & Wards Hierarchy */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-navy-950">
                            <strong>{selectedDistrictObj?.name_bn || 'খুলনা'}</strong> জেলার আওতাধীন উপজেলা ও থানাসমূহ ({upazilas.length} টি)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upazilas.map((upz) => (
                            <div
                                key={upz.id}
                                className={`rounded-2xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition ${
                                    upz.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300 opacity-60'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gov-100 text-gov-700 flex items-center justify-center font-bold text-xs">
                                                {upz.unions_count || 0}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-800">{upz.name_bn}</h4>
                                                <p className="text-[10px] text-slate-400">
                                                    {upz.unions_count || 0} টি ওয়ার্ড/ইউনিয়ন পরিষদ অন্তর্ভুক্ত
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleToggleStatus('upazila', upz.id)}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                upz.is_active
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}
                                            title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                                        >
                                            {upz.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                        </button>
                                    </div>

                                    {/* Unions / Wards Chips */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="font-bold text-slate-600">ওয়ার্ড বা ইউনিয়নের তালিকা:</span>
                                            <button
                                                onClick={() => handleOpenAddModal('union', upz.id)}
                                                className="text-gov-700 font-bold text-[10px] hover:underline inline-flex items-center gap-0.5"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>যুক্ত করুন</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 bg-slate-50/70 rounded-xl">
                                            {upz.unions && upz.unions.length > 0 ? (
                                                upz.unions.map((union) => (
                                                    <span
                                                        key={union.id}
                                                        onClick={() => handleToggleStatus('union', union.id)}
                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition ${
                                                            union.is_active
                                                                ? 'bg-white border-slate-200 text-slate-700 hover:border-rose-400'
                                                                : 'bg-rose-50 border-rose-200 text-rose-500 line-through'
                                                        }`}
                                                        title="ক্লিক করে টগল করুন"
                                                    >
                                                        {union.name_bn}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic p-1">
                                                    কোনো ওয়ার্ড বা ইউনিয়ন তালিকাভুক্ত নেই
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Add Administrative Area Modal                                  */}
            {/* ------------------------------------------------------------- */}
            {addModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-gov-600" />
                                <span>
                                    {addModal.type === 'district'
                                        ? 'নতুন জেলা যুক্ত করুন'
                                        : addModal.type === 'upazila'
                                        ? 'নতুন উপজেলা বা থানা যুক্ত করুন'
                                        : 'নতুন ওয়ার্ড বা ইউনিয়ন পরিষদ যুক্ত করুন'}
                                </span>
                            </h3>
                            <button
                                onClick={() => setAddModal({ open: false, type: 'upazila' })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAreaSubmit} className="space-y-4 text-xs">
                            {addModal.type === 'upazila' && (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        কোন জেলার আওতাধীন? <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.district_id}
                                        onChange={(e) => setData('district_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                    >
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name_bn}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {addModal.type === 'union' && (
                                <>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            উপজেলা বা থানা <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.upazila_id}
                                            onChange={(e) => setData('upazila_id', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        >
                                            {upazilas.map((u) => (
                                                <option key={u.id} value={u.id}>{u.name_bn}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">ধরণ</label>
                                        <select
                                            value={data.union_type}
                                            onChange={(e) => setData('union_type', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                        >
                                            <option value="ward">সিটি কর্পোরেশন / পৌরসভা ওয়ার্ড</option>
                                            <option value="union">ইউনিয়ন পরিষদ</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    বাংলায় নাম <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name_bn}
                                    onChange={(e) => setData('name_bn', e.target.value)}
                                    placeholder={
                                        addModal.type === 'district'
                                            ? 'যেমন: মেহেরপুর'
                                            : addModal.type === 'upazila'
                                            ? 'যেমন: তেরখাদা'
                                            : 'যেমন: কেসিসি ওয়ার্ড নং ৩২ বা সেনহাটী ইউনিয়ন'
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gov-500"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAddModal({ open: false, type: 'upazila' })}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold shadow-sm"
                                >
                                    {processing ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
