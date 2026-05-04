<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Tranche;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrancheController extends Controller
{
    public function index(Project $project)
    {
        $project->load('company');
        $tranches = Tranche::withCount('blocs')
            ->withSum('properties', 'quantity')
            ->where('project_id', $project->id)
            ->latest()
            ->get();

        return Inertia::render('Tranches', [
            'project' => $project,
            'tranches' => $tranches,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->tranches()->create($validated);

        return redirect()->back()->with('success', 'Tranche created successfully.');
    }

    public function update(Request $request, Project $project, Tranche $tranche)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $tranche->update($validated);

        return redirect()->back()->with('success', 'Tranche updated successfully.');
    }

    public function destroy(Project $project, Tranche $tranche)
    {
        $tranche->delete();

        return redirect()->back()->with('success', 'Tranche deleted successfully.');
    }
}
