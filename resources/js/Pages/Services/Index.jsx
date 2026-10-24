import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ServiceCard from '@/Components/ServiceCard';
import AuthNoticeBanner from '@/Components/AuthNoticeBanner';
import { Search, Filter, Layers, Building2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ServicesIndex({ services = [], categories = [], departments = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || '');

    const handleFilterChange = (catSlug, deptId, searchTerm) => {
        router.get('/services', {
            category: catSlug !== undefined ? catSlug : selectedCategory,
            department: deptId !== undefined ? deptId : selectedDepartment,
            search: searchTerm !== undefined ? searchTerm : search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedDepartment('');
        router.get('/services', {}, { replace: true });
    };

    return (
        <MainLayout>
            <Head title="সকল নাগরিক সেবা ডিরেক্টরি - খুলনা সেবা" />

            {/* Header banner */}
            <div className="bg-gradient-to-r from-navy-950 via-gov-900 to-gov-800 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-300">
                        <Layers className="w-3.5 h-3.5" />
                        নাগরিক সেবা ক্যাটালগ
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        খুলনা সিটি কর্পোরেশন নাগরিক সেবা ডিরেক্টরি
                    </h1>
                    <p className="text-slate-300 text-sm max-w-2xl">
                        ট্রেড লাইসেন্স, পৌরকর, নাগরিক সনদ, সড়ক ও অবকাঠামো সংস্কারসহ সিটি কর্পোরেশনের সকল অনলাইন সেবা এক নজরে দেখে আবেদন করুন।
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange(undefined, undefined, e.target.value);
                            }}
                            placeholder="সেবার নাম দিয়ে খুঁজুন..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600 focus:border-gov-600"
                        />
                    </div>

                    {/* Department Dropdown */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                handleFilterChange(undefined, e.target.value, undefined);
                            }}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-gov-600"
                        >
                            <option value="">সকল বিভাগ (All Departments)</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name_bn}
                                </option>
                            ))}
                        </select>

                        {(selectedCategory || selectedDepartment || search) && (
                            <button
                                onClick={handleReset}
                                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                ফিল্টার মুছুন
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar">
                    <button
                        onClick={() => {
                            setSelectedCategory('');
                            handleFilterChange('', undefined, undefined);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold shrink-0 transition-all ${
                            !selectedCategory
                                ? 'bg-gov-600 text-white shadow-md shadow-gov-600/20'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        সব সেবা ({services.length})
                    </button>

                    {categories.map((c) => {
                        const isSelected = selectedCategory === c.slug;
                        return (
                            <button
                                key={c.id}
                                onClick={() => {
                                    const next = isSelected ? '' : c.slug;
                                    setSelectedCategory(next);
                                    handleFilterChange(next, undefined, undefined);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold shrink-0 transition-all ${
                                    isSelected
                                        ? 'bg-gov-600 text-white shadow-md shadow-gov-600/20'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {c.name_bn}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Service Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <AuthNoticeBanner />
                {services.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">কোনো সেবা খুঁজে পাওয়া যায়নি</h3>
                        <p className="text-sm text-slate-500">
                            আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সেবা নেই। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
                        </p>
                        <button
                            onClick={handleReset}
                            className="px-5 py-2.5 rounded-xl bg-gov-600 text-white font-bold text-sm shadow-md"
                        >
                            সকল সেবা দেখুন
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}