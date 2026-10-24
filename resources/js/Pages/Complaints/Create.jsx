import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    AlertCircle,
    Send,
    Camera,
    MapPin,
    Shield,
    CheckCircle2,
    Building2,
    Wrench,
    Trash2,
    Lightbulb,
    HelpCircle,
} from 'lucide-react';

export default function ComplaintCreate({ wards = [], categories = [] }) {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        citizen_name: auth.user?.name || '',
        citizen_phone: auth.user?.phone || '',
        citizen_email: auth.user?.email || '',
        category: categories[0]?.id || 'road_repair',
        ward_no: auth.user?.ward_no ? parseInt(auth.user.ward_no) : (wards[0]?.ward_no || 1),
        location_landmark: '',
        description: '',
        evidence_file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/complaints');
    };

    return (
        <MainLayout>
            <Head title="নাগরিক অভিযোগ ও সমস্যা দাখিল - খুলনা সেবা" />

            {/* Header banner */}
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-navy-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-rose-900">
                <div className="max-w-4xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        পাবলিক গ্রিভেন্স রিড্রেসাল সিস্টেম (GRS)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        নাগরিক অভিযোগ ও জনদুর্ভোগ প্রতিকার
                    </h1>
                    <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                        আপনার এলাকায় ভাঙা রাস্তা, ড্রেনেজ বন্ধ, জলাবদ্ধতা, ময়লার স্তূপ কিংবা অচল সড়ক বাতি রয়েছে? দ্রুত সমাধানের জন্য বিস্তারিত জানিয়ে ছবিসহ জমা দিন।
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Privacy Guarantee Alert */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-start gap-3.5 shadow-2xs">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                        <span className="font-bold">নাগরিক গোপনীয়তার শতভাগ নিশ্চয়তা:</span>
                        <p className="text-slate-600 mt-0.5">
                            আপনার নাম, ফোন নম্বর ও ব্যক্তিগত তথ্য কোনো অবস্থাতেই পাবলিক ট্র্যাকিং পেজে বা সাধারণের কাছে প্রকাশ করা হবে না। শুধুমাত্র দায়িত্বপ্রাপ্ত তদন্তকারী কর্মকর্তা কাজের স্বার্থে আপনার সাথে যোগাযোগ করতে পারবেন।
                        </p>
                    </div>
                </div>

                {/* Complaint Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8"
                >
                    {/* Category Selection Cards */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 block">
                            সমস্যার ধরন বা বিষয় নির্বাচন করুন <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map((cat) => {
                                const isSelected = data.category === cat.id;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => setData('category', cat.id)}
                                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-rose-50/80 border-rose-500 text-rose-900 font-bold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="text-xs font-semibold">{cat.name_bn}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Location & Ward */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                                কেসিসি ওয়ার্ড নম্বর <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.ward_no}
                                onChange={(e) => setData('ward_no', parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-500"
                            >
                                {wards.map((w) => (
                                    <option key={w.id} value={w.ward_no}>
                                        ওয়ার্ড নং {w.ward_no} ({w.area_coverage_bn || w.office_address_bn})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                                নির্দিষ্ট স্থান বা ল্যান্ডমার্ক <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.location_landmark}
                                onChange={(e) => setData('location_landmark', e.target.value)}
                                placeholder="উদা: সোনাডাঙ্গা বাস টার্মিনাল মোড়, রূপসা ঘাট..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
                            />
                            {errors.location_landmark && (
                                <p className="text-xs text-rose-500">{errors.location_landmark}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                            সমস্যার বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="সমস্যার তীব্রতা, কতদিন ধরে সমস্যাটি রয়েছে এবং জনজীবনে এর প্রভাব বিস্তারিত লিখুন..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
                        />
                        {errors.description && (
                            <p className="text-xs text-rose-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Photo / Evidence Upload */}
                    <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                <Camera className="w-4 h-4 text-rose-600" />
                                <span>সমস্যার ছবি বা ভিডিও প্রমাণ আপলোড (ঐচ্ছিক কিন্তু সুপারিশকৃত)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                সর্বোচ্চ ফাইল সাইজ ১০ MB
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            ছবি বা ভিডিও দিলে সংশ্লিষ্ট দল সমস্যাটি দ্রুত সমাধান করতে পারে (অনুমোদিত ফরম্যাট: JPG, PNG, MP4, PDF • সর্বোচ্চ ফাইল সাইজ ১০ MB)।
                        </p>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.mp4,.pdf"
                            onChange={(e) => {
                                const f = e.target.files[0];
                                if (f && f.size > 10 * 1024 * 1024) {
                                    alert('ফাইলের সাইজ ১০ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১০ MB বা তার কম সাইজের ফাইল আপলোড করুন।');
                                    e.target.value = '';
                                    setData('evidence_file', null);
                                    return;
                                }
                                setData('evidence_file', f);
                            }}
                            className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-700 file:text-white"
                        />
                    </div>

                    {/* Citizen Details */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h4 className="text-sm font-bold text-slate-800">
                            আপনার যোগাযোগের বিবরণ (গোপনীয় থাকবে)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">
                                    আপনার নাম <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.citizen_name}
                                    onChange={(e) => setData('citizen_name', e.target.value)}
                                    placeholder="আপনার নাম"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">
                                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={data.citizen_phone}
                                    onChange={(e) => setData('citizen_phone', e.target.value)}
                                    placeholder="০১৮১২-৩৪৫৬৭৮"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">ইমেইল (ঐচ্ছিক)</label>
                                <input
                                    type="email"
                                    value={data.citizen_email}
                                    onChange={(e) => setData('citizen_email', e.target.value)}
                                    placeholder="email@domain.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <Link
                            href="/complaints/track"
                            className="text-xs font-bold text-slate-600 hover:text-slate-800"
                        >
                            পূর্ববর্তী অভিযোগ ট্র্যাক করতে চান?
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/20 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span>{processing ? 'জমা হচ্ছে...' : 'অভিযোগ দাখিল করুন'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}