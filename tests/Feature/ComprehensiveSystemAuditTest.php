<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Service;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\BusinessType;
use App\Models\CharacterCertificateReason;
use App\Models\Department;
use App\Models\GeoDivision;
use App\Models\GeoDistrict;
use App\Models\GeoUpazila;
use App\Models\GeoUnion;
use App\Models\Ward;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ComprehensiveSystemAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $officer;
    protected User $complaintOfficer;
    protected User $citizen;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');

        $this->superAdmin = User::where('role', 'super_admin')->first();
        $this->officer = User::where('role', 'reviewing_officer')->first();
        $this->complaintOfficer = User::where('role', 'complaint_officer')->first();
        $this->citizen = User::where('role', 'citizen')->first();

        // Ensure reviewing officer has all services assigned
        $this->officer->assignedServices()->sync(Service::pluck('id'));
    }

    /**
     * Test Public APIs and Homepage Navigation
     */
    public function test_public_routes_and_geo_cascading_api(): void
    {
        // 1. Homepage
        $resp = $this->get('/');
        $resp->assertStatus(200);

        // 2. Services list
        $resp = $this->get('/services');
        $resp->assertStatus(200);

        // 3. Geo cascading API
        $resp = $this->getJson('/api/geo/cascading');
        $resp->assertStatus(200);
        $resp->assertJsonStructure([
            '*' => [
                'id',
                'name_bn',
                'districts' => [
                    '*' => [
                        'id',
                        'name_bn',
                        'upazilas' => [
                            '*' => [
                                'id',
                                'name_bn',
                                'unions' => [
                                    '*' => [
                                        'id',
                                        'name_bn',
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]);
    }

    /**
     * Test Complete Application Lifecycle:
     * Apply -> Review -> Request Info -> Citizen Resubmits -> Approve -> Payment -> Certificate
     */
    public function test_complete_application_workflow_and_state_consistency(): void
    {
        $service = Service::where('slug', 'nagorik-sonod')->firstOrFail();

        // 1. Citizen submits application
        $applyPayload = [
            'service_id' => $service->id,
            'applicant_name' => 'আব্দুর রহমান',
            'applicant_phone' => '01711000001',
            'applicant_email' => 'citizen@example.com',
            'applicant_nid' => '19900112345678901',
            'gender' => 'male',
            'marital_status' => 'married',
            'father_or_husband_name' => 'মরহুম মোঃ করিম',
            'mother_name' => 'মোসাম্মৎ রহিমা খাতুন',
            'ward_no' => 17,
            'present_address' => 'সোনাডাঙ্গা, খুলনা',
            'permanent_address' => 'সোনাডাঙ্গা, খুলনা',
            'documents' => [
                'applicant_photo' => UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg'),
                'applicant_nid_file' => UploadedFile::fake()->create('nid.pdf', 100, 'application/pdf'),
            ],
            'document_titles' => [
                'applicant_photo' => 'আবেদনকারীর ছবি',
                'applicant_nid_file' => 'জাতীয় পরিচয়পত্র',
            ],
            'form_data' => [
                'character_reason' => 'চাকরির আবেদন',
            ],
        ];

        $resp = $this->actingAs($this->citizen)->post('/applications', $applyPayload);
        $resp->assertStatus(302);
        $resp->assertSessionHasNoErrors();

        $application = Application::where('user_id', $this->citizen->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertEquals('submitted', $application->status);
        $this->assertEquals('unpaid', $application->payment_status);

        // 2. Public Track Search works for this application
        $trackResp = $this->post('/track-search', ['tracking_id' => $application->tracking_id]);
        $trackResp->assertStatus(302);
        $trackResp->assertRedirect("/applications/track?tracking_id={$application->tracking_id}");

        // 3. Officer puts application Under Review
        $resp = $this->actingAs($this->officer)->post("/admin/applications/{$application->id}/status", [
            'status' => 'under_review',
            'comment' => 'কাগজপত্র যাচাই করা হচ্ছে।',
        ]);
        $resp->assertStatus(302);
        $application->refresh();
        $this->assertEquals('under_review', $application->status);

        // 4. Officer flags a document for correction (info_required)
        $doc = $application->documents()->first();
        $this->assertNotNull($doc);

        $resp = $this->actingAs($this->officer)->post("/admin/applications/{$application->id}/status", [
            'status' => 'info_required',
            'comment' => 'অনুগ্রহ করে পরিষ্কার ছবি আপলোড করুন।',
            'flagged_documents' => [
                [
                    'id' => $doc->id,
                    'reason' => 'ছবি ঝাপসা দেখাচ্ছে।',
                ]
            ],
        ]);
        $resp->assertStatus(302);
        $application->refresh();
        $this->assertEquals('info_required', $application->status);

        $doc->refresh();
        $this->assertEquals('needs_correction', $doc->status);
        $this->assertEquals('ছবি ঝাপসা দেখাচ্ছে।', $doc->correction_reason);

        // 5. Citizen resubmits corrected document
        $resubmitResp = $this->actingAs($this->citizen)->post("/applications/{$application->id}/resubmit-corrections", [
            'correction_files' => [
                $doc->id => UploadedFile::fake()->create('clear_photo.jpg', 120, 'image/jpeg'),
            ],
            'applicant_note' => 'পরিষ্কার ছবি পুনরায় সংযুক্ত করা হয়েছে।',
        ]);
        $resubmitResp->assertStatus(302);
        $application->refresh();
        $this->assertEquals('under_review', $application->status);

        $doc->refresh();
        $this->assertEquals('accepted', $doc->status);

        // 6. Officer approves application
        $resp = $this->actingAs($this->officer)->post("/admin/applications/{$application->id}/status", [
            'status' => 'approved',
            'comment' => 'যাচাই সম্পন্ন, আবেদন অনুমোদন করা হলো।',
        ]);
        $resp->assertStatus(302);
        $application->refresh();
        $this->assertEquals('approved', $application->status);
        $this->assertNotNull($application->approved_at);

        // 7. Citizen accesses checkout
        $checkoutResp = $this->actingAs($this->citizen)->get("/payments/checkout/{$application->tracking_id}");
        $checkoutResp->assertStatus(200);

        // 8. Citizen completes payment
        $payResp = $this->actingAs($this->citizen)->post('/payments/process', [
            'application_id' => $application->id,
            'payment_method' => 'bkash',
            'sender_account' => '01711000001',
        ]);
        $payResp->assertStatus(302);

        $application->refresh();
        $this->assertEquals('completed', $application->status);
        $this->assertEquals('paid', $application->payment_status);
        $this->assertNotNull($application->certificate_number);

        // 9. Payment record verified
        $payment = Payment::where('application_id', $application->id)->first();
        $this->assertNotNull($payment);
        $this->assertEquals('completed', $payment->status);
        $this->assertEquals($application->fee_amount, $payment->amount);

        // 10. Receipt page loads
        $receiptResp = $this->actingAs($this->citizen)->get("/payments/receipt/{$payment->receipt_number}");
        $receiptResp->assertStatus(200);

        // 11. Certificate view / download loads
        $certResp = $this->actingAs($this->citizen)->get("/applications/certificate/{$application->tracking_id}");
        $certResp->assertStatus(200);
    }

    /**
     * Test Complaint Lifecycle & Citizen Feedback
     */
    public function test_complaint_lifecycle_and_feedback(): void
    {
        // 1. Citizen registers complaint
        $resp = $this->actingAs($this->citizen)->post('/complaints', [
            'citizen_name' => 'আব্দুর রহমান',
            'citizen_phone' => '01711000001',
            'citizen_email' => 'citizen@example.com',
            'category' => 'road_repair',
            'ward_no' => 17,
            'location_landmark' => 'সোনাডাঙ্গা মেইন রোড',
            'description' => 'সোনাডাঙ্গা রোডের ম্যানহোলের ঢাকনা ভেঙে গেছে, দ্রুত মেরামত প্রয়োজন।',
            'evidence_file' => UploadedFile::fake()->create('damage.jpg', 150, 'image/jpeg'),
        ]);
        $resp->assertStatus(302);

        $complaint = Complaint::where('user_id', $this->citizen->id)
            ->where('category', 'road_repair')
            ->latest('id')
            ->firstOrFail();

        $this->assertEquals('submitted', $complaint->status);
        $this->assertStringStartsWith('CMP-', $complaint->tracking_id);

        // 2. Complaint Officer updates status to action_in_progress
        $resp = $this->actingAs($this->complaintOfficer)->post("/admin/complaints/{$complaint->id}/status", [
            'status' => 'action_in_progress',
            'comment' => 'তদন্ত দল পাঠানো হয়েছে।',
        ]);
        $resp->assertStatus(302);
        $complaint->refresh();
        $this->assertEquals('action_in_progress', $complaint->status);

        // Verify timeline created
        $timeline1 = $complaint->timelines()->where('status', 'action_in_progress')->first();
        $this->assertNotNull($timeline1);
        $this->assertEquals('তদন্ত দল পাঠানো হয়েছে।', $timeline1->comment);

        // 3. Complaint Officer resolves the complaint
        $resp = $this->actingAs($this->complaintOfficer)->post("/admin/complaints/{$complaint->id}/status", [
            'status' => 'resolved',
            'comment' => 'নতুন ঢাকনা স্থাপন করা হয়েছে এবং সমস্যা সমাধান হয়েছে।',
        ]);
        $resp->assertStatus(302);
        $complaint->refresh();
        $this->assertEquals('resolved', $complaint->status);
        $this->assertNotNull($complaint->resolved_at);

        // 4. Citizen provides feedback rating
        $resp = $this->actingAs($this->citizen)->post("/complaints/{$complaint->id}/feedback", [
            'citizen_rating' => 5,
            'citizen_feedback' => 'খুব দ্রুত সমাধান হয়েছে, ধন্যবাদ!',
        ]);
        $resp->assertStatus(302);
        $complaint->refresh();
        $this->assertEquals(5, $complaint->citizen_rating);
    }

    /**
     * Test Citizen Profile Update & Security
     */
    public function test_citizen_profile_update_and_security(): void
    {
        // 1. Update basic info with cascading address fields
        $resp = $this->actingAs($this->citizen)->post('/profile/update-info', [
            'name' => 'মোঃ আব্দুর রহমান আপডেট',
            'division' => 'খুলনা',
            'district' => 'খুলনা',
            'upazila' => 'সোনাডাঙ্গা',
            'union_ward' => '১৭ নম্বর ওয়ার্ড',
            'road_street' => 'মেইন রোড',
            'holding_no' => '১২/এ',
            'permanent_address' => 'নতুন ঠিকানা, খুলনা',
        ]);
        $resp->assertStatus(302);
        $this->citizen->refresh();
        $this->assertEquals('মোঃ আব্দুর রহমান আপডেট', $this->citizen->name);

        // 2. Avatar upload
        $avatarFile = UploadedFile::fake()->create('my_avatar.jpg', 80, 'image/jpeg');
        $resp = $this->actingAs($this->citizen)->post('/profile/update-avatar', [
            'avatar' => $avatarFile,
        ]);
        $resp->assertStatus(302);
        $this->citizen->refresh();
        $this->assertNotNull($this->citizen->avatar);

        // 3. Avatar remove
        $resp = $this->actingAs($this->citizen)->delete('/profile/remove-avatar');
        $resp->assertStatus(302);
        $this->citizen->refresh();
        $this->assertNull($this->citizen->avatar);
    }

    /**
     * Test Admin Management of Services, Sliders, and System Settings
     */
    public function test_admin_service_and_configuration_management(): void
    {
        $department = Department::first();
        $category = \App\Models\ServiceCategory::first();

        // 1. Store new service
        $resp = $this->actingAs($this->superAdmin)->post('/admin/services', [
            'service_category_id' => $category->id,
            'department_id' => $department->id,
            'name' => 'Water Connection Permit',
            'name_bn' => 'নতুন পানির সংযোগ অনুমতিপত্র',
            'fee_amount' => 500.00,
            'estimated_days' => 7,
            'short_description_bn' => 'নতুন বাসাবাড়ি বা বাণিজ্যিক ভবনে পানি সংযোগের আবেদন।',
            'required_documents_bn' => [
                ['id' => 'land_deed', 'title_bn' => 'জমির দলিল', 'required' => true]
            ],
            'eligibility_bn' => 'খুলনা সিটি কর্পোরেশন এলাকার সকল বাসিন্দা।',
        ]);
        $resp->assertStatus(302);

        $newService = Service::where('name', 'Water Connection Permit')->first();
        $this->assertNotNull($newService);
        $this->assertEquals(500.00, (float) $newService->fee_amount);

        // 2. Toggle service active
        $resp = $this->actingAs($this->superAdmin)->post("/admin/services/{$newService->id}/toggle");
        $resp->assertStatus(302);
        $newService->refresh();
        $this->assertFalse((bool) $newService->is_active);

        // Toggle back
        $resp = $this->actingAs($this->superAdmin)->post("/admin/services/{$newService->id}/toggle");
        $resp->assertStatus(302);
        $newService->refresh();
        $this->assertTrue((bool) $newService->is_active);
    }
}
