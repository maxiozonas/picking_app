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
            'alert_type' => ['required', 'in:stock_issue,product_not_found,quality_issue,other'],
            'message' => ['required', 'string', 'max:1000'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'product_code' => ['nullable', 'string'],
        ];
    }
}
