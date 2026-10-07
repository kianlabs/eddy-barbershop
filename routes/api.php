<?php

use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

Route::get("/services", [BookingController::class, "services"]);
Route::get("/barbers", [BookingController::class, "barbers"]);
Route::get("/available-slots", [BookingController::class, "availableSlots"]);
Route::post("/bookings", [BookingController::class, "store"]);
