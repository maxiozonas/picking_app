<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class CreateAlertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alert_type' => ['required', 'in:insufficient_stock,product_missing,order_issue'],
            'message' => ['required', 'string', 'max:1000'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'product_code' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'alert_type.in' => 'El tipo de alerta debe ser insufficient_stock, product_missing o order_issue.',
        ];
    }
}
