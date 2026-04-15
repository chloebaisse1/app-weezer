<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SondeDetail;
use Illuminate\Support\Facades\File;

class ImportSondesLocalSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('seeders/data/sondes_details.json');

        if (!File::exists($filePath)) {
            $this->command->error("Fichier introuvable : $filePath");
            return;
        }

        $json = File::get($filePath);
        $data = json_decode($json, true);

        
        $serveurs = $data['serveurs'] ?? [];
        $count = 0;

        foreach ($serveurs as $serveur) {
            $idSer = $serveur['IDESER'];
            $sondes = $serveur['sondes'] ?? [];

            foreach ($sondes as $sonde) {
                SondeDetail::updateOrCreate([
                    'IDAPP'   => $data['IDAPP'], 
                    'IDSER'   => $idSer,
                    'SONPRTG' => $sonde['SONPRTG']
                ]);
                $count++;
            }
        }

        $this->command->info("$count sondes importées pour l'application ID " . $data['IDAPP']);
    }
}