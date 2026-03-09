<?php

namespace Tests\Unit\Models;

use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WarehouseEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_is_encrypted_in_database(): void
    {
        // Arrange
        $plainPassword = '7171'; // Specific password for RONDEAU warehouse

        // Act - Create warehouse with password
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_username' => 'api',
            'flexxus_password' => $plainPassword,
        ]);

        // Assert - Verify password in DB is encrypted (not plain text)
        $dbPassword = DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->value('flexxus_password');

        $this->assertNotEquals($plainPassword, $dbPassword);
        $this->assertNotEmpty($dbPassword);
        $this->assertStringStartsWith('eyJ', $dbPassword); // Laravel encrypted format

        // Assert - Verify accessing via model returns decrypted password
        $this->assertEquals($plainPassword, $warehouse->flexxus_password);
    }

    public function test_username_is_encrypted_in_database(): void
    {
        // Arrange
        $plainUsername = 'api';

        // Act - Create warehouse with username
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_username' => $plainUsername,
            'flexxus_password' => '7171',
        ]);

        // Assert - Verify username in DB is encrypted
        $dbUsername = DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->value('flexxus_username');

        $this->assertNotEquals($plainUsername, $dbUsername);
        $this->assertNotEmpty($dbUsername);

        // Assert - Verify accessing via model returns decrypted username
        $this->assertEquals($plainUsername, $warehouse->flexxus_username);
    }

    public function test_credentials_can_be_retrieved_decrypted(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_username' => 'api',
            'flexxus_password' => '7171',
        ]);

        // Act
        $credentials = $warehouse->getFlexxusCredentials();

        // Assert
        $this->assertEquals('api', $credentials['username']);
        $this->assertEquals('7171', $credentials['password']);
    }

    public function test_different_warehouses_have_separately_encrypted_passwords(): void
    {
        // Arrange - Same password for different warehouses
        $password = '7171';

        // Act
        $warehouse1 = Warehouse::factory()->create([
            'code' => '002',
            'name' => 'RONDEAU',
            'flexxus_password' => $password,
        ]);

        $warehouse2 = Warehouse::factory()->create([
            'code' => '001',
            'name' => 'DON BOSCO',
            'flexxus_password' => $password,
        ]);

        // Assert - Encrypted values should be different (Laravel uses random IV)
        $dbPassword1 = DB::table('warehouses')
            ->where('id', $warehouse1->id)
            ->value('flexxus_password');

        $dbPassword2 = DB::table('warehouses')
            ->where('id', $warehouse2->id)
            ->value('flexxus_password');

        $this->assertNotEquals($dbPassword1, $dbPassword2);

        // But both decrypt to the same value
        $this->assertEquals($password, $warehouse1->flexxus_password);
        $this->assertEquals($password, $warehouse2->flexxus_password);
    }

    public function test_null_credentials_stay_null(): void
    {
        // Act - Create warehouse without credentials
        $warehouse = Warehouse::factory()->create([
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);

        // Assert - Should stay null in DB
        $dbUsername = DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->value('flexxus_username');

        $dbPassword = DB::table('warehouses')
            ->where('id', $warehouse->id)
            ->value('flexxus_password');

        $this->assertNull($dbUsername);
        $this->assertNull($dbPassword);

        // And accessing via model should return null
        $this->assertNull($warehouse->flexxus_username);
        $this->assertNull($warehouse->flexxus_password);
    }
}
