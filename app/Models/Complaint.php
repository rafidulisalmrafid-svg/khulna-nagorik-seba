<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_id',
        'user_id',
        'citizen_name',
        'citizen_phone',
        'citizen_email',
        'category',
        'ward_no',
        'location_landmark',
        'description',
        'evidence_file_path',
        'status',
        'priority',
        'department_id',
        'assigned_to',
        'internal_notes',
        'resolution_summary',
        'resolution_evidence_file_path',
        'citizen_rating',
        'citizen_feedback',
        'assigned_at',
        'resolved_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function assignedOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function timelines(): HasMany
    {
        return $this->hasMany(ComplaintTimeline::class)->orderBy('created_at', 'desc');
    }
}