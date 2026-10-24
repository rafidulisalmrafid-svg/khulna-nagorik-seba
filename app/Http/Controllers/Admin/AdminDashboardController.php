<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Application;
use App\Models\Complaint;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Department;
use App\Models\User;
use App\Models\Payment;
use App\Models\AuditLog;
use App\Models\ApplicationTimeline;
use App\Models\GeoDivision;
use App\Models\GeoDistrict;
use App\Models\GeoUpazila;
use App\Models\GeoUnion;

class AdminDashboardController extends Controller
{
    /**
     * 1. Overview & Comprehensive Analytics Dashboard
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        // Dedicated Officer Dashboard for reviewing officers & non-superadmins
        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedServices = $user->assignedServices()
                ->with(['category', 'department'])
                ->withCount([
                    'applications',
                    'applications as pending_count' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review']),
                    'applications as info_required_count' => fn ($q) => $q->where('status', 'info_required'),
                    'applications as approved_count' => fn ($q) => $q->whereIn('status', ['approved', 'completed']),
                    'applications as rejected_count' => fn ($q) => $q->where('status', 'rejected'),
                ])
                ->get();
            $assignedServiceIds = $assignedServices->pluck('id');

            $appQuery = Application::whereIn('service_id', $assignedServiceIds);

            $dateRange = $request->query('date_range', 'all');
            if ($dateRange === 'today') {
                $appQuery->whereDate('created_at', today());
            } elseif ($dateRange === 'week') {
                $appQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            } elseif ($dateRange === 'month') {
                $appQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
            }

            $totalApplications = (clone $appQuery)->count();
            $pendingApplications = (clone $appQuery)->whereIn('status', ['submitted', 'under_review'])->count();
            $infoRequired = (clone $appQuery)->where('status', 'info_required')->count();
            $approvedApplications = (clone $appQuery)->whereIn('status', ['approved', 'completed'])->count();
            $rejectedApplications = (clone $appQuery)->where('status', 'rejected')->count();
            $uniqueCitizensCount = (clone $appQuery)->distinct('user_id')->count('user_id');

            $recentApplications = (clone $appQuery)
                ->with(['service', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get();

            return Inertia::render('Admin/OfficerDashboard', [
                'officer' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'designation' => $user->designation,
                    'role' => $user->role,
                    'department' => $user->department?->name_bn,
                ],
                'stats' => [
                    'total_applications' => $totalApplications,
                    'pending_applications' => $pendingApplications,
                    'info_required' => $infoRequired,
                    'approved_applications' => $approvedApplications,
                    'rejected_applications' => $rejectedApplications,
                    'unique_citizens' => $uniqueCitizensCount,
                ],
                'assignedServices' => $assignedServices,
                'recentApplications' => $recentApplications,
                'filters' => [
                    'date_range' => $dateRange,
                ],
            ]);
        }

        // Base queries
        $appQuery = Application::query();
        $cmpQuery = Complaint::query();
        $payQuery = Payment::query();

        // RBAC: If officer (not super_admin or helpdesk), restrict to their assigned services
        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedServiceIds = $user->assignedServices()->pluck('services.id');
            $appQuery->whereIn('service_id', $assignedServiceIds);
        }

        // Optional date filter
        $dateRange = $request->query('date_range', 'all'); // 'today', 'week', 'month', 'year', 'all'
        if ($dateRange === 'today') {
            $appQuery->whereDate('created_at', today());
            $payQuery->whereDate('created_at', today());
        } elseif ($dateRange === 'week') {
            $appQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            $payQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateRange === 'month') {
            $appQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
            $payQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
        }

        // Service filter
        if ($request->filled('service_id')) {
            $appQuery->where('service_id', $request->service_id);
        }

        // Ward / District filter
        if ($request->filled('ward_no')) {
            $appQuery->where('ward_no', $request->ward_no);
        }

        // 1. Citizen metrics
        $totalCitizens = User::where('role', 'citizen')->count();
        $activeCitizens = User::where('role', 'citizen')
            ->where('is_active', true)
            ->where('updated_at', '>=', now()->subDays(30))
            ->count();

        // 2. Applications metrics
        $totalApplications = (clone $appQuery)->count();
        $pendingApplications = (clone $appQuery)->whereIn('status', ['submitted', 'under_review', 'info_required'])->count();
        $approvedApplications = (clone $appQuery)->whereIn('status', ['approved', 'completed'])->count();
        $rejectedApplications = (clone $appQuery)->where('status', 'rejected')->count();

        // 3. Financial metrics
        $totalBilled = (clone $appQuery)->sum('fee_amount');
        $totalCollected = (clone $payQuery)->where('status', 'completed')->sum('amount');
        $totalRefunded = (clone $payQuery)->where('status', 'refunded')->sum('amount');
        $totalPendingFee = max(0, $totalBilled - $totalCollected);

        // 4. Complaints metrics
        $totalComplaints = (clone $cmpQuery)->count();
        $resolvedComplaints = (clone $cmpQuery)->where('status', 'resolved')->count();
        $pendingComplaints = (clone $cmpQuery)->whereIn('status', ['submitted', 'assigned', 'under_investigation', 'action_in_progress'])->count();

        // 5. Top applied services (Ranked by volume)
        $topServices = Service::withCount('applications')
            ->orderBy('applications_count', 'desc')
            ->take(6)
            ->get(['id', 'name_bn', 'fee_amount', 'applications_count'])
            ->map(function ($s) use ($totalApplications) {
                return [
                    'id' => $s->id,
                    'name_bn' => $s->name_bn,
                    'fee_amount' => $s->fee_amount,
                    'count' => $s->applications_count,
                    'percentage' => $totalApplications > 0 ? round(($s->applications_count / $totalApplications) * 100, 1) : 0,
                ];
            });

        // 6. Top complaints categories
        $topComplaints = Department::withCount('complaints')
            ->orderBy('complaints_count', 'desc')
            ->take(5)
            ->get(['id', 'name_bn', 'complaints_count']);

        // 7. Officer performance summary (Applications received, completed, pending) - High-efficiency aggregated query
        $officersPerformance = User::whereIn('role', ['reviewing_officer', 'department_admin', 'super_admin'])
            ->with(['department', 'assignedServices:id,name_bn'])
            ->withCount([
                'assignedApplications as total_assigned',
                'assignedApplications as completed' => fn ($q) => $q->whereIn('status', ['approved', 'completed']),
                'assignedApplications as pending' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review', 'info_required']),
            ])
            ->get()
            ->map(function ($officer) {
                return [
                    'id' => $officer->id,
                    'name' => $officer->name,
                    'email' => $officer->email,
                    'phone' => $officer->phone,
                    'designation' => $officer->designation,
                    'department' => $officer->department?->name_bn,
                    'assigned_services' => $officer->assignedServices->pluck('name_bn'),
                    'total_assigned' => $officer->total_assigned,
                    'completed' => $officer->completed,
                    'pending' => $officer->pending,
                    'resolution_rate' => $officer->total_assigned > 0 ? round(($officer->completed / $officer->total_assigned) * 100) : 0,
                ];
            });

        // 8. Service requirements & fees details
        $serviceRequirements = Service::with(['category', 'department', 'assignedOfficers:id,name'])
            ->withCount([
                'applications',
                'applications as approved_count' => fn ($q) => $q->whereIn('status', ['approved', 'completed']),
                'applications as pending_count' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review', 'info_required']),
                'applications as rejected_count' => fn ($q) => $q->where('status', 'rejected'),
            ])
            ->orderBy('display_order')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name_bn' => $s->name_bn,
                    'category' => $s->category?->name_bn,
                    'fee_amount' => $s->fee_amount,
                    'is_free' => (float)$s->fee_amount <= 0,
                    'estimated_days' => $s->estimated_days,
                    'required_documents' => collect($s->required_documents_bn ?: [])->map(function ($doc) {
                        if (is_array($doc)) {
                            return $doc['title_bn'] ?? $doc['title'] ?? $doc['name'] ?? 'কাগজপত্র';
                        }
                        return $doc;
                    })->values()->all(),
                    'eligibility' => $s->eligibility_bn,
                    'is_active' => $s->is_active,
                    'assigned_officers' => $s->assignedOfficers->pluck('name'),
                    'stats' => [
                        'total' => $s->applications_count,
                        'approved' => $s->approved_count,
                        'pending' => $s->pending_count,
                        'rejected' => $s->rejected_count,
                    ],
                ];
            });

        // Recent applications and complaints
        $recentApplications = (clone $appQuery)->with(['service', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        $recentComplaints = (clone $cmpQuery)->with(['department', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        $auditLogs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        $servicesList = Service::where('is_active', true)->get(['id', 'name_bn']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_citizens' => $totalCitizens,
                'active_citizens' => $activeCitizens,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'approved_applications' => $approvedApplications,
                'rejected_applications' => $rejectedApplications,
                'total_billed' => $totalBilled,
                'total_collected' => $totalCollected,
                'total_pending_fee' => $totalPendingFee,
                'total_refunded' => $totalRefunded,
                'total_complaints' => $totalComplaints,
                'resolved_complaints' => $resolvedComplaints,
                'pending_complaints' => $pendingComplaints,
            ],
            'topServices' => $topServices,
            'topComplaints' => $topComplaints,
            'officersPerformance' => $officersPerformance,
            'serviceRequirements' => $serviceRequirements,
            'recentApplications' => $recentApplications,
            'recentComplaints' => $recentComplaints,
            'auditLogs' => $auditLogs,
            'servicesList' => $servicesList,
            'filters' => [
                'date_range' => $dateRange,
                'service_id' => $request->service_id,
                'ward_no' => $request->ward_no,
            ],
        ]);
    }

    /**
     * 2. Applications Index with strict Service-based RBAC
     */
    public function applications(Request $request): Response
    {
        $user = auth()->user();
        $status = $request->query('status');
        $search = $request->query('search');
        $serviceId = $request->query('service_id');
        $deptId = $request->query('department');

        $query = Application::with(['service.category', 'service.department', 'businessType', 'user', 'assignedOfficer'])
            ->orderBy('created_at', 'desc');

        // RBAC: If officer, only allow their assigned services
        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedIds = $user->assignedServices()->pluck('services.id');
            $query->whereIn('service_id', $assignedIds);
            $services = Service::whereIn('id', $assignedIds)->where('is_active', true)->get(['id', 'name_bn']);
            $departments = Department::whereHas('services', fn ($q) => $q->whereIn('id', $assignedIds))->where('is_active', true)->get();
        } else {
            $services = Service::where('is_active', true)->get(['id', 'name_bn']);
            $departments = Department::where('is_active', true)->get();
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($serviceId) {
            if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
                if ($user->hasServiceAccess($serviceId)) {
                    $query->where('service_id', $serviceId);
                }
            } else {
                $query->where('service_id', $serviceId);
            }
        }

