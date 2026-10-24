<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_id',
        'service_id',
        'business_type_id',
        'measurement_value',
        'user_id',
        'applicant_name',
        'applicant_phone',
        'applicant_email',
        'applicant_nid',
        'gender',
        'marital_status',
        'husband_name',
        'father_or_husband_name',
        'mother_name',
        'ward_no',
        'holding_no',
        'present_address',
        'permanent_address',
        'form_data',
        'status',
        'status_note',
        'assigned_to',
        'fee_amount',
        'payment_status',
        'certificate_number',
        'submitted_at',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'form_data' => 'array',
        'fee_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function businessType(): BelongsTo
    {
        return $this->belongsTo(BusinessType::class, 'business_type_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function timelines(): HasMany
    {
        return $this->hasMany(ApplicationTimeline::class)->orderBy('created_at', 'desc');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
