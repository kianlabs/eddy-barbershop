<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Testimoni pelanggan yang tampil di halaman publik.
 * Sebelumnya blok statis "Cerita Dari Kursi Cukur" di Home.jsx.
 */
class Testimonial extends Model
{
    protected $fillable = [
        "author_name", "author_location", "quote",
        "rating", "member_since", "sort_order", "is_active",
    ];

    protected function casts(): array
    {
        return ["is_active" => "boolean", "rating" => "integer", "sort_order" => "integer"];
    }

    /** Urutan tampil: sort_order lalu id sebagai tie-break. */
    public function scopeOrdered($query)
    {
        return $query->orderBy("sort_order")->orderBy("id");
    }
}
