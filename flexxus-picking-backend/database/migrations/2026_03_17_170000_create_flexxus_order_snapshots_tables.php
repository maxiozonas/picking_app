<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flexxus_order_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->date('snapshot_date');
            $table->string('order_number', 64);
            $table->string('order_type', 16)->default('NP');
            $table->string('customer')->nullable();
            $table->decimal('total', 12, 2)->default(0);
            $table->string('delivery_type', 64)->nullable();
            $table->timestamp('flexxus_created_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['warehouse_id', 'snapshot_date', 'order_number'], 'flexxus_order_snapshot_unique');
            $table->index(['warehouse_id', 'snapshot_date'], 'flexxus_order_snapshot_lookup');
        });

        Schema::create('flexxus_sync_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->date('snapshot_date')->nullable();
            $table->string('status', 24)->default('idle');
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('last_success_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->unique('warehouse_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flexxus_sync_states');
        Schema::dropIfExists('flexxus_order_snapshots');
    }
};
