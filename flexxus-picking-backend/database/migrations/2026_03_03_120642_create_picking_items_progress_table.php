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
        Schema::create('picking_items_progress', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50);  // NP 623136
            $table->string('product_code', 50);  // 04535

            $table->integer('quantity_required');
            $table->integer('quantity_picked')->default(0);

            $table->enum('status', ['pending', 'in_progress', 'completed', 'issue_reported'])->default('pending');

            $table->string('issue_type', 50)->nullable();
            $table->text('issue_notes')->nullable();

            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('order_number')
                ->references('order_number')
                ->on('picking_orders_progress')
                ->cascadeOnDelete();

            $table->unique(['order_number', 'product_code']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('picking_items_progress');
    }
};
