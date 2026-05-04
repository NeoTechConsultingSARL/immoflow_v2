<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tranche extends Model
{
    protected $fillable = ['project_id', 'name', 'description'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function blocs()
    {
        return $this->hasMany(Bloc::class);
    }

    public function properties()
    {
        return $this->hasManyThrough(Property::class, Bloc::class);
    }
}
