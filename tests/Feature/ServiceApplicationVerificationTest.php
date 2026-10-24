<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Service;
use App\Models\Application;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ServiceApplicationVerificationTest extends TestCase
{
    use RefreshDatabase;
    protected User $citizen;
    protected User $officer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');

        $this->citizen = User::where('role', 'citizen')->first() 
            ?? User::factory()->create(['role' => 'citizen']);

        $this->officer = User::where('role', 'reviewing_officer')->first() ?? User::factory()->create(['role' => 'reviewing_officer']);
        $this->officer->assignedServices()->sync(Service::pluck('id'));
    }

    public function test_all_active_services_can_be_applied_for_successfully(): void
    {
        $services = Service::where('is_active', true)
            ->where('authority_type', '!=', 'external_gov_link')
            ->get();

        $this->assertNotEmpty($services, 'At least one active service must exist in the database.');

        foreach ($services as $service) {
            // Prepare uploaded documents according to service requirement
            $docs = [];
            $docTitles = [];

            if (!empty($service->required_documents_bn) && is_array($service->required_documents_bn)) {
                foreach ($service->required_documents_bn as $idx => $d) {
                    $docId = is_array($d) ? ($d['id'] ?? "doc_{$idx}") : "doc_{$idx}";
                    $docTitle = is_array($d) ? ($d['title_bn'] ?? "Document {$idx}") : $d;
                    $docs[$docId] = UploadedFile::fake()->create("{$docId}.pdf", 100, 'application/pdf');
                    $docTitles[$docId] = $docTitle;
                }
            } else {
                $docs['applicant_photo'] = UploadedFile::fake()->image('photo.jpg', 300, 300);
                $docs['applicant_nid_file'] = UploadedFile::fake()->create('nid.pdf', 100, 'application/pdf');
            }

            // Prepare payload
            $payload = [
                'service_id' => $service->id,
                'applicant_name' => 'মোঃ রফিকুল ইসলাম (পরীক্ষামূলক)',
                'applicant_phone' => '01711000001',
                'applicant_email' => 'citizen@example.com',
                'applicant_nid' => '19900112345678901',
                'gender' => 'male',
                'marital_status' => 'married',
                'father_or_husband_name' => 'মরহুম আব্দুল জলিল',
                'mother_name' => 'মোসাম্মৎ আয়েশা বেগম',
                'ward_no' => 17,
                'present_address' => 'সোনাডাঙ্গা আবাসিক এলাকা, খুলনা',
                'permanent_address' => 'সোনাডাঙ্গা আবাসিক এলাকা, খুলনা',
                'documents' => $docs,
                'document_titles' => $docTitles,
                'form_data' => [
                    'property_area' => 'সোনাডাঙ্গা ফেজ ২',
                    'property_road' => 'রোড নং ৫',
                    'building_type' => 'আবাসিক',
                    'land_size' => '৪.৫ শতাংশ',
                    'floor_count' => '২ তলা (দোতলা)',
                    'driving_license_no' => 'DK0123456L',
                    'vehicle_type' => 'ব্যাটারি চালিত ইজিবাইক',
                    'chassis_no' => 'CH-KCC-2026-99',
                    'vehicle_color' => 'সবুজ ও হলুদ',
                ],
            ];

            // Submit application
            $response = $this->actingAs($this->citizen)
                ->post('/applications', $payload);

            // Expect redirect to citizen dashboard or application tracking
            $response->assertSessionHasNoErrors();
            $response->assertStatus(302);

            // Verify application exists in DB
            $application = Application::where('service_id', $service->id)
                ->where('user_id', $this->citizen->id)
                ->latest('id')
                ->first();

            $this->assertNotNull($application, "Application for service '{$service->name_bn}' was not saved to database.");
            $this->assertStringStartsWith('KCC-', $application->tracking_id);
            $this->assertEquals('submitted', $application->status);

            // Verify documents stored
            $this->assertGreaterThan(0, $application->documents()->count(), "Documents were not saved for service '{$service->name_bn}'.");

            // Verify officer can view the application in admin portal
            $adminView = $this->actingAs($this->officer)
                ->get("/admin/applications/{$application->tracking_id}");

            $adminView->assertStatus(200);
        }
    }
}
