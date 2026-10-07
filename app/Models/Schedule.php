<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = ["barber_id", "day_of_week", "start_time", "end_time", "is_active"];

    protected function casts(): array
    {
        return ["is_active" => "boolean"];
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(Barber::class);
    }
}
