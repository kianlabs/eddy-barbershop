<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Item galeri (contoh gaya potong) yang tampil di halaman publik.
 * Sebelumnya array statis GALERI di Home.jsx.
 */
class Gallery extends Model
{
    protected $fillable = ["label", "image_path", "alt", "sort_order", "is_active"];

    protected function casts(): array
    {
        return ["is_active" => "boolean", "sort_order" => "integer"];
    }

    /** Urutan tampil: sort_order lalu id sebagai tie-break. */
    public function scopeOrdered($query)
    {
        return $query->orderBy("sort_order")->orderBy("id");
    }
}
