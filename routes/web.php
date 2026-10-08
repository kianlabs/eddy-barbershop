<?php

use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Auth\AuthController;
use App\Models\Barber;
use App\Models\Service;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get("/", function () {
    return Inertia::render("Home", [
        "services" => Service::where("is_active", true)->orderBy("price")->get(),
        "barbers" => Barber::where("is_active", true)->get(),
    ]);
});

Route::get("/booking", function () {
    return Inertia::render("Booking", [
        "services" => Service::where("is_active", true)->orderBy("price")->get(),
        "barbers" => Barber::where("is_active", true)->get(),
    ]);
});

/*
|----------------------------------------------------------------------------
| Autentikasi (session, guard `web`)
|----------------------------------------------------------------------------
| Login dilindungi throttle:10,1 (maks 10 percobaan per menit per IP) untuk
| meredam brute force. `guest` mencegah admin yang sudah login membuka /login.
*/
Route::middleware("guest")->group(function () {
    Route::get("/login", [AuthController::class, "showLogin"])->name("login");
    Route::post("/login", [AuthController::class, "login"])->middleware("throttle:10,1");
});

Route::post("/logout", [AuthController::class, "logout"])
    ->middleware("auth")
    ->name("logout");

/*
|----------------------------------------------------------------------------
| Panel Admin — wajib login (`auth`) DAN berflag admin (`admin`)
|----------------------------------------------------------------------------
*/
Route::middleware(["auth", "admin"])
    ->prefix("admin")
    ->name("admin.")
    ->group(function () {
        Route::get("/", [DashboardController::class, "index"])->name("dashboard");

        Route::get("/bookings", [AdminBookingController::class, "index"])->name("bookings.index");
        Route::patch("/bookings/{booking}/status", [AdminBookingController::class, "updateStatus"])
            ->name("bookings.status");

        Route::get("/services", [ServiceController::class, "index"])->name("services.index");
        Route::patch("/services/{service}/active", [ServiceController::class, "toggleActive"])
            ->name("services.active");
        Route::put("/services/{service}", [ServiceController::class, "update"])->name("services.update");

        Route::get("/barbers", [BarberController::class, "index"])->name("barbers.index");
        Route::patch("/barbers/{barber}/active", [BarberController::class, "toggleActive"])
            ->name("barbers.active");
    });
