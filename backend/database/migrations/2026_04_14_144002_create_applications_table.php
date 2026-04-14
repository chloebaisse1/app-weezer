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
    Schema::create('applications', function (Blueprint $table) {
        $table->integer('IDAPP')->primary(); // PK APPLICATION
        $table->integer('IDIURB')->default(0); // FK URBA_ILOT
        $table->string('APPNOM', 30); 
        $table->string('APPCOD', 4);
        $table->boolean('APPACT')->default(true); // Etat
        $table->date('APPDAT')->default(now()); // Date de maj
        
        $table->string('APPFAMILLE', 50)->nullable();
        $table->string('APPHEB', 30)->nullable()->default(0); 
        $table->integer('APPCRI')->nullable()->default(0);
        $table->integer('IDTAPP')->nullable()->default(0);
        $table->string('APPLIB', 150)->nullable();
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
