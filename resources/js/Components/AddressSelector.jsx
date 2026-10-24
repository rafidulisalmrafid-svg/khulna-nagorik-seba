import React, { useState, useEffect, useMemo } from 'react';
import {
    MapPin,
    Building2,
    Home,
    Compass,
    Navigation,
    Search,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import {
    KHULNA_DIVISION,
    KHULNA_GEO_DATA,
    KHULNA_DISTRICTS,
} from '@/data/khulnaGeoData';

export default function AddressSelector({
    values,
    value,
    onChange,
    errors = {},
    className = '',
    title = 'ঠিকানা সংক্রান্ত তথ্য',
}) {
    // Current selection values
    const currentValues = (values && Object.keys(values).length > 0) ? values : (value || {});
    const division = currentValues.division || KHULNA_DIVISION;
    const district = currentValues.district || 'খুলনা';

    const availableUpazilas = useMemo(() => {
        return KHULNA_GEO_DATA[district]?.upazilas || {};
    }, [district]);

    const upazilaList = useMemo(() => {
        return Object.keys(availableUpazilas);
    }, [availableUpazilas]);

    const upazila = currentValues.upazila || upazilaList[0] || '';

    const availableUnionsOrWards = useMemo(() => {
        return availableUpazilas[upazila] || [];
    }, [availableUpazilas, upazila]);

    const unionWard = currentValues.union_ward || availableUnionsOrWards[0] || '';
    const roadStreet = currentValues.road_street || '';
    const holdingNo = currentValues.holding_no || '';

    // Search filters within dropdowns
    const [districtSearch, setDistrictSearch] = useState('');
    const [upazilaSearch, setUpazilaSearch] = useState('');
    const [unionSearch, setUnionSearch] = useState('');

    // Filtered lists
    const filteredDistricts = useMemo(() => {
        if (!districtSearch.trim()) return KHULNA_DISTRICTS;
        return KHULNA_DISTRICTS.filter((d) =>
            d.toLowerCase().includes(districtSearch.toLowerCase().trim())
        );
    }, [districtSearch]);

    const filteredUpazilas = useMemo(() => {
        if (!upazilaSearch.trim()) return upazilaList;
        return upazilaList.filter((u) =>
            u.toLowerCase().includes(upazilaSearch.toLowerCase().trim())
        );
    }, [upazilaSearch, upazilaList]);

    const filteredUnionsOrWards = useMemo(() => {
        if (!unionSearch.trim()) return availableUnionsOrWards;
        return availableUnionsOrWards.filter((item) =>
            item.toLowerCase().includes(unionSearch.toLowerCase().trim())
        );
    }, [unionSearch, availableUnionsOrWards]);

    // Handle District change -> cascade to upazila and ward
    const handleDistrictChange = (newDistrict) => {
        const nextUpazilas = Object.keys(KHULNA_GEO_DATA[newDistrict]?.upazilas || {});
        const nextUpazila = nextUpazilas[0] || '';
        const nextWards = KHULNA_GEO_DATA[newDistrict]?.upazilas[nextUpazila] || [];
        const nextWard = nextWards[0] || '';

        onChange({
            ...currentValues,
            division: KHULNA_DIVISION,
            district: newDistrict,
            upazila: nextUpazila,
            union_ward: nextWard,
        });
    };

    // Handle Upazila change -> cascade to ward
    const handleUpazilaChange = (newUpazila) => {
        const nextWards = availableUpazilas[newUpazila] || [];
        const nextWard = nextWards[0] || '';

        onChange({
            ...currentValues,
            upazila: newUpazila,
            union_ward: nextWard,
        });
    };

    const handleFieldChange = (fieldName, val) => {
        onChange({
            ...currentValues,
            [fieldName]: val,
        });
    };

    // Calculate formatted preview
    const previewString = useMemo(() => {
        const parts = [
            holdingNo ? `বাড়ি/দোকান: ${holdingNo}` : '',
            roadStreet ? `রোড: ${roadStreet}` : '',
            unionWard,
            upazila,
            district,
            division,
        ].filter(Boolean);

        return parts.join(', ');
    }, [holdingNo, roadStreet, unionWard, upazila, district, division]);

    return (
        <div className={`space-y-4 ${className}`}>
            {title && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gov-100 text-gov-700 flex items-center justify-center font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
                            {title}
                        </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        খুলনা বিভাগ বিশেষায়িত
                    </span>
                </div>
            )}

            {/* Row 1: Division & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Division (Default & Protected) */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>১. বিভাগ</span>
                        <span className="text-[10px] text-gov-600 font-semibold bg-gov-50 px-1.5 py-0.5 rounded">
                            ডিফল্ট
                        </span>
                    </label>
                    <div className="relative">
                        <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            disabled
                            value={division}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* 2. District (Searchable Dropdown) */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>২. জেলা</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                            value={district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-gov-600 bg-white"
                        >
                            {filteredDistricts.map((d) => (
                                <option key={d} value={d}>
                                    {d} জেলা
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.district && (
                        <p className="text-[11px] text-rose-500 font-semibold">{errors.district}</p>
                    )}
                </div>
            </div>

            {/* Row 2: Upazila/Thana & Union/Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 3. Upazila / Thana (Cascaded from District) */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>৩. উপজেলা / থানা</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                            value={upazila}
                            onChange={(e) => handleUpazilaChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-gov-600 bg-white"
                        >
                            {filteredUpazilas.map((u) => (
                                <option key={u} value={u}>
                                    {u}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.upazila && (
                        <p className="text-[11px] text-rose-500 font-semibold">{errors.upazila}</p>
                    )}
                </div>

                {/* 4. Union / Ward / Municipality (Cascaded from Upazila) */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>৪. ইউনিয়ন / পৌরসভা / ওয়ার্ড</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                            value={unionWard}
                            onChange={(e) => handleFieldChange('union_ward', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-gov-600 bg-white"
                        >
                            {filteredUnionsOrWards.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.union_ward && (
                        <p className="text-[11px] text-rose-500 font-semibold">{errors.union_ward}</p>
                    )}
                </div>
            </div>

            {/* Row 3: Road/Street & House/Shop/Holding No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 5. Road Number / Street Name */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                        ৫. রোড নম্বর / রাস্তার নাম
                    </label>
                    <input
                        type="text"
                        value={roadStreet}
                        onChange={(e) => handleFieldChange('road_street', e.target.value)}
                        placeholder="যেমন: কেডিএ এভিনিউ, রোড নং ৪, শান্তিধাম"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600 font-medium"
                    />
                </div>

                {/* 6. House / Shop / Holding No */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                        ৬. বাড়ি / দোকান / হোল্ডিং নম্বর
                    </label>
                    <input
                        type="text"
                        value={holdingNo}
                        onChange={(e) => handleFieldChange('holding_no', e.target.value)}
                        placeholder="যেমন: বাড়ি নং ১২/এ অথবা দোকান নং ৫"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-gov-600 font-medium"
                    />
                </div>
            </div>

            {/* Live Address Preview Card */}
            {previewString && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-gov-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-slate-800">ঠিকানার লাইভ প্রিভিউ: </span>
                        <span className="text-slate-600 font-medium">{previewString}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
