<?php

use App\Http\Controllers\Tracking\BookingLookupController;
use Illuminate\Support\Facades\Route;

/*
|----------------------------------------------------------------------------
| Pelacakan booking tanpa akun (Gap 2)
|----------------------------------------------------------------------------
| Dipisah dari routes/web.php agar tidak bertabrakan dengan sesi lain yang
| juga menyunting file itu. Didaftarkan via withRouting(then:) di bootstrap/app.php.
|
| Keamanan: pelanggan hanya bisa melihat/membatalkan booking miliknya sendiri
| karena pencarian WAJIB cocok id booking DAN nomor WhatsApp. Semua rute di sini
| dibungkus throttle:20,1 supaya enumerasi id/kode tidak ekonomis.
*/
Route::middleware(['web', 'throttle:20,1'])->group(function () {
    Route::get('/cek-booking', [BookingLookupController::class, 'index'])->name('tracking.index');
    Route::post('/cek-booking', [BookingLookupController::class, 'lookup'])->name('tracking.lookup');
    Route::post('/cek-booking/{kode}/batal', [BookingLookupController::class, 'cancel'])
        ->name('tracking.cancel');
});
