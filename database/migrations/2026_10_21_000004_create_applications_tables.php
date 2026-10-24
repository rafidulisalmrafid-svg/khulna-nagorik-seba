<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id', 30)->unique(); // e.g. KCC-2026-10023
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // applicant citizen
            
            // Applicant details
            $table->string('applicant_name');
            $table->string('applicant_phone', 20);
            $table->string('applicant_email')->nullable();
            $table->string('applicant_nid', 25)->nullable();
            $table->string('father_or_husband_name')->nullable();
            $table->string('mother_name')->nullable();
            
            // Address details
            $table->integer('ward_no')->index();
            $table->string('holding_no')->nullable();
            $table->text('present_address');
            $table->text('permanent_address')->nullable();
            
            // Form custom values
            $table->json('form_data')->nullable(); // answers to dynamic fields
            
            // Workflow Status
            // 'draft', 'submitted', 'under_review', 'info_required', 'approved', 'rejected', 'completed'
            $table->string('status')->default('submitted')->index();
            $table->text('status_note')->nullable(); // feedback or reason for rejection/info_required
            
            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            
            // Payment info
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // 'unpaid', 'paid', 'exempted'
            
            // Approval metadata
            $table->string('certificate_number')->nullable()->unique();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('document_title');
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type')->nullable();
            $table->boolean('is_requested_addition')->default(false);
            $table->timestamps();
        });

        Schema::create('application_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // officer or citizen
            $table->string('status');
            $table->string('action_title');
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_timelines');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('applications');
    }
};