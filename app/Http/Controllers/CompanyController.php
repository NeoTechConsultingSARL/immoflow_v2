<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $companies = Company::orderBy('name')->get();

        return Inertia::render('Companies', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        Company::create($validated);

        return redirect()->route('companies.index')
            ->with('success', 'Company created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        $company->update($validated);

        return redirect()->route('companies.index')
            ->with('success', 'Company updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company): RedirectResponse
    {
        $company->delete();

        return redirect()->route('companies.index')
            ->with('success', 'Company deleted successfully.');
    }
}
