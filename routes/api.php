<?php

use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

Route::get("/services", [BookingController::class, "services"])
    ->middleware("throttle:120,1")
    ->name("api.services");
Route::get("/barbers", [BookingController::class, "barbers"])
    ->middleware("throttle:120,1")
    ->name("api.barbers");
// Throttle ketat: endpoint ini paling mahal (hitung slot bentrok) dan dipanggil
// berulang saat user memilih tanggal, termasuk varian ?all=1 (Gap 23 ikut tercakup).
Route::get("/available-slots", [BookingController::class, "availableSlots"])
    ->middleware("throttle:60,1")
    ->name("api.available-slots");

Route::post("/bookings", [BookingController::class, "store"])
    ->middleware("throttle:10,1")
    ->name("api.bookings.store");
