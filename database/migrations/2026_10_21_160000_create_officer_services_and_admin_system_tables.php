<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Officer Services Pivot
        if (!Schema::hasTable('officer_services')) {
            Schema::create('officer_services', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->boolean('is_active')->default(true);
                $table->string('notes')->nullable();
                $table->timestamps();

                $table->unique(['user_id', 'service_id']);
            });
        }

        // 2. Add must_change_password to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('is_active');
            }
        });

        // 3. Dynamic Administrative Areas: Divisions
        if (!Schema::hasTable('geo_divisions')) {
            Schema::create('geo_divisions', function (Blueprint $table) {
                $table->id();
                $table->string('name_bn');
                $table->string('name_en')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 4. Dynamic Administrative Areas: Districts
        if (!Schema::hasTable('geo_districts')) {
            Schema::create('geo_districts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('division_id')->constrained('geo_divisions')->cascadeOnDelete();
                $table->string('name_bn');
                $table->string('name_en')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 5. Dynamic Administrative Areas: Upazilas / Thanas
        if (!Schema::hasTable('geo_upazilas')) {
            Schema::create('geo_upazilas', function (Blueprint $table) {
                $table->id();
                $table->foreignId('district_id')->constrained('geo_districts')->cascadeOnDelete();
                $table->string('name_bn');
                $table->string('name_en')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 6. Dynamic Administrative Areas: Wards / Unions
        if (!Schema::hasTable('geo_unions')) {
            Schema::create('geo_unions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('upazila_id')->constrained('geo_upazilas')->cascadeOnDelete();
                $table->string('name_bn');
                $table->string('name_en')->nullable();
                $table->string('type')->default('ward'); // 'ward' or 'union'
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('geo_unions');
        Schema::dropIfExists('geo_upazilas');
        Schema::dropIfExists('geo_districts');
        Schema::dropIfExists('geo_divisions');
        Schema::dropIfExists('officer_services');
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'must_change_password')) {
                $table->dropColumn('must_change_password');
            }
        });
    }
};
