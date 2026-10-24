<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_no',
        'councillor_name_bn',
        'councillor_phone',
        'office_address_bn',
        'area_coverage_bn',
    ];
}