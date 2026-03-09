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
        Schema::table('picking_orders_progress', function (Blueprint $table) {
            $table->string('order_type', 10)->nullable()->after('order_number');
        });

        DB::statement("UPDATE picking_orders_progress SET order_type = 'NP' WHERE order_type IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('picking_orders_progress', function (Blueprint $table) {
            $table->dropColumn('order_type');
        });
    }
};
