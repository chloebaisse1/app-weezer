<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
    Schema::create('urba_quartier', function (Blueprint $table) {
        $table->id(); // clé primaire
        $table->string('QURBLIB'); // Le libellé (ex: Supply, Finance, RH)
        $table->string('QURBCOD')->nullable(); // Un code optionnel
        // Ajoute ici d'autres colonnes si nécessaire selon ton schéma
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('urba_quartiers');
    }
};
