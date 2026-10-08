<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah unique index pada users.whatsapp.
     *
     * Asumsi: DB dev bersih (tidak ada duplikat). Meski demikian, migrasi ini
     * aman kalau seandainya ada duplikat: baris dengan whatsapp non-null yang
     * duplikat di-null-kan terlebih dahulu (kecuali satu baris yang dipertahankan)
     * agar unique index tidak gagal dibuat. Kolom tetap nullable sehingga banyak
     * NULL tetap diizinkan (MySQL unique index mengabaikan NULL).
     */
    public function up(): void
    {
        // Jaga-jaga terhadap data lama duplikat: sisakan satu baris per nomor.
        $duplicates = DB::table("users")
            ->select("whatsapp")
            ->whereNotNull("whatsapp")
            ->groupBy("whatsapp")
            ->havingRaw("COUNT(*) > 1")
            ->pluck("whatsapp");

        foreach ($duplicates as $whatsapp) {
            $keeperId = DB::table("users")
                ->where("whatsapp", $whatsapp)
                ->orderBy("id")
                ->value("id");

            DB::table("users")
                ->where("whatsapp", $whatsapp)
                ->where("id", "!=", $keeperId)
                ->update(["whatsapp" => null]);
        }

        Schema::table("users", function (Blueprint $table) {
            $table->unique("whatsapp", "users_whatsapp_unique");
        });
    }

    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->dropUnique("users_whatsapp_unique");
        });
    }
};
