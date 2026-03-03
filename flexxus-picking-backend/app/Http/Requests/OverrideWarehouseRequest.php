<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OverrideWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'duration' => ['nullable', 'integer', 'min:15', 'max:480'],
        ];
    }

    public function getDurationMinutes(): int
    {
        return $this->input('duration', 60);
    }
}
