<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('picking_alerts', function (Blueprint $table) {
            $table->text('resolution_notes')->nullable()->after('resolved_by');
        });
    }

    public function down(): void
    {
        Schema::table('picking_alerts', function (Blueprint $table) {
            $table->dropColumn('resolution_notes');
        });
    }
};
