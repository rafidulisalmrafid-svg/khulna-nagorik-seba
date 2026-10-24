<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Application;
use App\Models\Complaint;
use App\Models\Payment;

class CitizenDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $applications = Application::where('user_id', $user->id)
            ->with(['service.category', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        $complaints = Complaint::where('user_id', $user->id)
            ->with('department')
            ->orderBy('created_at', 'desc')
            ->get();

        $payments = Payment::where('user_id', $user->id)
            ->with('application.service')
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_applications' => $applications->count(),
            'approved_applications' => $applications->whereIn('status', ['approved', 'completed'])->count(),
            'pending_applications' => $applications->whereIn('status', ['submitted', 'under_review', 'info_required'])->count(),
            'total_complaints' => $complaints->count(),
            'resolved_complaints' => $complaints->where('status', 'resolved')->count(),
        ];

        return Inertia::render('Citizen/Dashboard', [
            'applications' => $applications,
            'complaints' => $complaints,
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }
}