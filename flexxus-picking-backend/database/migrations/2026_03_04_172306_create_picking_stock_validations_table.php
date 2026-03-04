<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('picking_stock_validations', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50);
            $table->string('item_code', 50);
            $table->enum('validation_type', ['over_pick', 'physical_stock', 'already_picked', 'prefetch']);
            $table->unsignedInteger('requested_qty');
            $table->unsignedInteger('available_qty')->nullable();
            $table->enum('validation_result', ['passed', 'failed']);
            $table->string('error_code', 50)->nullable();
            $table->json('stock_snapshot')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('validated_at');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');

            // Indexes for performance
            $table->index(['order_number', 'item_code'], 'idx_order_item');
            $table->index('validated_at', 'idx_validated_at');
            $table->index('validation_result', 'idx_result');
            $table->index(['user_id', 'warehouse_id'], 'idx_user_warehouse');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_stock_validations');
    }
};
