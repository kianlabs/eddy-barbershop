<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Di balik proxy Vercel, TLS di-*terminate* di edge sehingga PHP
        // melihat request sebagai HTTP. Tanpa ini, asset()/url() menghasilkan
        // "http://..." pada halaman HTTPS -> browser memblokir (mixed content)
        // -> bundle JS tidak dimuat -> Inertia gagal hydrate -> layar putih.
        // Memaksa skema https hanya di production; lokal (http) tidak terpengaruh.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
