<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('picking_items_progress', function (Blueprint $table) {
            // Product description from Flexxus DESCRIPCION
            $table->string('description')->nullable()->after('product_code');
            // Physical location in warehouse from Flexxus UBICACIONPRODUCTO
            $table->string('location')->nullable()->after('description');
            // Lot number from Flexxus LOTE
            $table->string('lot')->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('picking_items_progress', function (Blueprint $table) {
            $table->dropColumn(['description', 'location', 'lot']);
        });
    }
};
