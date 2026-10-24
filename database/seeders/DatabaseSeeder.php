<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\Ward;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\Application;
use App\Models\ApplicationTimeline;
use App\Models\Complaint;
use App\Models\ComplaintTimeline;
use App\Models\Payment;
use App\Models\Notice;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Departments
        $revenue = Department::create([
            'name' => 'Revenue Department',
            'name_bn' => 'রাজস্ব ও কর আদায় বিভাগ',
            'code' => 'REV',
            'description_bn' => 'হোল্ডিং ট্যাক্স, ট্রেড লাইসেন্স ও বিজ্ঞাপনী কর পরিচালনা',
            'icon' => 'ReceiptText',
            'email' => 'revenue@khulnacity.gov.bd',
            'phone' => '০৪১-৭২০১০০',
            'is_active' => true,
        ]);

        $engineering = Department::create([
            'name' => 'Engineering Department',
            'name_bn' => 'প্রকৌশল ও ড্রেনেজ বিভাগ',
            'code' => 'ENG',
            'description_bn' => 'রাস্তাঘাট, কালভার্ট, ড্রেনেজ ব্যবস্থা ও অবকাঠামো উন্নয়ন',
            'icon' => 'HardHat',
            'email' => 'engineering@khulnacity.gov.bd',
            'phone' => '০৪১-৭২০১০১',
            'is_active' => true,
        ]);

        $conservancy = Department::create([
            'name' => 'Conservancy Department',
            'name_bn' => 'বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা বিভাগ',
            'code' => 'CON',
            'description_bn' => 'দৈনিক বর্জ্য অপসারণ, নালা-নর্দমা পরিষ্কার ও মশক নিধন',
            'icon' => 'Trash2',
            'email' => 'clean@khulnacity.gov.bd',
            'phone' => '০৪১-৭২০১০২',
            'is_active' => true,
        ]);

        $electrical = Department::create([
            'name' => 'Electrical Department',
            'name_bn' => 'বিদ্যুৎ ও সড়ক বাতি শাখা',
            'code' => 'ELE',
            'description_bn' => 'নগরের সড়ক বাতি সচল রাখা ও বৈদ্যুতিক ব্যবস্থাপনা',
            'icon' => 'Lightbulb',
            'email' => 'electric@khulnacity.gov.bd',
            'phone' => '০৪১-৭২০১০৩',
            'is_active' => true,
        ]);

        $health = Department::create([
            'name' => 'Health & Sanitation',
            'name_bn' => 'স্বাস্থ্য ও পরিবার পরিকল্পনা বিভাগ',
            'code' => 'HLT',
            'description_bn' => 'স্বাস্থ্য সেবা, টিকাদান ও স্যানিটেশন তদারকি',
            'icon' => 'HeartPulse',
            'email' => 'health@khulnacity.gov.bd',
            'phone' => '০৪১-৭২০১০৪',
            'is_active' => true,
        ]);

        // 2. Wards (Key wards of Khulna City Corporation)
        $wardsData = [
            ['ward_no' => 1, 'councillor' => 'মোহাম্মদ আলী', 'phone' => '০১৭১১-০০০১০১', 'office' => 'দৌলতপুর বাজার রোড, খুলনা', 'area' => 'দৌলতপুর, মহেশ্বরপাশা উত্তর'],
            ['ward_no' => 2, 'councillor' => 'এস এম রফিকুল ইসলাম', 'phone' => '০১৭১১-০০০১০২', 'office' => 'মহেশ্বরপাশা পশ্চিম রোড, খুলনা', 'area' => 'মহেশ্বরপাশা দক্ষিণ, কুয়েট সংলগ্ন'],
            ['ward_no' => 10, 'councillor' => 'কাজী শফিকুল ইসলাম', 'phone' => '০১৭১১-০০০১১০', 'office' => 'খালিশপুর রোড, খুলনা', 'area' => 'খালিশপুর হাউজিং এস্টেট'],
            ['ward_no' => 17, 'councillor' => 'শেখ হাফিজুর রহমান', 'phone' => '০১৭১১-০০০১১৭', 'office' => 'সোনাডাঙ্গা বাস স্ট্যান্ড মোড়, খুলনা', 'area' => 'সোনাডাঙ্গা আ/এ, এম এ মজিদ সরণি'],
            ['ward_no' => 21, 'councillor' => 'মো: ইকবাল হোসেন', 'phone' => '০১৭১১-০০০১২১', 'office' => 'রয়েল মোড়, খুলনা', 'area' => 'শান্তিদাম মোড়, রিকশা স্ট্যান্ড'],
            ['ward_no' => 24, 'councillor' => 'এমডি জাহাঙ্গীর হোসেন', 'phone' => '০১৭১১-০০০১২৪', 'office' => 'রূপসা ঘাট রোড, খুলনা', 'area' => 'রূপসা ট্রাফিক মোড়, নতুন বাজার'],
            ['ward_no' => 31, 'councillor' => 'আবুল কালাম আজাদ', 'phone' => '০১৭১১-০০০১৩১', 'office' => 'লবণচরা মেইন রোড, খুলনা', 'area' => 'লবণচরা, মোক্তার হোসেন রোড'],
        ];

        foreach ($wardsData as $w) {
            Ward::create([
                'ward_no' => $w['ward_no'],
                'councillor_name_bn' => $w['councillor'],
                'councillor_phone' => $w['phone'],
                'office_address_bn' => $w['office'],
                'area_coverage_bn' => $w['area'],
            ]);
        }

        // 3. Users with Roles
        $superAdmin = User::create([
            'name' => 'প্রধান নির্বাহী কর্মকর্তা (Super Admin)',
            'email' => 'admin@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'phone' => '01711123456',
            'designation' => 'সিস্টেম অ্যাডমিনিস্ট্রেটর ও সিইও',
            'ward_no' => '21',
            'address' => 'কেসিসি প্রধান কার্যালয়, খুলনা',
        ]);

        $deptAdmin = User::create([
            'name' => 'তারেক মাহমুদ (নির্বাহী প্রকৌশলী)',
            'email' => 'deptadmin@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'department_admin',
            'phone' => '01712234567',
            'department_id' => $engineering->id,
            'designation' => 'নির্বাহী প্রকৌশলী (Engineering)',
            'ward_no' => '17',
            'address' => 'সোনাডাঙ্গা, খুলনা',
        ]);

        $officer = User::create([
            'name' => 'নজরুল ইসলাম (রাজস্ব কর্মকর্তা)',
            'email' => 'officer@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'reviewing_officer',
            'phone' => '01713345678',
            'department_id' => $revenue->id,
            'designation' => 'লাইসেন্স ও রাজস্ব পরিদর্শক',
            'ward_no' => '21',
            'address' => 'রূপসা, খুলনা',
        ]);
        
        $accounts = User::create([
            'name' => 'রেজাউল করিম (হিসাবরক্ষণ কর্মকর্তা)',
            'email' => 'accounts@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'accounts_officer',
            'phone' => '01714456789',
            'department_id' => $revenue->id,
            'designation' => 'চিফ একাউন্টস অফিসার',
            'ward_no' => '21',
            'address' => 'কেসিসি ভবন, খুলনা',
        ]);

        $complaintOfficer = User::create([
            'name' => 'ফারহানা ইয়াসমিন (অভিযোগ নিষ্পত্তি কর্মকর্তা)',
            'email' => 'complaints@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'complaint_officer',
            'phone' => '01715567890',
            'department_id' => $conservancy->id,
            'designation' => 'পাবলিক গ্রিভেন্স রিড্রেসাল অফিসার',
            'ward_no' => '17',
            'address' => 'সোনাডাঙ্গা, খুলনা',
        ]);

        $helpdesk = User::create([
            'name' => 'তানভীর আহমেদ (হেল্পডেস্ক অপারেটর)',
            'email' => 'helpdesk@khulnacity.gov.bd',
            'password' => Hash::make('password123'),
            'role' => 'helpdesk',
            'phone' => '01678987654',
            'designation' => 'সিটিজেন কেয়ার অপারেটর',
            'ward_no' => '21',
            'address' => 'হেল্পডেস্ক বুথ, কেসিসি',
        ]);

        $citizen = User::create([
            'name' => 'মোহাম্মদ রফিকুল ইসলাম',
            'email' => 'citizen@example.com',
            'password' => Hash::make('password123'),
            'role' => 'citizen',
            'phone' => '01711000001',
            'nid' => '19900112345678901',
            'ward_no' => '17',
            'address' => 'বাসা নং ১২, রোড নং ৩, সোনাডাঙ্গা আ/এ, খুলনা',
        ]);

        // 4. Service Categories
        $catTrade = ServiceCategory::create([
            'name' => 'Trade License & Business',
            'name_bn' => 'ট্রেড লাইসেন্স ও ব্যবসা বাণিজ্য',
            'slug' => 'trade-license',
            'icon' => 'Briefcase',
            'description_bn' => 'নতুন ট্রেড লাইসেন্স আবেদন, বার্ষিক নবায়ন, মালিকানা ও ঠিকানা সংশোধন',
            'display_order' => 1,
        ]);

        $catTax = ServiceCategory::create([
            'name' => 'Holding Tax & Assessment',
            'name_bn' => 'হোল্ডিং ট্যাক্স ও মূল্যায়ন',
            'slug' => 'holding-tax',
            'icon' => 'Home',
            'description_bn' => 'হোল্ডিং ট্যাক্স অনুসন্ধান, বকেয়া পরিশোধ, হোল্ডিং নামজারি ও কর পুনঃমূল্যায়ন',
            'display_order' => 2,
        ]);

        $catCert = ServiceCategory::create([
            'name' => 'Citizen Certificates',
            'name_bn' => 'নাগরিক ও চারিত্রিক সনদপত্র',
            'slug' => 'citizen-certificates',
            'icon' => 'Award',
            'description_bn' => 'নাগরিকত্ব সনদ, চারিত্রিক সনদ, অবিবাহিত সনদ ও উত্তরাধিকার সনদ',
            'display_order' => 3,
        ]);

        $catBirth = ServiceCategory::create([
            'name' => 'Birth & Death Registration Guide',
            'name_bn' => 'জন্ম ও মৃত্যু নিবন্ধন গাইড ও ট্র্যাকিং',
            'slug' => 'birth-death-registration',
            'icon' => 'FileText',
            'description_bn' => 'সরকারি কেন্দ্রীয় সিস্টেমে জন্ম/মৃত্যু নিবন্ধন সংক্রান্ত সহায়তা ও গাইডলাইন',
            'display_order' => 4,
        ]);

        $catRoad = ServiceCategory::create([
            'name' => 'Road, Drainage & Infrastructure',
            'name_bn' => 'সড়ক মেরামত ও ড্রেনেজ সমস্যা',
            'slug' => 'roads-and-drainage',
            'icon' => 'Wrench',
            'description_bn' => 'ভাঙা রাস্তা সংস্কারের আবেদন, ড্রেনের স্লাব মেরামত ও জলাবদ্ধতা নিরসন',
            'display_order' => 5,
        ]);

        $catWaste = ServiceCategory::create([
            'name' => 'Waste & Sanitation',
            'name_bn' => 'বর্জ্য অপসারণ ও পরিচ্ছন্নতা সেবা',
            'slug' => 'waste-management',
            'icon' => 'Trash2',
            'description_bn' => 'বাসাবাড়ির বর্জ্য সংগ্রহ, নালা পরিষ্কার ও মৃত প্রাণী অপসারণ অনুরোধ',
            'display_order' => 6,
        ]);

        $catLight = ServiceCategory::create([
            'name' => 'Street Lighting',
            'name_bn' => 'সড়ক বাতি ও বৈদ্যুতিক সেবা',
            'slug' => 'street-lights',
            'icon' => 'Lightbulb',
            'description_bn' => 'অচল সড়ক বাতি সচল করার আবেদন ও নতুন বাতি স্থাপন অনুরোধ',
            'display_order' => 7,
        ]);

        $catPermit = ServiceCategory::create([
            'name' => 'Permits & Signboards',
            'name_bn' => 'ভবন, সাইনবোর্ড ও বিশেষ অনুমতি',
            'slug' => 'permits-and-signboards',
            'icon' => 'FileCheck',
            'description_bn' => 'বাণিজ্যিক সাইনবোর্ড কর, রাস্তা খনন অনুমতি ও প্রদর্শনী ছাড়পত্র',
            'display_order' => 8,
        ]);

        // 5. Configurable Services
        // 5.1 New Trade License
        $tradeService = Service::create([
            'service_category_id' => $catTrade->id,
            'department_id' => $revenue->id,
            'name' => 'New Trade License Application',
            'name_bn' => 'নতুন ই-ট্রেড লাইসেন্স আবেদন',
            'slug' => 'new-trade-license',
            'short_description_bn' => 'খুলনা সিটি কর্পোরেশন এলাকায় যে কোনো বৈধ ব্যবসা বা পেশার জন্য নতুন ট্রেড লাইসেন্স গ্রহণ।',
            'description_bn' => 'সিটি কর্পোরেশন আদর্শ কর তফসিল অনুযায়ী সকল প্রকার ব্যবসা প্রতিষ্ঠান, দোকানপাট ও বাণিজ্যিক কার্যক্রমের জন্য বৈধ ট্রেড লাইসেন্স গ্রহণ করা বাধ্যতামূলক। সম্পূর্ণ অনলাইন প্রক্রিয়ায় আবেদন করুন এবং ডিজিটাল স্বাক্ষরযুক্ত লাইসেন্স ডাউনলোড করুন।',
            'eligibility_bn' => '১. আবেদনকারীকে বাংলাদেশের নাগরিক হতে হবে এবং বয়স কমপক্ষে ১৮ বছর হতে হবে।\n২. খুলনা সিটি কর্পোরেশনের আওতাধীন এলাকায় নির্ধারিত বাণিজ্যিক বা অনুমোদিত ঠিকানা থাকতে হবে।\n৩. প্রযোজ্য ক্ষেত্রে পরিবেশ অধিদপ্তর, ফায়ার সার্ভিস বা ড্রাগ লাইসেন্সের ছাড়পত্র প্রয়োজন হতে পারে।',
            'required_documents_bn' => [
                'আবেদনকারীর পাসপোর্ট সাইজ ছবি (jpg/png)',
                'আবেদনকারীর জাতীয় পরিচয়পত্র (NID) কপি',
                'দোকান বা ব্যবসা প্রতিষ্ঠানের চুক্তিপত্র অথবা নিজস্ব জায়গার দলিল/হোল্ডিং ট্যাক্স রসিদ',
                'সীমিত কোম্পানি হলে মেমোরেন্ডাম ও ইনকর্পোরেশন সার্টিফিকেট',
                'অনুমোদিত ট্রেড নেম চালানের কপি'
            ],
            'fee_amount' => 1500.00,
            'fee_description_bn' => '১৫০০ টাকা (ভ্যাট ও সাইনবোর্ড ফি প্রযোজ্য সাপেক্ষে পৃথক হতে পারে)',
            'estimated_days' => 3,
            'process_steps_bn' => [
                'অনলাইনে তথ্য ও প্রয়োজনীয় কাগজপত্র আপলোড করে আবেদন সাবমিট করুন',
                'লাইসেন্স পরিদর্শক কর্তৃক আবেদন যাচাই ও ফিল্ড ভেরিফিকেশন',
                'অনুমোদনের পর নির্ধারিত ফি ডিজিটাল পেমেন্ট করুন',
                'সরাসরি নাগরিক ড্যাশবোর্ড থেকে কিউআর কোডযুক্ত ডিজিটাল ট্রেড লাইসেন্স ডাউনলোড করুন'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => true,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'business_name', 'label_bn' => 'ব্যবসা বা প্রতিষ্ঠানের নাম', 'type' => 'text', 'required' => true],
                ['name' => 'business_type', 'label_bn' => 'ব্যবসার ধরন (যেমন: খুচরা, পাইকারি, তথ্যপ্রযুক্তি)', 'type' => 'select', 'options' => ['খুচরা ও জেনারেল স্টোর', 'তথ্যপ্রযুক্তি ও সফটওয়্যার', 'ফার্মেসি ও স্বাস্থ্যসেবা', 'রেস্তোরাঁ ও খাদ্যপণ্য', 'উৎপাদন ও কারখানা', 'অন্যান্য'], 'required' => true],
                ['name' => 'capital_amount', 'label_bn' => 'প্রারম্ভিক মূলধন (টাকা)', 'type' => 'number', 'required' => true],
                ['name' => 'signboard_size_sqft', 'label_bn' => 'দোকানের সাইনবোর্ডের মাপ (বর্গফুট)', 'type' => 'number', 'required' => false],
            ]
        ]);

        // 5.2 Trade License Renewal
        Service::create([
            'service_category_id' => $catTrade->id,
            'department_id' => $revenue->id,
            'name' => 'Trade License Renewal',
            'name_bn' => 'ট্রেড লাইসেন্স বাৎসরিক নবায়ন',
            'slug' => 'trade-license-renewal',
            'short_description_bn' => 'বিদ্যমান ট্রেড লাইসেন্স নম্বর প্রদান করে কোনো লাইন ছাড়া এক মিনিটেই বাৎসরিক নবায়ন করুন।',
            'description_bn' => 'প্রতি অর্থবছর শেষ হওয়ার পর সিটি কর্পোরেশনের ট্রেড লাইসেন্স নবায়ন করা আবশ্যক। অনলাইনে পূর্ববর্তী লাইসেন্স নম্বর যাচাই করে সরাসরি ফি পরিশোধ করে নবায়নকৃত লাইসেন্স গ্রহণ করা যায়।',
            'eligibility_bn' => 'কেসিসি কর্তৃক ইস্যুকৃত পূর্ববর্তী বৈধ ট্রেড লাইসেন্স নম্বর থাকতে হবে।',
            'required_documents_bn' => [
                'বিগত অর্থ বছরের মূল ট্রেড লাইসেন্স কপি',
                'সর্বশেষ অর্থ বছরের হোল্ডিং ট্যাক্স পরিশোধের রসিদ'
            ],
            'fee_amount' => 1200.00,
            'fee_description_bn' => '১২০০ টাকা (বকেয়া থাকলে সারচার্জ যুক্ত হবে)',
            'estimated_days' => 1,
            'process_steps_bn' => [
                'ট্রেড লাইসেন্স নম্বর দিন ও ডাটা যাচাই করুন',
                'অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে ফি পরিশোধ করুন',
                'নবায়নকৃত ডিজিটাল প্রত্যয়নপত্র ডাউনলোড করুন'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => true,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'previous_license_no', 'label_bn' => 'পূর্ববর্তী ট্রেড লাইসেন্স নম্বর', 'type' => 'text', 'required' => true],
                ['name' => 'financial_year', 'label_bn' => 'নবায়নকৃত অর্থবছর', 'type' => 'select', 'options' => ['২০২৬-২০২৭', '২০২৫-২০২৬'], 'required' => true],
            ]
        ]);

        // 5.3 Holding Tax Assessment & Payment
        $taxService = Service::create([
            'service_category_id' => $catTax->id,
            'department_id' => $revenue->id,
            'name' => 'Holding Tax Assessment & Clearance',
            'name_bn' => 'হোল্ডিং ট্যাক্স নির্ধারণ ও কর পরিশোধ',
            'slug' => 'holding-tax-payment',
            'short_description_bn' => 'হোল্ডিং নম্বর দ্বারা কর বকেয়া অনুসন্ধান, অনলাইন পেমেন্ট ও কর পরিশোধিত প্রত্যয়নপত্র গ্রহণ।',
            'description_bn' => 'খুলনা সিটি কর্পোরেশন এলাকার সকল আবাসিক, বাণিজ্যিক ও শিল্প ভবনের জন্য নির্ধারিত পৌরকর ঘরে বসেই বিকাশ, নগদ বা কার্ডের মাধ্যমে পরিশোধ করুন। তাৎক্ষণিক সরকারি রসিদ সংরক্ষণ করুন।',
            'eligibility_bn' => 'কেসিসি ওয়ার্ডের আওতাভুক্ত বৈধ হোল্ডিং নম্বরধারী ভবন মালিক বা ভাড়াটিয়া।',
            'required_documents_bn' => [
                'হোল্ডিং ট্যাক্স বই বা সর্বশেষ রসিদের ছবি',
                'মালিকানা পরিবর্তন হলে নামজারি কাগজ'
            ],
            'fee_amount' => 500.00,
            'fee_description_bn' => 'বাৎসরিক অ্যাসেসমেন্ট অনুযায়ী নির্ধারিত ট্যাক্স',
            'estimated_days' => 1,
            'process_steps_bn' => [
                'ওয়ার্ড নম্বর ও হোল্ডিং নম্বর প্রদান করুন',
                'চলতি ও বকেয়া ট্যাক্স বিবরণী দেখুন',
                'অনলাইনে পরিশোধ করে ডিজিটাল রসিদ প্রিন্ট করুন'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => true,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'holding_no_search', 'label_bn' => 'হোল্ডিং নম্বর', 'type' => 'text', 'required' => true],
                ['name' => 'building_type', 'label_bn' => 'ভবনের ব্যবহার', 'type' => 'select', 'options' => ['আবাসিক', 'বাণিজ্যিক', 'মিশ্র (আবাসিক ও দোকান)'], 'required' => true],
            ]
        ]);

        // 5.4 Citizen Certificate (Nagorik Sonod)
        $certService = Service::create([
            'service_category_id' => $catCert->id,
            'department_id' => $revenue->id,
            'name' => 'Citizen Certificate Application',
            'name_bn' => 'অনলাইন নাগরিকত্ব ও চারিত্রিক সনদপত্র',
            'slug' => 'nagorik-sonod',
            'short_description_bn' => 'ওয়ার্ড কাউন্সিলর কার্যালয় কর্তৃক অনুমোদিত ডিজিটাল নাগরিক সনদপত্র গ্রহণ।',
            'description_bn' => 'চাকরি, শিক্ষা প্রতিষ্ঠানে ভর্তি বা বিভিন্ন সরকারি কাজের জন্য খুলনা সিটি কর্পোরেশনের স্থায়ী বাসিন্দাদের নাগরিকত্ব ও চারিত্রিক সনদ অনলাইনে প্রদান করা হয়। কাউন্সিলরের ডিজিটাল স্বাক্ষরের পর প্রিন্টযোগ্য কপি পাওয়া যায়।',
            'eligibility_bn' => 'খুলনা সিটি কর্পোরেশনের সংশ্লিষ্ট ওয়ার্ডের স্থায়ী অথবা বৈধভাবে বসবাসরত বাসিন্দা হতে হবে।',
            'required_documents_bn' => [
                'আবেদনকারীর ১ কপি রঙিন ছবি',
                'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন সনদ',
                'বাসার বিদ্যুৎ বিল বা হোল্ডিং ট্যাক্স রসিদের কপি'
            ],
            'fee_amount' => 100.00,
            'fee_description_bn' => '১০০ টাকা সরকারি ফি',
            'estimated_days' => 2,
            'process_steps_bn' => [
                'নাগরিক তথ্য ও ওয়ার্ড নম্বর পূরণ করে আবেদন সাবমিট করুন',
                'কাউন্সিলর কার্যালয় থেকে সত্যতা যাচাই ও অনুমোদন',
                'অনুমোদন সম্পন্ন হলে এসএমএস নোটিফিকেশন ও সনদ ডাউনলোড'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => true,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'birth_date', 'label_bn' => 'জন্ম তারিখ', 'type' => 'date', 'required' => true],
                ['name' => 'reason_for_certificate', 'label_bn' => 'সনদ গ্রহণের কারণ', 'type' => 'text', 'required' => true],
                ['name' => 'marital_status', 'label_bn' => 'বৈবাহিক অবস্থা', 'type' => 'select', 'options' => ['অবিবাহিত', 'বিবাহিত', 'অন্যান্য'], 'required' => true],
            ]
        ]);

        // 5.5 Birth and Death Registration (Transparent External Gov Authority)
        Service::create([
            'service_category_id' => $catBirth->id,
            'department_id' => $health->id,
            'name' => 'Birth and Death Certificate Application Guide',
            'name_bn' => 'জন্ম ও মৃত্যু নিবন্ধন কেন্দ্রীয় পোর্টাল গাইড',
            'slug' => 'birth-death-central-portal',
            'short_description_bn' => 'রেজিস্ট্রার জেনারেলের কার্যালয়ের (bdris.gov.bd) কেন্দ্রীয় সিস্টেমে আবেদন নির্দেশিকা ও ওয়ার্ড কাউন্সিলর সহায়তা।',
            'description_bn' => 'আইন অনুযায়ী জন্ম ও মৃত্যু নিবন্ধন স্থানীয় সরকার বিভাগের জাতীয় ডাটাবেজে (BDRIS) সংরক্ষিত হয়। খুলনা সিটি কর্পোরেশনের সংশ্লিষ্ট ওয়ার্ড কাউন্সিলর অফিস স্থানীয় নিবন্ধকের দায়িত্ব পালন করে। এখান থেকে প্রয়োজনীয় নিয়মাবলী জেনে সরাসরি জাতীয় পোর্টালে আবেদন করতে পারবেন এবং স্থানীয় ওয়ার্ড অফিসে যোগাযোগের সহায়তা পাবেন।',
            'eligibility_bn' => 'খুলনা সিটি কর্পোরেশন এলাকায় জন্ম বা মৃত্যুর ক্ষেত্রে অথবা স্থায়ী বাসিন্দাগণের জন্য প্রযোজ্য।',
            'required_documents_bn' => [
                'হাসপাতাল বা ক্লিনিকের জন্ম সংক্রান্ত প্রত্যয়নপত্র (EPI কার্ড)',
                'পিতামাতার অনলাইন জন্ম নিবন্ধন সনদ ও NID',
                'হোল্ডিং ট্যাক্স পরিশোধের প্রমাণপত্র'
            ],
            'fee_amount' => 0.00,
            'fee_description_bn' => 'সরকারি বিধি মোতাবেক ৪৫ দিনের মধ্যে বিনামূল্যে, পরবর্তীতে নির্ধারিত ফি',
            'estimated_days' => 7,
            'process_steps_bn' => [
                'জাতীয় পোর্টালে (bdris.gov.bd) অনলাইনে আবেদন করুন',
                'আবেদন ফর্মের প্রিন্ট কপি নিয়ে প্রয়োজনীয় সনদসহ ওয়ার্ড অফিসে জমা দিন',
                'নিবন্ধক কর্মকর্তা যাচাই শেষে বায়োমেট্রিক ও সিলমোহরযুক্ত মূল সনদ প্রদান করবেন'
            ],
            'authority_type' => 'external_gov_link',
            'external_authority_name_bn' => 'রেজিস্ট্রার জেনারেলের কার্যালয়, জন্ম ও মৃত্যু নিবন্ধন (BDRIS)',
            'external_url' => 'https://bdris.gov.bd',
            'is_featured' => true,
            'is_active' => true,
        ]);

        // 5.6 Road Repair & Drainage
        Service::create([
            'service_category_id' => $catRoad->id,
            'department_id' => $engineering->id,
            'name' => 'Road Repair & Drain Construction Request',
            'name_bn' => 'রাস্তা সংস্কার ও ড্রেনেজ নির্মাণের আবেদন',
            'slug' => 'road-drain-repair-request',
            'short_description_bn' => 'এলাকার ভাঙা রাস্তা সংস্কার, স্লাব স্থাপন অথবা নতুন নর্দমা নির্মাণের জন্য নাগরিক আবেদন।',
            'description_bn' => 'এলাকাবাসীর দুর্ভোগ লাঘবে যে কোনো ক্ষতিগ্রস্ত সড়ক বা ড্রেনের তথ্য সরাসরি প্রকৌশল বিভাগে প্রেরণ করুন। সহকারী প্রকৌশলী সরেজমিনে পরিদর্শন করে প্রাক্কলন তৈরি করবেন।',
            'eligibility_bn' => 'খুলনা সিটি কর্পোরেশনের যে কোনো সচেতন নাগরিক বা এলাকাবাসীর পক্ষে আবেদন করা যাবে।',
            'required_documents_bn' => [
                'ক্ষতিগ্রস্ত সড়ক বা ড্রেনের স্পষ্ট ছবি',
                'এলাকাবাসীর যৌথ আবেদনের কপি (ঐচ্ছিক)'
            ],
            'fee_amount' => 0.00,
            'fee_description_bn' => 'সম্পূর্ণ বিনামূল্যে',
            'estimated_days' => 15,
            'process_steps_bn' => [
                'লোকেশন ও ছবিসহ আবেদন দাখিল',
                'প্রকৌশল দলের সরেজমিন পরিদর্শন ও মূল্যায়ন',
                'বার্ষিক উন্নয়ন বাজেট বা জরুরি ফান্ডে অন্তর্ভুক্তি'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => false,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'road_name', 'label_bn' => 'সড়ক বা গলির নাম', 'type' => 'text', 'required' => true],
                ['name' => 'approx_length', 'label_bn' => 'আনুমানিক ক্ষতিগ্রস্ত দৈর্ঘ্য (মিটার/ফুট)', 'type' => 'text', 'required' => false],
            ]
        ]);

        // 5.7 Street Lighting maintenance
        Service::create([
            'service_category_id' => $catLight->id,
            'department_id' => $electrical->id,
            'name' => 'Street Light Repair & Installation',
            'name_bn' => 'সড়ক বাতি মেরামত ও নতুন বাতি সংযোগ',
            'slug' => 'street-light-repair',
            'short_description_bn' => 'গলির বা প্রধান সড়কের অচল বাতি সচল করতে অনুরোধ জানান, ৪৮ ঘণ্টার মধ্যে সমাধান।',
            'description_bn' => 'রাত্রিকালীন নগরবাসীর নিরাপত্তা নিশ্চিত করতে অচল বাতি মেরামতে দ্রুত রেসপন্স টিম নিয়োজিত রয়েছে। পোলের নম্বর উল্লেখ করে আবেদন করুন।',
            'eligibility_bn' => 'খুলনা সিটি কর্পোরেশন এলাকার যে কোনো সড়ক বা গলির জন্য।',
            'required_documents_bn' => [
                'বৈদ্যুতিক পোলের ছবি বা অবস্থান নির্দেশক বিবরণ'
            ],
            'fee_amount' => 0.00,
            'fee_description_bn' => 'সম্পূর্ণ বিনামূল্যে',
            'estimated_days' => 2,
            'process_steps_bn' => [
                'পোল নম্বর ও ওয়ার্ড দিয়ে অনলাইনে আবেদন',
                'ইলেক্ট্রিক্যাল বিভাগের মোবাইল টিম প্রেরণ',
                'বাতি মেরামত ও স্টেটাস আপডেট'
            ],
            'authority_type' => 'city_corporation',
            'is_featured' => false,
            'is_active' => true,
            'form_fields' => [
                ['name' => 'pole_number', 'label_bn' => 'বিদ্যুতের খুঁটি বা পোল নম্বর (যদি থাকে)', 'type' => 'text', 'required' => false],
                ['name' => 'issue_type', 'label_bn' => 'সমস্যার ধরন', 'type' => 'select', 'options' => ['বাতি জ্বলে না', 'বাতি মিটমিট করে', 'তার ছিঁড়ে গেছে', 'নতুন বাতি প্রয়োজন'], 'required' => true],
            ]
        ]);

        // 6. Sample Application
        $app1 = Application::create([
            'tracking_id' => 'KCC-2026-10023',
            'service_id' => $tradeService->id,
            'user_id' => $citizen->id,
            'applicant_name' => 'মোহাম্মদ রফিকুল ইসলাম',
            'applicant_phone' => '০১৮১২-৩৪৫৬৭৮',
            'applicant_email' => 'citizen@example.com',
            'applicant_nid' => '১৯৯০০১১২৩৪৫৬৭৮৯০১',
            'father_or_husband_name' => 'মরহুম আব্দুল জলিল',
            'mother_name' => 'রাহেলা বেগম',
            'ward_no' => 17,
            'holding_no' => 'এইচ-৪৫/এ',
            'present_address' => 'বাসা নং ১২, রোড নং ৩, সোনাডাঙ্গা আ/এ, খুলনা',
            'permanent_address' => 'গ্রাম: বানিয়াখামার, থানা: সোনাডাঙ্গা, জেলা: খুলনা',
            'form_data' => [
                'business_name' => 'মেসার্স সুন্দরবন আইটি সল্যুশনস',
                'business_type' => 'তথ্যপ্রযুক্তি ও সফটওয়্যার',
                'capital_amount' => '৫০০০০০',
                'signboard_size_sqft' => '২৪',
            ],
            'status' => 'under_review',
            'status_note' => 'আপনার আবেদনটি প্রাথমিক যাচাই শেষে লাইসেন্স পরিদর্শক বরাবর ফিল্ড ভেরিফিকেশনের জন্য পাঠানো হয়েছে।',
            'assigned_to' => $officer->id,
            'fee_amount' => 1500.00,
            'payment_status' => 'paid',
            'submitted_at' => now()->subDays(2),
        ]);

        ApplicationTimeline::create([
            'application_id' => $app1->id,
            'user_id' => $citizen->id,
            'status' => 'submitted',
            'action_title' => 'আবেদন সফলভাবে দাখিল করা হয়েছে',
            'comment' => 'নাগরিক কর্তৃক প্রয়োজনীয় কাগজপত্রসহ আবেদন জমা প্রদান।',
            'created_at' => now()->subDays(2),
        ]);

        ApplicationTimeline::create([
            'application_id' => $app1->id,
            'user_id' => $officer->id,
            'status' => 'under_review',
            'action_title' => 'পর্যালোচনাধীন রয়েছে',
            'comment' => 'কাগজপত্র সঠিক পাওয়া গেছে। সরেজমিনে তদন্ত চলছে।',
            'created_at' => now()->subDay(),
        ]);

        // Sample Payment for app1
        Payment::create([
            'transaction_id' => 'TXN-KCC-' . strtoupper(bin2hex(random_bytes(4))),
            'application_id' => $app1->id,
            'user_id' => $citizen->id,
            'amount' => 1500.00,
            'currency' => 'BDT',
            'payment_method' => 'bkash',
            'gateway_trx_id' => 'BKS90321289',
            'status' => 'completed',
            'receipt_number' => 'REC-2026-00451',
            'purpose_bn' => 'নতুন ই-ট্রেড লাইসেন্স ফি',
            'paid_at' => now()->subDays(2),
        ]);

        // 7. Sample Civic Complaint
        $cmp1 = Complaint::create([
            'tracking_id' => 'CMP-2026-00842',
            'user_id' => $citizen->id,
            'citizen_name' => 'মোহাম্মদ রফিকুল ইসলাম',
            'citizen_phone' => '০১৮১২-৩৪৫৬৭৮',
            'citizen_email' => 'citizen@example.com',
            'category' => 'waterlogging',
            'ward_no' => 17,
            'location_landmark' => 'সোনাডাঙ্গা বাস টার্মিনালের পূর্ব পাশের ড্রেন সংলগ্ন গলি',
            'description' => 'গত ২ দিনের বৃষ্টিতে ড্রেন উপচে পুরো রাস্তায় হাঁটু পানি জমে গেছে। ময়লা-আবর্জনা জমে ড্রেনের মুখ বন্ধ হয়ে থাকায় পানি নামছে না। এলাকার মানুষের যাতায়াতে চরম দুর্ভোগ হচ্ছে।',
            'status' => 'action_in_progress',
            'priority' => 'high',
            'department_id' => $conservancy->id,
            'assigned_to' => $complaintOfficer->id,
            'internal_notes' => 'কনজারভেন্সি ইন্সপেক্টরকে জেসিবি এবং ক্লিনিং টিম নিয়ে ড্রেন পরিষ্কারের নির্দেশ দেওয়া হয়েছে।',
            'resolution_summary' => null,
            'assigned_at' => now()->subDay(),
        ]);

        ComplaintTimeline::create([
            'complaint_id' => $cmp1->id,
            'user_id' => $citizen->id,
            'status' => 'submitted',
            'action_title' => 'অভিযোগ দাখিল হয়েছে',
            'comment' => 'নাগরিক কর্তৃক অনলাইনে অভিযোগ নিবন্ধন সম্পন্ন।',
            'created_at' => now()->subDays(2),
        ]);

        ComplaintTimeline::create([
            'complaint_id' => $cmp1->id,
            'user_id' => $complaintOfficer->id,
            'status' => 'action_in_progress',
            'action_title' => 'কার্যক্রম চলমান রয়েছে',
            'comment' => 'কনজারভেন্সি টিম মাঠে কাজ করছে। দ্রুত পানি নিষ্কাশন সম্পন্ন হবে।',
            'created_at' => now()->subHours(6),
        ]);

        // 8. Public Notices & Announcements
        Notice::create([
            'title' => 'Holding Tax Rebate for Early Payment',
            'title_bn' => '২০২৬-২০২৭ অর্থবছরের হোল্ডিং ট্যাক্স অগ্রিম পরিশোধে ১০% বিশেষ রিবেট সুবিধা',
            'category' => 'tax',
            'content_bn' => 'খুলনা সিটি কর্পোরেশনের সম্মানিত সকল হোল্ডিং মালিকদের জানানো যাচ্ছে যে, আগামী ৩০ জুনের মধ্যে চলতি অর্থবছরের পৌরকর এককালীন অনলাইন বা ব্যাংকের মাধ্যমে পরিশোধ করলে ১০% বিশেষ ছাড় সুবিধা প্রদান করা হবে। যেকোনো ঝামেলা এড়াতে এখনই আপনার অনলাইন হোল্ডিং ট্যাক্স পরিশোধ করুন।',
            'is_pinned' => true,
            'is_published' => true,
            'published_at' => now()->subDays(3),
        ]);

        Notice::create([
            'title' => 'Cleanliness Drive in Ward 17 and 21',
            'title_bn' => 'সোনাডাঙ্গা ও রয়েল মোড় এলাকায় বিশেষ পরিচ্ছন্নতা ও মশক নিধন অভিযান',
            'category' => 'health',
            'content_bn' => 'ডেঙ্গু ও মশাবাহিত রোগ প্রতিরোধে খুলনা সিটি কর্পোরেশনের স্বাস্থ্য ও বর্জ্য ব্যবস্থাপনা বিভাগের যৌথ উদ্যোগে আগামী শনিবার থেকে সপ্তাহব্যাপী ক্র্যাশ প্রোগ্রাম পরিচালিত হবে। নগরবাসীকে বাড়ির আঙিনা পরিষ্কার রাখার অনুরোধ করা হচ্ছে।',
            'is_pinned' => false,
            'is_published' => true,
            'published_at' => now()->subDays(5),
        ]);

        Notice::create([
            'title' => 'Smart Khulna Digital Service Desk Open 24/7',
            'title_bn' => 'নাগরিক সেবা সহজীকরণে চালু হলো ২৪/৭ ডিজিটাল হেল্পলাইন ও ওয়ান স্টপ সার্ভিস ডেস্ক',
            'category' => 'general',
            'content_bn' => 'ঘরে বসে নাগরিক সেবা প্রাপ্তি নিশ্চিত করতে খুলনা সিটি কর্পোরেশন চালু করেছে পূর্ণাঙ্গ ডিজিটাল নাগরিক সেবা প্ল্যাটফর্ম। সেবা ও অভিযোগ ট্র্যাকিং সংক্রান্ত যেকোনো তথ্যের জন্য ১৬১৫২ নম্বরে সরাসরি যোগাযোগ করতে পারবেন।',
            'is_pinned' => true,
            'is_published' => true,
            'published_at' => now()->subDays(1),
        ]);
        if (isset($officer)) {
            $officer->assignedServices()->sync(Service::pluck('id'));
        }
    
        // ---------------------------------------------------------
        // 13. Sliders & Slider Settings Seeder
        // ---------------------------------------------------------
        \App\Models\SliderSetting::updateOrCreate(
            ['id' => 1],
            [
                'autoplay_seconds' => 3,
                'transition_effect' => 'fade',
                'show_indicators' => true,
                'show_arrows' => true,
                'is_enabled' => true,
            ]
        );

        $defaultSliders = [
            [
                'id' => 1,
                'title_bn' => 'রূপসা সেতু ও ঐতিহ্যবাহী নদী',
                'subtitle_bn' => 'খুলনা নগরীর প্রবেশদ্বার খান জাহান আলী (রূপসা) সেতুর গোধূলিবেলার নয়নাভিরাম সৌন্দর্য।',
                'image_path' => 'sliders/rupsha_bridge.jpg',
                'button_text_bn' => 'নাগরিক সেবা গ্রহণ করুন',
                'button_url' => '/services',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'title_bn' => 'বিশ্ব ঐতিহ্য সুন্দরবনের প্রবেশদ্বার',
                'subtitle_bn' => 'সবুজ শ্যামল প্রকৃতি ও পৃথিবীর সর্ববৃহৎ ম্যানগ্রোভ বনের অফুরন্ত প্রাকৃতিক বৈচিত্র্য।',
                'image_path' => 'sliders/sundarbans.jpg',
                'button_text_bn' => 'আমাদের সেবা সমূহ',
                'button_url' => '/services',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'title_bn' => 'ঐতিহাসিক শহীদ হাদিস পার্ক',
                'subtitle_bn' => 'খুলনা শহরের হৃদপিণ্ড—শান্ত লেক, স্মৃতিস্তম্ভ ও প্রস্ফুটিত পুষ্পশোভিত নগর উদ্যান।',
                'image_path' => 'sliders/hadis_park.jpg',
                'button_text_bn' => 'আবেদন ট্র্যাকিং',
                'button_url' => '/applications/track',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'id' => 4,
                'title_bn' => 'খুলনা সিটি কর্পোরেশন',
                'subtitle_bn' => 'আধুনিক, পরিচ্ছন্ন ও প্রযুক্তিনির্ভর স্মার্ট নাগরিক সেবার বিশ্বস্ত ঠিকানা।',
                'image_path' => 'sliders/city_corporation.jpg',
                'button_text_bn' => 'নাগরিক চার্টার দেখুন',
                'button_url' => '/services',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'id' => 5,
                'title_bn' => 'খাঁন জাহান আলীর পুণ্যভূমি',
                'subtitle_bn' => 'ঐতিহাসিক লাল ইটের টেরাকোটা স্থাপত্য ও শতাব্দী প্রাচীন ঐতিহ্যমণ্ডিত দীঘি।',
                'image_path' => 'sliders/khan_jahan_ali.jpg',
                'button_text_bn' => 'অভিযোগ দাখিল করুন',
                'button_url' => '/complaints/new',
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($defaultSliders as $slide) {
            \App\Models\Slider::updateOrCreate(['id' => $slide['id']], $slide);
        }
    }
}
