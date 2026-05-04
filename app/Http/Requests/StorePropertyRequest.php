<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $propertyType = $this->route('type');
        $isLivingUnit = in_array($propertyType->name, ['Apartment', 'Duplex', 'Duplexe', 'House', 'Villa', 'Office']);
        $isStore = $propertyType->name === 'Store';

        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'facade' => 'required|string|max:255',
            'surface' => 'required|numeric|min:0',
            'surface_titled' => 'required|numeric|min:0',
            'status' => ['required', Rule::in(['available', 'sold', 'reserved'])],

            'floor_number' => $isLivingUnit ? 'required|integer' : 'nullable|integer',
            'pieces_description' => $isLivingUnit ? 'required|string' : 'nullable|string',
            'has_basement' => $isLivingUnit ? 'required|boolean' : 'nullable|boolean',

            'has_mezzanine' => $isStore ? 'required|boolean' : 'nullable|boolean',
        ];
    }
}
