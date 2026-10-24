import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AddressSelector from '@/Components/AddressSelector';
import {
    User,
    Phone,
    CreditCard,
    Key,
    Mail,
    CheckCircle2,
    Shield,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RotateCw,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    MapPin,
    Check,
} from 'lucide-react';
import axios from 'axios';

// Convert Bengali digits to English digits
const bnToEnNumber = (str) => {
    if (!str) return '';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[০-৯]/g, (d) => bnDigits.indexOf(d));
};

export default function Register({ initialPhone = '', redirect = '' }) {
    // Current step: 1 (ব্যক্তিগত তথ্য), 2 (ঠিকানা), 3 (নিরাপত্তা ও পাসওয়ার্ড), 4 (ওটিপি যাচাই)
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        phone: initialPhone || '',
        nid: '',
        password: '',
        password_confirmation: '',
        email: '',
        division: 'খুলনা বিভাগ',
        district: 'খুলনা',
        upazila: 'সোনাডাঙ্গা (কেসিসি মেট্রো)',
        union_ward: 'কেসিসি ওয়ার্ড নং 17',
        road_street: '',
        holding_no: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (currentStep === 4 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [currentStep, timer]);

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phone' || name === 'nid') {
            value = bnToEnNumber(value);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    // Validate Step 1 (Personal Info)
    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'নাগরিকের পুরো নাম দেওয়া আবশ্যক।';
        }
        const cleanPhone = bnToEnNumber(formData.phone).replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            newErrors.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক।';
        } else if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
            newErrors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।';
        }
        const cleanNid = bnToEnNumber(formData.nid).replace(/[^0-9]/g, '');
        if (!cleanNid) {
            newErrors.nid = 'জাতীয় পরিচয়পত্র (NID) নম্বর দেওয়া আবশ্যক।';
        } else if (cleanNid.length < 10 || cleanNid.length > 17) {
            newErrors.nid = 'NID নম্বর ১০ থেকে ১৭ ডিজিটের হতে হবে।';
        }
        if (!formData.email || !formData.email.trim()) {
            newErrors.email = 'ইমেইল ঠিকানা দেওয়া বাধ্যতামূলক (ওটিপি ও লাইসেন্স আপডেটের জন্য)।';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: name@example.com)।';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate Step 2 (Address)
    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.district) {
            newErrors.district = 'জেলা নির্বাচন করা আবশ্যক।';
        }
        if (!formData.upazila) {
            newErrors.upazila = 'উপজেলা বা থানা নির্বাচন করা আবশ্যক।';
        }
        if (!formData.union_ward) {
            newErrors.union_ward = 'ওয়ার্ড বা ইউনিয়ন পরিষদ নির্বাচন করা আবশ্যক।';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate Step 3 (Password & Security)
    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'পাসওয়ার্ড দেওয়া আবশ্যক।';
        } else if (formData.password.length < 6) {
            newErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
        }
        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'পাসওয়ার্ড নিশ্চিতকরণ ফিল্ড পূরণ করুন।';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'পাসওয়ার্ড দুটি মেলেনি।';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Go to Next Step
    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Go to Previous Step
    const handlePrevStep = () => {
        if (currentStep > 1 && currentStep < 4) {
            setCurrentStep((prev) => prev - 1);
            setErrors({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Submit Step 3 and Send OTP (Advances to Step 4)
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateStep3()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                phone: bnToEnNumber(formData.phone).replace(/[^0-9]/g, ''),
                nid: bnToEnNumber(formData.nid).replace(/[^0-9]/g, ''),
            };
            const res = await axios.post('/auth/send-register-otp', payload);
            if (res.data.success) {
                setDevOtp(res.data.dev_otp);
                setCurrentStep(4);
                setTimer(60);
                setCanResend(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const formatted = {};
                for (let k in err.response.data.errors) {
                    formatted[k] = err.response.data.errors[k][0];
                }
                setErrors(formatted);
                // If error belongs to step 1 or 2, navigate back to that step
                if (formatted.phone || formatted.nid || formatted.name || formatted.email) {
                    setCurrentStep(1);
                } else if (formatted.district || formatted.upazila || formatted.union_ward) {
                    setCurrentStep(2);
                }
            } else {
                setErrors({ general: 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Verify Registration OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError('');

        if (otpCode.length !== 6) {
            setOtpError('অনুগ্রহ করে সঠিক ৬ ডিজিটের ওটিপি কোড দিন।');
            return;
        }

        setLoading(true);
        try {
            const cleanOtp = bnToEnNumber(otpCode).replace(/[^0-9]/g, '');
            const res = await axios.post('/auth/verify-register-otp', {
                phone: bnToEnNumber(formData.phone).replace(/[^0-9]/g, ''),
                email: formData.email ? formData.email.trim().toLowerCase() : '',
                otp_code: cleanOtp,
                redirect: redirect,
            });

            if (res.data.success) {
                window.location.href = res.data.redirect || res.data.redirect_url || "/citizen/dashboard";
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setOtpError(err.response.data.message);
            } else {
                setOtpError('ওটিপি যাচাই করা যায়নি। সঠিক কোড দিয়ে আবার চেষ্টা করুন।');
            }
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP handler
    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        setOtpError('');
        try {
            const payload = {
                ...formData,
                phone: bnToEnNumber(formData.phone).replace(/[^0-9]/g, ''),
                nid: bnToEnNumber(formData.nid).replace(/[^0-9]/g, ''),
            };
            const res = await axios.post('/auth/send-register-otp', payload);
            if (res.data.success) {
                setDevOtp(res.data.dev_otp);
                setTimer(60);
                setCanResend(false);
            }
        } catch (err) {
            setOtpError('পুনরায় ওটিপি পাঠাতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    // Step definitions for the progress indicator
    const steps = [
        { id: 1, title: 'ব্যক্তিগত তথ্য', subtitle: 'নাম ও পরিচয়', icon: User },
        { id: 2, title: 'বসবাসের ঠিকানা', subtitle: 'খুলনা বিভাগ', icon: MapPin },
        { id: 3, title: 'নিরাপত্তা', subtitle: 'পাসওয়ার্ড নির্ধারণ', icon: Lock },
        { id: 4, title: 'ওটিপি যাচাই', subtitle: 'মোবাইল কোড', icon: Key },
    ];

    // Helper to format full address string for preview
    const addressPreviewText = [
        formData.holding_no ? `বাড়ি/দোকান: ${formData.holding_no}` : null,
        formData.road_street ? `রোড: ${formData.road_street}` : null,
        formData.union_ward,
        formData.upazila,
        formData.district,
        formData.division || 'খুলনা বিভাগ',
    ].filter(Boolean).join(', ');

    return (
        <GuestLayout>
            <Head title="নতুন নাগরিক অ্যাকাউন্ট তৈরি - খুলনা সেবা" />

            {/* Header Title & Portal Badge */}
            <div className="mb-5 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gov-50 text-gov-700 border border-gov-200 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>খুলনা সিটি কর্পোরেশন ডিজিটাল সিটিজেন সার্ভিসেস</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-navy-950">
                    নতুন নাগরিক অ্যাকাউন্ট তৈরি
                </h2>
                <p className="text-xs text-slate-500">
                    সহজে ও ধাপে ধাপে আপনার তথ্য দিয়ে নাগরিক সেবা গ্রহণ করুন
                </p>
            </div>

            {/* Multi-Step Visual Stepper Bar */}
            <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center justify-between relative">
                    {/* Background Progress Track */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                        <div
                            className="h-full bg-gov-600 transition-all duration-500 ease-out"
                            style={{
                                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                            }}
                        />
                    </div>

                    {steps.map((s) => {
                        const Icon = s.icon;
                        const isDone = currentStep > s.id;
                        const isActive = currentStep === s.id;

                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center flex-1">
                                <div
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                        isDone
                                            ? 'bg-gov-600 text-white ring-4 ring-gov-100 shadow-sm'
                                            : isActive
                                            ? 'bg-white text-gov-700 border-2 border-gov-600 ring-4 ring-gov-50 shadow-md font-extrabold scale-110'
                                            : 'bg-white text-slate-400 border border-slate-300'
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                <span
                                    className={`mt-1.5 text-[10px] md:text-xs font-bold transition-colors text-center hidden sm:block ${
                                        isActive
                                            ? 'text-gov-700 font-extrabold'
                                            : isDone
                                            ? 'text-slate-700 font-semibold'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {s.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Active Step Label */}
                <div className="sm:hidden mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-gov-700">
                        ধাপ {currentStep} এর ৪: {steps[currentStep - 1]?.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                        {steps[currentStep - 1]?.subtitle}
                    </span>
                </div>
            </div>

            {/* Target service redirect banner */}
            {redirect && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">সরাসরি সেবায় পৌঁছাবেন:</span> অ্যাকাউন্ট তৈরি ও যাচাই সম্পন্ন হওয়া মাত্রই আপনি সরাসরি নির্বাচিত সেবার আবেদন ফর্মে পৌঁছে যাবেন।
                    </div>
                </div>
            )}

            {errors.general && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.general}</span>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: ব্যক্তিগত তথ্য (Basic Personal Information)           */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gov-600" />
                            <span>১. প্রাথমিক পরিচয় ও যোগাযোগের তথ্য</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            আপনার জাতীয় পরিচয়পত্র অনুযায়ী সঠিক নাম ও তথ্য প্রদান করুন
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            নাগরিকের পুরো নাম (NID অনুযায়ী) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                                    errors.name
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        {errors.name && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            মোবাইল নম্বর (১১ ডিজিট) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                maxLength={11}
                                placeholder="017XXXXXXXX"
                                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm border focus:ring-2 focus:outline-none font-medium transition-all ${
                                    errors.phone
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        {errors.phone ? (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
                        ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                                এই নম্বরে ভেরিফিকেশন ওটিপি এবং সেবার আপডেট পাঠানো হবে।
                            </p>
                        )}
                    </div>

                    {/* NID */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="nid"
                                value={formData.nid}
                                onChange={handleInputChange}
                                maxLength={17}
                                placeholder="১০, ১৩ বা ১৭ ডিজিটের NID নম্বর"
                                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm border focus:ring-2 focus:outline-none font-medium transition-all ${
                                    errors.nid
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        {errors.nid && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.nid}</p>
                        )}
                    </div>

                    {/* Email (Mandatory) */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">
                                ইমেইল ঠিকানা <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">বাধ্যতামূলক (ওটিপি ও লাইসেন্স প্রাপ্তির জন্য)</span>
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="name@example.com"
                                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                                    errors.email
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        {errors.email && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                        )}
                    </div>

                    {/* Step 1 Action Button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gov-600 hover:bg-gov-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                        >
                            <span>পরবর্তী ধাপ: ঠিকানা নির্বাচন</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: বসবাসের ঠিকানা (Cascading Address Selection)          */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gov-600" />
                            <span>২. খুলনা বিভাগের বসবাসের ভৌগোলিক ঠিকানা</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            জেলা ➔ উপজেলা/থানা ➔ ওয়ার্ড বা ইউনিয়ন নির্বাচন করুন
                        </p>
                    </div>

                    {/* Reusable Cascading Address Component */}
                    <AddressSelector
                        values={formData}
                        value={formData}
                        onChange={(updated) => {
                            setFormData((prev) => ({
                                ...prev,
                                ...updated,
                            }));
                        }}
                        errors={errors}
                        required={true}
                    />

                    {/* Step 2 Action Buttons */}
                    <div className="pt-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="w-1/3 py-2.5 px-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 text-xs md:text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>পূর্ববর্তী</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-2/3 py-2.5 px-4 rounded-xl font-bold text-white bg-gov-600 hover:bg-gov-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm text-xs md:text-sm"
                        >
                            <span>পরবর্তী ধাপ: পাসওয়ার্ড</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: নিরাপত্তা ও পাসওয়ার্ড (Password & Summary)           */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 3 && (
                <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-gov-600" />
                            <span>৩. নিরাপত্তা ও অ্যাকাউন্ট পাসওয়ার্ড</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            ভবিষ্যতে লগইন করার জন্য একটি গোপন ও শক্তিশালী পাসওয়ার্ড দিন
                        </p>
                    </div>

                    {/* Summary Card for Review */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs space-y-1.5 text-slate-700">
                        <div className="font-bold text-emerald-800 flex items-center justify-between">
                            <span>আপনার প্রদানকৃত তথ্য সংক্ষেপ:</span>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="text-[11px] text-gov-700 hover:underline font-bold"
                            >
                                পরিবর্তন করুন
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                            <div><span className="text-slate-400">নাম:</span> <span className="font-semibold">{formData.name}</span></div>
                            <div><span className="text-slate-400">মোবাইল:</span> <span className="font-semibold">{formData.phone}</span></div>
                            <div className="col-span-2"><span className="text-slate-400">NID:</span> <span className="font-semibold">{formData.nid}</span></div>
                            <div className="col-span-2 pt-1 border-t border-emerald-100">
                                <span className="text-slate-400">ঠিকানা:</span> <span className="font-medium text-slate-800">{addressPreviewText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            পাসওয়ার্ড নির্ধারণ করুন <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                                className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                                    errors.password
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            পাসওয়ার্ড পুনরায় লিখুন <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                placeholder="একই পাসওয়ার্ড নিশ্চিত করুন"
                                className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl text-sm border focus:ring-2 focus:outline-none transition-all ${
                                    errors.password_confirmation
                                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                        : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                                }`}
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password_confirmation}</p>
                        )}
                    </div>

                    {/* Step 3 Action Buttons */}
                    <div className="pt-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="w-1/3 py-2.5 px-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 text-xs md:text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>পূর্ববর্তী</span>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-2/3 py-3 px-4 rounded-xl font-bold text-white bg-gov-600 hover:bg-gov-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm text-xs md:text-sm"
                        >
                            {loading ? (
                                <>
                                    <RotateCw className="w-4 h-4 animate-spin" />
                                    <span>ওটিপি কোড পাঠানো হচ্ছে...</span>
                                </>
                            ) : (
                                <>
                                    <span>ওটিপি পাঠান ও সম্পন্ন করুন</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: ওটিপি যাচাইকরণ (OTP Verification Screen)               */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 4 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-300">
                    {/* Demo OTP Banner for Local Development */}
                    {devOtp && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-sm">
                            <span className="font-bold flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <span>ডেমো টেস্টিং ওটিপি কোড:</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setOtpCode(devOtp)}
                                className="font-mono font-black text-sm px-2.5 py-0.5 bg-amber-200 hover:bg-amber-300 rounded-md tracking-wider transition-colors cursor-pointer"
                                title="কোডটি ইনপুটে বসাতে ক্লিক করুন"
                            >
                                {devOtp} (ক্লিক করে বসান)
                            </button>
                        </div>
                    )}

                    {/* Dual Delivery Channel: Mobile SMS & Email */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50/80 via-slate-50 to-blue-50/60 border border-emerald-200/80 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-center gap-2">
                            <span className="p-2 rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-50">
                                <Phone className="w-4 h-4" />
                            </span>
                            <span className="text-slate-400 font-bold text-sm">+</span>
                            <span className="p-2 rounded-full bg-blue-100 text-blue-700 ring-2 ring-blue-50">
                                <Mail className="w-4 h-4" />
                            </span>
                        </div>

                        <div className="text-center space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">
                                একই ওটিপি মোবাইল ও ইমেইলে পাঠানো হয়েছে
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                                আপনার মোবাইল <strong className="text-slate-900 font-mono font-bold">{formData.phone}</strong> এবং ইমেইল <strong className="text-emerald-800 font-mono font-bold">{formData.email}</strong>—উভয় মাধ্যমেই একই ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।
                            </p>
                            <div className="pt-1">
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                                    ✓ যেকোনো একটি মাধ্যম (মোবাইল বা ইমেইল) থেকে কোডটি দিলেই হবে
                                </span>
                            </div>
                        </div>

                        <div className="pt-1 text-center border-t border-slate-200/60">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="text-[11px] font-bold text-gov-700 hover:underline"
                            >
                                তথ্য পরিবর্তন করতে চান? ধাপ ১-এ ফিরে যান
                            </button>
                        </div>
                    </div>

                    {/* OTP 6-Digit Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                            ৬ ডিজিটের ওটিপি (OTP) কোড দিন
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => {
                                const val = bnToEnNumber(e.target.value).replace(/[^0-9]/g, '');
                                setOtpCode(val);
                                if (otpError) setOtpError('');
                            }}
                            placeholder="------"
                            className={`w-full py-3 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border focus:ring-2 focus:outline-none transition-all ${
                                otpError
                                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                                    : 'border-slate-300 focus:border-gov-500 focus:ring-gov-100'
                            }`}
                            autoFocus
                        />
                        {otpError && (
                            <p className="text-xs text-rose-600 mt-2 text-center font-medium flex items-center justify-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{otpError}</span>
                            </p>
                        )}
                    </div>

                    {/* Resend Countdown */}
                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-xs text-slate-400">
                                পুনরায় কোড পাঠাতে অপেক্ষা করুন:{' '}
                                <span className="font-bold text-slate-700">{timer} সেকেন্ড</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-xs font-bold text-gov-700 hover:text-gov-800 hover:underline inline-flex items-center gap-1"
                            >
                                <RotateCw className="w-3 h-3" />
                                <span>কোড পাননি? পুনরায় ওটিপি পাঠান</span>
                            </button>
                        )}
                    </div>

                    {/* Verify Action Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || otpCode.length !== 6}
                            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gov-600 hover:bg-gov-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                        >
                            {loading ? (
                                <>
                                    <RotateCw className="w-4 h-4 animate-spin" />
                                    <span>যাচাই করা হচ্ছে...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>যাচাই করুন ও অ্যাকাউন্ট সম্পন্ন করুন</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Existing User Login Prompt */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
                <p className="text-xs text-slate-500">
                    পূর্বেই অ্যাকাউন্ট রয়েছে?{' '}
                    <Link
                        href={route('login', redirect ? { redirect } : {})}
                        className="font-bold text-gov-700 hover:text-gov-800 hover:underline inline-flex items-center gap-1"
                    >
                        <span>লগইন করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
