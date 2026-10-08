<?php

use App\Http\Controllers\Admin\BarberController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\TestimonialController;
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
        Route::get("/bookings/{booking}", [AdminBookingController::class, "show"])->name("bookings.show");
        Route::patch("/bookings/{booking}/status", [AdminBookingController::class, "updateStatus"])
            ->name("bookings.status");

        Route::get("/services", [ServiceController::class, "index"])->name("services.index");
        Route::post("/services", [ServiceController::class, "store"])->name("services.store");
        Route::patch("/services/{service}/active", [ServiceController::class, "toggleActive"])
            ->name("services.active");
        Route::put("/services/{service}", [ServiceController::class, "update"])->name("services.update");
        Route::delete("/services/{service}", [ServiceController::class, "destroy"])->name("services.destroy");

        Route::get("/barbers", [BarberController::class, "index"])->name("barbers.index");
        Route::post("/barbers", [BarberController::class, "store"])->name("barbers.store");
        Route::patch("/barbers/{barber}/active", [BarberController::class, "toggleActive"])
            ->name("barbers.active");
        Route::put("/barbers/{barber}", [BarberController::class, "update"])->name("barbers.update");
        Route::delete("/barbers/{barber}", [BarberController::class, "destroy"])->name("barbers.destroy");

        // Jadwal kapster per hari (day_of_week 0-6).
        Route::get("/barbers/{barber}/schedules", [ScheduleController::class, "index"])->name("barbers.schedules.index");
        Route::post("/barbers/{barber}/schedules", [ScheduleController::class, "store"])->name("barbers.schedules.store");
        Route::put("/barbers/{barber}/schedules/{schedule}", [ScheduleController::class, "update"])
            ->name("barbers.schedules.update");
        Route::delete("/barbers/{barber}/schedules/{schedule}", [ScheduleController::class, "destroy"])
            ->name("barbers.schedules.destroy");

        // Galeri & testimoni (data dari DB; integrasi Home menyusul).
        Route::get("/galleries", [GalleryController::class, "index"])->name("galleries.index");
        Route::post("/galleries", [GalleryController::class, "store"])->name("galleries.store");
        Route::put("/galleries/{gallery}", [GalleryController::class, "update"])->name("galleries.update");
        Route::delete("/galleries/{gallery}", [GalleryController::class, "destroy"])->name("galleries.destroy");

        Route::get("/testimonials", [TestimonialController::class, "index"])->name("testimonials.index");
        Route::post("/testimonials", [TestimonialController::class, "store"])->name("testimonials.store");
        Route::put("/testimonials/{testimonial}", [TestimonialController::class, "update"])->name("testimonials.update");
        Route::delete("/testimonials/{testimonial}", [TestimonialController::class, "destroy"])
            ->name("testimonials.destroy");
    });
