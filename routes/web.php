<?php

use App\Http\Controllers\BlocController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ParkingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyTypeController;
use App\Http\Controllers\TrancheController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

// Protected routes - require authentication
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::resource('companies', CompanyController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,manager');

    Route::resource('projects', ProjectController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,manager');

    Route::get('/project-management', function () {
        return Inertia::render('ProjectManagement');
    })->name('project-management')->middleware('role:admin,manager');

    Route::get('/blocs/{bloc}/management', [PropertyController::class, 'managementGateway'])
        ->name('blocs.management')->middleware('role:admin,manager');

    Route::resource('projects.tranches', TrancheController::class)
        ->parameters(['tranches' => 'tranche'])
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,manager');

    Route::resource('projects.tranches.blocs', BlocController::class)
        ->parameters(['tranches' => 'tranche'])
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,manager');

    Route::get('/blocs/{bloc}/property-types', [PropertyController::class, 'propertyTypeGrid'])
        ->name('blocs.property-types')->middleware('role:admin,manager');

    Route::get('/blocs/{bloc}/property-types/{type}/properties', [PropertyController::class, 'propertiesList'])
        ->name('blocs.properties')->middleware('role:admin,manager');

    Route::post('/blocs/{bloc}/property-types/{type}/properties', [PropertyController::class, 'store'])
        ->name('blocs.properties.store')->middleware('role:admin,manager');

    Route::put('/blocs/{bloc}/property-types/{type}/properties/{property}', [PropertyController::class, 'update'])
        ->name('blocs.properties.update')->middleware('role:admin,manager');

    Route::delete('/blocs/{bloc}/property-types/{type}/properties/{property}', [PropertyController::class, 'destroy'])
        ->name('blocs.properties.destroy')->middleware('role:admin,manager');

    Route::resource('blocs.parkings', ParkingController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('role:admin,manager');

    Route::get('/properties', function () {
        return Inertia::render('Properties');
    })->name('properties');

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings')->middleware('role:admin');

    Route::get('/settings/property-types', [PropertyTypeController::class, 'index'])
        ->name('settings.property-types')->middleware('role:admin');
    Route::post('/settings/property-types', [PropertyTypeController::class, 'store'])
        ->name('settings.property-types.store')->middleware('role:admin');
    Route::put('/settings/property-types/{property_type}', [PropertyTypeController::class, 'update'])
        ->name('settings.property-types.update')->middleware('role:admin');
    Route::delete('/settings/property-types/{property_type}', [PropertyTypeController::class, 'destroy'])
        ->name('settings.property-types.destroy')->middleware('role:admin');

    Route::get('/settings/users', [UserController::class, 'index'])
        ->name('settings.users')->middleware('role:admin');

    // User CRUD routes
    Route::post('/users', [UserController::class, 'store'])
        ->name('users.store')->middleware('role:admin');

    Route::put('/users/{user}', [UserController::class, 'update'])
        ->name('users.update')->middleware('role:admin');

    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->name('users.destroy')->middleware('role:admin');

    Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])
        ->name('users.toggle-active')->middleware('role:admin');

    Route::get('/settings/profiles', function () {
        return Inertia::render('SettingsProfiles');
    })->name('settings.profiles')->middleware('role:admin');

    Route::get('/settings/profiles/create', function () {
        return Inertia::render('CreateEditRole');
    })->name('settings.profiles.create')->middleware('role:admin');

    Route::get('/settings/profiles/edit/{roleId}', function ($roleId) {
        return Inertia::render('CreateEditRole', ['roleId' => $roleId]);
    })->name('settings.profiles.edit')->middleware('role:admin');

    Route::get('/history', function () {
        return Inertia::render('History');
    })->name('history');

    Route::get('/news', function () {
        return Inertia::render('NewsArticle');
    })->name('news');

    Route::get('/admin-only', function () {
        return response('Admin only access', 200);
    })->name('admin-only')->middleware('role:admin');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
