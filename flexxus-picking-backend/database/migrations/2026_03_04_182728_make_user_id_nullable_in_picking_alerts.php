<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support altering columns with foreign keys easily
        // We need to recreate the table
        DB::statement('DROP TABLE IF EXISTS picking_alerts');
        Schema::create('picking_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50);
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            $table->enum('alert_type', ['insufficient_stock', 'product_missing', 'order_issue']);

            $table->string('product_code', 50)->nullable();
            $table->text('message');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');

            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');

            $table->timestamps();

            $table->index(['warehouse_id', 'is_resolved']);
            $table->index('severity');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS picking_alerts');
        Schema::create('picking_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50);
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();

            $table->enum('alert_type', ['insufficient_stock', 'product_missing', 'order_issue']);

            $table->string('product_code', 50)->nullable();
            $table->text('message');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');

            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');

            $table->timestamps();

            $table->index(['warehouse_id', 'is_resolved']);
            $table->index('severity');
            $table->index('created_at');
        });
    }
};
