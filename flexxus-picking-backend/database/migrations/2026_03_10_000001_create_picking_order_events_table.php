<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('picking_order_events', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50);
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('event_type', 50); // order_started, item_picked, item_completed, order_completed
            $table->string('product_code', 50)->nullable();
            $table->integer('quantity')->nullable();
            $table->text('message');
            $table->timestamps();

            $table->index(['order_number', 'warehouse_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('picking_order_events');
    }
};
