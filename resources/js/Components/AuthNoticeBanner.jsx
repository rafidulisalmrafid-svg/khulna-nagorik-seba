import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function AuthNoticeBanner({ redirect = '' }) {
    const { auth } = usePage().props;

    if (auth?.user) {
        return null;
    }

    const loginUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
    const registerUrl = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';

    return (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-2 border-amber-300/80 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Lock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-amber-950 text-base sm:text-lg">
                                সেবা নিতে আগে লগইন করতে হবে
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                                <AlertCircle className="w-3 h-3" />
                                জরুরি
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5">
                            খুলনা সিটি কর্পোরেশনের যে কোনো নাগরিক সেবার বিস্তারিত দেখা, আবেদন ও ফি পরিশোধের জন্য আপনার অ্যাকাউন্টে লগইন করুন।
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-13 sm:pl-0">
                    <Link
                        href={loginUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-600 hover:bg-gov-700 shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>লগইন করুন</span>
                    </Link>
                    <Link
                        href={registerUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all hover:-translate-y-0.5"
                    >
                        <UserPlus className="w-4 h-4 text-gov-600" />
                        <span>নতুন অ্যাকাউন্ট খুলুন</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
