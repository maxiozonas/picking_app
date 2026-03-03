<?php

namespace Tests\Unit\Models;

use App\Models\PickingAlert;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickingAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_alert_belongs_to_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create();
        $alert = PickingAlert::factory()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        $this->assertInstanceOf(Warehouse::class, $alert->warehouse);
        $this->assertEquals($warehouse->id, $alert->warehouse->id);
    }

    public function test_alert_belongs_to_reporter(): void
    {
        $reporter = User::factory()->create();
        $alert = PickingAlert::factory()->create([
            'user_id' => $reporter->id,
        ]);

        $this->assertInstanceOf(User::class, $alert->reporter);
        $this->assertEquals($reporter->id, $alert->reporter->id);
    }

    public function test_alert_belongs_to_resolver(): void
    {
        $resolver = User::factory()->create();
        $alert = PickingAlert::factory()->create([
            'resolved_by' => $resolver->id,
        ]);

        $this->assertInstanceOf(User::class, $alert->resolver);
        $this->assertEquals($resolver->id, $alert->resolver->id);
    }

    public function test_fillable_attributes(): void
    {
        $alert = new PickingAlert;

        $fillable = [
            'order_number',
            'warehouse_id',
            'user_id',
            'alert_type',
            'product_code',
            'message',
            'severity',
            'is_resolved',
            'resolved_at',
            'resolved_by',
        ];

        foreach ($fillable as $field) {
            $this->assertContains($field, $alert->getFillable());
        }
    }

    public function test_casts_resolved_at_to_datetime(): void
    {
        $alert = PickingAlert::factory()->create([
            'resolved_at' => '2026-03-03 12:00:00',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $alert->resolved_at);
    }

    public function test_casts_is_resolved_to_boolean(): void
    {
        $alert = PickingAlert::factory()->create([
            'is_resolved' => 1,
        ]);

        $this->assertIsBool($alert->is_resolved);
        $this->assertTrue($alert->is_resolved);
    }

    public function test_scope_unresolved_filters_only_unresolved_alerts(): void
    {
        PickingAlert::factory()->create(['is_resolved' => false]);
        PickingAlert::factory()->create(['is_resolved' => true]);
        PickingAlert::factory()->create(['is_resolved' => false]);

        $unresolvedAlerts = PickingAlert::unresolved()->get();

        $this->assertCount(2, $unresolvedAlerts);
        $unresolvedAlerts->each(function ($alert) {
            $this->assertFalse($alert->is_resolved);
        });
    }

    public function test_scope_high_severity_filters_only_high_severity_alerts(): void
    {
        PickingAlert::factory()->create(['severity' => 'low']);
        PickingAlert::factory()->create(['severity' => 'high']);
        PickingAlert::factory()->create(['severity' => 'medium']);
        PickingAlert::factory()->create(['severity' => 'high']);

        $highSeverityAlerts = PickingAlert::highSeverity()->get();

        $this->assertCount(2, $highSeverityAlerts);
        $highSeverityAlerts->each(function ($alert) {
            $this->assertEquals('high', $alert->severity);
        });
    }
}
