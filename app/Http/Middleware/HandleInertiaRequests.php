<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'phone' => $request->user()->phone,
                    'nid' => $request->user()->nid,
                    'ward_no' => $request->user()->ward_no,
                    'address' => $request->user()->address,
                    'permanent_address' => $request->user()->permanent_address,
                    'division' => $request->user()->division,
                    'district' => $request->user()->district,
                    'upazila' => $request->user()->upazila,
                    'union_ward' => $request->user()->union_ward,
                    'road_street' => $request->user()->road_street,
                    'holding_no' => $request->user()->holding_no,
                    'formatted_address' => $request->user()->formatted_address,
                    'avatar' => $request->user()->avatar,
                    'avatar_url' => $request->user()->avatar_url,
                    'department_id' => $request->user()->department_id,
                    'designation' => $request->user()->designation,
                    'is_staff' => $request->user()->isStaff(),
                    'is_admin' => in_array($request->user()->role, ['super_admin', 'department_admin']),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'tracking_id' => fn () => $request->session()->get('tracking_id'),
            ],
            'city_info' => [
                'name_bn' => 'খুলনা সিটি কর্পোরেশন',
                'name_en' => 'Khulna City Corporation',
                'slogan_bn' => 'গ্রিন ও স্মার্ট খুলনা গড়ার প্রত্যয়',
                'hotline' => '১৬১৫২',
                'emergency_phone' => '০৪১-৭২০১০০',
                'email' => 'info@khulnacity.gov.bd',
                'address_bn' => 'কেসিসি প্রধান ভবন, কেডিএ এভিনিউ, খুলনা-৯০০০',
            ],
        ];
    }
}
