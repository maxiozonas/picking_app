<?php

use App\Exceptions\AuthenticationValidationException;
use App\Exceptions\AuthorizationValidationException;
use App\Exceptions\BaseException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'role.admin' => \App\Http\Middleware\RequireAdminRole::class,
            'warehouse.override' => \App\Http\Middleware\WarehouseOverrideMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Laravel default auth exception
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please provide a valid token.',
                ], 401);
            }
        });

        // Auth/Validation exceptions
        $exceptions->render(function (AuthenticationValidationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 401);
            }
        });

        $exceptions->render(function (AuthorizationValidationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many attempts. Please try again later.',
                ], 429);
            }
        });

        // Laravel ValidationException
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The given data was invalid.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Custom BaseException handler - handles all our custom exceptions
        $exceptions->render(function (BaseException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                // Log the error with context for debugging
                Log::error($e->getMessage(), [
                    'error_code' => $e->getErrorCode(),
                    'http_status' => $e->getHttpStatus(),
                    'context' => $e->getContext(),
                ]);

                $response = [
                    'error' => [
                        'message' => $e->getMessage(),
                        'error_code' => $e->getErrorCode(),
                    ],
                ];

                // Include details only in debug mode
                if (config('app.debug')) {
                    $response['error']['details'] = $e->getContext();
                }

                return response()->json($response, $e->getHttpStatus());
            }
        });

        // Fallback for any other exceptions
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                Log::error($e->getMessage(), [
                    'exception' => get_class($e),
                    'trace' => $e->getTraceAsString(),
                ]);

                $response = [
                    'error' => [
                        'message' => config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.',
                        'error_code' => 'INTERNAL_SERVER_ERROR',
                    ],
                ];

                if (config('app.debug')) {
                    $response['error']['details'] = [
                        'exception' => get_class($e),
                        'trace' => $e->getTraceAsString(),
                    ];
                }

                return response()->json($response, 500);
            }
        });
    })->create();
