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
        Schema::table('projects', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('status')->default('Planning');
            $table->decimal('budget', 15, 2)->nullable()->default(0);
            $table->string('address')->nullable();
            $table->date('start_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['description', 'status', 'budget', 'address', 'start_date']);
        });
    }
};
