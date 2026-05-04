<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Models\Bloc;
use App\Models\Property;
use App\Models\PropertyType;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function managementGateway(Bloc $bloc)
    {
        $bloc->load('tranche.project.company');

        return Inertia::render('ProjectManagement', [
            'bloc' => $bloc,
            'tranche' => $bloc->tranche,
            'project' => $bloc->tranche->project,
            'company' => $bloc->tranche->project->company,
        ]);
    }

    public function propertyTypeGrid(Bloc $bloc)
    {
        $bloc->load('tranche.project.company');
        $types = PropertyType::withCount(['properties' => function ($query) use ($bloc) {
            $query->where('bloc_id', $bloc->id);
        }])->get();

        return Inertia::render('PropertyTypes', [
            'bloc' => $bloc,
            'tranche' => $bloc->tranche,
            'project' => $bloc->tranche->project,
            'company' => $bloc->tranche->project->company,
            'types' => $types,
        ]);
    }

    public function propertiesList(Bloc $bloc, PropertyType $type)
    {
        $bloc->load('tranche.project.company');

        $properties = $bloc->properties()
            ->where('property_type_id', $type->id)
            ->get();

        return Inertia::render('Properties', [
            'bloc' => $bloc,
            'tranche' => $bloc->tranche,
            'project' => $bloc->tranche->project,
            'company' => $bloc->tranche->project->company,
            'propertyType' => $type,
            'properties' => $properties,
        ]);
    }

    public function store(StorePropertyRequest $request, Bloc $bloc, PropertyType $type)
    {
        $validated = $request->validated();
        $validated['bloc_id'] = $bloc->id;
        $validated['property_type_id'] = $type->id;

        Property::create($validated);

        return back()->with('success', 'Property created successfully.');
    }

    public function update(StorePropertyRequest $request, Bloc $bloc, PropertyType $type, Property $property)
    {
        $property->update($request->validated());

        return back()->with('success', 'Property updated successfully.');
    }

    public function destroy(Bloc $bloc, PropertyType $type, Property $property)
    {
        $property->delete();

        return back()->with('success', 'Property deleted successfully.');
    }
}
