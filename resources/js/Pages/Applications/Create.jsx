import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    User,
    Building2,
    FileText,
    Upload,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Shield,
    Clock,
    FileCheck,
    Edit3,
    Trash2,
    Info,
    Store,
    Layers,
    HeartHandshake,
    Eye,
    MapPin,
    Navigation,
    Compass,
    Truck,
    Camera,
    CreditCard,
    Check,
} from 'lucide-react';

export default function ApplicationCreate({ service, wards = [], businessTypes = [], characterReasons = [] }) {
    const { auth } = usePage().props;
    const [currentStep, setCurrentStep] = useState(1);
    const [declarationChecked, setDeclarationChecked] = useState(false);
    const [sameAddress, setSameAddress] = useState(false);
    const [stepErrors, setStepErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Identify Service Type
    const isTradeLicense = service.slug?.includes('trade-license') || service.name_bn?.includes('ট্রেড লাইসেন্স');
    const isCharacterCertificate = service.slug?.includes('character-certificate') || service.slug?.includes('nagorik-sonod') || service.name_bn?.includes('চারিত্রিক');
    const isHolding = service.slug === 'new-holding-registration' || service.name_bn?.includes('হোল্ডিং');
    const isAutoRickshaw = service.slug === 'auto-rickshaw-license' || service.name_bn?.includes('অটোরিকশা');

    // Dynamic basic fields configuration
    const basicFieldsConfig = service.form_fields?.basic_fields || null;

    const isFieldEnabled = (fieldKey, defaultEnabled = true) => {
        if (basicFieldsConfig && basicFieldsConfig[fieldKey]) {
            return basicFieldsConfig[fieldKey].enabled !== false;
        }
        return defaultEnabled;
    };

    const isFieldRequired = (fieldKey, defaultRequired = true) => {
        if (basicFieldsConfig && basicFieldsConfig[fieldKey]) {
            if (basicFieldsConfig[fieldKey].enabled === false) return false;
            return !!basicFieldsConfig[fieldKey].required;
        }
        return defaultRequired;
    };

    // Form data state
    const [formData, setFormData] = useState({
        applicant_name: auth.user?.name || '',
        applicant_phone: auth.user?.phone || '',
        applicant_email: auth.user?.email || '',
        applicant_nid: auth.user?.nid || '',
        gender: 'male',
        marital_status: 'single',
        husband_name: '',
        father_or_husband_name: '',
        mother_name: '',
        ward_no: auth.user?.ward_no ? parseInt(auth.user.ward_no) : (wards[0]?.ward_no || 1),
        holding_no: '',
        present_address: auth.user?.address || '',
        permanent_address: '',
        birth_date: '',

        // Trade specific
        business_type_id: businessTypes[0]?.id || '',
        measurement_value: '',
        business_name: '',
        business_capital: '',
        business_address: '',

        // Character Certificate
        character_reason: characterReasons[0]?.reason_bn || '',
        custom_reason: '',

        // Holding specific fields
        property_area: '',
        property_road: '',
        building_type: 'আবাসিক',
        land_size: '',
        floor_count: '১ তলা (একতলা)',
        map_lat: '22.8456',
        map_lng: '89.5403',
        map_address: 'খুলনা সদর, খুলনা সিটি কর্পোরেশন',

        // Auto-Rickshaw specific fields
        driving_license_no: '',
        license_expiry_date: '',
        vehicle_type: 'ব্যাটারি চালিত ইজিবাইক',
        previous_reg_no: '',
        chassis_no: '',
        vehicle_color: 'সবুজ ও হলুদ হুড',

        extra_fields: {},
    });

    // Custom fields list defined in DB
    const customFieldsList = useMemo(() => {
        if (!service.form_fields) return [];
        let rawFields = [];
        if (Array.isArray(service.form_fields.custom_fields)) {
            rawFields = service.form_fields.custom_fields;
        } else if (Array.isArray(service.form_fields)) {
            rawFields = service.form_fields;
        }

        return rawFields
            .filter((f) => {
                const name = f.name || f.id;
                // Exclude fields already handled in Step 1 or specially
                if (name === 'marital_status') return false;
                if (isCharacterCertificate && (name === 'reason_for_certificate' || name === 'character_reason')) return false;
                return true;
            })
            .map((f, idx) => {
                let optionsList = [];
                if (Array.isArray(f.options)) {
                    optionsList = f.options;
                } else if (typeof f.options === 'string' && f.options.trim()) {
                    optionsList = f.options.split(',').map((s) => s.trim()).filter(Boolean);
                }

                const isSelect = f.type === 'select' || optionsList.length > 0 || (f.name && f.name.includes('type'));

                return {
                    id: f.name || f.id || `field_${idx}`,
                    label_bn: f.label_bn || f.name || f.id,
                    type: isSelect ? 'select' : (f.type || 'text'),
                    optionsList: optionsList,
                    required: !!f.required,
                };
            });
    }, [service.form_fields, isCharacterCertificate]);

    const selectedBusinessType = businessTypes.find(
        (bt) => String(bt.id) === String(formData.business_type_id)
    ) || businessTypes[0];

    // Compute dynamic required documents list
    const requiredDocumentList = useMemo(() => {
        if (Array.isArray(service.required_documents_bn) && service.required_documents_bn.length > 0) {
            const first = service.required_documents_bn[0];
            if (typeof first === 'object' && first !== null && first.id) {
                return service.required_documents_bn.map((doc) => {
                    const allowed = doc.allowed_types || ['pdf', 'jpg', 'png', 'webp'];
                    const acceptStr = allowed.map((ext) => (ext === 'pdf' ? '.pdf' : `.${ext}`)).join(',');
                    return {
                        id: doc.id,
                        title: doc.title_bn || doc.id,
                        hint: doc.description_bn || (doc.required ? 'বাধ্যতামূলক সংযুক্তি' : 'ঐচ্ছিক সংযুক্তি'),
                        accept: acceptStr,
                        allowed_types: allowed,
                        required: !!doc.required,
                    };
                });
            }
        }

        // Default legacy fallback
        const list = [
            {
                id: 'applicant_photo',
                title: 'আবেদনকারীর পাসপোর্ট সাইজ ছবি (রঙিন)',
                hint: 'ফরম্যাট: JPG, PNG বা WEBP (সর্বোচ্চ ১৫ মেগাবাইট)',
                accept: '.jpg,.jpeg,.png,.webp',
                required: true,
            },
            {
                id: 'applicant_nid_file',
                title: 'আবেদনকারীর জাতীয় পরিচয়পত্র (NID) কপি',
                hint: 'ফরম্যাট: PDF, JPG বা PNG (উভয় পিঠ স্পষ্ট)',
                accept: '.pdf,.jpg,.jpeg,.png,.webp',
                required: true,
            },
        ];

        return list;
    }, [service.required_documents_bn]);

    // Documents state: { [docId]: { file, name, size, title } }
    const [uploadedDocs, setUploadedDocs] = useState({});

    const handleTextChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (stepErrors[field]) {
            setStepErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleExtraFieldChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            extra_fields: { ...prev.extra_fields, [key]: value },
        }));
        if (stepErrors[`field_${key}`]) {
            setStepErrors((prev) => {
                const next = { ...prev };
                delete next[`field_${key}`];
                return next;
            });
        }
    };

    const handleFileSelect = (docId, file, title) => {
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            alert('ফাইলের সাইজ ১৫ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১৫ MB বা তার কম সাইজের ফাইল আপলোড করুন।');
            setStepErrors((prev) => ({
                ...prev,
                [docId]: 'ফাইলের সাইজ ১৫ MB-এর বেশি হতে পারবে না।',
            }));
            return;
        }

        setUploadedDocs((prev) => ({
            ...prev,
            [docId]: {
                file: file,
                name: file.name,
                size: file.size,
                title: title,
            },
        }));

        if (stepErrors[docId]) {
            setStepErrors((prev) => {
                const next = { ...prev };
                delete next[docId];
                return next;
            });
        }
    };

    const handleFileRemove = (docId) => {
        setUploadedDocs((prev) => {
            const next = { ...prev };
            delete next[docId];
            return next;
        });
    };

    const handleSameAddressChange = (e) => {
        const checked = e.target.checked;
        setSameAddress(checked);
        if (checked) {
            setFormData((prev) => ({
                ...prev,
                permanent_address: prev.present_address,
            }));
        }
    };

    // Interactive Map Pin selector simulation for Khulna
    const handlePickLocation = (areaName, lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            map_lat: lat,
            map_lng: lng,
            map_address: `${areaName}, ওয়ার্ড ${prev.ward_no}, খুলনা`,
            property_area: prev.property_area || areaName,
        }));
    };

    const handleGetGPSLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setFormData((prev) => ({
                        ...prev,
                        map_lat: lat,
                        map_lng: lng,
                        map_address: `জিপিএস পিন: (${lat}, ${lng}), খুলনা`,
                    }));
                },
                () => {
                    alert('আপনার ব্রাউজার থেকে লোকেশন অ্যাক্সেস অনুমতি পাওয়া যায়নি। ডিফল্ট ম্যাপ পিন ব্যবহার করা হচ্ছে।');
                }
            );
        }
    };

    // Steps Configuration based on Service Type
    const steps = useMemo(() => {
        if (isAutoRickshaw) {
            return [
                { num: 1, title: '১. চালক/মালিকের তথ্য', subtitle: 'নাম, এনআইডি, জন্ম তারিখ ও ছবি', icon: User },
                { num: 2, title: '২. ড্রাইভিং তথ্য', subtitle: 'লাইসেন্স নম্বর ও সনদ কপি', icon: CreditCard },
                { num: 3, title: '৩. গাড়ির বিবরণ ও ৩ দিকের ছবি', subtitle: 'ধরন, চেসিস ও ৩ অ্যাঙ্গেল ফটো', icon: Truck },
                { num: 4, title: '৪. প্রয়োজনীয় কাগজপত্র', subtitle: 'ক্রয় রশিদ, এনআইডি ও প্রত্যয়ন', icon: Upload },
                { num: 5, title: '৫. যাচাই ও দাখিল', subtitle: 'চূড়ান্ত পর্যালোচনা ও সাবমিশন', icon: FileCheck },
            ];
        }

        if (isHolding) {
            return [
                { num: 1, title: '১. মালিকের তথ্য', subtitle: 'নাম, পিতা, এনআইডি ও মোবাইল', icon: User },
                { num: 2, title: '২. বাড়ির তথ্য ও ম্যাপ পিন', subtitle: 'ওয়ার্ড, রাস্তা, ধরন ও ম্যাপ পিন', icon: Building2 },
                { num: 3, title: '৩. প্রয়োজনীয় কাগজপত্র', subtitle: 'দলিল, নামজারি, এনআইডি ও ছবি', icon: Upload },
                { num: 4, title: '৪. যাচাই ও দাখিল', subtitle: 'চূড়ান্ত পর্যালোচনা ও সাবমিশন', icon: FileCheck },
            ];
        }

        return [
            { num: 1, title: '১. আবেদনকারীর তথ্য', subtitle: 'নাম, পিতা, মাতা ও ঠিকানা', icon: User },
            { num: 2, title: '২. সেবার বিবরণী', subtitle: 'প্রয়োজনীয় তথ্যাবলী', icon: Layers },
            { num: 3, title: '৩. কাগজপত্র আপলোড', subtitle: 'প্রয়োজনীয় নথিপত্র সংযুক্তি', icon: Upload },
            { num: 4, title: '৪. পর্যালোচনা ও দাখিল', subtitle: 'যাচাই ও চূড়ান্ত সাবমিশন', icon: FileCheck },
        ];
    }, [isAutoRickshaw, isHolding]);

    const maxStep = steps.length;

    // Step 1 Validation (All required fields must be filled)
    const validateStep1 = () => {
        const errors = {};
        if (!formData.applicant_name?.trim()) errors.applicant_name = 'আবেদনকারীর পূর্ণ নাম প্রদান আবশ্যক';
        if (!formData.applicant_phone?.trim()) {
            errors.applicant_phone = 'মোবাইল নম্বর প্রদান আবশ্যক';
        } else if (!/^01[3-9]\d{8}$/.test(formData.applicant_phone.trim())) {
            errors.applicant_phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (উদা: 01711000001)';
        }
        if (!formData.applicant_nid?.trim()) errors.applicant_nid = 'জাতীয় পরিচয়পত্র (NID) নম্বর আবশ্যক';
        if (!formData.father_or_husband_name?.trim()) errors.father_or_husband_name = 'পিতার নাম প্রদান আবশ্যক';
        if (!formData.mother_name?.trim()) errors.mother_name = 'মাতার নাম প্রদান আবশ্যক';
        if (!formData.marital_status?.trim()) errors.marital_status = 'বৈবাহিক অবস্থা নির্বাচন করুন';
        if (!formData.ward_no) errors.ward_no = 'ওয়ার্ড নম্বর নির্বাচন করুন';
        if (!formData.present_address?.trim()) errors.present_address = 'বর্তমান ঠিকানা প্রদান আবশ্যক';

        if (formData.gender === 'female' && formData.marital_status === 'married' && !formData.husband_name?.trim()) {
            errors.husband_name = 'বিবাহিত মহিলা আবেদনকারীর ক্ষেত্রে স্বামীর নাম আবশ্যক';
        }

        if (isAutoRickshaw) {
            if (!formData.birth_date?.trim()) errors.birth_date = 'চালকের জন্ম তারিখ প্রদান আবশ্যক';
            if (!uploadedDocs['driver_photo']) errors.driver_photo = 'চালকের পাসপোর্ট সাইজ রঙিন ছবি আপলোড করুন';
        }

        setStepErrors(errors);
        if (Object.keys(errors).length > 0) {
            window.scrollTo({ top: 120, behavior: 'smooth' });
            alert('আবেদনকারীর পরিচিতির সকল আবশ্যিক তথ্য সঠিকভাবে পূরণ করুন।');
        }
        return Object.keys(errors).length === 0;
    };

    // Step 2 Validation (Service Specific Info)
    const validateStep2 = () => {
        const errors = {};

        if (isAutoRickshaw) {
            if (!formData.driving_license_no?.trim()) {
                errors.driving_license_no = 'ড্রাইভিং লাইসেন্স নম্বর প্রদান আবশ্যক';
            }
            if (!uploadedDocs['driving_license_file']) {
                errors.driving_license_file = 'ড্রাইভিং লাইসেন্সের স্ক্যান কপি বা ছবি আপলোড করুন';
            }
            setStepErrors(errors);
            if (Object.keys(errors).length > 0) window.scrollTo({ top: 120, behavior: 'smooth' });
            return Object.keys(errors).length === 0;
        }

        if (isHolding) {
            if (!formData.property_area?.trim()) errors.property_area = 'এলাকা বা মহল্লার নাম প্রদান আবশ্যক';
            if (!formData.property_road?.trim()) errors.property_road = 'রাস্তা বা সড়কের নাম প্রদান আবশ্যক';
            if (!formData.land_size?.trim()) errors.land_size = 'জমির আকার বা আয়তন উল্লেখ করুন';
            setStepErrors(errors);
            if (Object.keys(errors).length > 0) window.scrollTo({ top: 120, behavior: 'smooth' });
            return Object.keys(errors).length === 0;
        }

        if (isCharacterCertificate) {
            if (!formData.character_reason?.trim()) {
                errors.character_reason = 'সনদ গ্রহণের কারণ নির্বাচন করুন';
            }
        }

        // Validate all custom fields defined for this service
        customFieldsList.forEach((cf) => {
            const val = formData.extra_fields[cf.id];
            if (cf.required && (!val || !String(val).trim())) {
                errors[`field_${cf.id}`] = `${cf.label_bn || cf.id} পূরণ/নির্বাচন করা আবশ্যক`;
            }
        });

        setStepErrors(errors);
        if (Object.keys(errors).length > 0) {
            window.scrollTo({ top: 120, behavior: 'smooth' });
            alert('সেবা সম্পর্কিত প্রয়োজনীয় সকল তথ্য সঠিকভাবে পূরণ বা নির্বাচন করুন।');
        }
        return Object.keys(errors).length === 0;
    };

    // Step 3 Validation (Specific to Auto-Rickshaw vehicles details)
    const validateStep3 = () => {
        const errors = {};

        if (isAutoRickshaw) {
            if (!formData.chassis_no?.trim()) errors.chassis_no = 'গাড়ির চেসিস নম্বর (Chassis No) প্রদান আবশ্যক';
            if (!formData.vehicle_color?.trim()) errors.vehicle_color = 'গাড়ির রঙ উল্লেখ করুন';

            if (!uploadedDocs['vehicle_photo_front']) errors.vehicle_photo_front = 'গাড়ির সামনে থেকে ছবি আপলোড করুন';
            if (!uploadedDocs['vehicle_photo_rear']) errors.vehicle_photo_rear = 'গাড়ির পেছন থেকে ছবি আপলোড করুন';
            if (!uploadedDocs['vehicle_photo_side']) errors.vehicle_photo_side = 'গাড়ির পাশ থেকে ছবি আপলোড করুন';

            setStepErrors(errors);
            return Object.keys(errors).length === 0;
        }

        // For 4-step services, step 3 is documents
        return validateDocumentsStep();
    };

    // Document Validation
    const validateDocumentsStep = () => {
        const errors = {};
        requiredDocumentList.forEach((doc) => {
            // If already uploaded in step 1 or 2 or 3, skip checking
            if (doc.required && !uploadedDocs[doc.id]) {
                errors[doc.id] = `অনুগ্রহ করে '${doc.title}' আপলোড করুন (বাধ্যতামূলক)`;
            }
        });

        setStepErrors(errors);
        if (Object.keys(errors).length > 0) {
            alert('কিছু প্রয়োজনীয় ডকুমেন্ট এখনো আপলোড করা হয়নি। লাল চিহ্নিত ঘরগুলোতে ফাইল যুক্ত করুন।');
        }
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        if (currentStep === 3 && !validateStep3()) return;
        if (currentStep === 4 && isAutoRickshaw && !validateDocumentsStep()) return;

        setCurrentStep((prev) => Math.min(prev + 1, maxStep));
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!declarationChecked) {
            alert('আবেদন জমা দেওয়ার আগে অঙ্গীকারনামায় টিক চিহ্ন দিয়ে সম্মতি প্রদান করুন।');
            return;
        }

        setIsSubmitting(true);

        const payload = new FormData();
        payload.append('service_id', service.id);
        payload.append('applicant_name', formData.applicant_name);
        payload.append('applicant_phone', formData.applicant_phone);
        payload.append('applicant_email', formData.applicant_email || '');
        payload.append('applicant_nid', formData.applicant_nid);
        payload.append('gender', formData.gender);
        payload.append('marital_status', formData.marital_status);
        payload.append('husband_name', formData.husband_name || '');
        payload.append('father_or_husband_name', formData.father_or_husband_name);
        payload.append('mother_name', formData.mother_name || '—');
        payload.append('ward_no', formData.ward_no);
        payload.append('holding_no', formData.holding_no || '');
        payload.append('present_address', formData.present_address);
        payload.append('permanent_address', formData.permanent_address || formData.present_address);

        if (isTradeLicense) {
            payload.append('business_type_id', formData.business_type_id);
            payload.append('measurement_value', formData.measurement_value);
        }

        const extraData = {
            ...formData.extra_fields,
            birth_date: formData.birth_date,
            business_name: formData.business_name,
            business_capital: formData.business_capital,
            business_address: formData.business_address,
            character_reason: formData.character_reason,
            custom_reason: formData.custom_reason,
            property_area: formData.property_area,
            property_road: formData.property_road,
            building_type: formData.building_type,
            land_size: formData.land_size,
            floor_count: formData.floor_count,
            map_coordinates: `Lat: ${formData.map_lat}, Lng: ${formData.map_lng}`,
            map_address: formData.map_address,
            driving_license_no: formData.driving_license_no,
            license_expiry_date: formData.license_expiry_date,
            vehicle_type: formData.vehicle_type,
            previous_reg_no: formData.previous_reg_no,
            chassis_no: formData.chassis_no,
            vehicle_color: formData.vehicle_color,
        };

        Object.entries(extraData).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                payload.append(`form_data[${k}]`, v);
            }
        });

        Object.entries(uploadedDocs).forEach(([docKey, docItem]) => {
            if (docItem && docItem.file) {
                payload.append(`documents[${docKey}]`, docItem.file);
                payload.append(`document_titles[${docKey}]`, docItem.title);
            }
        });

        router.post('/applications', payload, {
            forceFormData: true,
            onError: (errs) => {
                setIsSubmitting(false);
                setStepErrors(errs);
                const firstErr = Object.values(errs)[0];
                alert('আবেদনে ত্রুটি রয়েছে: ' + (firstErr || 'সকল তথ্য ও ফাইল পুনরায় পরীক্ষা করুন।'));
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <MainLayout>
            <Head title={`অনলাইন আবেদন: ${service.name_bn} - খুলনা সেবা`} />

            {/* Header Banner */}
            <div className="bg-navy-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-navy-900 shadow-md">
                <div className="max-w-4xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                        <Shield className="w-3.5 h-3.5 text-teal-400" />
                        <span>ডিজিটাল নাগরিক আবেদন ব্যবস্থা • খুলনা সিটি কর্পোরেশন ও বিভাগীয় সেবা</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {service.name_bn}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {service.department?.name_bn || 'খুলনা সেবা কর্তৃপক্ষ'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            প্রক্রিয়াকরণ সময়: {service.estimated_days} কার্যদিবস
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-teal-300 font-bold">
                            সরকারি ফি: {parseFloat(service.fee_amount) > 0 ? `৳${Math.round(service.fee_amount)} টাকা` : 'বিনামূল্যে'}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 mt-2">
                        <Info className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>
                            <b>নাগরিকদের জন্য বিশেষ নির্দেশনা:</b> আবেদন দাখিলের পর যাচাই শেষে আপনার মোবাইলে ট্র্যাকিং নম্বর সহ এসএমএস পাঠানো হবে।
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Interactive Dynamic Progress Bar */}
                <div className="mb-8">
                    <div className={`grid gap-2.5 ${isAutoRickshaw ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                        {steps.map((st) => {
                            const IconComponent = st.icon;
                            const isCompleted = currentStep > st.num;
                            const isCurrent = currentStep === st.num;

                            return (
                                <div
                                    key={st.num}
                                    className={`p-3 rounded-2xl border transition relative overflow-hidden ${
                                        isCurrent
                                            ? 'bg-gov-700 text-white border-gov-700 shadow-md ring-2 ring-gov-600/30'
                                            : isCompleted
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                            : 'bg-white text-slate-400 border-slate-200 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                                                isCurrent
                                                    ? 'bg-white text-gov-800'
                                                    : isCompleted
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                                        </div>
                                        <div className="truncate">
                                            <span className="block font-bold text-xs truncate">{st.title}</span>
                                            <span className="block text-[10px] opacity-75 truncate">{st.subtitle}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                    {/* ================= STEP 1: Applicant / Driver Info ================= */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-gov-600" />
                                    <span>
                                        {isHolding ? '১. বাড়ির মালিকের ব্যক্তিগত তথ্য' : isAutoRickshaw ? '১. চালক বা মালিকের তথ্য' : '১. আবেদনকারীর পরিচিতি'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {auth.user ? 'লগইন একাউন্ট থেকে প্রাপ্ত তথ্য স্বয়ংক্রিয়ভাবে নিচে যুক্ত করা হয়েছে।' : 'সঠিক জাতীয় পরিচয়পত্র অনুযায়ী তথ্য পূরণ করুন।'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        {isHolding ? 'মালিকের পূর্ণ নাম' : isAutoRickshaw ? 'চালক/মালিকের পূর্ণ নাম' : 'পূর্ণ নাম'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.applicant_name}
                                        onChange={(e) => handleTextChange('applicant_name', e.target.value)}
                                        placeholder="উদা: মোঃ আব্দুর রহমান"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.applicant_name && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.applicant_name}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        মোবাইল নম্বর <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.applicant_phone}
                                        onChange={(e) => handleTextChange('applicant_phone', e.target.value)}
                                        placeholder="০১৭১১০০০০০১"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.applicant_phone && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.applicant_phone}</p>
                                    )}
                                </div>

                                {/* NID */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.applicant_nid}
                                        onChange={(e) => handleTextChange('applicant_nid', e.target.value)}
                                        placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.applicant_nid && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.applicant_nid}</p>
                                    )}
                                </div>

                                {/* Father's Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        পিতার নাম <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.father_or_husband_name}
                                        onChange={(e) => handleTextChange('father_or_husband_name', e.target.value)}
                                        placeholder="পিতার পূর্ণ নাম"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.father_or_husband_name && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.father_or_husband_name}</p>
                                    )}
                                </div>

                                {/* Mother's Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        মাতার নাম <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.mother_name}
                                        onChange={(e) => handleTextChange('mother_name', e.target.value)}
                                        placeholder="মাতার পূর্ণ নাম"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.mother_name && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.mother_name}</p>
                                    )}
                                </div>

                                {/* Gender Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        লিঙ্গ <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleTextChange('gender', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-gov-600"
                                    >
                                        <option value="male">পুরুষ</option>
                                        <option value="female">মহিলা</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>

                                {/* Marital Status Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        বৈবাহিক অবস্থা <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.marital_status}
                                        onChange={(e) => handleTextChange('marital_status', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-gov-600"
                                    >
                                        <option value="single">অবিবাহিত</option>
                                        <option value="married">বিবাহিত</option>
                                        <option value="widowed">বিধবা / বিপত্নীক</option>
                                        <option value="divorced">তালাকপ্রাপ্ত</option>
                                    </select>
                                    {stepErrors.marital_status && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.marital_status}</p>
                                    )}
                                </div>

                                {/* Husband's Name (If Married Female) */}
                                {formData.gender === 'female' && formData.marital_status === 'married' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            স্বামীর নাম <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.husband_name}
                                            onChange={(e) => handleTextChange('husband_name', e.target.value)}
                                            placeholder="স্বামীর পূর্ণ নাম"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                        />
                                        {stepErrors.husband_name && (
                                            <p className="text-xs text-rose-500 font-bold">{stepErrors.husband_name}</p>
                                        )}
                                    </div>
                                )}

                                {/* Date of Birth for Auto Rickshaw */}
                                {isAutoRickshaw && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            চালকের জন্ম তারিখ <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.birth_date}
                                            onChange={(e) => handleTextChange('birth_date', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                        />
                                        {stepErrors.birth_date && (
                                            <p className="text-xs text-rose-500 font-bold">{stepErrors.birth_date}</p>
                                        )}
                                    </div>
                                )}

                                {/* Ward */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        ওয়ার্ড নম্বর <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.ward_no}
                                        onChange={(e) => handleTextChange('ward_no', parseInt(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    >
                                        {wards.length > 0 ? (
                                            wards.map((w) => (
                                                <option key={w.id} value={w.ward_no}>
                                                    ওয়ার্ড নং {w.ward_no} ({w.name_bn || `ওয়ার্ড ${w.ward_no}`})
                                                </option>
                                            ))
                                        ) : (
                                            [...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    ওয়ার্ড নং {i + 1}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* Driver Photo Upload for Auto Rickshaw */}
                                {isAutoRickshaw && (
                                    <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    চালক বা মালিকের পাসপোর্ট সাইজ ছবি <span className="text-rose-500">*</span>
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    রঙিন স্পষ্ট ছবি (JPG বা PNG, অনূর্ধ্ব ১৫ MB)
                                                </span>
                                            </div>
                                            {uploadedDocs['driver_photo'] ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                                                        ছবি আপলোড হয়েছে ✓
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileRemove('driver_photo')}
                                                        className="p-1 text-rose-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="px-3 py-1.5 bg-gov-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm">
                                                    <Camera className="w-3.5 h-3.5" />
                                                    <span>ছবি যুক্ত করুন</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const f = e.target.files[0];
                                                            if (f) handleFileSelect('driver_photo', f, 'চালকের ছবি');
                                                        }}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {stepErrors.driver_photo && (
                                            <p className="text-xs text-rose-500 font-bold">{stepErrors.driver_photo}</p>
                                        )}
                                    </div>
                                )}

                                {/* Present Address */}
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        {isHolding ? 'মালিকের বর্তমান ঠিকানা' : 'বর্তমান ঠিকানা'} <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.present_address}
                                        onChange={(e) => handleTextChange('present_address', e.target.value)}
                                        placeholder="বাড়ি/হোল্ডিং, রোড, মহল্লা, থানা, জেলা"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.present_address && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.present_address}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 2: HOLDING PROPERTY OR AUTO DRIVING ================= */}
                    {currentStep === 2 && isHolding && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-gov-600" />
                                    <span>২. নতুন হোল্ডিং নম্বর বরাদ্দ সংক্রান্ত বাড়ির তথ্য ও ম্যাপ পিন</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    যে বাড়ি বা প্লটের জন্য নতুন হোল্ডিং নেওয়া হবে তার অবস্থান ও অবকাঠামোর তথ্য প্রদান করুন।
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        এলাকা / মহল্লা <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.property_area}
                                        onChange={(e) => handleTextChange('property_area', e.target.value)}
                                        placeholder="যেমন: সোনাডাঙ্গা আবাসিক এলাকা, ২য় ফেজ"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.property_area && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.property_area}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        রাস্তা / সড়কের নাম বা নম্বর <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.property_road}
                                        onChange={(e) => handleTextChange('property_road', e.target.value)}
                                        placeholder="যেমন: এম এ মজিদ সরণি, রোড নং ৫"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.property_road && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.property_road}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        বাড়ির ধরন (ব্যবহারের উদ্দেশ্য) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.building_type}
                                        onChange={(e) => handleTextChange('building_type', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-gov-600 font-bold"
                                    >
                                        <option value="আবাসিক">আবাসিক (শুধুমাত্র বসবাস)</option>
                                        <option value="বাণিজ্যিক">বাণিজ্যিক (দোকান/অফিস/শপিং)</option>
                                        <option value="আবাসিক ও বাণিজ্যিক (মিশ্র)">আবাসিক ও বাণিজ্যিক (মিশ্র)</option>
                                        <option value="শিল্প প্রতিষ্ঠান বা কারখানা">শিল্প প্রতিষ্ঠান বা কারখানা</option>
                                        <option value="খালি প্লট / সীমানা প্রাচীর">খালি প্লট / সীমানা প্রাচীর</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        জমির আকার / আয়তন <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.land_size}
                                        onChange={(e) => handleTextChange('land_size', e.target.value)}
                                        placeholder="উদা: ৪.৫ শতাংশ বা ২.৫ কাঠা / ২১০০ বর্গফুট"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.land_size && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.land_size}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        ভবনের তলা সংখ্যা (Floor Count) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {[
                                            '১ তলা (একতলা)',
                                            '২ তলা (দোতলা)',
                                            '৩ তলা',
                                            '৪ তলা',
                                            '৫ তলা',
                                            'বহুতল (৬ তলা বা তদুর্ধ্ব)',
                                        ].map((fl) => (
                                            <button
                                                key={fl}
                                                type="button"
                                                onClick={() => handleTextChange('floor_count', fl)}
                                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                                                    formData.floor_count === fl
                                                        ? 'bg-gov-700 text-white border-gov-700 shadow-sm'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span>{fl}</span>
                                                {formData.floor_count === fl && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Interactive Map Pin Box */}
                                <div className="md:col-span-2 p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-teal-950 font-extrabold text-xs">
                                            <MapPin className="w-4 h-4 text-teal-700" />
                                            <span>ম্যাপে বাড়ির সঠিক পিন অবস্থান (Location Pin)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGetGPSLocation}
                                            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            <span>আমার বর্তমান জিপিএস লোকেশন নিন</span>
                                        </button>
                                    </div>

                                    {/* Mock Interactive Map Pin Area */}
                                    <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px] border border-teal-300">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700">
                                                খুলনা সিটি কর্পোরেশন জিআইএস গ্রিড
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-300">
                                                স্থানাঙ্ক: {formData.map_lat}° N, {formData.map_lng}° E
                                            </span>
                                        </div>

                                        <div className="my-3 z-10 flex items-center justify-center gap-2">
                                            <span className="p-2 rounded-full bg-rose-600 text-white shadow-lg animate-bounce">
                                                <MapPin className="w-5 h-5" />
                                            </span>
                                            <div className="bg-black/60 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/30">
                                                {formData.map_address}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between z-10 text-[10px] text-slate-400">
                                            <span>দ্রুত লোকেশন সেট করুন:</span>
                                            <div className="flex gap-1.5">
                                                {[
                                                    { name: 'সোনাডাঙ্গা', lat: '22.8214', lng: '89.5422' },
                                                    { name: 'খালিশপুর', lat: '22.8631', lng: '89.5312' },
                                                    { name: 'রয়্যাল মোড়', lat: '22.8123', lng: '89.5614' },
                                                    { name: 'দৌলতপুর', lat: '22.8854', lng: '89.5187' },
                                                ].map((loc) => (
                                                    <button
                                                        key={loc.name}
                                                        type="button"
                                                        onClick={() => handlePickLocation(loc.name, loc.lat, loc.lng)}
                                                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                                                    >
                                                        {loc.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-teal-800">
                                        * কেসিসি রাজস্ব পরিদর্শক এই পিন লোকেশন অনুযায়ী সরেজমিনে পরিদর্শন করে হোল্ডিং চূড়ান্ত করবেন।
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 2: AUTO RICKSHAW - DRIVING LICENSE ================= */}
                    {currentStep === 2 && isAutoRickshaw && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gov-600" />
                                    <span>২. চালকের ড্রাইভিং লাইসেন্স তথ্য ও কপি</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    বিআরটিএ (BRTA) কর্তৃক অনুমোদিত বৈধ ড্রাইভিং লাইসেন্সের তথ্য প্রদান ও কপি আপলোড করুন।
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        ড্রাইভিং লাইসেন্স নম্বর (BRTA) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.driving_license_no}
                                        onChange={(e) => handleTextChange('driving_license_no', e.target.value)}
                                        placeholder="উদা: DK0123456L বা KH0987654"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gov-600 uppercase"
                                    />
                                    {stepErrors.driving_license_no && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.driving_license_no}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        লাইসেন্সের মেয়াদোত্তীর্ণের তারিখ
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.license_expiry_date}
                                        onChange={(e) => handleTextChange('license_expiry_date', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <div className="md:col-span-2 p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-sky-950 block">
                                                ড্রাইভিং লাইসেন্সের কপি আপলোড (উভয় পিঠ) <span className="text-rose-500">*</span>
                                            </span>
                                            <span className="text-[11px] text-sky-800">
                                                পিডিএফ বা স্পষ্ট রঙিন ছবি (সর্বোচ্চ ১৫ MB)
                                            </span>
                                        </div>

                                        {uploadedDocs['driving_license_file'] ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                                    <span>{uploadedDocs['driving_license_file'].name}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove('driving_license_file')}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm">
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>লাইসেন্স ফাইল আপলোড</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => {
                                                        const f = e.target.files[0];
                                                        if (f) handleFileSelect('driving_license_file', f, 'ড্রাইভিং লাইসেন্স কপি');
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {stepErrors.driving_license_file && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.driving_license_file}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 3: AUTO RICKSHAW - VEHICLE DETAILS & 3-ANGLE PHOTOS ================= */}
                    {currentStep === 3 && isAutoRickshaw && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-gov-600" />
                                    <span>৩. গাড়ির তথ্য ও ৩ দিকের ছবি (সামনে, পেছনে, পাশে)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    গাড়ির চেসিস নম্বর ও স্পেসিফিকেশন প্রদান করুন এবং ৩টি ভিন্ন অ্যাঙ্গেল থেকে স্পষ্ট ছবি আপলোড করুন।
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        অটোরিকশার ধরন <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.vehicle_type}
                                        onChange={(e) => handleTextChange('vehicle_type', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-bold focus:ring-2 focus:ring-gov-600"
                                    >
                                        <option value="ব্যাটারি চালিত ইজিবাইক">ব্যাটারি চালিত ইজিবাইক (৬ সিটার)</option>
                                        <option value="সিএনজি অটোরিকশা">সিএনজি ৪-স্ট্রোক অটোরিকশা</option>
                                        <option value="চার্জার মিশুক / টমটম">চার্জার মিশুক / টমটম</option>
                                        <option value="ইলেকট্রিক কার্গো ভ্যান">ইলেকট্রিক মালবাহী ভ্যান</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        চেসিস নম্বর (Chassis No) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.chassis_no}
                                        onChange={(e) => handleTextChange('chassis_no', e.target.value)}
                                        placeholder="উদা: CH-KCC-2026-98124"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gov-600 uppercase"
                                    />
                                    {stepErrors.chassis_no && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.chassis_no}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        পূর্বের রেজিস্ট্রেশন / প্লেট নং (যদি থাকে)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.previous_reg_no}
                                        onChange={(e) => handleTextChange('previous_reg_no', e.target.value)}
                                        placeholder="উদা: খুলনা মেট্রো-থ-১২৩৪"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                        গাড়ির বডি ও হুডের রঙ <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.vehicle_color}
                                        onChange={(e) => handleTextChange('vehicle_color', e.target.value)}
                                        placeholder="যেমন: সবুজ বডি ও হলুদ ছাদ"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                    />
                                    {stepErrors.vehicle_color && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.vehicle_color}</p>
                                    )}
                                </div>
                            </div>

                            {/* 3-Angle Vehicle Photos Upload Grid */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-gov-600" />
                                    <span>গাড়ির ৩ দিকের ছবি আপলোড (বাধ্যতামূলক)</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'vehicle_photo_front', label: '১. সামনে থেকে ছবি (Front View)', desc: 'সামনের হেডলাইট ও উইন্ডশিল্ড' },
                                        { id: 'vehicle_photo_rear', label: '২. পেছন থেকে ছবি (Rear View)', desc: 'পেছনের বডি ও চাকা স্পষ্ট' },
                                        { id: 'vehicle_photo_side', label: '৩. পাশ থেকে ছবি (Side View)', desc: 'পুরো সাইড প্রোফাইল স্পষ্ট' },
                                    ].map((angle) => {
                                        const uploaded = uploadedDocs[angle.id];
                                        return (
                                            <div
                                                key={angle.id}
                                                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                                                    uploaded
                                                        ? 'bg-emerald-50/70 border-emerald-300'
                                                        : stepErrors[angle.id]
                                                        ? 'bg-rose-50 border-rose-300'
                                                        : 'bg-slate-50 border-slate-200'
                                                }`}
                                            >
                                                <div className="font-bold text-xs text-slate-800">{angle.label}</div>
                                                <div className="text-[10px] text-slate-500">{angle.desc}</div>

                                                {uploaded ? (
                                                    <div className="space-y-1.5 pt-1">
                                                        <span className="text-xs font-bold text-emerald-800 block truncate">
                                                            ✓ {uploaded.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFileRemove(angle.id)}
                                                            className="text-[11px] font-bold text-rose-600 hover:underline"
                                                        >
                                                            মুছে পরিবর্তন করুন
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="inline-block mt-1 px-3 py-1.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold cursor-pointer transition shadow-2xs">
                                                        <span>ছবি আপলোড</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const f = e.target.files[0];
                                                                if (f) handleFileSelect(angle.id, f, angle.label);
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}

                                                {stepErrors[angle.id] && (
                                                    <p className="text-[10px] text-rose-500 font-bold">{stepErrors[angle.id]}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= GENERIC STEP 2 (FOR OTHER SERVICES) ================= */}
                    {currentStep === 2 && !isHolding && !isAutoRickshaw && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-gov-600" />
                                    <span>২. সেবা সম্পর্কিত নির্দিষ্ট তথ্য বিবরণী</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    এই সেবার জন্য প্রয়োজনীয় নির্দিষ্ট বিবরণ ও তথ্যসমূহ নিচে নির্ভুলভাবে প্রদান বা নির্বাচন করুন।
                                </p>
                            </div>

                            {/* Character Certificate: Reason Dropdown Only Once */}
                            {isCharacterCertificate && (
                                <div className="space-y-1.5 max-w-xl">
                                    <label className="text-xs font-bold text-slate-700">
                                        সনদ গ্রহণের কারণ <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.character_reason}
                                        onChange={(e) => handleTextChange('character_reason', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-gov-600"
                                    >
                                        <option value="">-- সনদ গ্রহণের কারণ নির্বাচন করুন --</option>
                                        {characterReasons.map((r) => (
                                            <option key={r.id} value={r.reason_bn}>
                                                {r.reason_bn}
                                            </option>
                                        ))}
                                    </select>
                                    {stepErrors.character_reason && (
                                        <p className="text-xs text-rose-500 font-bold">{stepErrors.character_reason}</p>
                                    )}
                                </div>
                            )}

                            {/* Dynamic Service Fields (Includes Dropdowns for Business Type & Custom Fields) */}
                            {customFieldsList.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                    {customFieldsList.map((cf) => (
                                        <div key={cf.id} className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700">
                                                {cf.label_bn || cf.id} {cf.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            {cf.type === 'select' || (cf.optionsList && cf.optionsList.length > 0) ? (
                                                <select
                                                    value={formData.extra_fields[cf.id] ?? ''}
                                                    onChange={(e) => handleExtraFieldChange(cf.id, e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-gov-600"
                                                >
                                                    <option value="">-- নির্বাচন করুন --</option>
                                                    {cf.optionsList.map((opt, i) => (
                                                        <option key={i} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={cf.type || 'text'}
                                                    value={formData.extra_fields[cf.id] ?? ''}
                                                    onChange={(e) => handleExtraFieldChange(cf.id, e.target.value)}
                                                    placeholder={`${cf.label_bn} লিখুন`}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600"
                                                />
                                            )}
                                            {stepErrors[`field_${cf.id}`] && (
                                                <p className="text-xs text-rose-500 font-bold">{stepErrors[`field_${cf.id}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= DOCUMENTS STEP (STEP 3 FOR 4-STEP, STEP 4 FOR AUTO-RICKSHAW) ================= */}
                    {((currentStep === 3 && !isAutoRickshaw) || (currentStep === 4 && isAutoRickshaw)) && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-gov-600" />
                                    <span>
                                        {isAutoRickshaw ? '৪. প্রয়োজনীয় কাগজপত্র ও সনদপত্র' : '৩. প্রয়োজনীয় কাগজপত্র আপলোড'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    অনুমোদিত ফাইল ফরম্যাট: PDF, JPG, PNG, WEBP (সর্বোচ্চ ১৫ MB)। লাল তারকা (<span className="text-rose-500">*</span>) চিহ্নিত ফাইল আবশ্যক।
                                </p>
                            </div>

                            <div className="space-y-4">
                                {requiredDocumentList
                                    .filter((doc) => {
                                        // For Auto Rickshaw, driving license and driver photo are uploaded in earlier steps
                                        if (isAutoRickshaw && (doc.id === 'driver_photo' || doc.id === 'driving_license_file' || doc.id.startsWith('vehicle_photo_'))) {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((doc) => {
                                        const isUploaded = Boolean(uploadedDocs[doc.id]);
                                        const fileData = uploadedDocs[doc.id];
                                        const hasError = Boolean(stepErrors[doc.id]);

                                        return (
                                            <div
                                                key={doc.id}
                                                className={`p-4 rounded-2xl border transition ${
                                                    isUploaded
                                                        ? 'bg-emerald-50/70 border-emerald-300'
                                                        : hasError
                                                        ? 'bg-rose-50/80 border-rose-300'
                                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                                            <FileText className={`w-4 h-4 ${isUploaded ? 'text-emerald-700' : 'text-gov-600'}`} />
                                                            <span>{doc.title}</span>
                                                            {doc.required ? (
                                                                <span className="text-rose-500 font-extrabold">*</span>
                                                            ) : (
                                                                <span className="text-slate-400 font-normal text-[11px]">(ঐচ্ছিক)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500">
                                                            {doc.hint}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {isUploaded ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                                                    <span className="max-w-[180px] sm:max-w-xs truncate">{fileData.name} ({formatFileSize(fileData.size)})</span>
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFileRemove(doc.id)}
                                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label className="px-4 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>ফাইল যুক্ত করুন</span>
                                                                <input
                                                                    type="file"
                                                                    accept={doc.accept}
                                                                    onChange={(e) => {
                                                                        const f = e.target.files[0];
                                                                        if (f) handleFileSelect(doc.id, f, doc.title);
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasError && (
                                                    <p className="text-xs text-rose-600 font-bold mt-2">
                                                        {stepErrors[doc.id]}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* ================= FINAL STEP: REVIEW & SUBMIT ================= */}
                    {currentStep === maxStep && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-emerald-600" />
                                    <span>
                                        {isAutoRickshaw ? '৫. আবেদন পর্যালোচনা ও চূড়ান্ত দাখিল' : '৪. আবেদন পর্যালোচনা ও চূড়ান্ত দাখিল'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    দাখিল করার পূর্বে আপনার প্রদত্ত সকল তথ্য একনজরে মিলিয়ে নিন।
                                </p>
                            </div>

                            {/* Section 1: Personal Summary */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-gov-600" />
                                        <span>১. পরিচিতি ও যোগাযোগের তথ্য</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>সম্পাদনা</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-500 block">নাম:</span>
                                        <span className="font-bold text-slate-800">{formData.applicant_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">মোবাইল:</span>
                                        <span className="font-bold text-slate-800 font-mono">{formData.applicant_phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">জাতীয় পরিচয়পত্র:</span>
                                        <span className="font-bold text-slate-800 font-mono">{formData.applicant_nid}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">পিতার নাম:</span>
                                        <span className="font-bold text-slate-800">{formData.father_or_husband_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">ওয়ার্ড নং:</span>
                                        <span className="font-bold text-slate-800">ওয়ার্ড {formData.ward_no}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500 block">বর্তমান ঠিকানা:</span>
                                        <span className="font-semibold text-slate-800">{formData.present_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Service Specific Review */}
                            {isHolding && (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-gov-600" />
                                            <span>২. বাড়ির বিবরণ ও অবস্থান</span>
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>সম্পাদনা</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-500 block">এলাকা / মহল্লা:</span>
                                            <span className="font-bold text-slate-800">{formData.property_area}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">রাস্তা / সড়ক:</span>
                                            <span className="font-bold text-slate-800">{formData.property_road}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">বাড়ির ধরন:</span>
                                            <span className="font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                                                {formData.building_type}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">জমির আকার:</span>
                                            <span className="font-bold text-slate-800">{formData.land_size}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">তলা সংখ্যা:</span>
                                            <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                {formData.floor_count}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-slate-500 block">ম্যাপ পিন লোকেশন:</span>
                                            <span className="font-mono text-xs text-teal-900 bg-teal-100/60 px-2 py-0.5 rounded inline-block">
                                                📍 {formData.map_address} ({formData.map_lat}, {formData.map_lng})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isAutoRickshaw && (
                                <div className="space-y-4">
                                    {/* Driving License Summary */}
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                            <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                                <CreditCard className="w-4 h-4 text-gov-600" />
                                                <span>২. ড্রাইভিং লাইসেন্স তথ্য</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>সম্পাদনা</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-500 block">ড্রাইভিং লাইসেন্স নম্বর:</span>
                                                <span className="font-extrabold font-mono text-slate-800">{formData.driving_license_no}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">মেয়াদের তারিখ:</span>
                                                <span className="font-bold text-slate-800">{formData.license_expiry_date || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Summary */}
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                            <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                                <Truck className="w-4 h-4 text-gov-600" />
                                                <span>৩. গাড়ির বিবরণ ও ৩ দিকের ছবি</span>
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>সম্পাদনা</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-500 block">অটোরিকশার ধরন:</span>
                                                <span className="font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                                                    {formData.vehicle_type}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">চেসিস নম্বর:</span>
                                                <span className="font-extrabold font-mono text-slate-800">{formData.chassis_no}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">গাড়ির রঙ:</span>
                                                <span className="font-bold text-slate-800">{formData.vehicle_color}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Uploaded Documents Summary */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                        <Upload className="w-4 h-4 text-gov-600" />
                                        <span>সংযুক্ত সকল কাগজপত্র ({Object.keys(uploadedDocs).length} টি ফাইল)</span>
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {Object.entries(uploadedDocs).map(([docId, docItem]) => (
                                        <div key={docId} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                                            <div className="flex items-center gap-2 truncate">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <div className="truncate">
                                                    <span className="font-bold block text-slate-800 truncate">{docItem.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{docItem.name} ({formatFileSize(docItem.size)})</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Declaration */}
                            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={declarationChecked}
                                        onChange={(e) => setDeclarationChecked(e.target.checked)}
                                        className="mt-1 rounded text-gov-700 focus:ring-gov-600 w-4 h-4"
                                    />
                                    <span className="text-xs text-teal-950 leading-relaxed font-semibold">
                                        আমি সজ্ঞানে ঘোষণা করিতেছি যে, এই আবেদনে প্রদত্ত সকল তথ্য, দলিল ও গাড়ির ছবি সম্পূর্ণ সত্য ও সঠিক। ভবিষ্যতে কোনো তথ্য বা নথি ভুল প্রমাণিত হইলে কর্তৃপক্ষ এই আবেদন ও লাইসেন্স বাতিল করার ক্ষমতা সংরক্ষণ করিবে।
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>পূর্ববর্তী ধাপ</span>
                            </button>
                        ) : (
                            <Link
                                href="/services"
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>বাতিল ও ফিরে যান</span>
                            </Link>
                        )}

                        {currentStep < maxStep ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>পরবর্তী ধাপ</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting || !declarationChecked}
                                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isSubmitting ? 'দাখিল হচ্ছে...' : 'চূড়ান্ত আবেদন দাখিল করুন'}</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
