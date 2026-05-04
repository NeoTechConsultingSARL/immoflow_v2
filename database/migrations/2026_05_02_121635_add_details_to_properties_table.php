<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->default(0);
            $table->string('facade')->nullable();
            $table->decimal('surface', 10, 2)->default(0);
            $table->decimal('surface_titled', 10, 2)->default(0);
            $table->enum('status', ['available', 'sold', 'reserved'])->default('available');
            $table->foreignId('property_type_id')->nullable()->constrained()->cascadeOnDelete();

            $table->integer('floor_number')->nullable();
            $table->text('pieces_description')->nullable();
            $table->boolean('has_basement')->default(false);
            $table->boolean('has_mezzanine')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropForeign(['property_type_id']);
            $table->dropColumn([
                'price',
                'facade',
                'surface',
                'surface_titled',
                'status',
                'property_type_id',
                'floor_number',
                'pieces_description',
                'has_basement',
                'has_mezzanine',
            ]);
        });
    }
};
