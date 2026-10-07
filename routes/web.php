<?php

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
