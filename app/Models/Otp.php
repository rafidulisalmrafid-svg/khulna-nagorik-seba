<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'otp_code',
        'action',
        'payload',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'payload' => 'array',
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function isValid(string $code): bool
    {
        return !$this->is_used &&
               $this->otp_code === $code &&
               $this->expires_at->isFuture();
    }
}
