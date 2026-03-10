<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('picking_orders_progress', function (Blueprint $table) {
            // Customer name stored from Flexxus RAZONSOCIAL on order start
            $table->string('customer')->nullable()->after('order_number');
        });
    }

    public function down(): void
    {
        Schema::table('picking_orders_progress', function (Blueprint $table) {
            $table->dropColumn('customer');
        });
    }
};
