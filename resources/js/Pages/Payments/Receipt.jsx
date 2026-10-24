import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Printer,
    Download,
    CheckCircle2,
    Building2,
    QrCode,
    ChevronLeft,
    Receipt as ReceiptIcon,
} from 'lucide-react';

export default function PaymentReceipt({ payment }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <MainLayout>
            <Head title={`পেমেন্ট রসিদ: ${payment.receipt_number} - খুলনা সেবা`} />

            {/* Back Bar (Hidden on print) */}
            <div className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 print:hidden">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Link
                        href="/citizen/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-600 hover:text-gov-700 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>ড্যাশবোর্ডে ফিরে যান</span>
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-gov-600 hover:bg-gov-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                        <Printer className="w-4 h-4" />
                        <span>রসিদ প্রিন্ট করুন</span>
                    </button>
                </div>
            </div>

            {/* Printable Receipt Card */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-300 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="text-center space-y-2 border-b-2 border-slate-800 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gov-700 text-white flex items-center justify-center mx-auto shadow-sm">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            খুলনা সিটি কর্পোরেশন
                        </h1>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">
                            KHULNA CITY CORPORATION • OFFICIAL PAYMENT RECEIPT
                        </p>
                        <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs">
                            ই-মানি রসিদ (পরিশোধিত)
                        </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-200 pb-4">
                        <div>
                            <span className="text-slate-500 block">রসিদ নম্বর:</span>
                            <span className="font-extrabold text-slate-900 text-sm">{payment.receipt_number}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 block">পরিশোধের তারিখ ও সময়:</span>
                            <span className="font-bold text-slate-800">
                                {new Date(payment.paid_at || payment.created_at).toLocaleDateString('bn-BD', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Applicant & Application Details */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs md:text-sm grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-slate-500 block text-xs">প্রদানকারী নাগরিক:</span>
                            <span className="font-bold text-slate-900">{payment.user?.name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs">মোবাইল নম্বর:</span>
                            <span className="font-bold text-slate-900 font-mono">{payment.user?.phone || '—'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs">সংযুক্ত আবেদন আইডি:</span>
                            <span className="font-bold text-gov-700 font-mono">
                                {payment.application?.tracking_id || '—'}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs">কেসিসি ওয়ার্ড নম্বর:</span>
                            <span className="font-bold text-slate-900">
                                ওয়ার্ড নং {payment.application?.ward_no || payment.user?.ward_no || '২১'}
                            </span>
                        </div>
                    </div>

                    {/* Payment Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-xs md:text-sm">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4 text-left">বিবরণ / সেবার নাম</th>
                                    <th className="py-3 px-4 text-center">মাধ্যম</th>
                                    <th className="py-3 px-4 text-right">পরিমাণ (টাকা)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                                        {payment.purpose_bn}
                                    </td>
                                    <td className="py-3.5 px-4 text-center uppercase font-mono font-bold text-slate-600">
                                        {payment.payment_method}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                                        ৳{parseFloat(payment.amount).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-slate-50 font-black border-t-2 border-slate-800">
                                <tr>
                                    <td colSpan={2} className="py-3.5 px-4 text-right text-slate-700">
                                        সর্বমোট পরিশোধিত:
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-base text-gov-800 font-mono">
                                        ৳{parseFloat(payment.amount).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Verification info & QR */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 p-1 rounded-xl border border-slate-300 flex items-center justify-center">
                                <QrCode className="w-10 h-10 text-slate-800" />
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight">
                                <p className="font-bold text-slate-800">অনলাইন পেমেন্ট ভেরিফিকেশন</p>
                                <p className="font-mono text-[10px]">TRX: {payment.transaction_id}</p>
                                <p className="text-emerald-600 font-bold">স্টেটাস: পরিশোধিত (COMPLETED) ✓</p>
                            </div>
                        </div>

                        <div className="text-center sm:text-right space-y-1">
                            <div className="font-serif italic text-sm text-slate-600">কম্পিউটার জেনারেটেড রসিদ</div>
                            <div className="text-xs font-bold text-slate-800">হিসাব শাখা, খুলনা সিটি কর্পোরেশন</div>
                            <div className="text-[10px] text-slate-400">ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই</div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}