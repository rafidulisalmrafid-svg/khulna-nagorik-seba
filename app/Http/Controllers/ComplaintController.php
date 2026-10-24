<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Complaint;
use App\Models\ComplaintTimeline;
use App\Models\Department;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function create(): Response
    {
        $wards = Ward::orderBy('ward_no')->get();
        $categories = [
            ['id' => 'road_repair', 'name_bn' => 'ভাঙা রাস্তা ও গর্ত মেরামত', 'dept' => 'ENG'],
            ['id' => 'drainage', 'name_bn' => 'ড্রেনেজের স্ল্যাব ভাঙা ও বন্ধ ড্রেন', 'dept' => 'ENG'],
            ['id' => 'waterlogging', 'name_bn' => 'বৃষ্টির পানি নিষ্কাশন ও জলাবদ্ধতা', 'dept' => 'ENG'],
            ['id' => 'waste_management', 'name_bn' => 'বর্জ্য অপসারণ না হওয়া বা ময়লার স্তূপ', 'dept' => 'CON'],
            ['id' => 'street_light', 'name_bn' => 'সড়ক বাতি অচল বা মিটমিট করা', 'dept' => 'ELE'],
            ['id' => 'cleanliness', 'name_bn' => 'মৃত প্রাণী অপসারণ বা মশক নিধন', 'dept' => 'CON'],
            ['id' => 'illegal_construction', 'name_bn' => 'অবৈধ দখল বা ফুটপাত দখল', 'dept' => 'REV'],
            ['id' => 'other', 'name_bn' => 'অন্যান্য সিটি কর্পোরেশন সেবা সংক্রান্ত', 'dept' => 'REV'],
        ];

        return Inertia::render('Complaints/Create', [
            'wards' => $wards,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'citizen_name' => 'required|string|max:150',
            'citizen_phone' => 'required|string|max:20',
            'citizen_email' => 'nullable|email|max:100',
            'category' => 'required|string',
            'ward_no' => 'required|integer',
            'location_landmark' => 'required|string|max:255',
            'description' => 'required|string',
            'evidence_file' => 'nullable|file|mimes:jpg,jpeg,png,mp4,pdf|max:10240',
        ]);

        // Auto map department based on category
        $deptCode = match ($request->category) {
            'road_repair', 'drainage', 'waterlogging' => 'ENG',
            'waste_management', 'cleanliness' => 'CON',
            'street_light' => 'ELE',
            default => 'REV',
        };

        $department = Department::where('code', $deptCode)->first();

        // Generate unique tracking ID
        do {
            $trackingId = 'CMP-' . date('Y') . '-' . mt_rand(10000, 99999);
        } while (Complaint::where('tracking_id', $trackingId)->exists());

        DB::beginTransaction();
        try {
            $evidencePath = null;
            if ($request->hasFile('evidence_file')) {
                $path = $request->file('evidence_file')->store('complaints', 'public');
                $evidencePath = '/storage/' . $path;
            }

            $complaint = Complaint::create([
                'tracking_id' => $trackingId,
                'user_id' => auth()->id(),
                'citizen_name' => $request->citizen_name,
                'citizen_phone' => $request->citizen_phone,
                'citizen_email' => $request->citizen_email,
                'category' => $request->category,
                'ward_no' => $request->ward_no,
                'location_landmark' => $request->location_landmark,
                'description' => $request->description,
                'evidence_file_path' => $evidencePath,
                'status' => 'submitted',
                'priority' => 'medium',
                'department_id' => $department?->id,
            ]);

            ComplaintTimeline::create([
                'complaint_id' => $complaint->id,
                'user_id' => auth()->id(),
                'status' => 'submitted',
                'action_title' => 'অভিযোগ সফলভাবে দাখিল হয়েছে',
                'comment' => 'অভিযোগটি সংশ্লিষ্ট বিভাগের তদারকি তালিকায় অন্তর্ভুক্ত করা হয়েছে।',
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'complaint_created',
                'model_type' => 'Complaint',
                'model_id' => $complaint->id,
                'ip_address' => $request->ip(),
                'details' => ['tracking_id' => $trackingId, 'category' => $request->category],
            ]);

            DB::commit();

            return redirect()->route('complaints.track', ['tracking_id' => $trackingId])
                ->with('success', 'আপনার অভিযোগটি সফলভাবে নিবন্ধিত হয়েছে। ট্র্যাকিং নম্বরটি সংরক্ষণ করুন।')
                ->with('tracking_id', $trackingId);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'অভিযোগ জমা দিতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function trackView(Request $request): Response
    {
        return $this->track($request);
    }

    public function track(Request $request): Response
    {
        $trackingId = trim(strtoupper($request->query('tracking_id', $request->input('tracking_id', ''))));

        $complaint = null;
        if ($trackingId) {
            $complaint = Complaint::where('tracking_id', $trackingId)
                ->with(['department', 'timelines.user'])
                ->first();

            // Mask citizen sensitive details for public privacy
            if ($complaint && (! auth()->check() || (! auth()->user()->isStaff() && auth()->id() !== $complaint->user_id))) {
                $complaint->citizen_name = Str::mask($complaint->citizen_name, '*', 2, -2);
                $complaint->citizen_phone = Str::mask($complaint->citizen_phone, '*', 3, 4);
                $complaint->citizen_email = $complaint->citizen_email ? Str::mask($complaint->citizen_email, '*', 2, 4) : null;
                $complaint->internal_notes = null; // hide internal notes from public
            }
        }

        return Inertia::render('Complaints/Track', [
            'complaint' => $complaint,
            'searchedId' => $trackingId,
        ]);
    }

    public function feedback(Request $request, int $id)
    {
        $complaint = Complaint::findOrFail($id);

        if (auth()->id() !== $complaint->user_id && ! auth()->user()->isStaff()) {
            abort(403);
        }

        $request->validate([
            'citizen_rating' => 'required|integer|min:1|max:5',
            'citizen_feedback' => 'nullable|string|max:500',
        ]);

        $complaint->update([
            'citizen_rating' => $request->citizen_rating,
            'citizen_feedback' => $request->citizen_feedback,
        ]);

        return back()->with('success', 'আপনার মূল্যবান মতামত গ্রহণ করা হয়েছে। ধন্যবাদ!');
    }
}
