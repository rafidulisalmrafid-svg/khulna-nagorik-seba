<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id', 30)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Confidential citizen contact
            $table->string('citizen_name');
            $table->string('citizen_phone', 20);
            $table->string('citizen_email')->nullable();
            
            // Complaint details
            $table->string('category'); // road_repair, drainage, waterlogging, waste_management, street_light, cleanliness, illegal_construction, other
            $table->integer('ward_no')->index();
            $table->string('location_landmark');
            $table->text('description');
            $table->string('evidence_file_path')->nullable();
            
            // Workflow: submitted, assigned, under_investigation, action_in_progress, resolved, rejected
            $table->string('status')->default('submitted')->index();
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            
            // Assignment & Officer handling
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->text('resolution_summary')->nullable();
            $table->string('resolution_evidence_file_path')->nullable();
            
            // Citizen Feedback
            $table->integer('citizen_rating')->nullable(); // 1 to 5
            $table->text('citizen_feedback')->nullable();
            
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('complaint_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status');
            $table->string('action_title');
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_timelines');
        Schema::dropIfExists('complaints');
    }
};