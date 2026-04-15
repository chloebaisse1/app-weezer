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

        $this->command->info("Importation de " . count($apps) . " applications (champs filtrés)...");

        foreach ($apps as $appData) {
            try {
                // On ne liste QUE les colonnes qui existent réellement dans ta table
                Application::updateOrCreate(
                    ['IDAPP' => $appData['IDAPP']],
                    [
                        'IDIURB'     => $appData['IDIURB'] ?? 0,
                        'APPNOM'     => $appData['APPNOM'],
                        'APPCOD'     => $appData['APPCOD'],
                        'APPACT'     => $appData['APPACT'] ?? true,
                        'APPDAT'     => $appData['APPDAT'],
                        'APPFAMILLE' => $appData['ilot']['ILONOM'] ?? 'Non classé',
                        'APPHEB'     => $appData['APPHEB'] ?? '0',
                        'APPCRI'     => $appData['APPCRI'] ?? 0,
                        'IDTAPP'     => $appData['IDTAPP'] ?? 0,
                        'APPLIB'     => $appData['APPLIB'],
                
                    ]
                );
            } catch (\Exception $e) {
                $this->command->warn("Erreur sur l'IDAPP " . $appData['IDAPP'] . " : " . $e->getMessage());
            }
        }

        $this->command->info("Import terminé !");
    }
}