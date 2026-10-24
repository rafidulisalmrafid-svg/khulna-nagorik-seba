import React from 'react';

export default function StatusBadge({ status, type = 'application' }) {
    const config = {
        // Application statuses
        submitted: {
            label: 'দাখিলকৃত',
            bg: 'bg-blue-50 text-blue-700 border-blue-200',
            dot: 'bg-blue-500',
        },
        under_review: {
            label: 'পর্যালোচনাধীন',
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500 animate-pulse',
        },
        info_required: {
            label: 'অতিরিক্ত তথ্য প্রয়োজন',
            bg: 'bg-orange-50 text-orange-700 border-orange-200',
            dot: 'bg-orange-500',
        },
        approved: {
            label: 'অনুমোদিত',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        rejected: {
            label: 'বাতিলকৃত',
            bg: 'bg-rose-50 text-rose-700 border-rose-200',
            dot: 'bg-rose-500',
        },
        completed: {
            label: 'সেবা সম্পন্ন',
            bg: 'bg-teal-50 text-teal-700 border-teal-200',
            dot: 'bg-teal-500',
        },
        // Complaint statuses
        assigned: {
            label: 'কর্মকর্তা নির্ধারিত',
            bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            dot: 'bg-indigo-500',
        },
        under_investigation: {
            label: 'তদন্তাধীন',
            bg: 'bg-purple-50 text-purple-700 border-purple-200',
            dot: 'bg-purple-500 animate-pulse',
        },
        action_in_progress: {
            label: 'কার্যক্রম চলমান',
            bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            dot: 'bg-cyan-500 animate-pulse',
        },
        resolved: {
            label: 'সমাধানকৃত',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        // Payment statuses
        paid: {
            label: 'পরিশোধিত',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        unpaid: {
            label: 'বকেয়া / অপরিশোধিত',
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500',
        },
        exempted: {
            label: 'বিনামূল্যে',
            bg: 'bg-slate-50 text-slate-700 border-slate-200',
            dot: 'bg-slate-400',
        },
    };

    const current = config[status] || {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
            {current.label}
        </span>
    );
}