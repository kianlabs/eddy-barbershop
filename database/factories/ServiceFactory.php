<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => 'Potong Rambut',
            'description' => fake()->sentence(),
            'duration_minutes' => 30,
            'price' => 25000,
            'price_max' => null,
            'is_active' => true,
        ];
    }

    /**
     * Durasi layanan tertentu dalam menit.
     */
    public function duration(int $minutes): static
    {
        return $this->state(fn (array $attributes) => ['duration_minutes' => $minutes]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
