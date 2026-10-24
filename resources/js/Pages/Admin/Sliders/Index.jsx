import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Image as ImageIcon,
    Plus,
    Clock,
    Sparkles,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    CheckCircle2,
    Sliders,
    Save,
    ArrowUpRight,
    MoveUp,
    MoveDown,
    X,
    UploadCloud,
    HelpCircle,
} from 'lucide-react';

export default function SlidersIndex({ sliders = [], setting = {} }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Global Settings Form
    const settingsForm = useForm({
        autoplay_seconds: setting.autoplay_seconds || 5,
        transition_effect: setting.transition_effect || 'fade',
        show_indicators: setting.show_indicators !== false,
        show_arrows: setting.show_arrows !== false,
        is_enabled: setting.is_enabled !== false,
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        settingsForm.post('/admin/sliders/settings', {
            preserveScroll: true,
        });
    };

    // Add Slide Form
    const addForm = useForm({
        image: null,
        title_bn: '',
        subtitle_bn: '',
        button_text_bn: 'সেবা দেখুন',
        button_url: '/services',
        display_order: sliders.length + 1,
        is_active: true,
    });

    // Edit Slide Form
    const editForm = useForm({
        image: null,
        title_bn: '',
        subtitle_bn: '',
        button_text_bn: '',
        button_url: '',
        display_order: 1,
        is_active: true,
    });

    const openEditModal = (slide) => {
        setEditingSlide(slide);
        editForm.setData({
            image: null,
            title_bn: slide.title_bn || '',
            subtitle_bn: slide.subtitle_bn || '',
            button_text_bn: slide.button_text_bn || '',
            button_url: slide.button_url || '',
            display_order: slide.display_order || 1,
            is_active: Boolean(slide.is_active),
        });
        setImagePreview(slide.image_url || slide.image_path);
    };

    const handleAddSlide = (e) => {
        e.preventDefault();
        addForm.post('/admin/sliders', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
                setImagePreview(null);
            },
        });
    };

    const handleUpdateSlide = (e) => {
        e.preventDefault();
        if (!editingSlide) return;
        editForm.post(`/admin/sliders/${editingSlide.id}/update`, {
            onSuccess: () => {
                setEditingSlide(null);
                setImagePreview(null);
            },
        });
    };

    const handleToggle = (slideId) => {
        router.post(`/admin/sliders/${slideId}/toggle`, {}, { preserveScroll: true });
    };

    const handleDelete = (slideId, title) => {
        if (confirm(`আপনি কি নিশ্চিত যে "${title || 'এই স্লাইডটি'}" মুছে ফেলতে চান?`)) {
            router.delete(`/admin/sliders/${slideId}`, { preserveScroll: true });
        }
    };

    const handleImageChange = (e, formType) => {
        const file = e.target.files[0];
        if (file) {
            if (formType === 'add') {
                addForm.setData('image', file);
            } else {
                editForm.setData('image', file);
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <Head title="হোমপেজ স্লাইডার ব্যবস্থাপনা - খুলনা সেবা" />

            <div className="space-y-8">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-50 text-gov-700 text-xs font-bold mb-2">
                            <ImageIcon className="w-4 h-4 text-gov-600" />
                            হোমপেজ ভিজ্যুয়াল শোকেস
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                            ইমেজ স্লাইডার ব্যবস্থাপনা
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            হোমপেজের আকর্ষণীয় স্লাইডারের ছবি, টাইটেল, ক্রম এবং সময়সীমা (Speed) সম্পূর্ণ নিয়ন্ত্রণ করুন।
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setIsAddModalOpen(true);
                            setImagePreview(null);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        <span>নতুন স্লাইড যোগ করুন</span>
                    </button>
                </div>

                {/* 1. Global Slider Speed & Configuration Card */}
                <form
                    onSubmit={handleSaveSettings}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6"
                >
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                                    ছবি পরিবর্তনের সময়সীমা ও কন্ট্রোল সেটিংস
                                </h3>
                                <p className="text-xs text-slate-500">
                                    প্রতিটি ছবি কত সেকেন্ড পরপর স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে নির্ধারণ করুন
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={settingsForm.processing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{settingsForm.processing ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Autoplay Seconds Preset Buttons */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                স্লাইড পরিবর্তনের গতি (সেকেন্ড)
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {[3, 5, 7, 10].map((sec) => (
                                    <button
                                        key={sec}
                                        type="button"
                                        onClick={() => settingsForm.setData('autoplay_seconds', sec)}
                                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                                            settingsForm.data.autoplay_seconds === sec
                                                ? 'bg-gov-600 text-white border-gov-600 shadow-md scale-105'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {sec} সেকেন্ড
                                    </button>
                                ))}

                                <div className="flex items-center gap-2 pl-2">
                                    <span className="text-xs text-slate-400">অথবা:</span>
                                    <input
                                        type="number"
                                        min="2"
                                        max="30"
                                        value={settingsForm.data.autoplay_seconds}
                                        onChange={(e) => settingsForm.setData('autoplay_seconds', Number(e.target.value))}
                                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm text-center focus:ring-2 focus:ring-gov-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-500">সেকেন্ড</span>
                                </div>
                            </div>
                        </div>

                        {/* Transition Effect */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                ট্রানজিশন ইফেক্ট
                            </label>
                            <select
                                value={settingsForm.data.transition_effect}
                                onChange={(e) => settingsForm.setData('transition_effect', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-gov-500 bg-white"
                            >
                                <option value="fade">স্মুথ ফেড (Smooth Fade)</option>
                                <option value="slide">স্লাইড ট্রানজিশন (Slide)</option>
                                <option value="zoom">জেন্টল জুম (Ken Burns Zoom)</option>
                            </select>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                প্রদর্শন অপশন
                            </label>
                            <div className="flex flex-col gap-2 pt-1">
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.show_arrows}
                                        onChange={(e) => settingsForm.setData('show_arrows', e.target.checked)}
                                        className="rounded border-slate-300 text-gov-600 focus:ring-gov-500 w-4 h-4"
                                    />
                                    <span>নেক্সট/প্রিভিয়াস অ্যারো দেখান</span>
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.show_indicators}
                                        onChange={(e) => settingsForm.setData('show_indicators', e.target.checked)}
                                        className="rounded border-slate-300 text-gov-600 focus:ring-gov-500 w-4 h-4"
                                    />
                                    <span>ডট ইন্ডিকেটর দেখান</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* 2. Slide Cards Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <span>বর্তমান স্লাইডসমূহ</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                                {sliders.length} টি
                            </span>
                        </h2>
                        <span className="text-xs text-slate-500">
                            * ড্রপডাউন বা বাটনে ক্লিক করে ক্রম বা স্ট্যাটাস পরিবর্তন করুন
                        </span>
                    </div>

                    {sliders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="font-bold text-slate-700">কোনো স্লাইড যুক্ত করা হয়নি</h3>
                            <p className="text-xs text-slate-400">
                                হোমপেজে প্রদর্শনের জন্য উপরের "নতুন স্লাইড যোগ করুন" বাটনে ক্লিক করুন।
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sliders.map((slide, idx) => (
                                <div
                                    key={slide.id}
                                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                                        slide.is_active ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20 opacity-75'
                                    }`}
                                >
                                    {/* Thumbnail Preview with Overlay Info */}
                                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                                        <img
                                            src={slide.image_url || slide.image_path}
                                            alt={slide.title_bn}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Order Badge */}
                                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md text-white font-extrabold text-xs flex items-center gap-1 border border-white/20">
                                            <span>ক্রম #{slide.display_order}</span>
                                        </div>

                                        {/* Active/Inactive Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            {slide.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    সক্রিয়
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold">
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    লুকানো
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-5 space-y-2 flex-1">
                                        <h3 className="font-extrabold text-base text-slate-800 line-clamp-1">
                                            {slide.title_bn || 'শিরোনামহীন'}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {slide.subtitle_bn || 'কোনো বিবরণ দেওয়া হয়নি'}
                                        </p>

                                        {slide.button_text_bn && (
                                            <div className="pt-2 text-xs font-semibold text-gov-600 flex items-center gap-1">
                                                <span>বাটন: {slide.button_text_bn}</span>
                                                <span className="text-slate-400">({slide.button_url})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Bar */}
                                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(slide.id)}
                                            className={`inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition ${
                                                slide.is_active
                                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {slide.is_active ? (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    <span>হাইড করুন</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>চালু করুন</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(slide)}
                                                className="p-1.5 rounded-lg text-slate-600 hover:text-gov-600 hover:bg-slate-200/60 transition"
                                                title="সম্পাদনা করুন"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(slide.id, slide.title_bn)}
                                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                                                title="মুছে ফেলুন"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD SLIDE MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-gov-600" />
                                <h3 className="font-extrabold text-lg text-slate-800">
                                    নতুন স্লাইড তৈরি করুন
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSlide} className="space-y-4">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase">
                                    স্লাইডের ছবি নির্বাচন করুন (১৬:৯ রিকমেন্ডেড) *
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-gov-500 transition-colors bg-slate-50 relative overflow-hidden">
                                    {imagePreview ? (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    addForm.setData('image', null);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-navy-950/80 text-white hover:bg-rose-600 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block py-6 space-y-2">
                                            <UploadCloud className="w-10 h-10 text-gov-500 mx-auto" />
                                            <span className="text-sm font-bold text-slate-700 block">
                                                ক্লিক করে ছবি আপলোড করুন
                                            </span>
                                            <span className="text-xs text-slate-400 block">
                                                JPG, PNG, WEBP (সর্বোচ্চ ৮MB)
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'add')}
                                                className="hidden"
                                                required
                                            />
                                        </label>
                                    )}
                                </div>
                                {addForm.errors.image && (
                                    <p className="text-xs text-rose-600 font-semibold">{addForm.errors.image}</p>
                                )}
                            </div>

                            {/* Title & Subtitle */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    শিরোনাম (Title - বাংলা)
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.title_bn}
                                    onChange={(e) => addForm.setData('title_bn', e.target.value)}
                                    placeholder="যেমন: রূপসা সেতু ও গোধূলিবেলার সৌন্দর্য"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    সংক্ষিপ্ত বিবরণ (Subtitle - বাংলা)
                                </label>
                                <textarea
                                    rows="2"
                                    value={addForm.data.subtitle_bn}
                                    onChange={(e) => addForm.setData('subtitle_bn', e.target.value)}
                                    placeholder="যেমন: খুলনা নগরীর প্রবেশদ্বার খান জাহান আলী সেতুর নয়নাভিরাম রূপ।"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500"
                                />
                            </div>

                            {/* Button Text & URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        বাটন টেক্সট
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.data.button_text_bn}
                                        onChange={(e) => addForm.setData('button_text_bn', e.target.value)}
                                        placeholder="যেমন: সেবা গ্রহণ করুন"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        বাটন লিংক (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.data.button_url}
                                        onChange={(e) => addForm.setData('button_url', e.target.value)}
                                        placeholder="/services"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        প্রদর্শনের ক্রম (Order)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={addForm.data.display_order}
                                        onChange={(e) => addForm.setData('display_order', Number(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={addForm.data.is_active}
                                            onChange={(e) => addForm.setData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-gov-600 focus:ring-gov-500 w-4 h-4"
                                        />
                                        <span>সরাসরি সক্রিয় রাখুন</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                                >
                                    {addForm.processing ? 'আপলোড হচ্ছে...' : 'স্লাইড যুক্ত করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT SLIDE MODAL */}
            {editingSlide && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-gov-600" />
                                <h3 className="font-extrabold text-lg text-slate-800">
                                    স্লাইড সম্পাদনা করুন
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingSlide(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSlide} className="space-y-4">
                            {/* Image Preview / Replace */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase">
                                    ছবি পরিবর্তন (ঐচ্ছিক)
                                </label>
                                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
                                    {imagePreview && (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <label className="cursor-pointer block text-center py-2 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition">
                                        নতুন ছবি নির্বাচন করুন
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'edit')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Title & Subtitle */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    শিরোনাম (Title - বাংলা)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.title_bn}
                                    onChange={(e) => editForm.setData('title_bn', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700">
                                    সংক্ষিপ্ত বিবরণ (Subtitle - বাংলা)
                                </label>
                                <textarea
                                    rows="2"
                                    value={editForm.data.subtitle_bn}
                                    onChange={(e) => editForm.setData('subtitle_bn', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500"
                                />
                            </div>

                            {/* Button Text & URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        বাটন টেক্সট
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.button_text_bn}
                                        onChange={(e) => editForm.setData('button_text_bn', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        বাটন লিংক (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.button_url}
                                        onChange={(e) => editForm.setData('button_url', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        প্রদর্শনের ক্রম (Order)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editForm.data.display_order}
                                        onChange={(e) => editForm.setData('display_order', Number(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_active}
                                            onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-gov-600 focus:ring-gov-500 w-4 h-4"
                                        />
                                        <span>সক্রিয় রাখুন</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingSlide(null)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                                >
                                    {editForm.processing ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সম্পন্ন করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
