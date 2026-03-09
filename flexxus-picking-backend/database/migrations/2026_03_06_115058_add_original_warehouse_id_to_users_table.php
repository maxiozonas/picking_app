<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('original_warehouse_id')->nullable()->after('warehouse_id');
            $table->foreign('original_warehouse_id')->references('id')->on('warehouses')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['original_warehouse_id']);
            $table->dropColumn('original_warehouse_id');
        });
    }
};
