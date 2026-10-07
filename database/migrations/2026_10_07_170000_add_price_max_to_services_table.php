<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("services", function (Blueprint $table) {
            // Harga atas untuk layanan ber-range (mis. Semir Rp35.000-150.000).
            // NULL untuk layanan dengan harga tunggal.
            $table->unsignedBigInteger("price_max")->nullable()->after("price");
        });
    }

    public function down(): void
    {
        Schema::table("services", function (Blueprint $table) {
            $table->dropColumn("price_max");
        });
    }
};
