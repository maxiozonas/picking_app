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
        Schema::table('warehouses', function (Blueprint $table) {
            // Add Flexxus credential columns after 'branch'
            $table->string('flexxus_url')->nullable()->after('branch');
            $table->string('flexxus_username')->nullable()->after('flexxus_url');
            $table->string('flexxus_password')->nullable()->after('flexxus_username');

            // Add unique index on (flexxus_url, flexxus_username) to prevent duplicate credential sets
            $table->unique(['flexxus_url', 'flexxus_username'], 'warehouses_flexxus_url_flexxus_username_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            // Drop the unique index first
            $table->dropUnique('warehouses_flexxus_url_flexxus_username_unique');

            // Drop the columns
            $table->dropColumn(['flexxus_url', 'flexxus_username', 'flexxus_password']);
        });
    }
};
