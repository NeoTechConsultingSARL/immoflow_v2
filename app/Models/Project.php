<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'description',
        'status',
        'budget',
        'address',
        'start_date',
    ];

    /**
     * Get the company that owns the project.
     *
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * The property types associated with the project.
     *
     * @return BelongsToMany<PropertyType, $this>
     */
    public function propertyTypes(): BelongsToMany
    {
        return $this->belongsToMany(PropertyType::class)->withPivot('quantity');
    }

    /**
     * Get the tranches associated with the project.
     */
    public function tranches()
    {
        return $this->hasMany(Tranche::class);
    }
}
