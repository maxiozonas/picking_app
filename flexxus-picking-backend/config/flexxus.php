<?php

return [
    'url' => env('FLEXXUS_URL'),
    'username' => env('FLEXXUS_USERNAME'),
    'password' => env('FLEXXUS_PASSWORD'),
    'device_info' => json_decode(env('FLEXXUS_DEVICE_INFO', '{}'), true),
];
