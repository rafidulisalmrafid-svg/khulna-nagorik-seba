<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Otp;
use App\Models\User;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '01711223344',
            'nid' => '19901122334455',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_new_users_can_register_with_bengali_digits(): void
    {
        $response = $this->post('/register', [
            'name' => 'বাংলা নাগরিক',
            'email' => 'bangla@example.com',
            'phone' => '০১৭১৯৮৮৭৭৬৬',
            'nid' => '১৯৯০১১২২৩৩৪৪৬৬',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'phone' => '01719887766',
            'nid' => '19901122334466',
        ]);
        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_citizen_can_register_via_otp_flow_with_bengali_digits(): void
    {
        // 1. Send OTP
        $sendResp = $this->postJson('/auth/send-register-otp', [
            'name' => 'রহিম উদ্দিন',
            'phone' => '০১৭১২০০০৩৩৩',
            'nid' => '১৯৯৫০১১২৩৪৫৬৭',
            'password' => 'password123',
            'email' => 'rahim@example.com',
            'district' => 'খুলনা',
            'upazila' => 'সোনাডাঙ্গা',
            'union_ward' => '১৭ নম্বর ওয়ার্ড',
        ]);

        $sendResp->assertStatus(200);
        $sendResp->assertJson(['success' => true]);

        $otp = Otp::where('phone', '01712000333')->latest()->first();
        $this->assertNotNull($otp);

        // 2. Verify OTP (even if entered in Bengali digits)
        $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $bnOtp = str_replace($en, $bn, $otp->otp_code);

        $verifyResp = $this->postJson('/auth/verify-register-otp', [
            'phone' => '০১৭১২০০০৩৩৩',
            'otp_code' => $bnOtp,
        ]);

        $verifyResp->assertStatus(200);
        $verifyResp->assertJson(['success' => true]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'phone' => '01712000333',
            'nid' => '1995011234567',
            'role' => 'citizen',
        ]);
    }
}
