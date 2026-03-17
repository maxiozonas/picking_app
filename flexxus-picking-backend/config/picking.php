<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cache TTLs (seconds)
    |--------------------------------------------------------------------------
    */
    'stock_cache_ttl' => (int) env('PICKING_STOCK_CACHE_TTL', 45),
    'orders_cache_ttl' => (int) env('PICKING_ORDERS_CACHE_TTL', 900),
    'order_detail_cache_ttl' => (int) env('PICKING_ORDER_DETAIL_CACHE_TTL', 300),
    'admin_orders_cache_ttl' => (int) env('PICKING_ADMIN_ORDERS_CACHE_TTL', 900),
    'stock_validation_ttl' => (int) env('PICKING_STOCK_VALIDATION_TTL', 60),

    /*
    |--------------------------------------------------------------------------
    | Flexxus API
    |--------------------------------------------------------------------------
    */
    'flexxus_timeout' => (int) env('FLEXXUS_TIMEOUT', 15),

    /*
    |--------------------------------------------------------------------------
    | Circuit Breaker
    |--------------------------------------------------------------------------
    */
    'circuit_breaker_threshold' => (int) env('FLEXXUS_CIRCUIT_BREAKER_THRESHOLD', 5),
    'circuit_breaker_cooldown' => (int) env('FLEXXUS_CIRCUIT_BREAKER_COOLDOWN', 30),
];
