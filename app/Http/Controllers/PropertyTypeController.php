<?php

namespace App\Http\Controllers;

use App\Models\PropertyType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('SettingsPropertyTypes', [
            'propertyTypes' => PropertyType::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:property_types',
            'description' => 'nullable|string',
            'icon' => 'required|string|max:255',
        ]);

        PropertyType::create($validated);

        return redirect()->back()->with('success', 'Property type created successfully.');
    }

    public function update(Request $request, PropertyType $propertyType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:property_types,name,'.$propertyType->id,
            'description' => 'nullable|string',
            'icon' => 'required|string|max:255',
        ]);

        $propertyType->update($validated);

        return redirect()->back()->with('success', 'Property type updated successfully.');
    }

    public function destroy(PropertyType $propertyType)
    {
        $propertyType->delete();

        return redirect()->back()->with('success', 'Property type deleted successfully.');
    }
}
