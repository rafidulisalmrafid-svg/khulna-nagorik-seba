<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('application_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('application_documents', 'status')) {
                $table->string('status')->default('accepted')->after('is_requested_addition');
            }
            if (!Schema::hasColumn('application_documents', 'correction_reason')) {
                $table->text('correction_reason')->nullable()->after('status');
            }
            if (!Schema::hasColumn('application_documents', 'corrected_at')) {
                $table->timestamp('corrected_at')->nullable()->after('correction_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('application_documents', function (Blueprint $table) {
            $table->dropColumn(['status', 'correction_reason', 'corrected_at']);
        });
    }
};