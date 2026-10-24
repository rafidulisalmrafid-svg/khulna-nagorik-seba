import React from 'react';
import { Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-6 sm:pt-0 bg-gradient-to-b from-navy-950 via-gov-900 to-gov-800 text-slate-800 font-sans p-4">
            <div className="mb-6 text-center">
                <Link href="/" className="inline-flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl group-hover:scale-105 transition flex items-center justify-center text-gov-700">
                        <Building2 className="w-9 h-9" />
                    </div>
                    <div className="text-white">
                        <h2 className="text-2xl font-black tracking-tight">খুলনা সেবা</h2>
                        <p className="text-xs text-slate-300">ডিজিটাল সিটি কর্পোরেশন প্ল্যাটফর্ম</p>
                    </div>
                </Link>
            </div>

            <div className="w-full sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
                {children}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
                <Link href="/" className="hover:text-white transition">← মূল ওয়েবসাইটে ফিরে যান</Link>
            </div>
        </div>
    );
}