<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\Notice;
use App\Models\Ward;
use App\Models\Application;
use App\Models\Complaint;
use App\Models\Slider;
use App\Models\SliderSetting;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = ServiceCategory::where('is_active', true)
            ->withCount('services')
            ->orderBy('display_order')
            ->get();

        $featuredServices = Service::where('is_active', true)
            ->where('is_featured', true)
            ->with('category')
            ->get();

        $notices = Notice::where('is_published', true)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        $wards = Ward::orderBy('ward_no')->get();

        $stats = [
            'total_services' => Service::where('is_active', true)->count(),
            'total_wards' => 31,
            'completed_applications' => Application::whereIn('status', ['approved', 'completed'])->count() + 1420,
            'resolved_complaints' => Complaint::where('status', 'resolved')->count() + 890,
            'active_citizens' => 45800,
        ];

        // Fetch dynamic homepage sliders & settings
        $sliderSetting = SliderSetting::firstOrCreate([], [
            'autoplay_seconds' => 5,
            'transition_effect' => 'fade',
            'show_indicators' => true,
            'show_arrows' => true,
            'is_enabled' => true,
        ]);

        $sliders = $sliderSetting->is_enabled 
            ? Slider::where('is_active', true)->orderBy('display_order')->get() 
            : [];

        return Inertia::render('Home', [
            'categories' => $categories,
            'featuredServices' => $featuredServices,
            'notices' => $notices,
            'wards' => $wards,
            'stats' => $stats,
            'sliders' => $sliders,
            'sliderSetting' => $sliderSetting,
        ]);
    }

    public function trackSearch(Request $request)
    {
        $request->validate([
            'tracking_id' => 'required|string|max:40',
        ]);

        $trackingId = trim(strtoupper($request->tracking_id));

        if (str_starts_with($trackingId, 'KCC-')) {
            $application = Application::where('tracking_id', $trackingId)->first();
            if ($application) {
                return redirect()->route('applications.track', ['tracking_id' => $trackingId]);
            }
        } elseif (str_starts_with($trackingId, 'CMP-')) {
            $complaint = Complaint::where('tracking_id', $trackingId)->first();
            if ($complaint) {
                return redirect()->route('complaints.track', ['tracking_id' => $trackingId]);
            }
        } else {
            // Check both
            $app = Application::where('tracking_id', $trackingId)->first();
            if ($app) {
                return redirect()->route('applications.track', ['tracking_id' => $trackingId]);
            }
            $cmp = Complaint::where('tracking_id', $trackingId)->first();
            if ($cmp) {
                return redirect()->route('complaints.track', ['tracking_id' => $trackingId]);
            }
        }

        return back()->with('error', "প্রদত্ত ট্র্যাকিং আইডি '{$trackingId}' দিয়ে কোনো আবেদন বা অভিযোগ খুঁজে পাওয়া যায়নি। দয়া করে সঠিক আইডি লিখুন।");
    }
}
