<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_category_id',
        'department_id',
        'name',
        'name_bn',
        'slug',
        'short_description_bn',
        'description_bn',
        'eligibility_bn',
        'required_documents_bn',
        'fee_amount',
        'fee_description_bn',
        'estimated_days',
        'process_steps_bn',
        'authority_type',
        'external_authority_name_bn',
        'external_url',
        'form_fields',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'required_documents_bn' => 'array',
        'process_steps_bn' => 'array',
        'form_fields' => 'array',
        'fee_amount' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function assignedOfficers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'officer_services')
            ->withPivot('assigned_by', 'is_active', 'notes')
            ->withTimestamps();
    }
}
