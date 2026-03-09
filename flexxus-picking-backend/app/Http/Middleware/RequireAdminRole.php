<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasRole('admin')) {
            return response()->json([
                'error' => [
                    'message' => 'This action requires administrator privileges.',
                    'error_code' => 'FORBIDDEN',
                ],
            ], 403);
        }

        return $next($request);
    }
}
