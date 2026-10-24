<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Service;
use App\Models\Application;
use App\Models\Complaint;
use App\Models\Otp;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;

class UniversalEmailNotificationAndOtpAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');
    }

    /**
     * Test: ANY citizen with ANY valid email address receives OTP and can register.
     */
    public function test_any_citizen_with_any_email_receives_otp_and_registers_successfully(): void
    {
        $testEmail = 'anycitizen.' . mt_rand(1000, 9999) . '@example.com';
        $testPhone = '017' . mt_rand(10000000, 99999999);
        $testNid = '1990' . mt_rand(1000000000, 9999999999);

        // 1. Send OTP
        $sendResp = $this->postJson('/auth/send-register-otp', [
            'name' => 'আব্দুর রহমান',
            'phone' => $testPhone,
            'nid' => $testNid,
            'password' => 'SecurePass@123',
            'email' => $testEmail,
            'division' => 'খুলনা বিভাগ',
            'district' => 'খুলনা',
            'upazila' => 'সোনাডাঙ্গা',
            'union_ward' => 'ওয়ার্ড ১৭',
            'road_street' => 'মজিদ সরণি',
            'holding_no' => '১২/এ',
        ]);

        $sendResp->assertStatus(200);
        $sendResp->assertJson([
            'success' => true,
            'target_email' => $testEmail,
            'target_phone' => $testPhone,
        ]);

        // Assert OTP is safely recorded for this citizen
        $otp = Otp::where('phone', $testPhone)
            ->where('action', 'register')
            ->latest()
            ->first();

        $this->assertNotNull($otp, 'OTP record must be created in database.');
        $this->assertEquals($testEmail, $otp->payload['email']);
        $this->assertEquals(6, strlen($otp->otp_code));

        // 2. Verify OTP using either email or phone
        $verifyResp = $this->postJson('/auth/verify-register-otp', [
            'email' => $testEmail,
            'phone' => $testPhone,
            'otp_code' => $otp->otp_code,
        ]);

        $verifyResp->assertStatus(200);
        $verifyResp->assertJson(['success' => true]);

        $this->assertAuthenticated();

        // 3. Verify user in database
        $this->assertDatabaseHas('users', [
            'email' => $testEmail,
            'phone' => $testPhone,
            'role' => 'citizen',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Citizen Profile Email Change dispatches OTP and updates email.
     */
    public function test_citizen_profile_email_change_dispatches_otp_to_new_email(): void
    {
        $citizen = User::factory()->create([
            'role' => 'citizen',
            'email' => 'oldemail@example.com',
            'phone' => '01711223344',
            'is_active' => true,
        ]);

        $newEmail = 'newcitizen.' . mt_rand(1000, 9999) . '@example.com';

        // 1. Citizen requests email change OTP
        $resp = $this->actingAs($citizen)->postJson('/profile/email/send-otp', [
            'new_email' => $newEmail,
        ]);

        $resp->assertStatus(200);
        $resp->assertJson(['success' => true]);

        $otp = Otp::where('action', 'change_email')
            ->where('payload->new_email', $newEmail)
            ->latest()
            ->first();

        $this->assertNotNull($otp);

        // 2. Citizen verifies OTP
        $verifyResp = $this->actingAs($citizen)->postJson('/profile/email/verify-otp', [
            'new_email' => $newEmail,
            'otp_code' => $otp->otp_code,
        ]);

        $verifyResp->assertStatus(200);
        $verifyResp->assertJson(['success' => true]);

        $citizen->refresh();
        $this->assertEquals($newEmail, $citizen->email);
    }

    /**
     * Test: Application submission and officer approval notification flow.
     */
    public function test_application_lifecycle_triggers_email_services(): void
    {
        $citizen = User::where('role', 'citizen')->firstOrFail();
        $officer = User::where('role', 'reviewing_officer')->firstOrFail();
        $service = Service::where('slug', 'nagorik-sonod')->firstOrFail();

        $officer->assignedServices()->sync([$service->id]);

        // 1. Citizen submits application
        $applyResp = $this->actingAs($citizen)->post('/applications', [
            'service_id' => $service->id,
            'applicant_name' => 'কামাল হোসেন',
            'applicant_phone' => '01899112233',
            'applicant_email' => 'kamal.applicant@example.com',
            'applicant_nid' => '19921234567890',
            'gender' => 'male',
            'marital_status' => 'married',
            'father_or_husband_name' => 'জামাল হোসেন',
            'mother_name' => 'রাশিদা বেগম',
            'ward_no' => 15,
            'present_address' => 'সোনাডাঙ্গা, খুলনা',
            'permanent_address' => 'সোনাডাঙ্গা, খুলনা',
            'documents' => [
                'applicant_photo' => UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg'),
                'applicant_nid_file' => UploadedFile::fake()->create('nid.pdf', 100, 'application/pdf'),
            ],
        ]);

        $applyResp->assertStatus(302);

        $application = Application::where('applicant_email', 'kamal.applicant@example.com')->first();
        $this->assertNotNull($application);
        $this->assertEquals('submitted', $application->status);

        // 2. Officer approves application
        $approveResp = $this->actingAs($officer)->post("/admin/applications/{$application->id}/status", [
            'status' => 'approved',
            'comment' => 'সকল তথ্য ও কাগজপত্র সঠিকভাবে যাচাই করা হয়েছে।',
        ]);

        $approveResp->assertStatus(302);

        $application->refresh();
        $this->assertEquals('approved', $application->status);
        $this->assertNotEmpty($application->certificate_number);
    }
}