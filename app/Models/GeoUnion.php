<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeoUnion extends Model
{
    use HasFactory;

    protected $fillable = [
        'upazila_id',
        'name_bn',
        'name_en',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function upazila(): BelongsTo
    {
        return $this->belongsTo(GeoUpazila::class, 'upazila_id');
    }
}
