<?php

namespace Database\Factories;

use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        return [
            // Selalu di-set eksplisit oleh pemanggil (model tidak memakai
            // trait HasFactory, jadi `Barber::factory()` tidak tersedia).
            'barber_id' => null,
            'day_of_week' => 1, // Senin
            'start_time' => '10:00:00',
            'end_time' => '23:00:00',
            'is_active' => true,
        ];
    }

    /**
     * Tetapkan jadwal ke kapster tertentu (berdasarkan id).
     */
    public function forBarberId(int $barberId): static
    {
        return $this->state(fn (array $attributes) => ['barber_id' => $barberId]);
    }

    /**
     * Tetapkan hari kerja (0=Minggu .. 6=Sabtu).
     */
    public function day(int $dayOfWeek): static
    {
        return $this->state(fn (array $attributes) => ['day_of_week' => $dayOfWeek]);
    }

    /**
     * Jam kerja kapster.
     */
    public function hours(string $start, string $end): static
    {
        return $this->state(fn (array $attributes) => [
            'start_time' => $start,
            'end_time' => $end,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
