<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\Admin\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['role', 'warehouse_id', 'is_active', 'search']);
        $users = $this->userService->getAll($filters);

        return UserResource::collection($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:admin,empleado',
            'warehouse_id' => 'required_if:role,empleado|nullable|exists:warehouses,id',
            'can_override_warehouse' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['can_override_warehouse'] = false;

        $user = $this->userService->create($validated);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(int $id): UserResource
    {
        $user = $this->userService->findById($id);

        return new UserResource($user);
    }

    public function update(Request $request, int $id): UserResource
    {
        $validated = $request->validate([
            'username' => 'sometimes|string|unique:users,username,'.$id,
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|string|in:admin,empleado',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'can_override_warehouse' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['can_override_warehouse'] = false;

        $user = $this->userService->update($id, $validated);

        return new UserResource($user);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return response()->json(['message' => 'User deleted successfully']);
    }
}
