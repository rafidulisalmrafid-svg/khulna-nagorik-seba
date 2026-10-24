<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'nid',
        'ward_no',
        'address',
        'permanent_address',
        'division',
        'district',
        'upazila',
        'union_ward',
        'road_street',
        'holding_no',
        'avatar',
        'department_id',
        'designation',
        'is_active',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
        'is_staff',
        'formatted_address',
    ];

    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return null;
    }

    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->holding_no ? "বাড়ি/দোকান: {$this->holding_no}" : null,
            $this->road_street ? "রোড: {$this->road_street}" : null,
            $this->union_ward,
            $this->upazila,
            $this->district,
            $this->division,
        ]);

        return !empty($parts) ? implode(', ', $parts) : ($this->address ?: '');
    }

    public function isStaff(): bool
    {
        return in_array($this->role, [
            'super_admin',
            'department_admin',
            'reviewing_officer',
            'accounts_officer',
            'complaint_officer',
            'helpdesk',
        ]);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function getIsStaffAttribute(): bool
    {
        return $this->isStaff();
    }

    /**
     * Check if user has permission to manage/view a specific service
     */
    public function hasServiceAccess($serviceId): bool
    {
        if ($this->isSuperAdmin() || $this->role === 'helpdesk') {
            return true;
        }

        return $this->assignedServices()
            ->where('services.id', $serviceId)
            ->where('officer_services.is_active', true)
            ->exists();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Services assigned to this officer
     */
    public function assignedServices(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'officer_services')
            ->withPivot('assigned_by', 'is_active', 'notes')
            ->withTimestamps();
    }

    /**
     * Applications directly assigned to this officer
     */
    public function assignedApplications(): HasMany
    {
        return $this->hasMany(Application::class, 'assigned_to');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'applicant_phone', 'phone');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'citizen_phone', 'phone');
    }
}
