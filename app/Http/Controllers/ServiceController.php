<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\Department;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $categorySlug = $request->query('category');
        $search = $request->query('search');
        $departmentId = $request->query('department');

        $query = Service::where('is_active', true)
            ->with(['category', 'department']);

        if ($categorySlug) {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name_bn', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('short_description_bn', 'like', "%{$search}%");
            });
        }

        $services = $query->orderBy('is_featured', 'desc')->get();
        $categories = ServiceCategory::where('is_active', true)->withCount('services')->get();
        $departments = Department::where('is_active', true)->get();

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'departments' => $departments,
            'filters' => [
                'category' => $categorySlug,
                'search' => $search,
                'department' => $departmentId,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $service = Service::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category', 'department'])
            ->firstOrFail();

        $relatedServices = Service::where('service_category_id', $service->service_category_id)
            ->where('id', '!=', $service->id)
            ->where('is_active', true)
            ->take(3)
            ->get();

        return Inertia::render('Services/Show', [
            'service' => $service,
            'relatedServices' => $relatedServices,
        ]);
    }
}