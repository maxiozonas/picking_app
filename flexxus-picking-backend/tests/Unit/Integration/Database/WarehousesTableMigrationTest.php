<?php

namespace Tests\Unit\Integration\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class WarehousesTableMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_warehouses_table_has_flexxus_credentials_columns(): void
    {
        // Check that the warehouses table has the new columns
        $this->assertTrue(Schema::hasColumn('warehouses', 'flexxus_url'));
        $this->assertTrue(Schema::hasColumn('warehouses', 'flexxus_username'));
        $this->assertTrue(Schema::hasColumn('warehouses', 'flexxus_password'));
    }

    public function test_warehouses_table_columns_are_nullable(): void
    {
        // Verify columns are nullable by checking pragma for SQLite
        // In SQLite, we can't easily check nullable without inspecting CREATE TABLE
        // So we'll verify by checking the table structure
        $tableStructure = Schema::getConnection()->select('PRAGMA table_info(warehouses)');

        $flexxusUrlColumn = collect($tableStructure)->firstWhere('name', 'flexxus_url');
        $flexxusUsernameColumn = collect($tableStructure)->firstWhere('name', 'flexxus_username');
        $flexxusPasswordColumn = collect($tableStructure)->firstWhere('name', 'flexxus_password');

        // In SQLite, notnull = 0 means nullable
        $this->assertEquals(0, $flexxusUrlColumn->notnull ?? 1);
        $this->assertEquals(0, $flexxusUsernameColumn->notnull ?? 1);
        $this->assertEquals(0, $flexxusPasswordColumn->notnull ?? 1);
    }

    public function test_warehouses_table_has_unique_index_on_flexxus_credentials(): void
    {
        // Check that unique index exists on (flexxus_url, flexxus_username)
        $indexes = Schema::getConnection()->select("PRAGMA index_list('warehouses')");

        // Look for the unique index on flexxus_url and flexxus_username
        $uniqueIndexes = collect($indexes)->filter(function ($index) {
            return $index->unique === 1 && str_contains($index->name, 'flexxus_url');
        });

        $this->assertGreaterThan(0, $uniqueIndexes->count(), 'No unique index found on flexxus credentials');
    }
}
