<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    private function normalizeBengaliDigits(?string $str): string
    {
        if (!$str) return '';
        $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return str_replace($bn, $en, $str);
    }


    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'initialPhone' => $request->query('phone', ''),
            'redirect' => $request->query('redirect', ''),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $cleanedPhone = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->phone));
        $cleanedNid = preg_replace('/[^0-9]/', '', $this->normalizeBengaliDigits($request->nid));
        $request->merge([
            'phone' => $cleanedPhone,
            'nid' => $cleanedNid,
            'email' => $request->filled('email') ? trim($request->email) : null,
        ]);
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:20|unique:'.User::class,
            'nid' => 'required|string|max:30|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'nid' => $request->nid,
            'role' => 'citizen',
            'is_active' => true,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        if ($request->filled('redirect')) {
            return redirect($request->redirect);
        }

        return redirect(route('home'));
    }
}
