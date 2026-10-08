<?php

use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

Route::get("/services", [BookingController::class, "services"])->name("api.services");
Route::get("/barbers", [BookingController::class, "barbers"])->name("api.barbers");
Route::get("/available-slots", [BookingController::class, "availableSlots"])->name("api.available-slots");
Route::post("/bookings", [BookingController::class, "store"])
    ->middleware("throttle:10,1")
    ->name("api.bookings.store");
