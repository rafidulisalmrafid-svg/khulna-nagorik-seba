<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CitizenDashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CitizenProfileController;
use App\Models\GeoDivision;
use App\Models\GeoDistrict;
use App\Models\GeoUpazila;
use App\Models\GeoUnion;

// 1. Public Portal Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::post('/track-search', [HomeController::class, 'trackSearch'])
    ->middleware('throttle:30,1')
    ->name('track.search');

// Services Directory & Details
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

// Dynamic Geo Areas API for frontend cascading selectors
Route::get('/api/geo/cascading', function () {
    $divisions = GeoDivision::where('is_active', true)
        ->with([
            'districts' => function ($q) {
                $q->where('is_active', true)->with([
                    'upazilas' => function ($uq) {
                        $uq->where('is_active', true)->with([
                            'unions' => function ($unq) {
                                $unq->where('is_active', true);
                            }
                        ]);
                    }
                ]);
            }
        ])
        ->get();

    return response()->json($divisions);
})->middleware('throttle:60,1')->name('api.geo.cascading');

// Live Public Application & Complaint Tracking
Route::get('/applications/track', [ApplicationController::class, 'trackView'])->name('applications.track');
Route::get('/complaints/new', [ComplaintController::class, 'create'])->name('complaints.create');
Route::post('/complaints', [ComplaintController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('complaints.store');
Route::get('/complaints/track', [ComplaintController::class, 'trackView'])->name('complaints.track');
Route::post('/complaints/{id}/feedback', [ComplaintController::class, 'feedback'])
    ->middleware('throttle:15,1')
    ->name('complaints.feedback');

// 2. Citizen Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        if (in_array(auth()->user()->role, ['super_admin', 'department_admin', 'reviewing_officer', 'accounts_officer', 'complaint_officer', 'helpdesk'])) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('citizen.dashboard');
    })->name('dashboard');

    Route::get('/citizen/dashboard', [CitizenDashboardController::class, 'index'])->name('citizen.dashboard');

    // Online Application
    Route::get('/apply/{serviceSlug}', [ApplicationController::class, 'create'])->name('applications.create');
    Route::post('/applications', [ApplicationController::class, 'store'])
        ->middleware('throttle:15,1')
        ->name('applications.store');
    Route::get('/applications/view/{trackingId}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::get('/applications/certificate/{trackingId}', [ApplicationController::class, 'certificate'])->name('applications.certificate');
    Route::post('/applications/{id}/additional-doc', [ApplicationController::class, 'uploadAdditionalDoc'])
        ->middleware('throttle:15,1')
        ->name('applications.upload-doc');
    Route::post('/applications/{id}/resubmit-corrections', [ApplicationController::class, 'resubmitCorrections'])
        ->middleware('throttle:15,1')
        ->name('applications.resubmit');

    // Payments
    Route::get('/payments/checkout/{trackingId}', [PaymentController::class, 'initiate'])->name('payments.checkout');
    Route::post('/payments/process', [PaymentController::class, 'processDemo'])
        ->middleware('throttle:10,1')
        ->name('payments.process');
    Route::get('/payments/receipt/{receiptNumber}', [PaymentController::class, 'receipt'])->name('payments.receipt');

    // Citizen Profile Settings & Multi-step Verification
    Route::get('/profile', [CitizenProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update-info', [CitizenProfileController::class, 'updateInfo'])
        ->middleware('throttle:20,1')
        ->name('profile.update-info');
    Route::post('/profile/update-avatar', [CitizenProfileController::class, 'updateAvatar'])
        ->middleware('throttle:10,1')
        ->name('profile.update-avatar');
    Route::delete('/profile/remove-avatar', [CitizenProfileController::class, 'removeAvatar'])->name('profile.remove-avatar');

    // Phone Change (Two-step OTP + Fallback with Throttle)
    Route::post('/profile/phone/step1-send-old-otp', [CitizenProfileController::class, 'sendOldPhoneOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.phone.send-old-otp');
    Route::post('/profile/phone/step1-verify', [CitizenProfileController::class, 'verifyOldPhoneOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.phone.verify-old-otp');
    Route::post('/profile/phone/fallback-verify', [CitizenProfileController::class, 'verifyPhoneFallback'])
        ->middleware('throttle:5,1')
        ->name('profile.phone.fallback-verify');
    Route::post('/profile/phone/step2-send-new-otp', [CitizenProfileController::class, 'sendNewPhoneOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.phone.send-new-otp');
    Route::post('/profile/phone/step2-verify', [CitizenProfileController::class, 'verifyNewPhoneOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.phone.verify-new-otp');

    // Email Change (OTP)
    Route::post('/profile/email/send-otp', [CitizenProfileController::class, 'sendEmailOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.email.send-otp');
    Route::post('/profile/email/verify-otp', [CitizenProfileController::class, 'verifyEmailOtp'])
        ->middleware('throttle:5,1')
        ->name('profile.email.verify-otp');

    // Password Change
    Route::post('/profile/change-password', [CitizenProfileController::class, 'changePassword'])
        ->middleware('throttle:5,1')
        ->name('profile.change-password');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 3. Officer & Admin Management Routes (RBAC Protected)
Route::middleware(['auth', 'role:super_admin,department_admin,reviewing_officer,accounts_officer,complaint_officer,helpdesk'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Applications
        Route::get('/applications', [AdminDashboardController::class, 'applications'])->name('applications.index');
        Route::get('/citizens', [AdminDashboardController::class, 'citizens'])->name('citizens.index');
        Route::get('/citizens/{id}', [AdminDashboardController::class, 'citizenHistory'])->name('citizens.show');
        Route::get('/applications/{trackingId}', [AdminDashboardController::class, 'showApplication'])->name('applications.show');
        Route::post('/applications/{id}/status', [AdminDashboardController::class, 'updateApplicationStatus'])->name('applications.status');
        Route::post('/applications/{id}/assign', [AdminDashboardController::class, 'assignApplicationOfficer'])->name('applications.assign');

        // Officers & Service Responsibility Assignment
        Route::get('/officers', [AdminDashboardController::class, 'officers'])->name('officers.index');
        Route::post('/officers', [AdminDashboardController::class, 'storeOfficer'])->name('officers.store');
        Route::post('/officers/{id}/services', [AdminDashboardController::class, 'updateOfficerServices'])->name('officers.services');
        Route::post('/officers/{id}/password', [AdminDashboardController::class, 'resetOfficerPassword'])
            ->middleware('throttle:5,1')
            ->name('officers.password');

        // Dynamic Administrative Areas (Divisions, Districts, Upazilas, Wards)
        Route::get('/geo-areas', [AdminDashboardController::class, 'geoAreas'])->name('geo-areas.index');
        Route::post('/geo-areas', [AdminDashboardController::class, 'storeGeoArea'])->name('geo-areas.store');
        Route::post('/geo-areas/{type}/{id}/toggle', [AdminDashboardController::class, 'toggleGeoArea'])->name('geo-areas.toggle');

        // Comprehensive Reports & Financial Accounting
        Route::get('/reports', [AdminDashboardController::class, 'reports'])->name('reports.index');

        // Complaints
        Route::get('/complaints', [AdminDashboardController::class, 'complaints'])->name('complaints.index');
        Route::get('/complaints/{trackingId}', [AdminDashboardController::class, 'showComplaint'])->name('complaints.show');
        Route::post('/complaints/{id}/status', [AdminDashboardController::class, 'updateComplaintStatus'])->name('complaints.status');

        // Services (Dynamic Service Builder)
        Route::get('/services', [AdminDashboardController::class, 'services'])->name('services.index');
        Route::post('/services', [AdminDashboardController::class, 'storeService'])->name('services.store');
        Route::post('/services/{id}/update', [AdminDashboardController::class, 'updateService'])->name('services.update');
        Route::post('/services/{id}/toggle', [AdminDashboardController::class, 'toggleServiceActive'])->name('services.toggle');

        // Hero Sliders Management
        Route::get('/sliders', [SliderController::class, 'index'])->name('sliders.index');
        Route::post('/sliders', [SliderController::class, 'store'])->name('sliders.store');
        Route::post('/sliders/{id}/update', [SliderController::class, 'update'])->name('sliders.update');
        Route::post('/sliders/{id}/toggle', [SliderController::class, 'toggle'])->name('sliders.toggle');
        Route::delete('/sliders/{id}', [SliderController::class, 'destroy'])->name('sliders.destroy');
        Route::post('/sliders/settings', [SliderController::class, 'updateSettings'])->name('sliders.settings');

        // Users & Roles
        Route::get('/users', [AdminDashboardController::class, 'users'])->name('users.index');

        // Audit Logs
        Route::get('/audit-logs', [AdminDashboardController::class, 'auditLogs'])->name('audit-logs.index');

        // Business Types Management
        Route::get('/business-types', [AdminDashboardController::class, 'businessTypes'])->name('business-types.index');
        Route::post('/business-types', [AdminDashboardController::class, 'storeBusinessType'])->name('business-types.store');
        Route::post('/business-types/{id}/update', [AdminDashboardController::class, 'updateBusinessType'])->name('business-types.update');
        Route::delete('/business-types/{id}', [AdminDashboardController::class, 'destroyBusinessType'])->name('business-types.destroy');

        // Character Certificate Reasons Management
        Route::get('/character-reasons', [AdminDashboardController::class, 'characterReasons'])->name('character-reasons.index');
        Route::post('/character-reasons', [AdminDashboardController::class, 'storeCharacterReason'])->name('character-reasons.store');
        Route::post('/character-reasons/{id}/update', [AdminDashboardController::class, 'updateCharacterReason'])->name('character-reasons.update');
        Route::delete('/character-reasons/{id}', [AdminDashboardController::class, 'destroyCharacterReason'])->name('character-reasons.destroy');
    });

require __DIR__.'/auth.php';
