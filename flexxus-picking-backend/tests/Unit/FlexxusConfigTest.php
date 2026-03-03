<?php

namespace Tests\Unit;

use Tests\TestCase;

class FlexxusConfigTest extends TestCase
{
    public function test_flexxus_config_returns_correct_values(): void
    {
        $this->assertSame(
            'https://pruebagiliycia.procomisp.com.ar',
            config('flexxus.url')
        );

        $this->assertSame(
            'CARLOSR',
            config('flexxus.username')
        );

        $this->assertSame(
            'W250',
            config('flexxus.password')
        );

        $this->assertSame(
            [
                'model' => '0',
                'platform' => '0',
                'uuid' => '4953457348957348975',
                'version' => '0',
                'manufacturer' => '0',
            ],
            config('flexxus.device_info')
        );
    }
}
