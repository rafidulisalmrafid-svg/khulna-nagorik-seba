<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;

        // Super Admin has access to everything
        if ($userRole === 'super_admin') {
            return $next($request);
        }

        if (! in_array($userRole, $roles)) {
            if ($userRole === 'citizen') {
                return redirect()->route('dashboard')->with('error', 'অ্যাডমিন প্যানেল শুধুমাত্র দায়িত্বপ্রাপ্ত কর্মকর্তা ও অ্যাডমিনদের জন্য সংরক্ষিত।');
            }
            abort(403, 'আপনার এই পেইজে প্রবেশের অনুমতি নেই (Unauthorized access).');
        }

        return $next($request);
    }
}
