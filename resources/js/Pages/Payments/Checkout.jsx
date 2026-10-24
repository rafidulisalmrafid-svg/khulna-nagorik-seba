import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    CreditCard,
    Shield,
    Receipt,
    CheckCircle2,
    Building2,
    Lock,
    ArrowRight,
    AlertCircle,
    ChevronLeft,
} from 'lucide-react';

export default function PaymentCheckout({ application }) {
    const [selectedMethod, setSelectedMethod] = useState('bkash');
    const [accountNumber, setAccountNumber] = useState('01812345678');

    const { data, setData, post, processing } = useForm({
        application_id: application.id,
        payment_method: 'bkash',
        sender_account: '01812345678',
    });

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setData('payment_method', method);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        post('/payments/process');
    };

    const paymentMethods = [
        {
            id: 'bkash',
            name: 'বিকাশ (bKash)',
            desc: 'তাৎক্ষণিক মোবাইল ব্যাংকিং',
            badge: 'জনপ্রিয়',
            color: 'from-pink-600 to-rose-600',
        },
        {
            id: 'nagad',
            name: 'নগদ (Nagad)',
            desc: 'পোস্টাল ডিজিটাল ব্যাংকিং',
            badge: 'কম চার্জ',
            color: 'from-orange-500 to-amber-600',
        },
        {
            id: 'rocket',
            name: 'রকেট (Rocket DBBL)',
            desc: 'ডাচ-বাংলা ব্যাংক মোবাইল ব্যাংকিং',
            badge: null,
            color: 'from-purple-600 to-indigo-600',
        },
        {
            id: 'card',
            name: 'ভিসা / মাস্টারকার্ড',
            desc: 'যেকোনো ব্যাংকের ডেবিট/ক্রেডিট কার্ড',
            badge: 'আন্তর্জাতিক',
            color: 'from-blue-600 to-gov-700',
        },
        {
            id: 'bank',
            name: 'সোনালী ব্যাংক / ই-চালান',
            desc: 'সরকারি ট্রেজারি চালানের সরাসরি হিসাব',
            badge: 'সরকারি চালান',
            color: 'from-emerald-700 to-teal-800',
        },
    ];

    return (
        <MainLayout>
            <Head title={`সরকারি ফি পরিশোধ: ${application.tracking_id} - খুলনা সেবা`} />

            {/* Back bar */}
            <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        href={`/applications/view/${application.tracking_id}`}
                        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-600 hover:text-gov-700 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>আবেদনে ফিরে যান</span>
                    </Link>
                    <span className="text-xs text-slate-500 font-mono">
                        আবেদন নম্বর: {application.tracking_id}
                    </span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Sandbox / Integration Status Notice */}
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                        <span className="font-bold">স্যান্ডবক্স ও গেটওয়ে সিমুলেশন মোড:</span>
                        <p className="text-slate-600 mt-0.5">
                            এই মডিউলে নিরাপদ সরকারি পেমেন্ট গেটওয়ের সম্পূর্ণ রিয়েল-ওয়ার্ল্ড ওয়ার্কফ্লো ইন্টিগ্রেট করা হয়েছে। ডেমো ভেরিফিকেশনের মাধ্যমে আপনার ট্রানজ্যাকশন আইডি ও সরকারি মানি রসিদ স্বয়ংক্রিয়ভাবে জেনারেট হবে।
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left 2 Cols: Payment Methods */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-800">
                                    পেমেন্ট মাধ্যম নির্বাচন করুন
                                </h2>
                                <p className="text-xs text-slate-500">
                                    আপনার সুবিধাজনক অনলাইন পেমেন্ট চ্যানেল সিলেক্ট করুন
                                </p>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((pm) => {
                                    const isSelected = selectedMethod === pm.id;
                                    return (
                                        <div
                                            key={pm.id}
                                            onClick={() => handleMethodSelect(pm.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                                isSelected
                                                    ? 'border-gov-600 bg-gov-50/60 shadow-xs'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${pm.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <span>{pm.name}</span>
                                                        {pm.badge && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                                {pm.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{pm.desc}</div>
                                                </div>
                                            </div>

                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                isSelected ? 'border-gov-600 bg-gov-600 text-white' : 'border-slate-300'
                                            }`}>
                                                {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Simulated Account Input */}
                            <form onSubmit={handlePaymentSubmit} className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        মোবাইল ব্যাংকিং / কার্ড নম্বর
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={accountNumber}
                                        onChange={(e) => {
                                            setAccountNumber(e.target.value);
                                            setData('sender_account', e.target.value);
                                        }}
                                        placeholder="০১৮১২-৩৪৫৬৭৮"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                    <span>২৫৬-বিট এসএসএল (SSL) এনক্রিপ্টেড ও ব্যাংক অনুমোদিত</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 px-6 rounded-2xl bg-gov-600 hover:bg-gov-700 text-white font-extrabold text-base shadow-lg shadow-gov-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span>৳{Math.round(application.fee_amount)} টাকা নিশ্চিত করুন</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right 1 Col: Fee Breakdown Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-gov-600" />
                                <span>পেমেন্ট বিবরণী</span>
                            </h3>

                            <div className="space-y-3 text-xs md:text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>সেবার নাম:</span>
                                    <span className="font-bold text-slate-800 text-right">{application.service?.name_bn}</span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>আবেদনকারী:</span>
                                    <span className="font-bold text-slate-800">{application.applicant_name}</span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>মূল সরকারি ফি:</span>
                                    <span className="font-bold text-slate-800">৳{Math.round(application.fee_amount)}</span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>অনলাইন সার্ভিস চার্জ:</span>
                                    <span className="font-bold text-emerald-600">৳০ (বিনামূল্যে)</span>
                                </div>

                                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-base font-black text-navy-950">
                                    <span>সর্বমোট প্রদেয়:</span>
                                    <span className="text-xl text-gov-700 font-mono">৳{Math.round(application.fee_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Box */}
                        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 text-xs text-slate-600 space-y-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                নিরাপদ সরকারি ট্রানজ্যাকশন
                            </div>
                            <p className="leading-relaxed">
                                পেমেন্ট সম্পন্ন হওয়া মাত্রই স্বয়ংক্রিয়ভাবে সরকারি কিউআর কোডযুক্ত রসিদ তৈরি হবে যা আপনি সংরক্ষণ করতে পারবেন।
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}