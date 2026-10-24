<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title_bn')->nullable();
            $table->text('subtitle_bn')->nullable();
            $table->string('image_path');
            $table->string('button_text_bn')->nullable();
            $table->string('button_url')->nullable();
            $table->integer('display_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('slider_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('autoplay_seconds')->default(5);
            $table->string('transition_effect')->default('fade'); // fade, slide, zoom
            $table->boolean('show_indicators')->default(true);
            $table->boolean('show_arrows')->default(true);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        // Insert default setting
        DB::table('slider_settings')->insert([
            'autoplay_seconds' => 5,
            'transition_effect' => 'fade',
            'show_indicators' => true,
            'show_arrows' => true,
            'is_enabled' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('slider_settings');
    }
};
