<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Application;
use App\Models\Payment;
use App\Models\ApplicationTimeline;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function initiate(string $trackingId)
    {
        $application = Application::where('tracking_id', $trackingId)
            ->with(['service', 'user'])
            ->firstOrFail();

        // Check ownership or staff
        if (auth()->id() !== $application->user_id && ! auth()->user()->isStaff()) {
            abort(403);
        }

        // Rule: Application must be approved before payment can be made
        if ($application->status !== 'approved' && $application->status !== 'completed') {
            return redirect()->route('applications.show', $application->tracking_id)
                ->with('error', 'আবেদনটি এখনো অনুমোদিত হয়নি। সংশ্লিষ্ট কর্মকর্তা যাচাই করে অনুমোদন প্রদান করার পর সরকারি ফি পরিশোধ করা যাবে।');
        }

        if ($application->payment_status === 'paid') {
            $payment = Payment::where('application_id', $application->id)->first();
            return redirect()->route('payments.receipt', $payment ? $payment->receipt_number : 1);
        }

        return Inertia::render('Payments/Checkout', [
            'application' => $application,
        ]);
    }

    public function processDemo(Request $request)
    {
        $request->validate([
            'application_id' => 'required|exists:applications,id',
            'payment_method' => 'required|string|in:bkash,nagad,rocket,card,bank',
            'sender_account' => 'nullable|string|max:30',
        ]);

        $application = Application::with('service')->findOrFail($request->application_id);

        if (auth()->id() !== $application->user_id && ! auth()->user()->isStaff()) {
            abort(403);
        }

        // Guard: Must be approved
        if ($application->status !== 'approved' && $application->status !== 'completed') {
            return back()->with('error', 'আবেদনটি এখনো অনুমোদিত হয়নি। অননুমোদিত আবেদনের ফি পরিশোধ গ্রহণযোগ্য নয়।');
        }

        // Prevent duplicate payment
        if ($application->payment_status === 'paid') {
            return back()->with('error', 'এই আবেদনের ফি ইতোমধ্যে পরিশোধ করা হয়েছে।');
        }

        DB::beginTransaction();
        try {
            $txnId = 'TXN-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
            $receiptNo = 'REC-' . date('Y') . '-' . mt_rand(10000, 99999);
            $certNo = $application->certificate_number ?? ('CERT-' . date('Y') . '-' . mt_rand(100000, 999999));

            $payment = Payment::create([
                'transaction_id' => $txnId,
                'application_id' => $application->id,
                'user_id' => auth()->id(),
                'amount' => $application->fee_amount,
                'currency' => 'BDT',
                'payment_method' => $request->payment_method,
                'gateway_trx_id' => strtoupper($request->payment_method) . '-' . mt_rand(10000000, 99999999),
                'status' => 'completed',
                'receipt_number' => $receiptNo,
                'purpose_bn' => $application->service->name_bn . ' সরকারি ফি',
                'payment_details' => [
                    'sender_account' => $request->sender_account ?? '018XXXXXXXX',
                    'channel' => 'Online Gateway (Sandbox Verified)',
                    'paid_ip' => $request->ip(),
                ],
                'paid_at' => now(),
            ]);

            $application->update([
                'payment_status' => 'paid',
                'status' => 'completed',
                'certificate_number' => $certNo,
                'completed_at' => now(),
            ]);

            ApplicationTimeline::create([
                'application_id' => $application->id,
                'user_id' => auth()->id(),
                'status' => 'completed',
                'action_title' => 'ফি পরিশোধ ও সনদ ইস্যু সম্পন্ন',
                'comment' => "অনলাইন গেটওয়ের মাধ্যমে ৳{$application->fee_amount} টাকা সরকারি ফি পরিশোধিত। ডিজিটাল সনদপত্র (নং: {$certNo}) প্রস্তুত করা হয়েছে।",
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'payment_completed',
                'model_type' => 'Payment',
                'model_id' => $payment->id,
                'ip_address' => $request->ip(),
                'details' => ['txn_id' => $txnId, 'amount' => $application->fee_amount, 'receipt_no' => $receiptNo, 'cert_no' => $certNo],
            ]);

            DB::commit();

            return redirect()->route('payments.receipt', $receiptNo)
                ->with('success', 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে এবং আপনার সনদপত্র প্রস্তুত হয়েছে!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে: ' . $e->getMessage());
        }
    }

    public function receipt(string $receiptNumber): Response
    {
        $payment = Payment::where('receipt_number', $receiptNumber)
            ->with(['application.service', 'application.businessType', 'user'])
            ->firstOrFail();

        // Check ownership or staff
        if (auth()->id() !== $payment->user_id && ! auth()->user()->isStaff()) {
            abort(403);
        }

        return Inertia::render('Payments/Receipt', [
            'payment' => $payment,
        ]);
    }
}
