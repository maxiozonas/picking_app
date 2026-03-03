<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\OverrideWarehouseRequest;
use App\Http\Resources\AuthResource;
use App\Services\Auth\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthServiceInterface $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('username'),
            $request->validated('password')
        );

        $tokenData = [
            'abilities' => ['*'],
            'name' => 'auth-token',
            'token' => $result['token'],
            'expires_at' => now()->addMinutes(config('sanctum.expiration', 0))->toISOString(),
        ];

        $formattedResult = [
            'token' => $tokenData,
            'user' => $result['user'],
        ];

        return (new AuthResource($formattedResult))->response()->setStatusCode(200);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['success' => true], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $result = $this->authService->me($request->user());

        return (new AuthResource($result))->response()->setStatusCode(200);
    }

    public function overrideWarehouse(OverrideWarehouseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->authService->overrideWarehouse(
            $request->user(),
            $validated['warehouse_id'],
            $validated['duration'] ?? 60
        );

        return (new AuthResource($result))->response()->setStatusCode(200);
    }

    public function clearOverride(Request $request): JsonResponse
    {
        $this->authService->clearOverride($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Override de depósito eliminado',
        ]);
    }
}
