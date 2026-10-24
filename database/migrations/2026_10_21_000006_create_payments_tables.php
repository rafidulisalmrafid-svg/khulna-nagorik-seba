<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 40)->unique();
            $table->foreignId('application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('BDT');
            $table->string('payment_method'); // 'bkash', 'nagad', 'rocket', 'visa_mastercard', 'bank_transfer', 'cash_counter'
            $table->string('gateway_trx_id')->nullable();
            
            // Status: 'pending', 'completed', 'failed', 'refunded'
            $table->string('status')->default('pending')->index();
            $table->string('receipt_number')->unique();
            $table->string('purpose_bn'); // e.g. "ট্রেড লাইসেন্স ফি"
            $table->json('payment_details')->nullable();
            
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};