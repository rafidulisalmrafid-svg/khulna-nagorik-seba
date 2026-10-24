<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn');
            $table->string('slug')->unique();
            $table->string('icon')->default('Layers');
            $table->text('description_bn')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('name_bn');
            $table->string('slug')->unique();
            $table->text('short_description_bn')->nullable();
            $table->longText('description_bn')->nullable();
            $table->longText('eligibility_bn')->nullable();
            $table->json('required_documents_bn')->nullable(); // array of strings
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->string('fee_description_bn')->nullable();
            $table->integer('estimated_days')->default(7);
            $table->json('process_steps_bn')->nullable(); // array of steps
            $table->string('authority_type')->default('city_corporation'); // 'city_corporation' or 'external_gov_link'
            $table->string('external_authority_name_bn')->nullable();
            $table->string('external_url')->nullable();
            $table->json('form_fields')->nullable(); // dynamic form builder fields
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};