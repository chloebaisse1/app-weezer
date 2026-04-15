<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Application;
use Illuminate\Support\Facades\File;

class ImportIel6LocalSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('seeders/data/applications.json');

        if (!File::exists($filePath)) {
            $this->command->error("Fichier introuvable : $filePath");
            return;
        }

        $json = File::get($filePath);
        $apps = json_decode($json, true);

        if (!$apps) {
            $this->command->error("Le fichier JSON est vide ou mal formé.");
            return;
        }

        $this->command->info("Importation de " . count($apps) . " applications (Dénormalisation du Quartier)...");

        foreach ($apps as $appData) {
            try {
              
                $quartierNom = $appData['ilot']['urb_quartier']['QURBLIB'] ?? 'Initialisation';

                Application::updateOrCreate(
                    ['IDAPP' => $appData['IDAPP']],
                    [
                        'IDIURB'     => $appData['IDIURB'] ?? 0,
                        'APPNOM'     => $appData['APPNOM'],
                        'APPCOD'     => $appData['APPCOD'],
                        'APPACT'     => $appData['APPACT'] ?? true,
                        'APPDAT'     => $appData['APPDAT'],
                        'APPFAMILLE' => $quartierNom, // Maintenance, RH, SI, etc.
                        'APPHEB'     => $appData['APPHEB'] ?? '0',
                        'APPCRI'     => $appData['APPCRI'] ?? 0,
                        'IDTAPP'     => $appData['IDTAPP'] ?? 0,
                        'APPLIB'     => $appData['APPLIB'] ?? null,
                    ]
                );
            } catch (\Exception $e) {
                $this->command->warn("Erreur sur l'IDAPP " . ($appData['IDAPP'] ?? '?') . " : " . $e->getMessage());
            }
        }

        $this->command->info("Import terminé avec succès !");
    }
}