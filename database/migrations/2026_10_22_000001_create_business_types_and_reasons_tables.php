<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Business Types for Trade License
        if (!Schema::hasTable('business_types')) {
            Schema::create('business_types', function (Blueprint $table) {
                $table->id();
                $table->string('name_bn');
                $table->string('name_en')->nullable();
                $table->string('measurement_label_bn')->default('দোকানের সাইনবোর্ডের মাপ');
                $table->string('measurement_unit_bn')->default('বর্গফুট');
                $table->boolean('is_required')->default(true);
                $table->boolean('is_active')->default(true);
                $table->integer('display_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Character Certificate Reasons
        if (!Schema::hasTable('character_certificate_reasons')) {
            Schema::create('character_certificate_reasons', function (Blueprint $table) {
                $table->id();
                $table->string('reason_bn');
                $table->string('reason_en')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('display_order')->default(0);
                $table->timestamps();
            });
        }

        // 3. Add marital status, husband info, and business type info to applications
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'gender')) {
                $table->string('gender')->nullable()->after('applicant_nid');
            }
            if (!Schema::hasColumn('applications', 'marital_status')) {
                $table->string('marital_status')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('applications', 'husband_name')) {
                $table->string('husband_name')->nullable()->after('marital_status');
            }
            if (!Schema::hasColumn('applications', 'business_type_id')) {
                $table->foreignId('business_type_id')->nullable()->constrained('business_types')->nullOnDelete()->after('service_id');
            }
            if (!Schema::hasColumn('applications', 'measurement_value')) {
                $table->string('measurement_value')->nullable()->after('business_type_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'measurement_value')) {
                $table->dropColumn('measurement_value');
            }
            if (Schema::hasColumn('applications', 'business_type_id')) {
                $table->dropConstrainedForeignId('business_type_id');
            }
            if (Schema::hasColumn('applications', 'husband_name')) {
                $table->dropColumn('husband_name');
            }
            if (Schema::hasColumn('applications', 'marital_status')) {
                $table->dropColumn('marital_status');
            }
            if (Schema::hasColumn('applications', 'gender')) {
                $table->dropColumn('gender');
            }
        });
        Schema::dropIfExists('character_certificate_reasons');
        Schema::dropIfExists('business_types');
    }
};
