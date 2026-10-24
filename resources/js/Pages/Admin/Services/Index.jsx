import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Layers,
    Shield,
    ArrowRight,
    Plus,
    ToggleLeft,
    ToggleRight,
    CheckCircle2,
    X,
    FileText,
    ExternalLink,
    Building2,
    Edit3,
    Trash2,
    Settings,
    FileUp,
    ListPlus,
    Check,
    AlertCircle,
    Sliders,
    Sparkles,
} from 'lucide-react';

const DEFAULT_BASIC_FIELDS = {
    applicant_name: { enabled: true, required: true, label_bn: 'আবেদনকারীর পূর্ণ নাম' },
    applicant_phone: { enabled: true, required: true, label_bn: 'মোবাইল নম্বর' },
    applicant_email: { enabled: true, required: false, label_bn: 'ইমেইল ঠিকানা' },
    applicant_nid: { enabled: true, required: true, label_bn: 'জাতীয় পরিচয়পত্র (NID) নম্বর' },
    gender: { enabled: true, required: true, label_bn: 'লিঙ্গ নির্বাচন' },
    marital_status: { enabled: true, required: true, label_bn: 'বৈবাহিক অবস্থা' },
    father_or_husband_name: { enabled: true, required: true, label_bn: 'পিতার নাম' },
    mother_name: { enabled: true, required: true, label_bn: 'মাতার নাম' },
    husband_name: { enabled: true, required: false, label_bn: 'স্বামীর নাম (প্রযোজ্য ক্ষেত্রে)' },
    ward_no: { enabled: true, required: true, label_bn: 'ওয়ার্ড নম্বর' },
    holding_no: { enabled: true, required: false, label_bn: 'হোল্ডিং নম্বর' },
    present_address: { enabled: true, required: true, label_bn: 'বর্তমান ঠিকানা' },
    permanent_address: { enabled: true, required: false, label_bn: 'স্থায়ী ঠিকানা' },
};

const DEFAULT_DOCUMENTS = [
    {
        id: 'applicant_photo',
        title_bn: 'আবেদনকারীর পাসপোর্ট সাইজ ছবি (রঙিন)',
        description_bn: 'স্পষ্ট রঙিন ছবি, সর্বোচ্চ ১৫ মেগাবাইট',
        allowed_types: ['jpg', 'png', 'webp'],
        required: true,
    },
    {
        id: 'applicant_nid_file',
        title_bn: 'জাতীয় পরিচয়পত্র (NID) কপি বা অনলাইন কপি',
        description_bn: 'পিডিএফ বা স্পষ্ট ছবি',
        allowed_types: ['pdf', 'jpg', 'png', 'webp'],
        required: true,
    },
];

