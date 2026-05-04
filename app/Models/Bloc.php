<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bloc extends Model
{
    protected $fillable = ['project_id', 'tranche_id', 'name', 'description', 'floors'];

    public function tranche()
    {
        return $this->belongsTo(Tranche::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function parkings()
    {
        return $this->hasMany(Parking::class);
    }
}
