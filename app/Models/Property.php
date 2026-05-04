<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'bloc_id',
        'property_type_id',
        'name',
        'price',
        'facade',
        'surface',
        'surface_titled',
        'status',
        'floor_number',
        'pieces_description',
        'has_basement',
        'has_mezzanine',
    ];

    public function bloc()
    {
        return $this->belongsTo(Bloc::class);
    }

    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class);
    }
}
