<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Complaint;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    /**
     * Send OTP Verification Email to Citizen for Register / Login
     */
    public static function sendOtpNotification(string $email, string $name, string $otp, ?string $phone = null): bool
    {
        try {
            $subject = "খুলনা সেবা - আপনার ওটিপি (OTP) কোড: {$otp}";
            
            $phoneNote = $phone ? "<p style='margin: 8px 0; color: #065f46; font-size: 13px; background: #e6fcf5; padding: 8px 12px; border-radius: 8px;'>📱 এই একই কোডটি আপনার মোবাইল নম্বর <strong>{$phone}</strong>-এও পাঠানো হয়েছে।</p>" : "";

            $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
    .message { font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 20px; }
    .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
    .otp-label { font-size: 12px; color: #047857; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .otp-code { font-size: 38px; font-weight: 800; color: #065f46; letter-spacing: 8px; font-family: monospace; }
    .dual-note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #1e40af; line-height: 1.6; margin: 20px 0; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.5; margin-top: 20px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>খুলনা সিটি কর্পোরেশন</h1>
        <p>নাগরিক ডিজিটাল সেবা পোর্টাল (খুলনা সেবা)</p>
    </div>
    <div class="content">
        <div class="greeting">সম্মানিত নাগরিক {$name},</div>
        <div class="message">
            খুলনা সেবা পোর্টালে আপনার নতুন নাগরিক অ্যাকাউন্ট যাচাইয়ের জন্য এই ওটিপি কোডটি প্রদান করা হলো।
        </div>

        <div class="otp-box">
            <div class="otp-label">আপনার ওটিপি ভেরিফিকেশন কোড (৬ ডিজিট)</div>
            <div class="otp-code">{$otp}</div>
        </div>

        <div class="dual-note">
            💡 <strong>যেকোনো একটি মাধ্যম দিয়ে যাচাই করুন:</strong><br>
            এই একই ৬ ডিজিটের ওটিপি কোডটি একই সাথে আপনার মোবাইল নম্বর ও এই ইমেইল ঠিকানায় পাঠানো হয়েছে। <strong>মোবাইল এসএমএস অথবা ইমেইল—যেকোনো একটি মাধ্যমে প্রাপ্ত কোডটি দিলেই আপনার অ্যাকাউন্ট সম্পূর্ণ ভেরিফাই হয়ে যাবে।</strong>
        </div>

        {$phoneNote}

        <div class="warning">
            ⚠️ <strong>সতর্কতা:</strong> এই কোডটি আগামী <strong>১০ মিনিটের</strong> জন্য কার্যকর থাকবে। আপনার ওটিপি কোডটি কখনোই অন্য কারো সাথে শেয়ার করবেন না।
        </div>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • সর্বস্বত্ব সংরক্ষিত • হেল্পলাইন: ১৬১৫২ • ইমেইল: rafidul.labar.bd@gmail.com
    </div>
</div>
</body>
</html>
HTML;

            Mail::html($html, function ($message) use ($email, $subject) {
                $message->to($email)
                        ->subject($subject);
            });

            Log::info("OTP email sent successfully to: {$email}");
            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP email to {$email}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send Application Submitted Confirmation Email
     */
    public static function sendApplicationSubmittedNotification(Application $application): bool
    {
        try {
            $user = $application->user;
            $email = $user->email ?? $application->email ?? null;
            if (!$email) return false;

            $applicantName = $application->applicant_name ?: ($user->name ?? 'নাগরিক');
            $serviceName = $application->service->name_bn ?? 'নাগরিক সেবা';
            $trackingId = $application->tracking_id;
            $submittedAt = $application->created_at ? $application->created_at->format('d M, Y h:i A') : date('d M, Y');
            $trackUrl = url("/applications/track?tracking_id={$trackingId}");

            $subject = "✅ আবেদন সফলভাবে দাখিল হয়েছে - ট্র্যাকিং নম্বর: {$trackingId}";

            $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: bold; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .val { color: #0f172a; font-weight: bold; }
    .tracking-badge { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 20px; font-family: monospace; font-size: 16px; font-weight: bold; display: inline-block; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; margin-top: 16px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>খুলনা সিটি কর্পোরেশন</h1>
        <p>নাগরিক সেবা আবেদন প্রাপ্তি স্বীকার</p>
    </div>
    <div class="content">
        <div class="greeting">সম্মানিত {$applicantName},</div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            খুলনা সেবা পোর্টালে আপনার <strong>{$serviceName}</strong>-এর আবেদন সফলভাবে গৃহীত হয়েছে। আবেদনটি সংশ্লিষ্ট কর্মকর্তার নিকট পর্যালোচনার জন্য প্রেরণ করা হয়েছে।
        </p>
        
        <div class="card">
            <div class="row">
                <span class="label">সেবার নাম:</span>
                <span class="val">{$serviceName}</span>
            </div>
            <div class="row">
                <span class="label">ট্র্যাকিং নম্বর:</span>
                <span class="val"><span class="tracking-badge">{$trackingId}</span></span>
            </div>
            <div class="row">
                <span class="label">দাখিলের তারিখ:</span>
                <span class="val">{$submittedAt}</span>
            </div>
            <div class="row">
                <span class="label">বর্তমান অবস্থা:</span>
                <span class="val" style="color: #0284c7;">জমা হয়েছে (Submitted)</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
            <a href="{$trackUrl}" class="btn">লাইভ ট্র্যাকিং দেখুন →</a>
        </div>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • সর্বস্বত্ব সংরক্ষিত • হেল্পলাইন: ১৬১৫২
    </div>
</div>
</body>
</html>
HTML;

            Mail::html($html, function ($message) use ($email, $subject) {
                $message->to($email)
                        ->subject($subject);
            });

            Log::info("Application submitted email sent to: {$email}");
            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send application submitted email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send License / Certificate Approved Notification Email
     */
    public static function sendLicenseApprovedNotification(Application $application): bool
    {
        try {
            $user = $application->user;
            $email = $user->email ?? $application->email ?? null;
            if (!$email) return false;

            $applicantName = $application->applicant_name ?: ($user->name ?? 'নাগরিক');
            $serviceName = $application->service->name_bn ?? 'নাগরিক সেবা';
            $trackingId = $application->tracking_id;
            $certificateNo = $application->certificate_number ?: 'CERT-KCC-'.date('Y').'-'.mt_rand(100000, 999999);
            $certUrl = url("/applications/{$trackingId}/certificate");
            $approvedAt = $application->approved_at ? $application->approved_at->format('d M, Y') : date('d M, Y');

            $subject = "🎉 অভিনন্দন! আপনার {$serviceName} অনুমোদিত হয়েছে - সনদ নং: {$certificateNo}";

            $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: bold; }
    .content { padding: 32px 24px; }
    .congrats { font-size: 18px; font-weight: bold; color: #047857; margin-bottom: 12px; }
    .cert-box { background: #f0fdf4; border: 2px solid #34d399; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .cert-label { font-size: 12px; color: #065f46; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
    .cert-no { font-size: 22px; font-weight: bold; color: #047857; font-family: monospace; }
    .details { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 14px; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>খুলনা সিটি কর্পোরেশন</h1>
        <p>লাইসেন্স ও ডিজিটাল সনদ অনুমোদন বিজ্ঞপ্তি</p>
    </div>
    <div class="content">
        <div class="congrats">🎉 অভিনন্দন, {$applicantName}!</div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            খুলনা সিটি কর্পোরেশন কর্তৃপক্ষ কর্তৃক আপনার <strong>{$serviceName}</strong>-এর আবেদনটি সফলভাবে <strong>অনুমোদিত</strong> করা হয়েছে এবং আপনার ডিজিটাল সনদ প্রস্তুত হয়েছে।
        </p>

        <div class="cert-box">
            <div class="cert-label">অফিসিয়াল সনদ / লাইসেন্স নম্বর</div>
            <div class="cert-no">{$certificateNo}</div>
        </div>

        <div class="details">
            <p style="margin: 6px 0;"><strong>সেবা:</strong> {$serviceName}</p>
            <p style="margin: 6px 0;"><strong>ট্র্যাকিং নম্বর:</strong> {$trackingId}</p>
            <p style="margin: 6px 0;"><strong>অনুমোদনের তারিখ:</strong> {$approvedAt}</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="{$certUrl}" class="btn">ডিজিটাল সনদ দেখুন ও ডাউনলোড করুন 📥</a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
            এই সনদটি কিউআর কোড (QR Code) যুক্ত সরকারি ডিজিটাল সনদ। আপনি সরাসরি প্রিন্ট করে সকল অফিসিয়াল কাজে ব্যবহার করতে পারবেন।
        </p>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • সর্বস্বত্ব সংরক্ষিত • হেল্পলাইন: ১৬১৫২
    </div>
</div>
</body>
</html>
HTML;

            Mail::html($html, function ($message) use ($email, $subject) {
                $message->to($email)
                        ->subject($subject);
            });

            Log::info("License approved email sent to: {$email}");
            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send license approved email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send Application Status Update Notification Email
     */
    public static function sendApplicationStatusNotification(Application $application, string $status, ?string $comment = null): bool
    {
        try {
            $user = $application->user;
            $email = $user->email ?? $application->email ?? null;
            if (!$email) return false;

            $applicantName = $application->applicant_name ?: ($user->name ?? 'নাগরিক');
            $serviceName = $application->service->name_bn ?? 'নাগরিক সেবা';
            $trackingId = $application->tracking_id;
            $trackUrl = url("/applications/track?tracking_id={$trackingId}");

            $statusTextMap = [
                'under_review' => 'পর্যালোচনাধীন (Under Review)',
                'info_required' => 'অতিরিক্ত তথ্য/কাগজ প্রয়োজন (Action Required)',
                'rejected' => 'আবেদন বাতিল (Rejected)',
                'completed' => 'নিষ্পত্তিকৃত (Completed)',
            ];
            $statusBangla = $statusTextMap[$status] ?? $status;

            $subject = "আবেদনের অবস্থা আপডেট: {$serviceName} (ট্র্যাকিং: {$trackingId})";

            $commentHtml = $comment ? "<div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin: 16px 0;'><strong>কর্মকর্তার মন্তব্য:</strong> {$comment}</div>" : '';

            $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .content { padding: 32px 24px; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; margin-top: 16px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1 style="margin: 0; font-size: 22px;">খুলনা সিটি কর্পোরেশন</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">আবেদন অবস্থা পরিবর্তন বিজ্ঞপ্তি</p>
    </div>
    <div class="content">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">সম্মানিত {$applicantName},</div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            আপনার <strong>{$serviceName}</strong> (ট্র্যাকিং: <code>{$trackingId}</code>) আবেদনের বর্তমান অবস্থা আপডেট করা হয়েছে।
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 16px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>বর্তমান অবস্থা:</strong> <span style="color: #0284c7; font-weight: bold;">{$statusBangla}</span></p>
        </div>

        {$commentHtml}

        <div style="text-align: center; margin-top: 24px;">
            <a href="{$trackUrl}" class="btn">আবেদনের বিস্তারিত ও ট্র্যাকিং দেখুন →</a>
        </div>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • সর্বস্বত্ব সংরক্ষিত • হেল্পলাইন: ১৬১৫২
    </div>
</div>
</body>
</html>
HTML;

            Mail::html($html, function ($message) use ($email, $subject) {
                $message->to($email)
                        ->subject($subject);
            });

            Log::info("Status update email sent to: {$email}");
            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send status update email: " . $e->getMessage());
            return false;
        }
    }
}