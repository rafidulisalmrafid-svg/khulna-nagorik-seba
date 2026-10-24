<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CitizenProfileController extends Controller
{
    /**
     * Display the citizen's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $wards = Ward::orderBy('ward_no')->get(['id', 'ward_no', 'name_bn', 'councillor_name_bn']);

        return Inertia::render('Profile/Edit', [
            'wards' => $wards,
            'status' => session('status'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Update basic profile and detailed address information.
     */
    public function updateInfo(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:150',
            'division' => 'nullable|string|max:50',
            'district' => 'required|string|max:100',
            'upazila' => 'required|string|max:100',
            'union_ward' => 'required|string|max:150',
            'road_street' => 'nullable|string|max:255',
            'holding_no' => 'nullable|string|max:100',
            'permanent_address' => 'nullable|string|max:500',
        ], [
            'name.required' => 'পুরো নাম দেওয়া আবশ্যক।',
            'district.required' => 'জেলা নির্বাচন করা আবশ্যক।',
            'upazila.required' => 'উপজেলা বা থানা নির্বাচন করা আবশ্যক।',
            'union_ward.required' => 'ওয়ার্ড বা ইউনিয়ন পরিষদ নির্বাচন করা আবশ্যক।',
        ]);

        // Generate full formatted address string
        $addressParts = array_filter([
            $request->holding_no ? "বাড়ি/দোকান: {$request->holding_no}" : null,
            $request->road_street ? "রোড: {$request->road_street}" : null,
            $request->union_ward,
            $request->upazila,
            $request->district,
            $request->division ?: 'খুলনা',
        ]);
        $fullAddress = implode(', ', $addressParts);

        // Extract ward number if present
        $wardNo = $user->ward_no ?: 1;
        if (!empty($request->union_ward) && preg_match('/(\d+)/', $request->union_ward, $matches)) {
            $wardNo = (int) $matches[1];
        }

        $user->update([
            'name' => $request->name,
            'division' => $request->division ?: 'খুলনা',
            'district' => $request->district,
            'upazila' => $request->upazila,
            'union_ward' => $request->union_ward,
            'road_street' => $request->road_street,
            'holding_no' => $request->holding_no,
            'ward_no' => $wardNo,
            'address' => $fullAddress,
            'permanent_address' => $request->permanent_address,
        ]);

        return back()->with('success', 'ব্যক্তিগত তথ্য ও ঠিকানা সফলভাবে আপডেট করা হয়েছে।');
    }

    /**
     * Upload and update citizen avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        ], [
            'avatar.required' => 'একটি ছবি নির্বাচন করুন।',
            'avatar.image' => 'ফাইলটি অবশ্যই একটি ছবি হতে হবে।',
            'avatar.mimes' => 'ছবিটি অবশ্যই JPG, PNG বা WebP ফরম্যাটের হতে হবে।',
            'avatar.max' => 'ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট (2MB) হতে পারে।',
        ]);

        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return back()->with('success', 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে।');
    }

    /**
     * Remove citizen avatar.
     */
    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return back()->with('success', 'প্রোফাইল ছবি সরিয়ে ফেলা হয়েছে।');
    }

    /**
     * Phone Change Step 1: Send OTP to OLD phone.
     */
    public function sendOldPhoneOtp(Request $request)
    {
        $user = $request->user();

        if (!$user->phone) {
            return response()->json([
                'success' => false,
                'message' => 'আপনার কোনো পুরোনো ফোন নম্বর যুক্ত নেই।',
            ], 422);
        }

        $otpCode = (string) mt_rand(100000, 999999);

        Otp::where('phone', $user->phone)
            ->where('action', 'change_phone_old')
            ->delete();

        Otp::create([
            'phone' => $user->phone,
            'otp_code' => $otpCode,
            'action' => 'change_phone_old',
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
        ]);

        $responseData = [
            'success' => true,
            'message' => "আপনার বর্তমান নম্বর ({$user->phone})-এ ৬ ডিজিটের ওটিপি পাঠানো হয়েছে।",
        ];

        if (config('app.debug') && app()->isLocal()) {
            $responseData['dev_otp'] = $otpCode;
        }

        return response()->json($responseData);
    }

    /**
     * Phone Change Step 1: Verify OTP from OLD phone.
     */
    public function verifyOldPhoneOtp(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'otp_code' => 'required|string|size:6',
        ], [
            'otp_code.required' => 'ওটিপি কোড দেওয়া আবশ্যক।',
            'otp_code.size' => 'ওটিপি কোড ৬ ডিজিটের হতে হবে।',
        ]);

        $otp = Otp::where('phone', $user->phone)
            ->where('action', 'change_phone_old')
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otp || !$otp->isValid($request->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড। অনুগ্রহ করে সঠিক কোড দিন।',
            ], 422);
        }

        $otp->update(['is_used' => true]);

        session(['phone_step1_passed' => true, 'phone_step1_time' => now()->timestamp]);

        return response()->json([
            'success' => true,
            'message' => 'বর্তমান ফোন নম্বর যাচাই সফল হয়েছে! এবার নতুন ফোন নম্বর দিন।',
        ]);
    }

    /**
     * Phone Change Step 1 Alternative: Fallback verification via NID + Password.
     */
    public function verifyPhoneFallback(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nid' => 'required|string',
            'password' => 'required|string',
        ], [
            'nid.required' => 'জাতীয় পরিচয়পত্র (NID) নম্বর দেওয়া আবশ্যক।',
            'password.required' => 'বর্তমান পাসওয়ার্ড দেওয়া আবশ্যক।',
        ]);

        if (trim($user->nid) !== trim($request->nid)) {
            return response()->json([
                'success' => false,
                'message' => 'প্রদত্ত NID নম্বর আপনার প্রোফাইলের তথ্যের সাথে মেলেনি।',
            ], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন।',
            ], 422);
        }

        session(['phone_step1_passed' => true, 'phone_step1_time' => now()->timestamp]);

        return response()->json([
            'success' => true,
            'message' => 'বিকল্প পরিচয় যাচাইকরণ সফল হয়েছে! এবার নতুন ফোন নম্বর দিন।',
        ]);
    }

    /**
     * Phone Change Step 2: Send OTP to NEW phone.
     */
    public function sendNewPhoneOtp(Request $request)
    {
        if (!session('phone_step1_passed')) {
            return response()->json([
                'success' => false,
                'message' => 'নিরাপত্তার স্বার্থে প্রথমে পুরোনো নম্বর বা পরিচয় যাচাই সম্পন্ন করতে হবে।',
            ], 403);
        }

        $cleanedPhone = preg_replace('/[^0-9]/', '', $request->new_phone);
        $request->merge(['new_phone' => $cleanedPhone]);

        $request->validate([
            'new_phone' => 'required|string|digits:11|unique:users,phone',
        ], [
            'new_phone.required' => 'নতুন মোবাইল নম্বর দেওয়া আবশ্যক।',
            'new_phone.digits' => 'মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।',
            'new_phone.unique' => 'এই মোবাইল নম্বরটি ইতোমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।',
        ]);

        $otpCode = (string) mt_rand(100000, 999999);

        Otp::where('phone', $cleanedPhone)
            ->where('action', 'change_phone_new')
            ->delete();

        Otp::create([
            'phone' => $cleanedPhone,
            'otp_code' => $otpCode,
            'action' => 'change_phone_new',
            'payload' => ['new_phone' => $cleanedPhone],
            'expires_at' => now()->addMinutes(10),
            'is_used' => false,
        ]);

        $responseData = [
            'success' => true,
            'message' => "নতুন নম্বর ({$cleanedPhone})-এ ৬ ডিজিটের ওটিপি পাঠানো হয়েছে।",
        ];

        if (config('app.debug') && app()->isLocal()) {
            $responseData['dev_otp'] = $otpCode;
        }

        return response()->json($responseData);
    }

    /**
     * Phone Change Step 2: Verify OTP for NEW phone and update account.
     */
    public function verifyNewPhoneOtp(Request $request)
    {
        if (!session('phone_step1_passed')) {
            return response()->json([
                'success' => false,
                'message' => 'যাচাইকরণ প্রক্রিয়া সম্পন্ন হয়নি। পুনরায় চেষ্টা করুন।',
            ], 403);
        }

        $cleanedPhone = preg_replace('/[^0-9]/', '', $request->new_phone);
        $request->merge(['new_phone' => $cleanedPhone]);

        $request->validate([
            'new_phone' => 'required|string|digits:11|unique:users,phone,' . $request->user()->id,
            'otp_code' => 'required|string|size:6',
        ], [
            'otp_code.required' => 'ওটিপি কোড দেওয়া আবশ্যক।',
            'otp_code.size' => 'ওটিপি কোড ৬ ডিজিটের হতে হবে।',
        ]);

        $otp = Otp::where('phone', $cleanedPhone)
            ->where('action', 'change_phone_new')
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otp || !$otp->isValid($request->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড! অনুগ্রহ করে সঠিক কোড দিন।',
            ], 422);
        }

        $otp->update(['is_used' => true]);

        $user = $request->user();
        $user->update(['phone' => $cleanedPhone]);

        session()->forget(['phone_step1_passed', 'phone_step1_time']);

        return response()->json([
            'success' => true,
            'message' => 'অভিনন্দন! আপনার ফোন নম্বর সফলভাবে পরিবর্তিত ও নিশ্চিত করা হয়েছে।',
            'new_phone' => $cleanedPhone,
        ]);
    }

    /**
     * Email Change: Send OTP to new email.
     */
    public function sendEmailOtp(Request $request)
    {
        $request->validate([
            'new_email' => 'required|email|max:100|unique:users,email,' . $request->user()->id,
        ], [
            'new_email.required' => 'নতুন ইমেইল অ্যাড্রেস দেওয়া আবশ্যক।',
            'new_email.email' => 'সঠিক ইমেইল ফরম্যাট দিন।',
            'new_email.unique' => 'এই ইমেইলটি ইতোমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।',
        ]);

        $user = $request->user();
        $otpCode = (string) mt_rand(100000, 999999);

        Otp::where('phone', $user->phone ?: 'email_otp_' . $user->id)
            ->where('action', 'change_email')
            ->delete();

        Otp::create([
            'phone' => $user->phone ?: 'email_otp_' . $user->id,
            'otp_code' => $otpCode,
            'action' => 'change_email',
            'payload' => ['new_email' => $request->new_email],
            'expires_at' => now()->addMinutes(15),
            'is_used' => false,
        ]);

        // Dispatch OTP to citizen's new email address
        \App\Services\EmailNotificationService::sendOtpNotification(
            $request->new_email,
            $user->name,
            $otpCode,
            $user->phone
        );

        $responseData = [
            'success' => true,
            'message' => "আপনার নতুন ইমেইলে ({$request->new_email}) একটি ৬ ডিজিটের যাচাইকরণ কোড পাঠানো হয়েছে।",
        ];

        if (config('app.debug') && app()->isLocal()) {
            $responseData['dev_otp'] = $otpCode;
        }

        return response()->json($responseData);
    }

    /**
     * Email Change: Verify OTP and update email.
     */
    public function verifyEmailOtp(Request $request)
    {
        $request->validate([
            'new_email' => 'required|email|max:100|unique:users,email,' . $request->user()->id,
            'otp_code' => 'required|string|size:6',
        ], [
            'otp_code.required' => 'যাচাইকরণ কোড দেওয়া আবশ্যক।',
            'otp_code.size' => 'কোডটি ৬ ডিজিটের হতে হবে।',
        ]);

        $user = $request->user();

        $otp = Otp::where('phone', $user->phone ?: 'email_otp_' . $user->id)
            ->where('action', 'change_email')
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otp || !$otp->isValid($request->otp_code)) {
            return response()->json([
                'success' => false,
                'message' => 'ভুল বা মেয়াদোত্তীর্ণ যাচাইকরণ কোড!',
            ], 422);
        }

        $otp->update(['is_used' => true]);

        $user->update([
            'email' => $request->new_email,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ইমেইল সফলভাবে পরিবর্তিত ও নিশ্চিত করা হয়েছে।',
            'new_email' => $request->new_email,
        ]);
    }

    /**
     * Change citizen account password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'বর্তমান পাসওয়ার্ড প্রদান করুন।',
            'password.required' => 'নতুন পাসওয়ার্ড প্রদান করুন।',
            'password.min' => 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
            'password.confirmed' => 'নতুন পাসওয়ার্ড দুটি হুবহু মেলেনি।',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।',
            ]);
        }

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        $request->session()->regenerate();

        return back()->with('success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
    }
}