export default function AdminServicesIndex({
    services = [],
    categories = [],
    departments = [],
    isSuperAdmin = false,
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'fields' | 'documents'

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        name_bn: '',
        service_category_id: categories[0]?.id || '',
        department_id: departments[0]?.id || '',
        short_description_bn: '',
        description_bn: '',
        eligibility_bn: '',
        fee_amount: 0,
        estimated_days: 7,
        authority_type: 'city_corporation',
        external_authority_name_bn: '',
        external_url: '',
        form_fields: {
            basic_fields: { ...DEFAULT_BASIC_FIELDS },
            custom_fields: [],
        },
        required_documents_bn: [...DEFAULT_DOCUMENTS],
    });

    // Open Modal for New Service
    const handleOpenCreate = () => {
        setEditingService(null);
        setActiveTab('basic');
        setData({
            name: '',
            name_bn: '',
            service_category_id: categories[0]?.id || '',
            department_id: departments[0]?.id || '',
            short_description_bn: '',
            description_bn: '',
            eligibility_bn: '',
            fee_amount: 0,
            estimated_days: 7,
            authority_type: 'city_corporation',
            external_authority_name_bn: '',
            external_url: '',
            form_fields: {
                basic_fields: JSON.parse(JSON.stringify(DEFAULT_BASIC_FIELDS)),
                custom_fields: [],
            },
            required_documents_bn: JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)),
        });
        setModalOpen(true);
    };

    // Open Modal for Editing Existing Service
    const handleOpenEdit = (srv) => {
        setEditingService(srv);
        setActiveTab('basic');

        let basicFields = JSON.parse(JSON.stringify(DEFAULT_BASIC_FIELDS));
        let customFields = [];

        if (srv.form_fields) {
            if (srv.form_fields.basic_fields) {
                basicFields = { ...basicFields, ...srv.form_fields.basic_fields };
            }
            if (Array.isArray(srv.form_fields.custom_fields)) {
                customFields = srv.form_fields.custom_fields;
            } else if (Array.isArray(srv.form_fields)) {
                customFields = srv.form_fields.map((f, idx) => ({
                    id: f.name || `field_${idx}`,
                    label_bn: f.label_bn || f.name,
                    type: f.type || 'text',
                    options: Array.isArray(f.options) ? f.options.join(', ') : '',
                    required: !!f.required,
                }));
            }
        }

        let docs = [];
        if (Array.isArray(srv.required_documents_bn) && srv.required_documents_bn.length > 0) {
            const first = srv.required_documents_bn[0];
            if (typeof first === 'object' && first !== null && first.id) {
                docs = srv.required_documents_bn;
            } else {
                docs = srv.required_documents_bn.map((item, idx) => ({
                    id: `doc_${idx + 1}`,
                    title_bn: typeof item === 'string' ? item : `প্রয়োজনীয় নথি ${idx + 1}`,
                    description_bn: 'পিডিএফ বা স্পষ্ট ছবি (সর্বোচ্চ ১৫ মেগাবাইট)',
                    allowed_types: ['pdf', 'jpg', 'png', 'webp'],
                    required: true,
                }));
            }
        } else {
            docs = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
        }

        setData({
            name: srv.name || '',
            name_bn: srv.name_bn || '',
            service_category_id: srv.service_category_id || categories[0]?.id || '',
            department_id: srv.department_id || '',
            short_description_bn: srv.short_description_bn || '',
            description_bn: srv.description_bn || '',
            eligibility_bn: srv.eligibility_bn || '',
            fee_amount: srv.fee_amount || 0,
            estimated_days: srv.estimated_days || 7,
            authority_type: srv.authority_type || 'city_corporation',
            external_authority_name_bn: srv.external_authority_name_bn || '',
            external_url: srv.external_url || '',
            form_fields: {
                basic_fields: basicFields,
                custom_fields: customFields,
            },
            required_documents_bn: docs,
        });

        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingService) {
            post(`/admin/services/${editingService.id}/update`, {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/services', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleToggle = (id) => {
        router.post(`/admin/services/${id}/toggle`);
    };

    const toggleBasicFieldEnabled = (fieldKey) => {
        const cur = data.form_fields.basic_fields[fieldKey] || { enabled: true, required: true };
        setData('form_fields', {
            ...data.form_fields,
            basic_fields: {
                ...data.form_fields.basic_fields,
                [fieldKey]: {
                    ...cur,
                    enabled: !cur.enabled,
                },
            },
        });
    };

    const toggleBasicFieldRequired = (fieldKey, isReq) => {
        const cur = data.form_fields.basic_fields[fieldKey] || { enabled: true, required: true };
        setData('form_fields', {
            ...data.form_fields,
            basic_fields: {
                ...data.form_fields.basic_fields,
                [fieldKey]: {
                    ...cur,
                    required: isReq,
                },
            },
        });
    };

    const addCustomField = () => {
        const newId = `field_${Date.now()}`;
        const newField = {
            id: newId,
            label_bn: 'নতুন তথ্যের শিরোনাম',
            type: 'text',
            options: '',
            required: true,
            placeholder_bn: '',
        };
        setData('form_fields', {
            ...data.form_fields,
            custom_fields: [...(data.form_fields.custom_fields || []), newField],
        });
    };

    const updateCustomField = (index, key, val) => {
        const updated = [...(data.form_fields.custom_fields || [])];
        updated[index] = { ...updated[index], [key]: val };
        setData('form_fields', {
            ...data.form_fields,
            custom_fields: updated,
        });
    };

    const removeCustomField = (index) => {
        const updated = [...(data.form_fields.custom_fields || [])];
        updated.splice(index, 1);
        setData('form_fields', {
            ...data.form_fields,
            custom_fields: updated,
        });
    };

    const addDocument = (preset = null) => {
        const newDoc = preset || {
            id: `doc_${Date.now()}`,
            title_bn: 'নতুন প্রয়োজনীয় নথি/ডকুমেন্ট',
            description_bn: 'পিডিএফ বা স্পষ্ট ছবি (সর্বোচ্চ ১৫ মেগাবাইট)',
            allowed_types: ['pdf', 'jpg', 'png', 'webp'],
            required: true,
        };
        setData('required_documents_bn', [...data.required_documents_bn, newDoc]);
    };

    const updateDocument = (index, key, val) => {
        const updated = [...data.required_documents_bn];
        updated[index] = { ...updated[index], [key]: val };
        setData('required_documents_bn', updated);
    };

    const toggleDocFormat = (index, format) => {
        const doc = data.required_documents_bn[index];
        const currentTypes = doc.allowed_types || ['pdf', 'jpg', 'png'];
        let nextTypes;
        if (currentTypes.includes(format)) {
            nextTypes = currentTypes.filter((t) => t !== format);
            if (nextTypes.length === 0) nextTypes = [format];
        } else {
            nextTypes = [...currentTypes, format];
        }
        updateDocument(index, 'allowed_types', nextTypes);
    };

    const removeDocument = (index) => {
        const updated = [...data.required_documents_bn];
        updated.splice(index, 1);
        setData('required_documents_bn', updated);
    };

    return (
        <AdminLayout>
            <Head title="ডায়নামিক সেবা ও ফর্ম বিল্ডার - খুলনা সেবা অ্যাডমিন" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-gov-600 text-white shadow-sm">
                                <Sliders className="w-5 h-5" />
                            </span>
                            <h1 className="text-2xl font-extrabold text-navy-950">
                                {isSuperAdmin ? 'ডায়নামিক সেবা ও ফর্ম কনফিগারেটর' : 'আমার দায়িত্বপ্রাপ্ত সেবাসমূহ ও নির্দেশিকা'}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {isSuperAdmin
                                ? 'কোনো কোড পরিবর্তন ছাড়া এডমিন ইচ্ছামতো নতুন সেবা তৈরি, নাগরিকের প্রয়োজনীয় তথ্য ফিল্ড এবং ডকুমেন্ট রুলস (বাধ্যতামূলক/ঐচ্ছিক) নির্ধারণ করতে পারেন।'
                                : 'আপনার দায়িত্বপ্রাপ্ত সেবাসমূহের সরকারি ফি, প্রক্রিয়াকরণ সময়, প্রয়োজনীয় তথ্যের তালিকা ও নির্দেশিকা।'}
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <button
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>নতুন সেবা ও ফর্ম তৈরি করুন</span>
                        </button>
                    )}
                </div>

                {/* Services Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                                <tr>
                                    <th className="py-3.5 px-4">সেবার নাম ও আইডি</th>
                                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                                    <th className="py-3.5 px-4">বিভাগ</th>
                                    <th className="py-3.5 px-4">সরকারি ফি</th>
                                    <th className="py-3.5 px-4">প্রক্রিয়াকরণ সময়</th>
                                    <th className="py-3.5 px-4">আবেদন সংখ্যা</th>
                                    <th className="py-3.5 px-4">ফর্ম ফিল্ড ও নথি</th>
                                    <th className="py-3.5 px-4">স্থিতি</th>
                                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.map((srv) => {
                                    const customCount = Array.isArray(srv.form_fields?.custom_fields)
                                        ? srv.form_fields.custom_fields.length
                                        : (Array.isArray(srv.form_fields) ? srv.form_fields.length : 0);
                                    const docCount = Array.isArray(srv.required_documents_bn)
                                        ? srv.required_documents_bn.length
                                        : 0;

                                    return (
                                        <tr key={srv.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-800 text-sm">{srv.name_bn}</div>
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                    <span>slug: {srv.slug}</span>
                                                    {srv.authority_type === 'external_gov_link' && (
                                                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                            বহিরাগত
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-700">
                                                {srv.category?.name_bn || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {srv.department?.name_bn || 'সাধারণ'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                                                {srv.fee_amount > 0 ? `৳${srv.fee_amount}` : <span className="text-emerald-600">বিনামূল্যে</span>}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {srv.estimated_days} কার্যদিবস
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gov-800 font-mono">
                                                {srv.applications_count || 0}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                        ফিল্ড: {customCount > 0 ? `${customCount} কাস্টম` : 'স্ট্যান্ডার্ড'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                                                        ডকুমেন্ট: {docCount}টি
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                        srv.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {srv.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => handleOpenEdit(srv)}
                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gov-50 text-gov-700 hover:bg-gov-100 border border-gov-200 transition flex items-center gap-1 cursor-pointer"
                                                            title="ফর্ম ও সেবা কনফিগার করুন"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                            <span>কনফিগার ও সম্পাদনা</span>
                                                        </button>
                                                    )}

                                                    {isSuperAdmin ? (
                                                        <button
                                                            onClick={() => handleToggle(srv.id)}
                                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                                                srv.is_active
                                                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                            }`}
                                                        >
                                                            {srv.is_active ? 'বন্ধ করুন' : 'চালু করুন'}
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={`/admin/applications?service_id=${srv.id}`}
                                                            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-gov-50 text-gov-700 hover:bg-gov-100 transition inline-flex items-center gap-1"
                                                        >
                                                            <span>আবেদন দেখুন</span>
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Service & Dynamic Form Builder Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-2xl bg-gov-700 text-white shadow-md">
                                    <Sliders className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
                                        <span>{editingService ? `সেবা ও ফর্ম সম্পাদনা: ${editingService.name_bn}` : 'নতুন নাগরিক সেবা ও ফর্ম তৈরি'}</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        কোন তথ্য বাধ্যতামূলক বা ঐচ্ছিক হবে এবং কোন কোন ডকুমেন্ট নাগরিককে দিতে হবে, তা এখান থেকে নির্ধারণ করুন।
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Tabs Navigation */}
                        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('basic')}
                                className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'basic'
                                        ? 'border-gov-600 text-gov-700 bg-gov-50/50 rounded-t-xl'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                <span>১. মৌলিক তথ্য ও ফি</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('fields')}
                                className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'fields'
                                        ? 'border-gov-600 text-gov-700 bg-gov-50/50 rounded-t-xl'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <ListPlus className="w-4 h-4" />
                                <span>২. নাগরিকের তথ্য ফিল্ড কনফিগারেশন</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gov-100 text-gov-800 font-bold">
                                    {(data.form_fields?.custom_fields?.length || 0) + 13}টি
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('documents')}
                                className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'documents'
                                        ? 'border-gov-600 text-gov-700 bg-gov-50/50 rounded-t-xl'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <FileUp className="w-4 h-4" />
                                <span>৩. প্রয়োজনীয় ডকুমেন্ট রুলস</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                                    {data.required_documents_bn.length}টি
                                </span>
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                            {/* TAB 1: BASIC INFO */}
                            {activeTab === 'basic' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">সেবার নাম (বাংলায়) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name_bn}
                                                onChange={(e) => setData('name_bn', e.target.value)}
                                                placeholder="যেমন: নাগরিকত্ব ও চারিত্রিক সনদপত্র"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-gov-500 focus:ring-1 focus:ring-gov-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">নাম (ইংরেজিতে) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. Citizen & Character Certificate"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-gov-500 focus:ring-1 focus:ring-gov-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">ক্যাটাগরি *</label>
                                            <select
                                                value={data.service_category_id}
                                                onChange={(e) => setData('service_category_id', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                                            >
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name_bn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">দায়িত্বপ্রাপ্ত বিভাগ</label>
                                            <select
                                                value={data.department_id}
                                                onChange={(e) => setData('department_id', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                                            >
                                                <option value="">নির্বাচন করুন (সাধারণ)</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name_bn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">সরকারি ফি (টাকা) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={data.fee_amount}
                                                onChange={(e) => setData('fee_amount', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">আনুমানিক সময় (কার্যদিবস) *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={data.estimated_days}
                                                onChange={(e) => setData('estimated_days', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">সংক্ষিপ্ত বিবরণ (১ লাইনে) *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.short_description_bn}
                                            onChange={(e) => setData('short_description_bn', e.target.value)}
                                            placeholder="সেবার সংক্ষিপ্ত সারসংক্ষেপ যা হোমপেজ বা কার্ডে প্রদর্শিত হবে..."
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">বিস্তারিত বিবরণ ও নিয়মাবলী</label>
                                        <textarea
                                            rows={3}
                                            value={data.description_bn}
                                            onChange={(e) => setData('description_bn', e.target.value)}
                                            placeholder="সেবার উদ্দেশ্য, সরকারি নিয়ম ও নির্দেশনা..."
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">আবেদনের যোগ্যতা ও শর্ত</label>
                                        <textarea
                                            rows={2}
                                            value={data.eligibility_bn}
                                            onChange={(e) => setData('eligibility_bn', e.target.value)}
                                            placeholder="যেমন: খুলনা সিটি কর্পোরেশনের যে কোনো ওয়ার্ডের স্থায়ী বা বর্তমান বাসিন্দা..."
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">কর্তৃপক্ষ ধরন</label>
                                            <select
                                                value={data.authority_type}
                                                onChange={(e) => setData('authority_type', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                                            >
                                                <option value="city_corporation">খুলনা সিটি কর্পোরেশন নিজস্ব সেবা</option>
                                                <option value="external_gov_link">বহিরাগত কেন্দ্রীয় সরকারি পোর্টাল</option>
                                            </select>
                                        </div>

                                        {data.authority_type === 'external_gov_link' && (
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-700">বহিরাগত পোর্টাল লিংক (URL)</label>
                                                <input
                                                    type="url"
                                                    value={data.external_url}
                                                    onChange={(e) => setData('external_url', e.target.value)}
                                                    placeholder="https://bdris.gov.bd"
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CITIZEN FORM FIELDS CONFIGURATION */}
                            {activeTab === 'fields' && (
                                <div className="space-y-6">
                                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sky-900 flex items-start gap-3">
                                        <Sliders className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-extrabold text-sky-950 block">নাগরিকের তথ্য ফিল্ড কনফিগারেটর:</span>
                                            <span>
                                                এই সেবার জন্য নাগরিকদের কোন কোন তথ্য দিতে হবে তা টিক চিহ্ন দিয়ে অন্তর্ভুক্ত করুন এবং প্রতিটি তথ্য
                                                <strong> বাধ্যতামূলক (Required)</strong> নাকি <strong>ঐচ্ছিক (Optional)</strong> হবে তা নির্ধারণ করুন।
                                            </span>
                                        </div>
                                    </div>

                                    {/* SECTION A: Standard Citizen Personal Fields */}
                                    <div className="space-y-3">
                                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center justify-between border-b border-slate-200 pb-2">
                                            <span>ক. সাধারণ নাগরিক তথ্য ফিল্ডসমূহ (Standard Personal Info)</span>
                                            <span className="text-[11px] text-slate-500 font-normal">টগল করে বাধ্যতামূলক/ঐচ্ছিক নির্ধারণ করুন</span>
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {Object.entries(DEFAULT_BASIC_FIELDS).map(([key, meta]) => {
                                                const currentConfig = data.form_fields?.basic_fields?.[key] || {
                                                    enabled: true,
                                                    required: meta.required,
                                                };
                                                const isEnabled = currentConfig.enabled !== false;
                                                const isReq = !!currentConfig.required;

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                                                            isEnabled
                                                                ? 'bg-white border-slate-200 shadow-2xs'
                                                                : 'bg-slate-50/70 border-slate-100 opacity-60'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 truncate">
                                                            <input
                                                                type="checkbox"
                                                                id={`bf_${key}`}
                                                                checked={isEnabled}
                                                                onChange={() => toggleBasicFieldEnabled(key)}
                                                                className="rounded border-slate-300 text-gov-600 focus:ring-gov-500 cursor-pointer"
                                                            />
                                                            <label
                                                                htmlFor={`bf_${key}`}
                                                                className="font-bold text-slate-800 truncate cursor-pointer select-none"
                                                            >
                                                                {meta.label_bn}
                                                            </label>
                                                        </div>

                                                        {isEnabled && (
                                                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleBasicFieldRequired(key, true)}
                                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                                                        isReq
                                                                            ? 'bg-rose-600 text-white shadow-2xs'
                                                                            : 'text-slate-600 hover:text-slate-900'
                                                                    }`}
                                                                >
                                                                    বাধ্যতামূলক *
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleBasicFieldRequired(key, false)}
                                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                                                        !isReq
                                                                            ? 'bg-slate-700 text-white shadow-2xs'
                                                                            : 'text-slate-600 hover:text-slate-900'
                                                                    }`}
                                                                >
                                                                    ঐচ্ছিক
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* SECTION B: Custom Service-Specific Fields */}
                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-extrabold text-slate-800 text-sm">
                                                    খ. সেবাভিত্তিক অতিরিক্ত কাস্টম ফিল্ড (Service Custom Fields)
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    এই সেবার জন্য বিশেষ কোনো অতিরিক্ত তথ্য নিতে চাইলে নিচে ফিল্ড যুক্ত করুন (যেমন: ব্যবসার আয়তন, সনদ গ্রহণের কারণ ইত্যাদি)।
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addCustomField}
                                                className="px-3 py-1.5 rounded-xl bg-gov-50 text-gov-700 hover:bg-gov-100 border border-gov-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>নতুন ফিল্ড যোগ করুন</span>
                                            </button>
                                        </div>

                                        {(!data.form_fields?.custom_fields || data.form_fields.custom_fields.length === 0) ? (
                                            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400">
                                                কোনো অতিরিক্ত কাস্টম ফিল্ড যুক্ত করা হয়নি। প্রয়োজন হলে উপরের "নতুন ফিল্ড যোগ করুন" বাটনে ক্লিক করুন।
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {data.form_fields.custom_fields.map((cf, idx) => (
                                                    <div
                                                        key={cf.id || idx}
                                                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 shadow-2xs"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-full bg-gov-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="font-extrabold text-slate-800">
                                                                    কাস্টম ফিল্ড #{idx + 1}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateCustomField(idx, 'required', true)}
                                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                                                            cf.required
                                                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                                                : 'text-slate-600'
                                                                        }`}
                                                                    >
                                                                        বাধ্যতামূলক *
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateCustomField(idx, 'required', false)}
                                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                                                            !cf.required
                                                                                ? 'bg-slate-700 text-white shadow-2xs'
                                                                                : 'text-slate-600'
                                                                        }`}
                                                                    >
                                                                        ঐচ্ছিক
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCustomField(idx)}
                                                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                                                                    title="ফিল্ডটি মুছে ফেলুন"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="font-bold text-slate-700">ফিল্ডের শিরোনাম (বাংলায়) *</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={cf.label_bn}
                                                                    onChange={(e) => updateCustomField(idx, 'label_bn', e.target.value)}
                                                                    placeholder="যেমন: সনদের উদ্দেশ্য"
                                                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="font-bold text-slate-700">ফিল্ড আইডি (ইংরেজি) *</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={cf.id}
                                                                    onChange={(e) => updateCustomField(idx, 'id', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                                                    placeholder="e.g. certificate_purpose"
                                                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="font-bold text-slate-700">ইনপুট টাইপ *</label>
                                                                <select
                                                                    value={cf.type}
                                                                    onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                                                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                                                                >
                                                                    <option value="text">টেক্সট (এক লাইনের লেখা)</option>
                                                                    <option value="number">সংখ্যা (Number)</option>
                                                                    <option value="date">তারিখ (Date Picker)</option>
                                                                    <option value="select">ড্রপডাউন নির্বাচন (Select)</option>
                                                                    <option value="textarea">বড় বিবরণ (Textarea)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {cf.type === 'select' && (
                                                            <div className="space-y-1">
                                                                <label className="font-bold text-slate-700">
                                                                    ড্রপডাউন অপশনসমূহ (কমা দিয়ে আলাদা করুন) *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={cf.options}
                                                                    onChange={(e) => updateCustomField(idx, 'options', e.target.value)}
                                                                    placeholder="যেমন: পাসপোর্ট এর জন্য, চাকরির জন্য, ব্যাংক একাউন্ট, অন্যান্য"
                                                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: REQUIRED DOCUMENTS CONFIGURATION */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <FileUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-extrabold text-emerald-950 block">প্রয়োজনীয় ডকুমেন্ট কনফিগারেটর:</span>
                                                <span>
                                                    নাগরিককে কোন কোন ডকুমেন্ট আপলোড করতে হবে এবং কোনটি <strong>বাধ্যতামূলক</strong> আর কোনটি <strong>ঐচ্ছিক</strong>—তা এখান থেকে নিয়ন্ত্রণ করুন।
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => addDocument()}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>নতুন ডকুমেন্ট যোগ করুন</span>
                                        </button>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-slate-500 font-bold text-[11px]">কুইক প্রিসেট যোগ করুন:</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addDocument({
                                                    id: `tax_receipt_${Date.now()}`,
                                                    title_bn: 'হোল্ডিং ট্যাক্স ও পৌরকর পরিশোধের রশিদ',
                                                    description_bn: 'সাম্প্রতিক পরিশোধিত রশিদ',
                                                    allowed_types: ['pdf', 'jpg', 'png'],
                                                    required: false,
                                                })
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>ট্যাক্স রশিদ</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addDocument({
                                                    id: `recommendation_${Date.now()}`,
                                                    title_bn: 'স্থানীয় কাউন্সিলর বা জনপ্রতিনিধির প্রত্যয়নপত্র',
                                                    description_bn: 'সংশ্লিষ্ট ওয়ার্ড কাউন্সিলর কর্তৃক প্রদত্ত',
                                                    allowed_types: ['pdf', 'jpg', 'png'],
                                                    required: true,
                                                })
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>কাউন্সিলর প্রত্যয়নপত্র</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addDocument({
                                                    id: `rent_deed_${Date.now()}`,
                                                    title_bn: 'দোকান/অফিসের ভাড়ার চুক্তিপত্র বা মালিকানা দলিল',
                                                    description_bn: 'নন-জুডিশিয়াল স্ট্যাম্পে চুক্তিপত্র',
                                                    allowed_types: ['pdf', 'jpg', 'png'],
                                                    required: true,
                                                })
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>ভাড়া চুক্তিপত্র</span>
                                        </button>
                                    </div>

                                    {/* Document List */}
                                    <div className="space-y-3">
                                        {data.required_documents_bn.map((doc, idx) => (
                                            <div
                                                key={doc.id || idx}
                                                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="font-extrabold text-slate-800">
                                                            ডকুমেন্ট #{idx + 1}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateDocument(idx, 'required', true)}
                                                                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                                                    doc.required
                                                                        ? 'bg-rose-600 text-white shadow-2xs'
                                                                        : 'text-slate-600'
                                                                }`}
                                                            >
                                                                বাধ্যতামূলক *
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateDocument(idx, 'required', false)}
                                                                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                                                                    !doc.required
                                                                        ? 'bg-slate-700 text-white shadow-2xs'
                                                                        : 'text-slate-600'
                                                                }`}
                                                            >
                                                                ঐচ্ছিক
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocument(idx)}
                                                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                                                            title="ডকুমেন্টটি বাদ দিন"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="font-bold text-slate-700">ডকুমেন্টের নাম (বাংলায়) *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={doc.title_bn}
                                                            onChange={(e) => updateDocument(idx, 'title_bn', e.target.value)}
                                                            placeholder="যেমন: জাতীয় পরিচয়পত্র (NID) কপি"
                                                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="font-bold text-slate-700">নির্দেশনা বা বর্ণনা (নাগরিকের সুবিধার জন্য)</label>
                                                        <input
                                                            type="text"
                                                            value={doc.description_bn || ''}
                                                            onChange={(e) => updateDocument(idx, 'description_bn', e.target.value)}
                                                            placeholder="যেমন: স্পষ্ট রঙিন কপি, সর্বোচ্চ ১৫ মেগাবাইট"
                                                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-600 text-[11px]">গ্রহণযোগ্য ফাইল ফরম্যাট:</span>
                                                        {['pdf', 'jpg', 'png', 'webp'].map((fmt) => {
                                                            const isChecked = (doc.allowed_types || []).includes(fmt);
                                                            return (
                                                                <button
                                                                    key={fmt}
                                                                    type="button"
                                                                    onClick={() => toggleDocFormat(idx, fmt)}
                                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition border cursor-pointer ${
                                                                        isChecked
                                                                            ? 'bg-gov-50 text-gov-800 border-gov-300'
                                                                            : 'bg-white text-slate-400 border-slate-200'
                                                                    }`}
                                                                >
                                                                    {fmt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        আইডি: {doc.id}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Buttons */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-gov-600" />
                                    <span>সংরক্ষণ করার সাথে সাথে পোর্টালের নাগরিক ফর্মে পরিবর্তন কার্যকর হবে।</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>
                                            {processing
                                                ? 'সংরক্ষণ হচ্ছে...'
                                                : (editingService ? 'কনফিগারেশন হালনাগাদ করুন' : 'সেবা ও ফর্ম প্রকাশ করুন')}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
