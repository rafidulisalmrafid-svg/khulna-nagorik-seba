import React from 'react';
import { CheckCircle2, Clock, AlertCircle, FileText, User } from 'lucide-react';

export default function Timeline({ items }) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-6 text-slate-500 text-sm">
                কোনো সময়ক্রমের তথ্য পাওয়া যায়নি।
            </div>
        );
    }

    return (
        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {items.map((item, index) => {
                const isLatest = index === 0;
                return (
                    <div key={item.id || index} className="relative group">
                        {/* Dot */}
                        <div
                            className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                                isLatest
                                    ? 'bg-gov-600 text-white shadow-md shadow-gov-600/30'
                                    : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                            {isLatest ? (
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm group-hover:shadow-md transition">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <h4 className="font-semibold text-slate-800 text-sm md:text-base">
                                    {item.action_title}
                                </h4>
                                <span className="text-xs text-slate-500 font-medium">
                                    {new Date(item.created_at).toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            {item.comment && (
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 mt-2">
                                    {item.comment}
                                </p>
                            )}

                            {item.user && (
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>সম্পাদনকারী: {item.user.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}