<?php

namespace App\Http\Controllers;

use App\Models\Bloc;
use App\Models\Parking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParkingController extends Controller
{
    public function index(Bloc $bloc)
    {
        $bloc->load('tranche.project.company');
        $parkings = $bloc->parkings()->get();

        return Inertia::render('Parkings', [
            'bloc' => $bloc,
            'tranche' => $bloc->tranche,
            'project' => $bloc->tranche->project,
            'company' => $bloc->tranche->project->company,
            'parkings' => $parkings,
        ]);
    }

    public function store(Request $request, Bloc $bloc)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
        ]);

        $bloc->load('tranche.project');
        $projectInitial = strtoupper(substr($bloc->tranche->project->name, 0, 1));
        $trancheOrder = $bloc->tranche->id;
        $blocOrder = $bloc->id;

        DB::transaction(function () use ($bloc, $validated, $projectInitial, $trancheOrder, $blocOrder) {
            // Find max loop index from existing names like R_T1_B2_11
            $existingParkings = $bloc->parkings()->pluck('name');
            $maxIndex = 0;
            foreach ($existingParkings as $name) {
                $parts = explode('_', $name);
                $index = (int) end($parts);
                if ($index > $maxIndex) {
                    $maxIndex = $index;
                }
            }

            for ($i = $maxIndex + 1; $i <= $maxIndex + $validated['quantity']; $i++) {
                $name = "{$projectInitial}_T{$trancheOrder}_B{$blocOrder}_{$i}";
                $bloc->parkings()->create([
                    'name' => $name,
                    'price' => $validated['price'],
                    'status' => 'available',
                ]);
            }
        });

        return back()->with('success', "{$validated['quantity']} parkings generated successfully.");
    }

    public function update(Request $request, Bloc $bloc, Parking $parking)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:available,unavailable',
        ]);

        $parking->update($validated);

        return back()->with('success', 'Parking status updated.');
    }

    public function destroy(Bloc $bloc, Parking $parking)
    {
        $parking->delete();

        return back()->with('success', 'Parking deleted.');
    }
}
