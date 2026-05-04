<?php

namespace App\Http\Controllers;

use App\Models\Bloc;
use App\Models\Project;
use App\Models\Tranche;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlocController extends Controller
{
    public function index(Project $project, Tranche $tranche)
    {
        $project->load('company');

        $blocs = $tranche->blocs()
            ->withCount('properties')
            ->latest()
            ->get()
            ->map(function ($bloc) {
                return [
                    'id' => $bloc->id,
                    'name' => $bloc->name,
                    'description' => $bloc->description,
                    'floors' => $bloc->floors,
                    'properties_count' => $bloc->properties_count,
                ];
            });

        return Inertia::render('Blocs', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'company' => [
                    'id' => $project->company->id ?? null,
                    'name' => $project->company->name ?? null,
                ],
            ],
            'tranche' => [
                'id' => $tranche->id,
                'name' => $tranche->name,
            ],
            'blocs' => $blocs,
        ]);
    }

    public function store(Request $request, Project $project, Tranche $tranche)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'floors' => 'required|integer|min:1',
        ]);

        $tranche->blocs()->create([
            'project_id' => $project->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'floors' => $validated['floors'],
        ]);

        return redirect()->back()->with('success', 'Bloc created successfully.');
    }

    public function update(Request $request, Project $project, Tranche $tranche, Bloc $bloc)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'floors' => 'required|integer|min:1',
        ]);

        $bloc->update($validated);

        return redirect()->back()->with('success', 'Bloc updated successfully.');
    }

    public function destroy(Project $project, Tranche $tranche, Bloc $bloc)
    {
        $bloc->delete();

        return redirect()->back()->with('success', 'Bloc deleted successfully.');
    }
}
