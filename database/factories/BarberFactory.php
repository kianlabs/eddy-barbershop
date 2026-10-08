<?php

namespace Database\Factories;

use App\Models\Barber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Barber>
 */
class BarberFactory extends Factory
{
    protected $model = Barber::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'photo' => null,
            'specialty' => fake()->randomElement(['Classic Cut', 'Fade Specialist', 'Pakar Klasik']),
            'is_active' => true,
        ];
    }

    /**
     * Kapster non-aktif — tidak boleh muncul di daftar publik.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
