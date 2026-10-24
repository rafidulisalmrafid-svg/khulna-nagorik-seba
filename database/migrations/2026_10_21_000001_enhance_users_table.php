<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('citizen')->after('password');
            $table->string('phone')->nullable()->after('role');
            $table->string('nid', 20)->nullable()->after('phone');
            $table->string('ward_no', 10)->nullable()->after('nid');
            $table->text('address')->nullable()->after('ward_no');
            $table->unsignedBigInteger('department_id')->nullable()->after('address');
            $table->string('designation')->nullable()->after('department_id');
            $table->boolean('is_active')->default(true)->after('designation');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'nid', 'ward_no', 'address', 'department_id', 'designation', 'is_active']);
        });
    }
};