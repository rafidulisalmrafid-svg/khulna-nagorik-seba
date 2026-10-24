<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SliderSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'autoplay_seconds',
        'transition_effect',
        'show_indicators',
        'show_arrows',
        'is_enabled',
    ];

    protected $casts = [
        'autoplay_seconds' => 'integer',
        'show_indicators' => 'boolean',
        'show_arrows' => 'boolean',
        'is_enabled' => 'boolean',
    ];
}
