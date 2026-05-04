<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Project;
use App\Models\PropertyType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Projects', [
            'projects' => Project::with(['company', 'propertyTypes'])->latest()->get()->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'company_id' => $project->company_id,
                    'company_name' => $project->company->name,
                    'address' => $project->address,
                    'description' => $project->description,
                    'status' => $project->status ?? 'Planning',
                    'budget' => $project->budget,
                    'start_date' => $project->start_date,
                    'property_types' => $project->propertyTypes->map(function ($pt) {
                        return [
                            'property_type_id' => $pt->id,
                            'name' => $pt->name,
                            'quantity' => $pt->pivot->quantity,
                        ];
                    }),
                ];
            }),
            'companies' => Company::orderBy('name')->get(),
            'propertyTypes' => PropertyType::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'budget' => 'nullable|numeric',
            'address' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'property_types' => 'array',
            'property_types.*.property_type_id' => 'required|exists:property_types,id',
            'property_types.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            $project = Project::create([
                'name' => $validated['name'],
                'company_id' => $validated['company_id'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
                'budget' => $validated['budget'] ?? 0,
                'address' => $validated['address'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
            ]);

            if (isset($validated['property_types'])) {
                $syncData = [];
                foreach ($validated['property_types'] as $pt) {
                    $syncData[$pt['property_type_id']] = ['quantity' => $pt['quantity']];
                }
                $project->propertyTypes()->sync($syncData);
            }
        });

        return redirect()->back()->with('success', 'Project created successfully.');
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'budget' => 'nullable|numeric',
            'address' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'property_types' => 'array',
            'property_types.*.property_type_id' => 'required|exists:property_types,id',
            'property_types.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($project, $validated) {
            $project->update([
                'name' => $validated['name'],
                'company_id' => $validated['company_id'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
                'budget' => $validated['budget'] ?? 0,
                'address' => $validated['address'] ?? null,
                'start_date' => $validated['start_date'] ?? null,
            ]);

            if (isset($validated['property_types'])) {
                $syncData = [];
                foreach ($validated['property_types'] as $pt) {
                    $syncData[$pt['property_type_id']] = ['quantity' => $pt['quantity']];
                }
                $project->propertyTypes()->sync($syncData);
            } else {
                $project->propertyTypes()->detach();
            }
        });

        return redirect()->back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->back()->with('success', 'Project deleted successfully.');
    }
}
