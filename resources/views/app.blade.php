<!DOCTYPE html>
<html lang="bn" class="scroll-smooth overflow-x-hidden">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
        <meta name="description" content="খুলনা সিটি কর্পোরেশন স্মার্ট সিটিজেন সার্ভিসেস প্ল্যাটফর্ম - সব নাগরিক সেবা এখন আপনার হাতেই">

        <title inertia>{{ config('app.name', 'খুলনা সেবা - ডিজিটাল সিটি কর্পোরেশন') }}</title>

        <!-- Google Fonts: Hind Siliguri & Outfit -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-gov-600 selection:text-white overflow-x-hidden w-full">
        @inertia
    </body>
</html>
