<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyType extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'icon',
    ];

    /**
     * Get the properties for the property type.
     */
    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
