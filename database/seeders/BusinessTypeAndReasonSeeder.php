<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use App\Models\CharacterCertificateReason;
use Illuminate\Database\Seeder;

class BusinessTypeAndReasonSeeder extends Seeder
{
    public function run(): void
    {
        $businessTypes = [
            [
                'name_bn' => 'দোকান',
                'name_en' => 'Shop / Retail Store',
                'measurement_label_bn' => 'দোকানের সাইনবোর্ডের মাপ',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name_bn' => 'অফিস',
                'name_en' => 'Commercial Office',
                'measurement_label_bn' => 'অফিসের স্পেসের মাপ',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name_bn' => 'গুদাম',
                'name_en' => 'Warehouse / Godown',
                'measurement_label_bn' => 'গুদামের আয়তন',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'name_bn' => 'রেস্টুরেন্ট',
                'name_en' => 'Restaurant / Food Court',
                'measurement_label_bn' => 'রেস্টুরেন্টের আয়তন',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'name_bn' => 'কারখানা',
                'name_en' => 'Factory / Industry',
                'measurement_label_bn' => 'কারখানার আয়তন',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 5,
            ],
            [
                'name_bn' => 'বাণিজ্যিক প্রতিষ্ঠান',
                'name_en' => 'Commercial Enterprise',
                'measurement_label_bn' => 'প্রতিষ্ঠানের আয়তন',
                'measurement_unit_bn' => 'বর্গফুট',
                'is_required' => true,
                'is_active' => true,
                'display_order' => 6,
            ],
        ];

        foreach ($businessTypes as $bt) {
            BusinessType::updateOrCreate(
                ['name_bn' => $bt['name_bn']],
                $bt
            );
        }

        $reasons = [
            ['reason_bn' => 'সরকারি চাকরির জন্য', 'reason_en' => 'Government Job', 'display_order' => 1],
            ['reason_bn' => 'বেসরকারি চাকরির জন্য', 'reason_en' => 'Private Job', 'display_order' => 2],
            ['reason_bn' => 'পাসপোর্ট তৈরির জন্য', 'reason_en' => 'Passport Application', 'display_order' => 3],
            ['reason_bn' => 'ব্যাংক হিসাব / ঋণের জন্য', 'reason_en' => 'Bank Account or Loan', 'display_order' => 4],
            ['reason_bn' => 'বিদেশে উচ্চশিক্ষা বা ভিসা', 'reason_en' => 'Higher Study or Visa Abroad', 'display_order' => 5],
            ['reason_bn' => 'সাধারণ নাগরিক পরিচিতি', 'reason_en' => 'General Citizen Identity', 'display_order' => 6],
        ];

        foreach ($reasons as $r) {
            CharacterCertificateReason::updateOrCreate(
                ['reason_bn' => $r['reason_bn']],
                [
                    'reason_en' => $r['reason_en'],
                    'display_order' => $r['display_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
