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
    Schema::create('sondes_details', function (Blueprint $table) {
        $table->integer('IDAPP');
        $table->integer('IDSER');
        $table->integer('SONPRTG');
        
        // Définition de la clé primaire sur les 3 colonnes
        $table->primary(['IDAPP', 'IDSER', 'SONPRTG']);

        // Clé étrangère vers la table applications
        $table->foreign('IDAPP')
              ->references('IDAPP')
              ->on('applications')
              ->onDelete('cascade');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sondes_details');
    }
};
