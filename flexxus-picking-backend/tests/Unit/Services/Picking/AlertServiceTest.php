<?php

namespace Tests\Unit\Services\Picking;

use App\Models\PickingAlert;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\AlertService;
use App\Services\Picking\Interfaces\AlertServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertServiceTest extends TestCase
{
    use RefreshDatabase;

    private AlertServiceInterface $alertService;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();

        $this->alertService = $this->app->make(AlertServiceInterface::class);
        $this->user = User::factory()->create();
        $this->warehouse = Warehouse::factory()->create();
    }

    public function test_alert_service_is_bound(): void
    {
        $this->assertInstanceOf(AlertService::class, $this->alertService);
    }

    public function test_alert_service_implements_interface(): void
    {
        $this->assertInstanceOf(AlertServiceInterface::class, $this->alertService);
    }

    public function test_create_alert_creates_new_alert(): void
    {
        $data = [
            'order_number' => 'NP-001',
            'warehouse_id' => $this->warehouse->id,
            'alert_type' => 'insufficient_stock',
            'severity' => 'high',
            'message' => 'Stock does not match',
            'product_code' => 'PROD-001',
        ];

        $alert = $this->alertService->createAlert($data, $this->user);

        $this->assertInstanceOf(PickingAlert::class, $alert);
        $this->assertEquals('NP-001', $alert->order_number);
        $this->assertEquals('insufficient_stock', $alert->alert_type);
        $this->assertEquals('high', $alert->severity);
        $this->assertEquals($this->user->id, $alert->user_id);
        $this->assertEquals($this->warehouse->id, $alert->warehouse_id);
        $this->assertEquals('PROD-001', $alert->product_code);
        $this->assertFalse($alert->is_resolved);
        $this->assertDatabaseHas('picking_alerts', [
            'order_number' => 'NP-001',
            'alert_type' => 'insufficient_stock',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_resolve_alert_marks_as_resolved(): void
    {
        $alert = PickingAlert::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'is_resolved' => false,
        ]);

        $resolved = $this->alertService->resolveAlert($alert->id, $this->user, 'Fixed the issue');

        $this->assertTrue($resolved->is_resolved);
        $this->assertEquals($this->user->id, $resolved->resolved_by);
        $this->assertNotNull($resolved->resolved_at);
        $this->assertDatabaseHas('picking_alerts', [
            'id' => $alert->id,
            'is_resolved' => true,
            'resolved_by' => $this->user->id,
        ]);
    }

    public function test_get_alerts_for_order_returns_alerts(): void
    {
        PickingAlert::factory()->count(3)->create([
            'order_number' => 'NP-001',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
        ]);

        $alerts = $this->alertService->getAlertsForOrder('NP-001');

        $this->assertCount(3, $alerts);
        $this->assertContainsOnlyInstancesOf(PickingAlert::class, $alerts);
        foreach ($alerts as $alert) {
            $this->assertEquals('NP-001', $alert->order_number);
        }
    }

    public function test_has_critical_alerts_returns_true_when_critical(): void
    {
        PickingAlert::factory()->create([
            'order_number' => 'NP-001',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'severity' => 'critical',
            'is_resolved' => false,
        ]);

        $hasCritical = $this->alertService->hasCriticalAlerts('NP-001');

        $this->assertTrue($hasCritical);
    }

    public function test_has_critical_alerts_returns_false_when_none(): void
    {
        $hasCritical = $this->alertService->hasCriticalAlerts('NP-001');

        $this->assertFalse($hasCritical);
    }

    public function test_has_critical_alerts_returns_false_when_resolved(): void
    {
        PickingAlert::factory()->create([
            'order_number' => 'NP-001',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'severity' => 'critical',
            'is_resolved' => true, // Already resolved
        ]);

        $hasCritical = $this->alertService->hasCriticalAlerts('NP-001');

        $this->assertFalse($hasCritical);
    }

    public function test_create_validation_alert_creates_system_alert(): void
    {
        $alert = $this->alertService->createValidationAlert(
            'NP-002',
            'PROD-999',
            'stock_insufficient',
            ['warehouse_id' => $this->warehouse->id, 'requested' => 10, 'available' => 5],
            null // System-generated (no user)
        );

        $this->assertInstanceOf(PickingAlert::class, $alert);
        $this->assertEquals('NP-002', $alert->order_number);
        $this->assertEquals('PROD-999', $alert->product_code);
        $this->assertEquals('insufficient_stock', $alert->alert_type);
        $this->assertEquals('high', $alert->severity);
        $this->assertEquals($this->warehouse->id, $alert->warehouse_id);
        $this->assertNull($alert->user_id); // System alert
        $this->assertStringContainsString('Stock insuficiente', $alert->message);
    }
}
