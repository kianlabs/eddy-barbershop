<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("users", function (Blueprint $table) {
            // Flag akses panel admin. Default false agar user hasil booking
            // (dibuat otomatis dari nomor WhatsApp) tidak pernah jadi admin.
            $table->boolean("is_admin")->default(false)->after("password");
        });
    }

    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->dropColumn("is_admin");
        });
    }
};
