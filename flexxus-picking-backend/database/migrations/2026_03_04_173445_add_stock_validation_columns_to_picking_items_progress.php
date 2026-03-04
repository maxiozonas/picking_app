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
        Schema::table('picking_items_progress', function (Blueprint $table) {
            // Add foreign key to picking_orders_progress
            $table->foreignId('picking_order_progress_id')
                ->nullable()
                ->after('id')
                ->constrained('picking_orders_progress')
                ->nullOnDelete();

            // Add item_code as an alias to product_code for clarity in stock validation context
            $table->string('item_code')
                ->nullable()
                ->after('product_code');

            // Add quantity_requested as an alias to quantity_required for clarity
            $table->integer('quantity_requested')
                ->nullable()
                ->after('quantity_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('picking_items_progress', function (Blueprint $table) {
            $table->dropForeign(['picking_order_progress_id']);
            $table->dropColumn(['picking_order_progress_id', 'item_code', 'quantity_requested']);
        });
    }
};
