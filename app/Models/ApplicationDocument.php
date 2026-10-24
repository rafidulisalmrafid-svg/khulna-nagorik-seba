<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'document_title',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'is_requested_addition',
        'status',
        'correction_reason',
        'corrected_at',
    ];

    protected $casts = [
        'is_requested_addition' => 'boolean',
        'corrected_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}