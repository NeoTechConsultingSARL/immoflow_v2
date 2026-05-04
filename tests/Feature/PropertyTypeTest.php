<?php

namespace Tests\Feature;

use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTypeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_property_types_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/settings/property-types');
        $response->assertStatus(200);
    }

    public function test_admin_can_create_property_type(): void
    {
        $data = [
            'name' => 'Apartment',
            'description' => 'A nice apartment',
            'icon' => 'Building',
        ];

        $response = $this->actingAs($this->admin)->post('/settings/property-types', $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('property_types', $data);
    }

    public function test_admin_can_update_property_type(): void
    {
        $propertyType = PropertyType::factory()->create();

        $data = [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
            'icon' => 'Home',
        ];

        $response = $this->actingAs($this->admin)->put("/settings/property-types/{$propertyType->id}", $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('property_types', $data);
    }

    public function test_admin_can_delete_property_type(): void
    {
        $propertyType = PropertyType::factory()->create();

        $response = $this->actingAs($this->admin)->delete("/settings/property-types/{$propertyType->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('property_types', ['id' => $propertyType->id]);
    }
}
