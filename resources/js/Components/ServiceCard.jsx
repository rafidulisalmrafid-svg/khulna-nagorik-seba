import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Briefcase,
    Home,
    Award,
    FileText,
    Wrench,
    Trash2,
    Lightbulb,
    FileCheck,
    Layers,
    Building2,
    Clock,
    ArrowUpRight,
    ExternalLink,
    CheckCircle2,
    Lock,
    Unlock,
} from 'lucide-react';

const iconMap = {
    Briefcase,
    Home,
    Award,
    FileText,
    Wrench,
    Trash2,
    Lightbulb,
    FileCheck,
    Layers,
    Building2,
};

export default function ServiceCard({ service }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const IconComponent = iconMap[service.category?.icon] || iconMap[service.icon] || FileText;
    const isExternal = service.authority_type === 'external_gov_link';

    const targetUrl = isLoggedIn
        ? (isExternal ? service.external_url : `/apply/${service.slug}`)
        : `/login?redirect=/apply/${service.slug}`;

    const handleCardClick = (e) => {
        // If clicking on an anchor directly, let it handle
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        if (isExternal && isLoggedIn) {
            window.open(service.external_url, '_blank', 'noopener,noreferrer');
        } else {
            router.visit(targetUrl);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isLoggedIn
                    ? 'border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1'
                    : 'border-amber-200/80 p-5 md:p-6 shadow-sm hover:shadow-md hover:border-amber-300 bg-gradient-to-b from-white to-amber-50/20'
            }`}
        >
            <div>
                {/* Top badges & Lock Indicator */}
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-sm ${
                            isLoggedIn
                                ? 'bg-gov-50 group-hover:bg-gov-600 text-gov-600 group-hover:text-white'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                    >
                        <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        {!isLoggedIn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span>লক করা</span>
                            </span>
                        ) : isExternal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <ExternalLink className="w-3 h-3" />
                                কেন্দ্রীয় পোর্টাল
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                কেসিসি সেবা
                            </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {parseFloat(service.fee_amount) > 0 ? `৳${Math.round(service.fee_amount)}` : 'বিনামূল্যে'}
                        </span>
                    </div>
                </div>

                {/* Title & Short description (Blurred when not logged in) */}
                <div className={!isLoggedIn ? 'relative' : ''}>
                    <h3
                        className={`font-bold text-lg line-clamp-2 mb-2 transition-colors ${
                            isLoggedIn
                                ? 'text-slate-800 group-hover:text-gov-700'
                                : 'text-slate-700 blur-[1.2px] select-none'
                        }`}
                    >
                        {service.name_bn}
                    </h3>

                    <p
                        className={`text-sm leading-relaxed line-clamp-3 mb-4 ${
                            isLoggedIn
                                ? 'text-slate-600'
                                : 'text-slate-500 blur-[1.8px] select-none'
                        }`}
                    >
                        {service.short_description_bn}
                    </p>

                    {!isLoggedIn && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-sm text-white text-xs font-semibold shadow-md flex items-center gap-1.5 pointer-events-none">
                                <Lock className="w-3 h-3 text-amber-400" />
                                সেবা দেখতে লগইন করুন
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer meta & Action link */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.estimated_days} কার্যদিবস</span>
                </div>

                {!isLoggedIn ? (
                    <Link
                        href={`/login?redirect=/apply/${service.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm"
                    >
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>লগইন করে দেখুন</span>
                    </Link>
                ) : isExternal ? (
                    <a
                        href={service.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
                    >
                        <span>জাতীয় পোর্টালে যান</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                ) : (
                    <Link
                        href={`/apply/${service.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gov-600 group-hover:text-white group-hover:bg-gov-600 bg-gov-50 px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-sm"
                    >
                        <span>আবেদন করুন</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                )}
            </div>
        </div>
    );
}
