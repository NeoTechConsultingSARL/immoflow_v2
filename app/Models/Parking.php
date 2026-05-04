<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parking extends Model
{
    protected $fillable = ['name', 'price', 'status', 'bloc_id'];

    public function bloc()
    {
        return $this->belongsTo(Bloc::class);
    }
}
