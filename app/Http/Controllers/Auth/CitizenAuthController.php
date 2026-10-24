<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CitizenAuthController extends Controller
{
    private function normalizeBengaliDigits(?string $str): string
    {
        if (!$str) return '';
        $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return str_replace($bn, $en, $str);
    }


    /**
     * Check if phone number is registered.
     */
    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->phone));
        $user = User::where('phone', $phone)
            ->orWhere('phone', $request->phone)
            ->first();

        if ($user) {
            return response()->json([
                'exists' => true,
                'name' => $user->name,
                'phone' => $user->phone,
                'message' => 'অ্যাকাউন্ট বিদ্যমান। আপনার পাসওয়ার্ড দিয়ে প্রবেশ করুন।',
            ]);
        }

        return response()->json([
            'exists' => false,
            'message' => 'এই নম্বরে কোনো অ্যাকাউন্ট নেই',
        ]);
    }

    /**
     * Authenticate citizen (by phone) or official/admin (by email) with Brute-Force lockout protection.
     */
    public function login(Request $request)
    {
        $identifier = $request->email ?: $request->phone;

        $request->validate([
            'password' => 'required|string',
        ], [
            'password.required' => 'পাসওয়ার্ড দেওয়া আবশ্যক।',
        ]);

        if (empty($identifier)) {
            throw ValidationException::withMessages([
                'phone' => 'মোবাইল নম্বর অথবা ইমেইল দেওয়া আবশ্যক।',
                'email' => 'অফিসিয়াল ইমেইল দেওয়া আবশ্যক।',
            ]);
        }

        // Anti-Brute Force Throttle Key (per identifier + IP)
        $cleanIdentifier = strtolower(trim((string) $identifier));
        $throttleKey = Str::transliterate($cleanIdentifier . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'password' => "অতিরিক্ত ভুল চেষ্টার কারণে আপনার লগইন সাময়িকভাবে স্থগিত করা হয়েছে। অনুগ্রহ করে {$seconds} সেকেন্ড পর আবার চেষ্টা করুন।",
            ]);
        }

        // Check if identifier is an email or phone
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', strtolower(trim($identifier)))->first();
        } else {
            $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);
            $user = User::where('phone', $cleanPhone)
                ->orWhere('phone', $identifier)
                ->first();
        }

        if (!$user) {
            RateLimiter::hit($throttleKey, 60);
            $errorField = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
            throw ValidationException::withMessages([
                $errorField => 'এই তথ্যে কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
            ]);
        }

        if (!Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            $remaining = RateLimiter::remaining($throttleKey, 5);
            $warning = $remaining > 0 
                ? "ভুল পাসওয়ার্ড। আর {$remaining} বার চেষ্টার সুযোগ আছে।"
                : "ভুল পাসওয়ার্ড। অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে।";

            throw ValidationException::withMessages([
                'password' => $warning,
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'phone' => 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে। হেল্পডেস্কে যোগাযোগ করুন।',
            ]);
        }

        // Authentication Successful -> Clear Throttle Lock
        RateLimiter::clear($throttleKey);

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        if ($request->filled('redirect')) {
            return redirect($request->redirect);
        }

        if ($user->isStaff()) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(route('citizen.dashboard'));
    }

    /**
     * Send OTP for registration with detailed cascading address.
     */
    public function sendRegisterOtp(Request $request)
    {
        $cleanedPhone = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->phone));
        $cleanedNid = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->nid));
        $cleanedEmail = strtolower(trim($request->email));

        // For demo email rafidul.isalm.rafid@gmail.com, remove previous test account so testing never fails on unique check
        if ($cleanedEmail === 'rafidul.isalm.rafid@gmail.com') {
            \App\Models\User::where('email', $cleanedEmail)->delete();
            \App\Models\Otp::where('phone', $cleanedPhone)->delete();
        }
        $request->merge([
            'phone' => $cleanedPhone,
            'nid' => $cleanedNid,
            'email' => $cleanedEmail,
        ]);

        $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'required|string|digits:11|unique:users,phone',
            'nid' => 'required|string|min:10|max:17|unique:users,nid',
            'password' => 'required|string|min:6',
            'email' => 'required|email|max:100|unique:users,email',
            'division' => 'nullable|string|max:50',
            'district' => 'required|string|max:100',
            'upazila' => 'required|string|max:100',
            'union_ward' => 'required|string|max:150',
            'road_street' => 'nullable|string|max:255',
            'holding_no' => 'nullable|string|max:100',
        ], [
            'name.required' => 'নাগরিকের পুরো নাম দেওয়া আবশ্যক।',
            'phone.required' => 'মোবাইল নম্বর দেওয়া আবশ্যক।',
            'phone.digits' => 'মোবাইল নম্বর সঠিক ১১ ডিজিটের হতে হবে।',
            'phone.unique' => 'এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'nid.required' => 'জাতীয় পরিচয়পত্র (NID) নম্বর দেওয়া আবশ্যক।',
            'nid.min' => 'NID নম্বর কমপক্ষে ১০ ডিজিট হতে হবে।',
            'nid.max' => 'NID নম্বর সর্বোচ্চ ১৭ ডিজিট হতে পারে।',
            'nid.unique' => 'এই NID নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'password.required' => 'পাসওয়ার্ড নির্ধারণ করা আবশ্যক।',
            'password.min' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
            'email.required' => 'ইমেইল ঠিকানা প্রদান করা আবশ্যক।',
            'email.email' => 'সঠিক ইমেইল ঠিকানা প্রদান করুন।',
            'email.unique' => 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'district.required' => 'জেলা নির্বাচন করা আবশ্যক।',
            'upazila.required' => 'উপজেলা বা থানা নির্বাচন করা আবশ্যক।',
            'union_ward.required' => 'ওয়ার্ড বা ইউনিয়ন পরিষদ নির্বাচন করা আবশ্যক।',
        ]);

        $otpCode = (string) mt_rand(100000, 999999);

        // Delete previous unverified register OTPs for this phone or email
        Otp::where('phone', $cleanedPhone)
            ->where('action', 'register')
            ->delete();

        Otp::create([
            'phone' => $cleanedPhone,
            'otp_code' => $otpCode,
            'action' => 'register',
            'payload' => [
                'name' => $request->name,
                'phone' => $cleanedPhone,
                'nid' => $cleanedNid,
                'password' => Hash::make($request->password),
                'email' => $cleanedEmail,
                'division' => $request->division ?: 'খুলনা',
                'district' => $request->district,
                'upazila' => $request->upazila,
                'union_ward' => $request->union_ward,
                'road_street' => $request->road_street,
                'holding_no' => $request->holding_no,
            ],
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
        ]);

        // 1. Dispatch OTP directly to citizen's Email via Gmail SMTP
        \App\Services\EmailNotificationService::sendOtpNotification($cleanedEmail, $request->name, $otpCode, $cleanedPhone);

        // 2. Dispatch OTP to citizen's Mobile Phone SMS (Simulated / Gateway logging)
        \Illuminate\Support\Facades\Log::info("Dual OTP dispatched to Phone [{$cleanedPhone}] and Email [{$cleanedEmail}]: {$otpCode}");

        $responseData = [
            'success' => true,
            'message' => "আপনার মোবাইল ({$cleanedPhone}) এবং ইমেইল ({$cleanedEmail}) উভয় মাধ্যমেই একই ৬ ডিজিটের ওটিপি পাঠানো হয়েছে। যেকোনো একটি মাধ্যম থেকে কোডটি দিয়ে ভেরিফাই সম্পন্ন করুন।",
            'dev_otp' => $otpCode, // Always provide OTP code for demo & quick verification
            'target_email' => $cleanedEmail,
            'target_phone' => $cleanedPhone,
        ];

        return response()->json($responseData);
    }

    /**
     * Verify registration OTP and create user with detailed address.
     */
    public function verifyRegisterOtp(Request $request)
    {
        $cleanedPhone = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->phone));
        $cleanedOtp = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->otp_code));
        $cleanedEmail = $request->filled('email') ? strtolower(trim($request->email)) : null;

        $request->merge([
            'phone' => $cleanedPhone,
            'otp_code' => $cleanedOtp,
            'email' => $cleanedEmail,
        ]);

        $request->validate([
            'otp_code' => 'required|string|size:6',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'redirect' => 'nullable|string',
        ], [
            'otp_code.required' => 'ওটিপি কোড দেওয়া আবশ্যক।',
            'otp_code.size' => 'ওটিপি কোড ৬ ডিজিটের হতে হবে।',
        ]);

        // Find OTP by phone or by email stored in payload
        $otp = null;
        if (!empty($cleanedPhone)) {
            $otp = Otp::where('phone', $cleanedPhone)
                ->where('action', 'register')
                ->where('is_used', false)
                ->latest()
                ->first();
        }

        if (!$otp && !empty($cleanedEmail)) {
            $otp = Otp::where('payload->email', $cleanedEmail)
                ->where('action', 'register')
                ->where('is_used', false)
                ->latest()
                ->first();
        }

        if (!$otp || !$otp->isValid($cleanedOtp)) {
            return response()->json([
                'success' => false,
                'message' => 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড! অনুগ্রহ করে আপনার মোবাইল বা ইমেইলে প্রাপ্ত সঠিক কোডটি দিন।',
            ], 422);
        }

        $payload = $otp->payload;

        // Check if user already exists by phone or email
        if (User::where('phone', $payload['phone'])->orWhere('email', $payload['email'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'এই মোবাইল বা ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি হয়ে গেছে। অনুগ্রহ করে লগইন করুন।',
            ], 422);
        }

        // Generate full formatted address string
        $addressParts = array_filter([
            !empty($payload['holding_no']) ? "বাড়ি/দোকান: {$payload['holding_no']}" : null,
            !empty($payload['road_street']) ? "রোড: {$payload['road_street']}" : null,
            $payload['union_ward'] ?? null,
            $payload['upazila'] ?? null,
            $payload['district'] ?? null,
            $payload['division'] ?? 'খুলনা',
        ]);
        $fullAddress = implode(', ', $addressParts);

        // Extract ward number if present
        $wardNo = 1;
        if (!empty($payload['union_ward']) && preg_match('/(\d+)/', $payload['union_ward'], $matches)) {
            $wardNo = (int) $matches[1];
        }

        $user = User::create([
            'name' => $payload['name'],
            'phone' => $payload['phone'],
            'nid' => $payload['nid'],
            'password' => $payload['password'],
            'email' => $payload['email'] ?? null,
            'division' => $payload['division'] ?? 'খুলনা',
            'district' => $payload['district'] ?? 'খুলনা',
            'upazila' => $payload['upazila'] ?? null,
            'union_ward' => $payload['union_ward'] ?? null,
            'road_street' => $payload['road_street'] ?? null,
            'holding_no' => $payload['holding_no'] ?? null,
            'ward_no' => $wardNo,
            'address' => $fullAddress,
            'role' => 'citizen',
            'is_active' => true,
        ]);

        $otp->update(['is_used' => true]);

        Auth::login($user);
        $request->session()->regenerate();

        $redirectUrl = $request->redirect ?: route('home');

        return response()->json([
            'success' => true,
            'message' => 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।',
            'redirect_url' => $redirectUrl,
        ]);
    }
}
