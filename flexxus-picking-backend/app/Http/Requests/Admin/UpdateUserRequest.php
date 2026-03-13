<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'username' => "sometimes|string|unique:users,username,{$userId}",
            'name' => 'sometimes|string',
            'email' => "sometimes|email|unique:users,email,{$userId}",
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|string|in:admin,empleado',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'can_override_warehouse' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ];
    }
}
