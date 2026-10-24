<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Complaint;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class EmailNotificationService
{
    /**
     * Helper to send HTML email with multi-layer fallback (Laravel Mail -> SMTP 587 -> SMTPS 465)
     */
    public static function sendEmailDirect(string $toEmail, string $subject, string $htmlContent): bool
    {
        // 1. First Attempt: Standard Laravel Mailer
        try {
            Mail::html($htmlContent, function ($message) use ($toEmail, $subject) {
                $message->to($toEmail)
                        ->from('rafidul.labar.bd@gmail.com', 'খুলনা সেবা')
                        ->subject($subject);
            });
            Log::info("Email successfully sent via Laravel Mailer to: {$toEmail}");
            return true;
        } catch (\Throwable $e1) {
            Log::warning("Laravel Mailer failed for {$toEmail}: " . $e1->getMessage() . " - Falling back to direct Symfony SMTP...");
        }

        // 2. Second Attempt: Direct Symfony Mailer on Port 587 (TLS)
        try {
            $dsn587 = 'smtp://rafidul.labar.bd%40gmail.com:cwiigttcebziaoig@smtp.gmail.com:587';
            $transport587 = Transport::fromDsn($dsn587);
            $mailer587 = new Mailer($transport587);
            $emailObj = (new Email())
                ->from(new Address('rafidul.labar.bd@gmail.com', 'খুলনা সেবা'))
                ->to($toEmail)
                ->subject($subject)
                ->html($htmlContent);
            $mailer587->send($emailObj);
            Log::info("Email successfully sent via direct Symfony SMTP (Port 587) to: {$toEmail}");
            return true;
        } catch (\Throwable $e2) {
            Log::warning("Symfony SMTP 587 failed for {$toEmail}: " . $e2->getMessage() . " - Falling back to SMTPS 465...");
        }

        // 3. Third Attempt: Direct Symfony Mailer on Port 465 (SSL)
        try {
            $dsn465 = 'smtps://rafidul.labar.bd%40gmail.com:cwiigttcebziaoig@smtp.gmail.com:465';
            $transport465 = Transport::fromDsn($dsn465);
            $mailer465 = new Mailer($transport465);
            $emailObj = (new Email())
                ->from(new Address('rafidul.labar.bd@gmail.com', 'খুলনা সেবা'))
                ->to($toEmail)
                ->subject($subject)
                ->html($htmlContent);
            $mailer465->send($emailObj);
            Log::info("Email successfully sent via direct Symfony SMTPS (Port 465) to: {$toEmail}");
            return true;
        } catch (\Throwable $e3) {
            Log::error("All SMTP attempts failed for {$toEmail}: 587 Error: " . $e2->getMessage() . " | 465 Error: " . $e3->getMessage());
            return false;
        }
    }

    /**
     * Send OTP Verification Email to Citizen for Register / Login
     */
    public static function sendOtpNotification(string $email, string $name, string $otp, ?string $phone = null): bool
    {
        $subject = "খুলনা সেবা - আপনার ওটিপি (OTP) কোড: {$otp}";
        
        $phoneNote = $phone ? "<p style='margin: 8px 0; color: #065f46; font-size: 13px; background: #e6fcf5; padding: 8px 12px; border-radius: 8px;'>📱 এই একই ওটিপি কোডটি আপনার মোবাইল নম্বর <strong>{$phone}</strong>-এও পাঠানো হয়েছে।</p>" : "";

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
        <div class="greeting">সম্মানিত {$name},</div>
        <p class="message">
            খুলনা সেবা পোর্টালে আপনার অ্যাকাউন্ট যাচাই বা নিরাপদ প্রবেশের জন্য এককালীন ওটিপি (One-Time Password) প্রদান করা হলো।
        </p>

        <div class="otp-box">
            <div class="otp-label">আপনার ওটিপি (OTP) ভেরিফিকেশন কোড</div>
            <div class="otp-code">{$otp}</div>
        </div>

        <div class="dual-note">
            <strong>🔄 যৌথ ওটিপি সিস্টেম (Dual Channel Delivery):</strong>
            {$phoneNote}
            <p style="margin: 4px 0 0 0;">আপনি মোবাইল এসএমএস অথবা ইমেইল—যেকোনো একটির ওটিপি দিয়ে ভেরিফিকেশন সম্পন্ন করতে পারবেন।</p>
        </div>

        <div class="warning">
            ⚠️ <strong>নিরাপত্তা সতর্কতা:</strong> এই ওটিপি কোডটির মেয়াদ <strong>১০ মিনিট</strong>। আপনার ওটিপি কোডটি কখনোই অন্য কারও সাথে শেয়ার করবেন না। খুলনা সিটি কর্পোরেশনের কোনো প্রতিনিধি আপনার কাছে ওটিপি চাইবে না।
        </div>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • নাগরিক সেবা বিভাগ • সর্বস্বত্ব সংরক্ষিত
    </div>
</div>
</body>
</html>
HTML;

        return self::sendEmailDirect($email, $subject, $html);
    }

    /**
     * Send Application Submitted Notification Email
     */
    public static function sendApplicationSubmittedNotification(Application $application): bool
    {
        $user = $application->user;
        $email = $user->email ?? $application->email ?? null;
        if (!$email) return false;

        $applicantName = $application->applicant_name ?: ($user->name ?? 'নাগরিক');
        $serviceName = $application->service->name_bn ?? 'নাগরিক সেবা';
        $trackingId = $application->tracking_id;
        $trackUrl = url("/applications/track?tracking_id={$trackingId}");
        $createdAt = $application->created_at ? $application->created_at->format('d/m/Y h:i A') : date('d/m/Y');

        $subject = "খুলনা সেবা - আবেদন গৃহীত হয়েছে: {$serviceName} (ট্র্যাকিং: {$trackingId})";

        $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
    .tracking-box { background: #f0fdfa; border: 2px solid #5eead4; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; }
    .tracking-label { font-size: 12px; color: #0f766e; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
    .tracking-id { font-size: 24px; font-weight: bold; color: #115e59; font-family: monospace; letter-spacing: 2px; }
    .btn { display: inline-block; background: #0f766e; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>খুলনা সিটি কর্পোরেশন</h1>
        <p>নাগরিক সেবা আবেদন প্রাপ্তি নিশ্চিতকরণ</p>
    </div>
    <div class="content">
        <div class="greeting">সম্মানিত {$applicantName},</div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            খুলনা সেবা পোর্টালে আপনার <strong>{$serviceName}</strong>-এর আবেদনটি সফলভাবে গৃহীত হয়েছে। কর্তৃপক্ষ শীঘ্রই আপনার আবেদনটি পর্যালোচনা করবে।
        </p>

        <div class="tracking-box">
            <div class="tracking-label">আপনার আবেদনের ট্র্যাকিং নম্বর</div>
            <div class="tracking-id">{$trackingId}</div>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
            আবেদনের তারিখ: <strong>{$createdAt}</strong><br>
            যেকোনো সময় এই ট্র্যাকিং নম্বর দিয়ে আপনার আবেদনের সর্বশেষ অবস্থা জানতে পারবেন।
        </p>

        <div style="text-align: center; margin: 24px 0;">
            <a href="{$trackUrl}" class="btn">আবেদনের অগ্রগতি ট্র্যাক করুন →</a>
        </div>
    </div>
    <div class="footer">
        © খুলনা সিটি কর্পোরেশন • সর্বস্বত্ব সংরক্ষিত • হেল্পলাইন: ১৬১৫২
    </div>
</div>
</body>
</html>
HTML;

        return self::sendEmailDirect($email, $subject, $html);
    }

    /**
     * Send License / Certificate Approved Notification Email with Direct Download Link
     */
    public static function sendLicenseApprovedNotification(Application $application): bool
    {
        $user = $application->user;
        $email = $user->email ?? $application->email ?? null;
        if (!$email) return false;

        $applicantName = $application->applicant_name ?: ($user->name ?? 'নাগরিক');
        $serviceName = $application->service->name_bn ?? 'নাগরিক সেবা';
        $trackingId = $application->tracking_id;
        $certificateNo = $application->certificate_number ?? $application->license_number ?? $trackingId;
        $certUrl = url("/applications/{$application->id}/certificate");
        $approvedAt = $application->approved_at ? $application->approved_at->format('d/m/Y') : date('d/m/Y');

        $subject = "🎉 অভিনন্দন! আপনার {$serviceName} অনুমোদিত হয়েছে (সনদ নং: {$certificateNo})";

        $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 0; font-size: 13px; opacity: 0.95; }
    .content { padding: 32px 24px; }
    .congrats { font-size: 18px; font-weight: bold; color: #065f46; margin-bottom: 12px; }
    .cert-box { background: #ecfdf5; border: 2px solid #34d399; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; }
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

        return self::sendEmailDirect($email, $subject, $html);
    }

    /**
     * Send Application Status Update Notification Email
     */
    public static function sendApplicationStatusNotification(Application $application, string $status, ?string $comment = null): bool
    {
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

        return self::sendEmailDirect($email, $subject, $html);
    }
}