        if ($deptId) {
            $query->whereHas('service', fn ($q) => $q->where('department_id', $deptId));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_id', 'like', "%{$search}%")
                  ->orWhere('applicant_name', 'like', "%{$search}%")
                  ->orWhere('applicant_phone', 'like', "%{$search}%")
                  ->orWhere('applicant_nid', 'like', "%{$search}%");
            });
        }

        $applications = $query->paginate(15)->withQueryString();
        $officers = User::whereIn('role', ['reviewing_officer', 'department_admin', 'super_admin'])->get(['id', 'name', 'role', 'designation']);

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'departments' => $departments,
            'services' => $services,
            'officers' => $officers,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'service_id' => $serviceId,
                'department' => $deptId,
            ],
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    /**
     * 3. Show Application Details (Protected by Service RBAC)
     */
    public function showApplication(string $trackingId): Response
    {
        $user = auth()->user();

        $application = Application::where('tracking_id', $trackingId)
            ->with(['service.category', 'service.department', 'businessType', 'user', 'assignedOfficer', 'documents', 'timelines.user', 'payment'])
            ->firstOrFail();

        // RBAC Strict Check
        if (!$user->hasServiceAccess($application->service_id)) {
            abort(403, 'অননুমোদিত প্রবেশাধিকার: এই সেবার আবেদন দেখার অনুমতি আপনার নেই।');
        }

        // Record audit log for view
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'application_viewed',
            'model_type' => 'Application',
            'model_id' => $application->id,
            'ip_address' => request()->ip(),
            'details' => ['tracking_id' => $trackingId, 'service' => $application->service?->name_bn],
        ]);

        $officers = User::whereIn('role', ['reviewing_officer', 'department_admin', 'super_admin'])->get(['id', 'name', 'role', 'designation']);

        return Inertia::render('Admin/Applications/Show', [
            'application' => $application,
            'officers' => $officers,
        ]);
    }

    /**
     * 4. Update Application Status (RBAC Protected)
     */
        public function updateApplicationStatus(Request $request, int $id)
    {
        $user = auth()->user();
        $application = Application::findOrFail($id);

        if (!$user->hasServiceAccess($application->service_id)) {
            abort(403, 'অননুমোদিত প্রবেশাধিকার: এই সেবার আবেদন পরিবর্তন করার অনুমতি আপনার নেই।');
        }

        $request->validate([
            'status' => 'required|in:under_review,info_required,approved,rejected,completed',
            'comment' => 'required|string|max:1000',
            'flagged_documents' => 'nullable|array',
            'flagged_documents.*.id' => 'required_with:flagged_documents|integer|exists:application_documents,id',
            'flagged_documents.*.reason' => 'required_with:flagged_documents|string|max:500',
        ]);

        $oldStatus = $application->status;
        $newStatus = $request->status;

        $updates = [
            'status' => $newStatus,
            'status_note' => $request->comment,
        ];

        if ($newStatus === 'approved' && !$application->certificate_number) {
            $updates['certificate_number'] = 'CERT-KCC-' . date('Y') . '-' . mt_rand(100000, 999999);
            $updates['approved_at'] = now();
        }

        if ($newStatus === 'completed') {
            $updates['completed_at'] = now();
        }

        $application->update($updates);

        $flaggedDocSummary = [];
        if ($newStatus === 'info_required') {
            // First reset any previous flagged docs
            \App\Models\ApplicationDocument::where('application_id', $application->id)->update([
                'status' => 'accepted',
                'correction_reason' => null,
            ]);

            if ($request->filled('flagged_documents')) {
                foreach ($request->input('flagged_documents') as $flagged) {
                    $doc = \App\Models\ApplicationDocument::where('id', $flagged['id'])
                        ->where('application_id', $application->id)
                        ->first();
                    if ($doc) {
                        $reason = trim($flagged['reason'] ?? 'সংশোধন প্রয়োজন');
                        $doc->update([
                            'status' => 'needs_correction',
                            'correction_reason' => $reason,
                        ]);
                        $flaggedDocSummary[] = "{$doc->document_title} (কারণ: {$reason})";
                    }
                }
            }
        }

        $actionTitle = match ($newStatus) {
            'under_review' => 'আবেদন পর্যালোচনা শুরু করা হয়েছে',
            'info_required' => 'আবেদন সংশোধনের জন্য ফেরত পাঠানো হয়েছে',
            'approved' => 'আবেদন চূড়ান্ত অনুমোদন করা হয়েছে',
            'rejected' => 'আবেদন বাতিল করা হয়েছে',
            'completed' => 'সেবা প্রদান সফলভাবে সমাপ্ত',
            default => 'আবেদনের স্থিতি পরিবর্তন',
        };

        $timelineComment = $request->comment;
        if (!empty($flaggedDocSummary)) {
            $timelineComment .= ' [চিহ্নিত ত্রুটিপূর্ণ নথি: ' . implode('; ', $flaggedDocSummary) . ']';
        }

        ApplicationTimeline::create([
            'application_id' => $application->id,
            'user_id' => $user->id,
            'status' => $newStatus,
            'action_title' => $actionTitle,
            'comment' => $timelineComment,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'application_status_updated',
            'model_type' => 'Application',
            'model_id' => $application->id,
            'ip_address' => $request->ip(),
            'details' => [
                'from' => $oldStatus,
                'to' => $newStatus,
                'comment' => $request->comment,
                'flagged_documents' => $flaggedDocSummary,
            ],
        ]);

        return back()->with('success', 'আবেদনের স্থিতি ও সংশোধনের নির্দেশনা সফলভাবে পাঠানো হয়েছে।');
    }

    /**
     * Assign specific officer to an application
     */
    public function assignApplicationOfficer(Request $request, int $id)
    {
        $user = auth()->user();
        $application = Application::findOrFail($id);

        if (!$user->hasServiceAccess($application->service_id)) {
            abort(403, 'অননুমোদিত প্রবেশাধিকার: এই সেবার আবেদন দেখার অনুমতি আপনার নেই।');
        }

        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $officer = User::findOrFail($request->assigned_to);

        $application->update([
            'assigned_to' => $officer->id,
            'status' => $application->status === 'submitted' ? 'under_review' : $application->status,
        ]);

        ApplicationTimeline::create([
            'application_id' => $application->id,
            'user_id' => $user->id,
            'status' => $application->status,
            'action_title' => 'দায়িত্বপ্রাপ্ত কর্মকর্তা নিয়োগ',
            'comment' => "আবেদনের দায়িত্ব কর্মকর্তা {$officer->name} ({$officer->designation})-কে প্রদান করা হয়েছে।",
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'application_officer_assigned',
            'model_type' => 'Application',
            'model_id' => $application->id,
            'ip_address' => $request->ip(),
            'details' => ['officer_id' => $officer->id, 'officer_name' => $officer->name],
        ]);

        return back()->with('success', 'কর্মকর্তা সফলভাবে নিয়োগ করা হয়েছে।');
    }

    /**
     * 5. Officer & Staff Management + Service Responsibility Assignment
     */
    public function officers(Request $request): Response
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ। শুধুমাত্র সুপার অ্যাডমিন কর্মকর্তা ব্যবস্থাপনা দেখতে পারবেন।');
        }

        $officers = User::whereIn('role', [
            'super_admin',
            'department_admin',
            'reviewing_officer',
            'accounts_officer',
            'complaint_officer',
            'helpdesk'
        ])
        ->with(['department', 'assignedServices'])
        ->withCount([
            'assignedApplications as total_assigned_apps',
            'assignedApplications as completed_apps' => fn ($q) => $q->whereIn('status', ['approved', 'completed']),
            'assignedApplications as pending_apps' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review', 'info_required']),
        ])
        ->orderBy('role')
        ->get();

        $services = Service::where('is_active', true)->get(['id', 'name_bn', 'category_id', 'fee_amount']);
        $departments = Department::where('is_active', true)->get(['id', 'name_bn']);

        return Inertia::render('Admin/Officers/Index', [
            'officers' => $officers,
            'services' => $services,
            'departments' => $departments,
        ]);
    }

    /**
     * Create a new officer account with initial service assignment
     */
    public function storeOfficer(Request $request)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ।');
        }

        $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:150|unique:users,email',
            'phone' => 'required|string|max:15|unique:users,phone',
            'password' => 'required|string|min:6',
            'role' => 'required|in:super_admin,department_admin,reviewing_officer,accounts_officer,complaint_officer,helpdesk',
            'designation' => 'required|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
        ], [
            'name.required' => 'কর্মকর্তার নাম দেওয়া আবশ্যক।',
            'email.required' => 'অফিসিয়াল ইমেইল দেওয়া আবশ্যক।',
            'email.unique' => 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'phone.required' => 'ফোন নম্বর দেওয়া আবশ্যক।',
            'phone.unique' => 'এই ফোন নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।',
            'designation.required' => 'পদবি দেওয়া আবশ্যক।',
        ]);

        $officer = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'designation' => $request->designation,
            'department_id' => $request->department_id,
            'is_active' => true,
            'must_change_password' => true, // Force password change on first login
        ]);

        if (!empty($request->service_ids)) {
            $officer->assignedServices()->sync($request->service_ids);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'officer_created',
            'model_type' => 'User',
            'model_id' => $officer->id,
            'ip_address' => $request->ip(),
            'details' => ['officer_name' => $officer->name, 'role' => $officer->role, 'services' => $request->service_ids],
        ]);

        return back()->with('success', "নতুন কর্মকর্তা '{$officer->name}' সফলভাবে যুক্ত করা হয়েছে।");
    }

    /**
     * Update an officer's assigned services
     */
    public function updateOfficerServices(Request $request, int $id)
    {
        $officer = User::findOrFail($id);

        $request->validate([
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
            'role' => 'nullable|string',
            'designation' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('service_ids')) {
            $officer->assignedServices()->sync($request->service_ids);
        }

        $officerUpdates = [];
        if ($request->has('role')) $officerUpdates['role'] = $request->role;
        if ($request->has('designation')) $officerUpdates['designation'] = $request->designation;
        if ($request->has('is_active')) $officerUpdates['is_active'] = $request->boolean('is_active');

        if (!empty($officerUpdates)) {
            $officer->update($officerUpdates);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'officer_services_updated',
            'model_type' => 'User',
            'model_id' => $officer->id,
            'ip_address' => $request->ip(),
            'details' => ['officer' => $officer->name, 'assigned_services' => $request->service_ids],
        ]);

        return back()->with('success', "কর্মকর্তা '{$officer->name}'-এর দায়িত্ব সফলভাবে হালনাগাদ করা হয়েছে।");
    }

    /**
     * Reset an officer's password by Admin
     */
    public function resetOfficerPassword(Request $request, int $id)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ।');
        }

        $officer = User::whereIn('role', [
            'super_admin',
            'department_admin',
            'reviewing_officer',
            'accounts_officer',
            'complaint_officer',
            'helpdesk'
        ])->findOrFail($id);

        $request->validate([
            'password' => 'required|string|min:6',
        ], [
            'password.required' => 'নতুন পাসওয়ার্ড প্রদান আবশ্যক।',
            'password.min' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
        ]);

        $officer->update([
            'password' => Hash::make($request->password),
            'must_change_password' => true,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'officer_password_reset',
            'model_type' => 'User',
            'model_id' => $officer->id,
            'ip_address' => $request->ip(),
            'details' => ['officer_name' => $officer->name],
        ]);

        return back()->with('success', "কর্মকর্তা '{$officer->name}'-এর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।");
    }
    /**
     * 6. Dynamic Administrative Area Management (Divisions, Districts, Upazilas, Wards)
     */
    public function geoAreas(Request $request): Response
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ। এলাকা ব্যবস্থাপনা শুধুমাত্র সুপার অ্যাডমিনের জন্য সংরক্ষিত।');
        }

        $divisions = GeoDivision::with([
            'districts' => function ($q) {
                $q->withCount(['upazilas']);
            }
        ])->get();

        $selectedDistrictId = $request->query('district_id');
        $upazilas = [];
        if ($selectedDistrictId) {
            $upazilas = GeoUpazila::where('district_id', $selectedDistrictId)
                ->with(['unions'])
                ->withCount('unions')
                ->get();
        } else {
            // Default load Khulna district upazilas
            $khulnaDistrict = GeoDistrict::where('name_bn', 'খুলনা')->first();
            if ($khulnaDistrict) {
                $selectedDistrictId = $khulnaDistrict->id;
                $upazilas = GeoUpazila::where('district_id', $khulnaDistrict->id)
                    ->with(['unions'])
                    ->withCount('unions')
                    ->get();
            }
        }

            $khulnaDistrict = GeoDistrict::where('name_bn', 'খুলনা')->first();

        return Inertia::render('Admin/GeoAreas/Index', [
            'divisions' => $divisions,
            'districts' => $districtsList,
            'selectedDistrictId' => (int)$selectedDistrictId,
            'upazilas' => $upazilas,
            'counts' => [
                'total_districts' => GeoDistrict::count(),
                'total_upazilas' => GeoUpazila::count(),
                'total_unions' => GeoUnion::count(),
            ],
        ]);
    }

    /**
     * Store new administrative area (District, Upazila, or Union/Ward)
     */
    public function storeGeoArea(Request $request)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ।');
        }

        $type = $request->input('type'); // 'district', 'upazila', 'union'

        if ($type === 'district') {
            $request->validate([
                'division_id' => 'required|exists:geo_divisions,id',
                'name_bn' => 'required|string|max:100',
            ]);
            GeoDistrict::create([
                'division_id' => $request->division_id,
                'name_bn' => $request->name_bn,
                'is_active' => true,
            ]);
        } elseif ($type === 'upazila') {
            $request->validate([
                'district_id' => 'required|exists:geo_districts,id',
                'name_bn' => 'required|string|max:100',
            ]);
            GeoUpazila::create([
                'district_id' => $request->district_id,
                'name_bn' => $request->name_bn,
                'is_active' => true,
            ]);
        } elseif ($type === 'union') {
            $request->validate([
                'upazila_id' => 'required|exists:geo_upazilas,id',
                'name_bn' => 'required|string|max:100',
                'union_type' => 'nullable|in:ward,union',
            ]);
            GeoUnion::create([
                'upazila_id' => $request->upazila_id,
                'name_bn' => $request->name_bn,
                'type' => $request->union_type ?: 'ward',
                'is_active' => true,
            ]);
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'geo_area_created',
            'model_type' => ucfirst($type),
            'model_id' => 0,
            'ip_address' => $request->ip(),
            'details' => ['type' => $type, 'name' => $request->name_bn],
        ]);

        return back()->with('success', 'নতুন প্রশাসনিক এলাকা সফলভাবে যুক্ত করা হয়েছে।');
    }

    /**
     * Soft toggle active/inactive status of an administrative area
     */
    public function toggleGeoArea(Request $request, string $type, int $id)
    {
        $model = match ($type) {
            'district' => GeoDistrict::findOrFail($id),
            'upazila' => GeoUpazila::findOrFail($id),
            'union' => GeoUnion::findOrFail($id),
            default => abort(400, 'অবৈধ এলাকার ধরন।'),
        };

        $model->is_active = !$model->is_active;
        $model->save();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'geo_area_toggled',
            'model_type' => ucfirst($type),
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'details' => ['type' => $type, 'id' => $id, 'active' => $model->is_active],
        ]);

        return back()->with('success', "এলাকাটির স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।");
    }

    /**
     * 7. Comprehensive Reporting & Financial Accounting
     */
    public function reports(Request $request): Response
    {
        $user = auth()->user();
        if (!$user->isSuperAdmin() && $user->role !== 'accounts_officer') {
            abort(403, 'অননুমোদিত অনুরোধ। রিপোর্ট ও আর্থিক হিসাব শুধুমাত্র সুপার অ্যাডমিন ও হিসাব কর্মকর্তার জন্য প্রযোজ্য।');
        }
        $dateRange = $request->query('date_range', 'month');
        $serviceId = $request->query('service_id');
        $district = $request->query('district');

        $appQuery = Application::with(['service', 'assignedOfficer']);
        $payQuery = Payment::with(['application.service']);

        if ($dateRange === 'today') {
            $appQuery->whereDate('created_at', today());
            $payQuery->whereDate('created_at', today());
        } elseif ($dateRange === 'week') {
            $appQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
            $payQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateRange === 'month') {
            $appQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
            $payQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
        }

        if ($serviceId) {
            $appQuery->where('service_id', $serviceId);
            $payQuery->whereHas('application', fn ($q) => $q->where('service_id', $serviceId));
        }

        // Summary metrics
        $totalApps = (clone $appQuery)->count();
        $approvedApps = (clone $appQuery)->whereIn('status', ['approved', 'completed'])->count();
        $pendingApps = (clone $appQuery)->whereIn('status', ['submitted', 'under_review', 'info_required'])->count();
        $rejectedApps = (clone $appQuery)->where('status', 'rejected')->count();

        $totalRevenue = (clone $payQuery)->where('status', 'completed')->sum('amount');
        $pendingRevenue = (clone $payQuery)->where('status', 'pending')->sum('amount');
        $refundedRevenue = (clone $payQuery)->where('status', 'refunded')->sum('amount');

        // Service-wise breakdown
        $serviceStats = Service::withCount([
            'applications as total_count' => fn ($q) => $q->when($dateRange === 'month', fn ($sq) => $sq->whereMonth('created_at', now()->month)),
            'applications as approved_count' => fn ($q) => $q->whereIn('status', ['approved', 'completed']),
            'applications as pending_count' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review', 'info_required']),
        ])
        ->get()
        ->map(function ($s) {
            $collected = Payment::whereHas('application', fn ($q) => $q->where('service_id', $s->id))
                ->where('status', 'completed')
                ->sum('amount');

            return [
                'id' => $s->id,
                'name_bn' => $s->name_bn,
                'total' => $s->total_count,
                'approved' => $s->approved_count,
                'pending' => $s->pending_count,
                'collected_revenue' => $collected,
            ];
        });

        // Ward/Geographical distribution of applications
        $wardStats = Application::select('ward_no', DB::raw('count(*) as total'))
            ->groupBy('ward_no')
            ->orderBy('total', 'desc')
            ->take(10)
            ->get();

        $servicesList = Service::where('is_active', true)->get(['id', 'name_bn']);

        return Inertia::render('Admin/Reports/Index', [
            'summary' => [
                'total_apps' => $totalApps,
                'approved_apps' => $approvedApps,
                'pending_apps' => $pendingApps,
                'rejected_apps' => $rejectedApps,
                'resolution_rate' => $totalApps > 0 ? round(($approvedApps / $totalApps) * 100, 1) : 0,
                'total_revenue' => $totalRevenue,
                'pending_revenue' => $pendingRevenue,
                'refunded_revenue' => $refundedRevenue,
            ],
            'serviceStats' => $serviceStats,
            'wardStats' => $wardStats,
            'servicesList' => $servicesList,
            'filters' => [
                'date_range' => $dateRange,
                'service_id' => $serviceId,
            ],
        ]);
    }

    /**
     * Services builder & config
     */
    public function services(): Response
    {
        $user = auth()->user();
        $query = Service::with(['category', 'department', 'assignedOfficers:id,name,role'])
            ->withCount('applications')
            ->orderBy('id', 'desc');

        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedIds = $user->assignedServices()->pluck('services.id');
            $query->whereIn('id', $assignedIds);
        }

        $services = $query->get();
        $categories = ServiceCategory::where('is_active', true)->get();
        $departments = Department::where('is_active', true)->get();

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'departments' => $departments,
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    /**
     * Store new service
     */
    public function storeService(Request $request)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ। শুধুমাত্র সুপার অ্যাডমিন নতুন সেবা তৈরি করতে পারবেন।');
        }

        $request->validate([
            'name_bn' => 'required|string|max:200',
            'name' => 'required|string|max:200',
            'service_category_id' => 'required|exists:service_categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'fee_amount' => 'required|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'short_description_bn' => 'nullable|string',
            'required_documents_bn' => 'nullable|array',
            'eligibility_bn' => 'nullable|string',
        ]);

        $service = Service::create([
            'name' => $request->name,
            'name_bn' => $request->name_bn,
            'slug' => Str::slug($request->name) . '-' . mt_rand(100, 999),
            'service_category_id' => $request->service_category_id,
            'department_id' => $request->department_id,
            'fee_amount' => $request->fee_amount,
            'estimated_days' => $request->estimated_days,
            'short_description_bn' => $request->short_description_bn,
            'description_bn' => $request->description_bn,
            'eligibility_bn' => $request->eligibility_bn,
            'form_fields' => $request->form_fields,
            'required_documents_bn' => $request->required_documents_bn ?: [],
            'authority_type' => $request->authority_type ?: 'city_corporation',
            'external_authority_name_bn' => $request->external_authority_name_bn,
            'external_url' => $request->external_url,
            'is_active' => true,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'service_created',
            'model_type' => 'Service',
            'model_id' => $service->id,
            'ip_address' => $request->ip(),
            'details' => ['name' => $service->name_bn, 'fee' => $service->fee_amount],
        ]);

        return back()->with('success', "নতুন সেবা '{$service->name_bn}' সফলভাবে যুক্ত করা হয়েছে।");
    }

    /**
     * Update existing service and form/document configuration
     */
    public function updateService(Request $request, int $id)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ। শুধুমাত্র সুপার অ্যাডমিন সেবা পরিবর্তন করতে পারবেন।');
        }

        $service = Service::findOrFail($id);

        $request->validate([
            'name_bn' => 'required|string|max:200',
            'name' => 'required|string|max:200',
            'service_category_id' => 'required|exists:service_categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'fee_amount' => 'required|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'short_description_bn' => 'nullable|string',
            'description_bn' => 'nullable|string',
            'eligibility_bn' => 'nullable|string',
            'form_fields' => 'nullable|array',
            'required_documents_bn' => 'nullable|array',
            'authority_type' => 'nullable|string',
            'external_authority_name_bn' => 'nullable|string',
            'external_url' => 'nullable|string',
        ]);

        $service->update([
            'name' => $request->name,
            'name_bn' => $request->name_bn,
            'service_category_id' => $request->service_category_id,
            'department_id' => $request->department_id,
            'fee_amount' => $request->fee_amount,
            'estimated_days' => $request->estimated_days,
            'short_description_bn' => $request->short_description_bn,
            'description_bn' => $request->description_bn,
            'eligibility_bn' => $request->eligibility_bn,
            'form_fields' => $request->form_fields,
            'required_documents_bn' => $request->required_documents_bn ?: [],
            'authority_type' => $request->authority_type ?: 'city_corporation',
            'external_authority_name_bn' => $request->external_authority_name_bn,
            'external_url' => $request->external_url,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'service_updated',
            'model_type' => 'Service',
            'model_id' => $service->id,
            'ip_address' => $request->ip(),
            'details' => ['name' => $service->name_bn, 'fee' => $service->fee_amount],
        ]);

        return back()->with('success', "সেবা '{$service->name_bn}' এর তথ্য ও ফর্ম কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে।");
    }

    /**
     * Toggle service active status
     */
    public function toggleServiceActive(int $id)
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ।');
        }

        $service = Service::findOrFail($id);
        $service->is_active = !$service->is_active;
        $service->save();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'service_toggled',
            'model_type' => 'Service',
            'model_id' => $service->id,
            'ip_address' => request()->ip(),
            'details' => ['service' => $service->name_bn, 'is_active' => $service->is_active],
        ]);

        return back()->with('success', "সেবাটি সফলভাবে " . ($service->is_active ? 'চালু' : 'সাময়িক বন্ধ') . " করা হয়েছে।");
    }

    /**
     * Complaints list
     */
    public function complaints(Request $request): Response
    {
        $complaints = Complaint::with(['department', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Complaints/Index', [
            'complaints' => $complaints,
        ]);
    }

    /**
     * Show complaint
     */
    public function showComplaint(string $trackingId): Response
    {
        $complaint = Complaint::where('tracking_id', $trackingId)
            ->with(['department', 'user', 'timelines.user'])
            ->firstOrFail();

        return Inertia::render('Admin/Complaints/Show', [
            'complaint' => $complaint,
        ]);
    }

    /**
     * Update complaint status
     */
    public function updateComplaintStatus(Request $request, int $id)
    {
        $complaint = Complaint::findOrFail($id);
        $request->validate([
            'status' => 'required|in:assigned,under_investigation,action_in_progress,resolved,rejected',
            'comment' => 'required|string',
        ]);

        $updates = ['status' => $request->status];
        if ($request->status === 'resolved') {
            $updates['resolved_at'] = now();
            $updates['resolution_summary'] = $request->comment;
        }

        $complaint->update($updates);

        $actionTitle = match ($request->status) {
            'assigned' => 'দায়িত্বপ্রাপ্ত বিভাগে প্রেরণ',
            'under_investigation' => 'তদন্ত প্রক্রিয়াধীন',
            'action_in_progress' => 'সমাধান কার্যক্রম চলমান',
            'resolved' => 'অভিযোগ নিষ্পত্তি সম্পন্ন',
            'rejected' => 'অভিযোগ বাতিল করা হয়েছে',
            default => 'স্ট্যাটাস পরিবর্তন',
        };

        \App\Models\ComplaintTimeline::create([
            'complaint_id' => $complaint->id,
            'user_id' => auth()->id(),
            'status' => $request->status,
            'action_title' => $actionTitle,
            'comment' => $request->comment,
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'complaint_status_updated',
            'model_type' => 'Complaint',
            'model_id' => $complaint->id,
            'ip_address' => $request->ip(),
            'details' => ['status' => $request->status, 'comment' => $request->comment],
        ]);

        return back()->with('success', 'অভিযোগের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
    }

    /**
     * Users & Citizens list
     */
    public function users(Request $request): Response
    {
        $users = User::with('department')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Audit logs list
     */
    public function auditLogs(Request $request): Response
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'অননুমোদিত অনুরোধ।');
        }

        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }

    /**
     * Business Types Management
     */
    public function businessTypes(): Response
    {
        $types = \App\Models\BusinessType::orderBy('display_order')->get();
        return Inertia::render('Admin/BusinessTypes/Index', [
            'businessTypes' => $types,
        ]);
    }

    public function storeBusinessType(Request $request)
    {
        $request->validate([
            'name_bn' => 'required|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'measurement_label_bn' => 'required|string|max:150',
            'measurement_unit_bn' => 'required|string|max:50',
            'display_order' => 'nullable|integer',
        ]);

        \App\Models\BusinessType::create([
            'name_bn' => $request->name_bn,
            'name_en' => $request->name_en,
            'measurement_label_bn' => $request->measurement_label_bn,
            'measurement_unit_bn' => $request->measurement_unit_bn,
            'is_required' => true,
            'is_active' => true,
            'display_order' => $request->display_order ?? 0,
        ]);

        return back()->with('success', 'নতুন ব্যবসার ধরন সফলভাবে যুক্ত করা হয়েছে।');
    }

    public function updateBusinessType(Request $request, int $id)
    {
        $bt = \App\Models\BusinessType::findOrFail($id);
        $request->validate([
            'name_bn' => 'required|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'measurement_label_bn' => 'required|string|max:150',
            'measurement_unit_bn' => 'required|string|max:50',
        ]);

        $bt->update([
            'name_bn' => $request->name_bn,
            'name_en' => $request->name_en,
            'measurement_label_bn' => $request->measurement_label_bn,
            'measurement_unit_bn' => $request->measurement_unit_bn,
            'display_order' => $request->display_order ?? $bt->display_order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : $bt->is_active,
        ]);

        return back()->with('success', 'ব্যবসার ধরন সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroyBusinessType(int $id)
    {
        $bt = \App\Models\BusinessType::findOrFail($id);
        $bt->delete();
        return back()->with('success', 'ব্যবসার ধরন মুছে ফেলা হয়েছে।');
    }

    /**
     * Character Certificate Reasons Management
     */
    public function characterReasons(): Response
    {
        $reasons = \App\Models\CharacterCertificateReason::orderBy('display_order')->get();
        return Inertia::render('Admin/CharacterReasons/Index', [
            'reasons' => $reasons,
        ]);
    }

    public function storeCharacterReason(Request $request)
    {
        $request->validate([
            'reason_bn' => 'required|string|max:200',
            'reason_en' => 'nullable|string|max:200',
            'display_order' => 'nullable|integer',
        ]);

        \App\Models\CharacterCertificateReason::create([
            'reason_bn' => $request->reason_bn,
            'reason_en' => $request->reason_en,
            'is_active' => true,
            'display_order' => $request->display_order ?? 0,
        ]);

        return back()->with('success', 'সনদের কারণ সফলভাবে যুক্ত হয়েছে।');
    }

    public function updateCharacterReason(Request $request, int $id)
    {
        $reason = \App\Models\CharacterCertificateReason::findOrFail($id);
        $request->validate([
            'reason_bn' => 'required|string|max:200',
            'reason_en' => 'nullable|string|max:200',
        ]);

        $reason->update([
            'reason_bn' => $request->reason_bn,
            'reason_en' => $request->reason_en,
            'display_order' => $request->display_order ?? $reason->display_order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : $reason->is_active,
        ]);

        return back()->with('success', 'সনদের কারণ সফলভাবে আপডেট হয়েছে।');
    }

    public function destroyCharacterReason(int $id)
    {
        $reason = \App\Models\CharacterCertificateReason::findOrFail($id);
        $reason->delete();
        return back()->with('success', 'সনদের কারণ মুছে ফেলা হয়েছে।');
    }

    /**
     * Citizens Directory with application counts and search
     */
    public function citizens(Request $request): Response
    {
        $user = auth()->user();
        $search = $request->input('search');

        $query = User::where('role', 'citizen')
            ->orderBy('id', 'desc');

        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedIds = $user->assignedServices()->pluck('services.id');
            // Only citizens who have submitted applications for the officer's assigned services
            $query->whereHas('applications', fn ($q) => $q->whereIn('service_id', $assignedIds))
                  ->withCount([
                      'applications' => fn ($q) => $q->whereIn('service_id', $assignedIds),
                  ]);
        } else {
            $query->withCount('applications');
        }

        if ($search) {
            $query->where(function ($q) use ($search, $user) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('nid', 'like', "%{$search}%");
                if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
                    $assignedIds = $user->assignedServices()->pluck('services.id');
                    $q->orWhereHas('applications', function ($sub) use ($search, $assignedIds) {
                        $sub->where('tracking_id', 'like', "%{$search}%")
                            ->whereIn('service_id', $assignedIds);
                    });
                } else {
                    $q->orWhereHas('applications', function ($sub) use ($search) {
                        $sub->where('tracking_id', 'like', "%{$search}%");
                    });
                }
            });
        }

        $citizens = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Citizens/Index', [
            'citizens' => $citizens,
            'filters' => [
                'search' => $search,
            ],
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    /**
     * Citizen Profile & Complete Application History with Service Analytics
     */
    public function citizenHistory(Request $request, int $id): Response
    {
        $user = auth()->user();
        $citizen = User::findOrFail($id);

        $selectedServiceId = $request->input('service_id');
        $selectedStatus = $request->input('status');
        $search = $request->input('search');

        // Base query for citizen applications
        $appsQuery = Application::where('user_id', $citizen->id)
            ->with(['service', 'assignedOfficer', 'payment'])
            ->latest();

        // RBAC: For officers, strictly fetch applications under assigned services
        if (!$user->isSuperAdmin() && $user->role !== 'helpdesk') {
            $assignedIds = $user->assignedServices()->pluck('services.id');
            $appsQuery->whereIn('service_id', $assignedIds);
        }

        $allApps = $appsQuery->get();

        // 1. Service-wise breakdown calculation
        $serviceBreakdown = [];
        foreach ($allApps as $app) {
            $sId = $app->service_id;
            $sName = $app->service ? $app->service->name_bn : 'অন্যান্য সেবা';
            if (!isset($serviceBreakdown[$sId])) {
                $serviceBreakdown[$sId] = [
                    'service_id' => $sId,
                    'service_name' => $sName,
                    'service_slug' => $app->service?->slug,
                    'count' => 0,
                    'can_manage' => $user->hasServiceAccess($sId),
                ];
            }
            $serviceBreakdown[$sId]['count']++;
        }
        $serviceStats = array_values($serviceBreakdown);

        // 2. Status counts
        $statusCounts = [
            'total' => $allApps->count(),
            'submitted' => $allApps->where('status', 'submitted')->count(),
            'under_review' => $allApps->where('status', 'under_review')->count(),
            'info_required' => $allApps->where('status', 'info_required')->count(),
            'approved' => $allApps->where('status', 'approved')->count(),
            'completed' => $allApps->where('status', 'completed')->count(),
            'rejected' => $allApps->where('status', 'rejected')->count(),
        ];

        // 3. Filtered applications list
        $filteredApps = $allApps->filter(function ($app) use ($selectedServiceId, $selectedStatus, $search) {
            if ($selectedServiceId && $app->service_id != $selectedServiceId) {
                return false;
            }
            if ($selectedStatus && $app->status !== $selectedStatus) {
                return false;
            }
            if ($search) {
                $needle = strtolower($search);
                $matchesTracking = str_contains(strtolower($app->tracking_id), $needle);
                $matchesService = str_contains(strtolower($app->service?->name_bn ?? ''), $needle);
                if (!$matchesTracking && !$matchesService) {
                    return false;
                }
            }
            return true;
        })->values()->map(function ($app) use ($user) {
            $app->can_manage = $user->hasServiceAccess($app->service_id);
            return $app;
        });

        // Audit Log
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'citizen_history_viewed',
            'model_type' => 'User',
            'model_id' => $citizen->id,
            'ip_address' => request()->ip(),
            'details' => [
                'citizen_name' => $citizen->name,
                'total_apps' => $allApps->count(),
            ],
        ]);

        return Inertia::render('Admin/Citizens/Show', [
            'citizen' => $citizen,
            'applications' => $filteredApps,
            'serviceStats' => $serviceStats,
            'statusCounts' => $statusCounts,
            'selectedServiceId' => $selectedServiceId ? (int)$selectedServiceId : null,
            'selectedStatus' => $selectedStatus,
            'search' => $search,
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

}
