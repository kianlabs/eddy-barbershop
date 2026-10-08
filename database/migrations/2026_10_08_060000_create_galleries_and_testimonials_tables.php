<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Galeri & testimoni yang sebelumnya hardcoded di resources/js/Pages/Home.jsx.
 * Sekarang disimpan di DB agar bisa dikelola dari panel admin.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create("galleries", function (Blueprint $table) {
            $table->id();
            $table->string("label");                 // mis. "Skin Fade"
            $table->string("image_path");            // mis. "/images/galeri/skin-fade.webp"
            $table->string("alt")->nullable();       // teks alternatif gambar
            $table->unsignedInteger("sort_order")->default(0);
            $table->boolean("is_active")->default(true);
            $table->timestamps();

            $table->index(["is_active", "sort_order"]);
        });

        Schema::create("testimonials", function (Blueprint $table) {
            $table->id();
            $table->string("author_name");           // mis. "Dimas P."
            $table->string("author_location")->nullable(); // mis. "Gonilan Kartasura"
            $table->text("quote");
            $table->unsignedTinyInteger("rating")->default(5); // 1-5
            $table->string("member_since")->nullable();   // mis. "Reguler sejak 2021"
            $table->unsignedInteger("sort_order")->default(0);
            $table->boolean("is_active")->default(true);
            $table->timestamps();

            $table->index(["is_active", "sort_order"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("testimonials");
        Schema::dropIfExists("galleries");
    }
};
