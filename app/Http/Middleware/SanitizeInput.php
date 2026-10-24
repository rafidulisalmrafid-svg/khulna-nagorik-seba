<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Keys that should not be stripped/altered (e.g. passwords, code blocks).
     */
    protected array $except = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
    ];

    /**
     * Handle incoming request and sanitize string inputs against XSS and injection.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        array_walk_recursive($input, function (&$value, $key) {
            if (is_string($value) && !in_array($key, $this->except, true)) {
                // Strip null byte injections
                $value = str_replace(chr(0), '', $value);

                // Strip script tags and potential JS execution in HTML attributes
                $value = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $value);
                $value = preg_replace('/<iframe\b[^>]*>(.*?)<\/iframe>/is', '', $value);
                $value = preg_replace('/(?i)javascript\s*:/', '', $value);
                $value = preg_replace('/(?i)data\s*:\s*text\/html/', '', $value);
                $value = preg_replace('/(?i)on(load|error|click|mouseover|focus|blur|submit)\s*=/i', '', $value);
            }
        });

        $request->merge($input);

        return $next($request);
    }
}
