<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            // user_id/barber_id/service_id selalu di-set eksplisit oleh pemanggil
            // (model tidak memakai trait HasFactory, jadi `::factory()` tidak ada).
            'user_id' => null,
            'barber_id' => null,
            'service_id' => null,
            'date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '10:30:00',
            'status' => 'pending',
            'whatsapp' => '6281234567890',
            'notes' => null,
        ];
    }

    public function status(string $status): static
    {
        return $this->state(fn (array $attributes) => ['status' => $status]);
    }
}
