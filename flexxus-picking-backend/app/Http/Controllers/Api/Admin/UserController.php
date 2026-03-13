<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
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

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['can_override_warehouse'] = false;

        $user = $this->userService->create($validated);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(int $id): UserResource
    {
        $user = $this->userService->findById($id);

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, int $id): UserResource
    {
        $validated = $request->validated();
        $validated['can_override_warehouse'] = $validated['can_override_warehouse'] ?? false;

        $user = $this->userService->update($id, $validated);

        return new UserResource($user);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return response()->json(['message' => 'User deleted successfully']);
    }
}
