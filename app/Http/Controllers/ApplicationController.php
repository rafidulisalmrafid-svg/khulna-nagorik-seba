<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Service;
use App\Models\Ward;
use App\Models\BusinessType;
use App\Models\CharacterCertificateReason;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationTimeline;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function create(string $serviceSlug): Response
    {
        $service = Service::where('slug', $serviceSlug)
            ->where('is_active', true)
            ->with(['category', 'department'])
            ->firstOrFail();

        if ($service->authority_type === 'external_gov_link') {
            return redirect($service->external_url);
        }

        $wards = Ward::orderBy('ward_no')->get();
        $businessTypes = BusinessType::where('is_active', true)->orderBy('display_order')->get();
        $characterReasons = CharacterCertificateReason::where('is_active', true)->orderBy('display_order')->get();

        return Inertia::render('Applications/Create', [
            'service' => $service,
            'wards' => $wards,
            'businessTypes' => $businessTypes,
            'characterReasons' => $characterReasons,
        ]);
    }

    public function store(Request $request)
    {
        $service = Service::findOrFail($request->service_id);
        $isFemaleMarried = ($request->gender === 'female' && $request->marital_status === 'married');

        $rules = [
            'service_id' => 'required|exists:services,id',
            'business_type_id' => 'nullable',
            'measurement_value' => 'nullable|string|max:100',
            'form_data' => 'nullable|array',
            'document_titles' => 'nullable|array',
            'documents' => 'nullable|array',
        ];

        $messages = [];

        // Dynamic Form Field Configuration
        $formConfig = $service->form_fields;
        $basicFields = $formConfig['basic_fields'] ?? null;
        $customFields = $formConfig['custom_fields'] ?? null;

        $isFieldRequired = function ($fieldName, $defaultRequired = true) use ($basicFields) {
            if ($basicFields && isset($basicFields[$fieldName])) {
                $f = $basicFields[$fieldName];
                if (isset($f['enabled']) && !$f['enabled']) {
                    return 'disabled';
                }
                return !empty($f['required']);
            }
            return $defaultRequired;
        };

        $bfDefinitions = [
            'applicant_name' => ['label' => 'আবেদনকারীর পূর্ণ নাম', 'rule' => 'string|max:150', 'defaultReq' => true],
            'applicant_phone' => ['label' => 'মোবাইল নম্বর', 'rule' => 'string|max:20', 'defaultReq' => true],
            'applicant_email' => ['label' => 'ইমেইল ঠিকানা', 'rule' => 'email|max:100', 'defaultReq' => false],
            'applicant_nid' => ['label' => 'জাতীয় পরিচয়পত্র (NID) নম্বর', 'rule' => 'string|max:30', 'defaultReq' => true],
            'gender' => ['label' => 'লিঙ্গ', 'rule' => 'string|in:male,female,other,পুরুষ,মহিলা,অন্যান্য', 'defaultReq' => true],
            'marital_status' => ['label' => 'বৈবাহিক অবস্থা', 'rule' => 'string|in:single,married,widowed,divorced,অবিবাহিত,বিবাহিত,বিধবা,বিপত্নীক,তালাকপ্রাপ্ত,অন্যান্য', 'defaultReq' => true],
            'father_or_husband_name' => ['label' => 'পিতার নাম', 'rule' => 'string|max:150', 'defaultReq' => true],
            'mother_name' => ['label' => 'মাতার নাম', 'rule' => 'string|max:150', 'defaultReq' => true],
            'ward_no' => ['label' => 'ওয়ার্ড নম্বর', 'rule' => 'integer', 'defaultReq' => true],
            'holding_no' => ['label' => 'হোল্ডিং নম্বর', 'rule' => 'string|max:50', 'defaultReq' => false],
            'present_address' => ['label' => 'বর্তমান ঠিকানা', 'rule' => 'string', 'defaultReq' => true],
            'permanent_address' => ['label' => 'স্থায়ী ঠিকানা', 'rule' => 'string', 'defaultReq' => false],
        ];

        foreach ($bfDefinitions as $fn => $meta) {
            $reqStatus = $isFieldRequired($fn, $meta['defaultReq']);
            if ($reqStatus === 'disabled') {
                $rules[$fn] = 'nullable';
            } elseif ($reqStatus === true) {
                $rules[$fn] = 'required|' . $meta['rule'];
                $messages[$fn . '.required'] = $meta['label'] . ' পূরণ করা আবশ্যক।';
            } else {
                $rules[$fn] = 'nullable|' . $meta['rule'];
            }
        }

        $husbandReq = $isFieldRequired('husband_name', false);
        if ($isFemaleMarried && $husbandReq === true) {
            $rules['husband_name'] = 'required|string|max:150';
            $messages['husband_name.required'] = 'বিবাহিত মহিলা আবেদনকারীর ক্ষেত্রে স্বামীর নাম উল্লেখ করা আবশ্যক।';
        } else {
            $rules['husband_name'] = 'nullable|string|max:150';
        }

        // Custom Fields Validation
        if (!empty($customFields) && is_array($customFields)) {
            foreach ($customFields as $cf) {
                if (empty($cf['id'])) continue;
                $cfKey = 'form_data.' . $cf['id'];
                $label = $cf['label_bn'] ?? $cf['id'];
                if (!empty($cf['required'])) {
                    $rules[$cfKey] = 'required';
                    $messages[$cfKey . '.required'] = $label . ' পূরণ করা আবশ্যক।';
                } else {
                    $rules[$cfKey] = 'nullable';
                }
            }
        }

        // Document Rules Validation
        $docConfig = $service->required_documents_bn;
        if (!empty($docConfig) && is_array($docConfig)) {
            $isStructured = isset($docConfig[0]) && is_array($docConfig[0]) && isset($docConfig[0]['id']);
            if ($isStructured) {
                foreach ($docConfig as $doc) {
                    if (empty($doc['id'])) continue;
                    $docId = $doc['id'];
                    $docKey = 'documents.' . $docId;
                    $docTitle = $doc['title_bn'] ?? $docId;
                    $allowedExts = !empty($doc['allowed_types']) && is_array($doc['allowed_types'])
                        ? implode(',', $doc['allowed_types'])
                        : 'jpg,jpeg,png,webp,pdf';

                    if (!empty($doc['required'])) {
                        $rules[$docKey] = 'required|file|mimes:' . $allowedExts . '|max:15360';
                        $messages[$docKey . '.required'] = $docTitle . ' আপলোড করা আবশ্যক।';
                        $messages[$docKey . '.mimes'] = $docTitle . ' ফাইলটি অবশ্যই ' . strtoupper($allowedExts) . ' ফরম্যাটে হতে হবে।';
                        $messages[$docKey . '.max'] = $docTitle . ' ফাইলের সাইজ ১৫ মেগাবাইটের কম হতে হবে।';
                    } else {
                        $rules[$docKey] = 'nullable|file|mimes:' . $allowedExts . '|max:15360';
                        $messages[$docKey . '.mimes'] = $docTitle . ' ফাইলটি অবশ্যই ' . strtoupper($allowedExts) . ' ফরম্যাটে হতে হবে।';
                    }
                }
            } else {
                $rules['documents.*'] = 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:15360';
            }
        } else {
            $rules['documents.*'] = 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:15360';
        }

        $request->validate($rules, $messages);

        // Generate unique tracking ID
        do {
            $trackingId = 'KCC-' . date('Y') . '-' . mt_rand(10000, 99999);
        } while (Application::where('tracking_id', $trackingId)->exists());

        // Auto-assign to responsible officer for this specific service
        $assignedOfficerId = DB::table('officer_services')
            ->where('service_id', $service->id)
            ->where('is_active', true)
            ->value('user_id');

        if (!$assignedOfficerId && $service->department_id) {
            $assignedOfficerId = User::where('department_id', $service->department_id)
                ->whereIn('role', ['reviewing_officer', 'department_admin'])
                ->value('id');
        }

        if (!$assignedOfficerId) {
            $assignedOfficerId = User::whereIn('role', ['reviewing_officer', 'super_admin'])->value('id');
        }

        $assignedOfficer = $assignedOfficerId ? User::find($assignedOfficerId) : null;
        $officerDesignation = $assignedOfficer ? ($assignedOfficer->designation ?? $assignedOfficer->name) : 'সংশ্লিষ্ট কর্মকর্তা';

        DB::beginTransaction();
        try {
            
            $normalizedGender = $request->gender;
            if ($normalizedGender === 'পুরুষ') $normalizedGender = 'male';
            elseif ($normalizedGender === 'মহিলা') $normalizedGender = 'female';
            elseif ($normalizedGender === 'অন্যান্য') $normalizedGender = 'other';

            $maritalMap = [
                'অবিবাহিত' => 'single',
                'বিবাহিত' => 'married',
                'বিধবা' => 'widowed',
                'বিপত্নীক' => 'widowed',
                'তালাকপ্রাপ্ত' => 'divorced',
                'অন্যান্য' => 'single',
            ];
            $normalizedMarital = $request->marital_status;
            if (isset($maritalMap[$normalizedMarital])) {
                $normalizedMarital = $maritalMap[$normalizedMarital];
            }

            $application = Application::create([
                'tracking_id' => $trackingId,
                'service_id' => $service->id,
                'business_type_id' => !empty($request->business_type_id) ? $request->business_type_id : null,
                'measurement_value' => $request->measurement_value,
                'user_id' => $request->user()->id,
                'applicant_name' => $request->applicant_name,
                'applicant_phone' => $request->applicant_phone,
                'applicant_email' => $request->applicant_email ?? $request->user()->email,
                'applicant_nid' => $request->applicant_nid,
                'gender' => $normalizedGender,
                'marital_status' => $normalizedMarital,
                'husband_name' => $isFemaleMarried ? $request->husband_name : null,
                'father_or_husband_name' => $request->father_or_husband_name,
                'mother_name' => $request->mother_name,
                'ward_no' => $request->ward_no,
                'holding_no' => $request->holding_no,
                'present_address' => $request->present_address,
                'permanent_address' => $request->permanent_address ?? $request->present_address,
                'form_data' => $request->form_data ?? [],
                'status' => 'submitted',
                'assigned_to' => $assignedOfficerId,
                'fee_amount' => $service->fee_amount,
                'payment_status' => 'unpaid',
                'submitted_at' => now(),
            ]);

            // Save all uploaded documents
            if ($request->hasFile('documents')) {
                $docTitles = [
                    'applicant_photo' => 'আবেদনকারীর ছবি',
                    'applicant_nid_file' => 'নাগরিকের জাতীয় পরিচয়পত্র (NID)',
                    'husband_nid_file' => 'স্বামীর জাতীয় পরিচয়পত্র (NID)',
                    'trade_rent_agreement' => 'দোকান/অফিসের ভাড়ার চুক্তিপত্র বা মালিকানা দলিল',
                    'trade_tax_receipt' => 'হোল্ডিং ট্যাক্স ও পৌরকর পরিশোধের রসিদ',
                    'trade_tin_certificate' => 'ই-টিন সার্টিফিকেট',
                    'character_recommendation' => 'স্থানীয় জনপ্রতিনিধির সুপারিশপত্র',
                ];

                $customTitles = $request->input('document_titles', []);

                foreach ($request->file('documents') as $key => $file) {
                    if ($file && $file->isValid()) {
                        $originalName = $file->getClientOriginalName();
                        $path = $file->store('applications/' . $application->id, 'public');
                        
                        $title = $customTitles[$key] 
                            ?? $docTitles[$key] 
                            ?? (is_string($key) && !is_numeric($key) ? str_replace('_', ' ', $key) : 'প্রয়োজনীয় সংযুক্তি');

                        ApplicationDocument::create([
                            'application_id' => $application->id,
                            'document_title' => $title,
                            'file_path' => '/storage/' . $path,
                            'file_name' => $originalName,
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getClientMimeType(),
                            'is_requested_addition' => false,
                        ]);
                    }
                }
            }

            // Timeline with automatic officer routing notice
            ApplicationTimeline::create([
                'application_id' => $application->id,
                'user_id' => $request->user()->id,
                'status' => 'submitted',
                'action_title' => 'আবেদন সফলভাবে দাখিল ও দায়িত্বপ্রাপ্ত কর্মকর্তার কাছে প্রেরণ',
                'comment' => "নাগরিকের আবেদন সফলভাবে দাখিল হয়েছে। আবেদনটি যাচাই-বাছাই ও পর্যালোচনার জন্য কর্মকর্তা '{$officerDesignation}'-এর টেবিলে প্রেরণ করা হয়েছে।",
            ]);

            // Audit
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'application_submitted',
                'model_type' => 'Application',
                'model_id' => $application->id,
                'ip_address' => $request->ip(),
                'details' => [
                    'tracking_id' => $trackingId,
                    'service' => $service->name_bn,
                    'assigned_to' => $assignedOfficerId,
                ],
            ]);

            DB::commit();

            // Dispatch confirmation email to applicant with tracking details
            try {
                \App\Services\EmailNotificationService::sendApplicationSubmittedNotification($application);
            } catch (\Throwable $mailEx) {
                \Illuminate\Support\Facades\Log::warning("Email notification error on application submit: " . $mailEx->getMessage());
            }


            return redirect()->route('applications.show', $application->tracking_id)
                ->with('success', 'আপনার আবেদনটি সফলভাবে দাখিল হয়েছে এবং দায়িত্বপ্রাপ্ত কর্মকর্তার কাছে প্রেরিত হয়েছে।')
                ->with('tracking_id', $trackingId);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'আবেদন জমা দিতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function trackView(Request $request): Response
    {
        $trackingId = trim(strtoupper($request->query('tracking_id', $request->input('tracking_id', ''))));
        
        $application = null;
        if (!empty($trackingId)) {
            $application = Application::where('tracking_id', $trackingId)
                ->with(['service.category', 'service.department', 'businessType', 'timelines.user', 'documents', 'payment', 'assignedOfficer'])
                ->first();
        }

        return Inertia::render('Applications/Track', [
            'application' => $application,
            'searchedId' => $trackingId,
        ]);
    }

    public function track(Request $request): Response
    {
        return $this->trackView($request);
    }

    public function show(string $trackingId): Response
    {
        $application = Application::where('tracking_id', $trackingId)
            ->with(['service.category', 'service.department', 'businessType', 'timelines.user', 'documents', 'payment', 'assignedOfficer'])
            ->firstOrFail();

        // Check permission: owner or staff
        $user = auth()->user();
        if ($user && ! $user->isStaff() && $application->user_id !== $user->id) {
            abort(403, 'এই আবেদনের তথ্য দেখার অনুমতি আপনার নেই।');
        }

        return Inertia::render('Applications/Show', [
            'application' => $application,
        ]);
    }

    public function certificate(string $trackingId): Response
    {
        $application = Application::where('tracking_id', $trackingId)
            ->with(['service.category', 'service.department', 'businessType', 'user', 'payment', 'assignedOfficer'])
            ->firstOrFail();

        $user = auth()->user();
        if ($user && ! $user->isStaff() && $application->user_id !== $user->id) {
            abort(403, 'অনুমোদনহীন প্রবেশ নিষেধ।');
        }

        // Must be paid & approved/completed
        if (($application->status !== 'approved' && $application->status !== 'completed') || $application->payment_status !== 'paid') {
            return redirect()->route('applications.show', $application->tracking_id)
                ->with('error', 'আবেদনটি এখনো অনুমোদিত অথবা ফি পরিশোধিত নয়। সনদপত্র ডাউনলোড করা সম্ভব নয়।');
        }

        return Inertia::render('Applications/Certificate', [
            'application' => $application,
        ]);
    }

    /**
     * Resubmit flagged correction documents by citizen
     */
    public function resubmitCorrections(Request $request, int $id)
    {
        $application = Application::with('documents')->findOrFail($id);

        if (auth()->id() !== $application->user_id && ! auth()->user()->isStaff()) {
            abort(403, 'এই আবেদনটি পরিবর্তনের অনুমতি আপনার নেই।');
        }

        // Only allow if status is info_required
        if ($application->status !== 'info_required') {
            return back()->with('error', 'এই আবেদনটি বর্তমানে সংশোধনের অপেক্ষায় নেই।');
        }

        $request->validate([
            'correction_files' => 'required|array',
            'correction_files.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'applicant_note' => 'nullable|string|max:1000',
        ], [
            'correction_files.*.max' => 'ফাইলের সাইজ ১০ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১০ MB বা তার কম সাইজের ফাইল আপলোড করুন।',
            'correction_files.*.mimes' => 'নথিগুলো অবশ্যই JPG, JPEG, PNG, WEBP অথবা PDF ফরম্যাটে হতে হবে।',
        ]);

        $files = $request->file('correction_files', []);
        $updatedDocTitles = [];

        foreach ($files as $docId => $uploadedFile) {
            if ($uploadedFile && $uploadedFile->isValid()) {
                $doc = \App\Models\ApplicationDocument::where('id', $docId)
                    ->where('application_id', $application->id)
                    ->first();

                if ($doc) {
                    $path = $uploadedFile->store('applications/' . $application->id, 'public');
                    $doc->update([
                        'file_path' => '/storage/' . $path,
                        'file_name' => $uploadedFile->getClientOriginalName(),
                        'file_size' => $uploadedFile->getSize(),
                        'mime_type' => $uploadedFile->getClientMimeType(),
                        'status' => 'accepted',
                        'correction_reason' => null,
                        'corrected_at' => now(),
                    ]);
                    $updatedDocTitles[] = $doc->document_title;
                }
            }
        }

        if (empty($updatedDocTitles)) {
            return back()->with('error', 'অনুগ্রহ করে অন্তত একটি সংশোধিত নথি আপলোড করুন।');
        }

        $application->update([
            'status' => 'under_review',
            'status_note' => 'নাগরিক কর্তৃক সংশোধিত নথিপত্র (' . implode(', ', $updatedDocTitles) . ') পুনরায় দাখিল করা হয়েছে। দায়িত্বপ্রাপ্ত কর্মকর্তার পুনরায় যাচাই-বাছাই প্রক্রিয়াধীন।',
        ]);

        $comment = 'সংশোধিত নথিপত্র দাখিল করা হয়েছে: ' . implode(', ', $updatedDocTitles);
        if ($request->filled('applicant_note')) {
            $comment .= '। আবেদনকারীর মন্তব্য: ' . $request->applicant_note;
        }

        \App\Models\ApplicationTimeline::create([
            'application_id' => $application->id,
            'user_id' => auth()->id(),
            'status' => 'under_review',
            'action_title' => 'সংশোধিত নথিপত্র পুনরায় দাখিল সম্পন্ন',
            'comment' => $comment,
        ]);

        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'application_resubmitted',
            'model_type' => 'Application',
            'model_id' => $application->id,
            'ip_address' => $request->ip(),
            'details' => [
                'updated_documents' => $updatedDocTitles,
                'note' => $request->applicant_note,
            ],
        ]);

        return redirect()->route('applications.show', $application->tracking_id)
            ->with('success', 'সংশোধিত নথিপত্র সফলভাবে পুনরায় দাখিল করা হয়েছে। দায়িত্বপ্রাপ্ত কর্মকর্তা এটি পুনরায় যাচাই করবেন।');
    }

    public function uploadAdditionalDoc(Request $request, int $id)
    {
        $application = Application::findOrFail($id);

        if (auth()->id() !== $application->user_id && ! auth()->user()->isStaff()) {
            abort(403);
        }

        $request->validate([
            'document_title' => 'required|string|max:100',
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ], [
            'file.max' => 'ফাইলের সাইজ ১০ MB-এর বেশি হতে পারবে না। অনুগ্রহ করে ১০ MB বা তার কম সাইজের ফাইল আপলোড করুন।',
            'file.mimes' => 'নথি অবশ্যই JPG, JPEG, PNG, WEBP অথবা PDF ফরম্যাটে হতে হবে।',
        ]);

        $file = $request->file('file');
        $path = $file->store('applications/' . $application->id, 'public');

        ApplicationDocument::create([
            'application_id' => $application->id,
            'document_title' => $request->document_title,
            'file_path' => '/storage/' . $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'is_requested_addition' => true,
        ]);

        $application->update([
            'status' => 'under_review',
            'status_note' => 'নাগরিক কর্তৃক অতিরিক্ত নথিপত্র প্রদান করা হয়েছে। পুনরায় যাচাই-বাছাই করা হচ্ছে।',
        ]);

        ApplicationTimeline::create([
            'application_id' => $application->id,
            'user_id' => auth()->id(),
            'status' => 'under_review',
            'action_title' => 'সংশোধিত / অতিরিক্ত নথি আপলোড সম্পন্ন',
            'comment' => "নাগরিকের পক্ষ থেকে সংশোধিত নথি '{$request->document_title}' জমা দেওয়া হয়েছে।",
        ]);

        return back()->with('success', 'কাগজপত্র সফলভাবে আপলোড করা হয়েছে। কর্মকর্তা শীঘ্রই যাচাই করবেন।');
    }
}