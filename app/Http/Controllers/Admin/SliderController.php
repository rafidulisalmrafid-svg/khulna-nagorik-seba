<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use App\Models\SliderSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SliderController extends Controller
{
    /**
     * Display the slider management page in Admin Dashboard.
     */
    public function index(): Response
    {
        $sliders = Slider::orderBy('display_order')->get();
        $setting = SliderSetting::firstOrCreate([], [
            'autoplay_seconds' => 5,
            'transition_effect' => 'fade',
            'show_indicators' => true,
            'show_arrows' => true,
            'is_enabled' => true,
        ]);

        return Inertia::render('Admin/Sliders/Index', [
            'sliders' => $sliders,
            'setting' => $setting,
        ]);
    }

    /**
     * Store a new slider slide.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:8192',
            'title_bn' => 'nullable|string|max:150',
            'subtitle_bn' => 'nullable|string|max:300',
            'button_text_bn' => 'nullable|string|max:60',
            'button_url' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ], [
            'image.required' => 'একটি ছবি নির্বাচন করা আবশ্যক।',
            'image.image' => 'ফাইলটি অবশ্যই একটি বৈধ ছবি হতে হবে।',
            'image.mimes' => 'ছবিটি অবশ্যই JPG, PNG বা WebP ফরম্যাটের হতে হবে।',
            'image.max' => 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট (8MB) হতে পারে।',
        ]);

        $file = $request->file('image');
        $fileName = 'slider_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('sliders', $fileName, 'public');

        $maxOrder = Slider::max('display_order') ?? 0;
        $order = $request->filled('display_order') ? (int) $request->display_order : ($maxOrder + 1);

        Slider::create([
            'title_bn' => $request->title_bn,
            'subtitle_bn' => $request->subtitle_bn,
            'image_path' => $path,
            'button_text_bn' => $request->button_text_bn,
            'button_url' => $request->button_url,
            'display_order' => $order,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'নতুন স্লাইড সফলভাবে যুক্ত করা হয়েছে।');
    }

    /**
     * Update an existing slider slide.
     */
    public function update(Request $request, int $id)
    {
        $slider = Slider::findOrFail($id);

        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:8192',
            'title_bn' => 'nullable|string|max:150',
            'subtitle_bn' => 'nullable|string|max:300',
            'button_text_bn' => 'nullable|string|max:60',
            'button_url' => 'nullable|string|max:255',
            'display_order' => 'required|integer|min:1',
            'is_active' => 'nullable|boolean',
        ], [
            'image.image' => 'ফাইলটি অবশ্যই একটি বৈধ ছবি হতে হবে।',
            'image.mimes' => 'ছবিটি অবশ্যই JPG, PNG বা WebP ফরম্যাটের হতে হবে।',
            'image.max' => 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট (8MB) হতে পারে।',
        ]);

        $updateData = [
            'title_bn' => $request->title_bn,
            'subtitle_bn' => $request->subtitle_bn,
            'button_text_bn' => $request->button_text_bn,
            'button_url' => $request->button_url,
            'display_order' => (int) $request->display_order,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('image')) {
            // Delete old file if exists and not seeded default
            if ($slider->image_path && Storage::disk('public')->exists($slider->image_path)) {
                Storage::disk('public')->delete($slider->image_path);
            }

            $file = $request->file('image');
            $fileName = 'slider_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('sliders', $fileName, 'public');
            $updateData['image_path'] = $path;
        }

        $slider->update($updateData);

        return back()->with('success', 'স্লাইডটি সফলভাবে আপডেট করা হয়েছে।');
    }

    /**
     * Toggle slide active status.
     */
    public function toggle(int $id)
    {
        $slider = Slider::findOrFail($id);
        $slider->update([
            'is_active' => !$slider->is_active,
        ]);

        $statusMsg = $slider->is_active ? 'সক্রিয় করা হয়েছে।' : 'নিষ্ক্রিয় করা হয়েছে।';
        return back()->with('success', "স্লাইডটি সফলভাবে {$statusMsg}");
    }

    /**
     * Delete a slide.
     */
    public function destroy(int $id)
    {
        $slider = Slider::findOrFail($id);

        if ($slider->image_path && Storage::disk('public')->exists($slider->image_path)) {
            Storage::disk('public')->delete($slider->image_path);
        }

        $slider->delete();

        return back()->with('success', 'স্লাইডটি সফলভাবে মুছে ফেলা হয়েছে।');
    }

    /**
     * Update global slider configuration (speed/interval, transition, etc.).
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'autoplay_seconds' => 'required|integer|min:2|max:30',
            'transition_effect' => 'required|string|in:fade,slide,zoom',
            'show_indicators' => 'required|boolean',
            'show_arrows' => 'required|boolean',
            'is_enabled' => 'required|boolean',
        ], [
            'autoplay_seconds.required' => 'প্রতিটি ছবির পরিবর্তন সময়সীমা নির্ধারণ করুন।',
            'autoplay_seconds.min' => 'সময়সীমা কমপক্ষে ২ সেকেন্ড হতে হবে।',
            'autoplay_seconds.max' => 'সময়সীমা সর্বোচ্চ ৩০ সেকেন্ড হতে পারে।',
        ]);

        $setting = SliderSetting::firstOrCreate([]);
        $setting->update([
            'autoplay_seconds' => (int) $request->autoplay_seconds,
            'transition_effect' => $request->transition_effect,
            'show_indicators' => $request->boolean('show_indicators'),
            'show_arrows' => $request->boolean('show_arrows'),
            'is_enabled' => $request->boolean('is_enabled'),
        ]);

        return back()->with('success', 'স্লাইডারের সময়সীমা ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে।');
    }
}
