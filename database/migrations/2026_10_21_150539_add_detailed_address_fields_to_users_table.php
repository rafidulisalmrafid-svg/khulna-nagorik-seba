<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('division')->default('খুলনা')->after('permanent_address');
            $table->string('district')->nullable()->after('division');
            $table->string('upazila')->nullable()->after('district');
            $table->string('union_ward')->nullable()->after('upazila');
            $table->string('road_street')->nullable()->after('union_ward');
            $table->string('holding_no')->nullable()->after('road_street');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'division',
                'district',
                'upazila',
                'union_ward',
                'road_street',
                'holding_no',
            ]);
        });
    }
};
