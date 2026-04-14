<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Application;
use App\Models\SondeDetail;

class SyncIel6Data extends Command
{
    
    protected $signature = 'sync:iel6';

   
    protected $description = 'Synchronise les applications, familles et sondes depuis l\'API IEL6';

    public function handle()
    {
        $token = env('IEL6_API_TOKEN');
        $baseUrl = 'https://iel6.leader-sys.com/api';

        $this->info('--- Début de la synchronisation IEL6 ---');

        // 1. Récupération de la liste globale des applications
        $response = Http::withToken($token)->get("$baseUrl/applications");

        if ($response->failed()) {
            $this->error('Erreur : Impossible de contacter l\'API (Route /applications).');
            return;
        }

        $apps = $response->json();
        $this->info(count($apps) . " applications trouvées.");

        foreach ($apps as $appData) {
         
            $app = Application::updateOrCreate(
                ['IDAPP' => $appData['IDAPP']],
                [
                    'IDIURB'     => $appData['IDIURB'],
                    'APPNOM'     => $appData['APPNOM'],
                    'APPCOD'     => $appData['APPCOD'],
                    'APPACT'     => $appData['APPACT'],
                    'APPDAT'     => $appData['APPDAT'],
                    'APPHEB'     => $appData['APPHEB'],
                    'APPCRI'     => $appData['APPCRI'],
                    'IDTAPP'     => $appData['IDTAPP'],
                    'APPLIB'     => $appData['APPLIB'],
                    // Extraction de la famille via l'objet ilot
                    'APPFAMILLE' => $appData['ilot']['ILONOM'] ?? 'Non classé',
                ]
            );

            $this->line("Traitement de l'application : <info>{$app->APPNOM}</info>");

          
            $detailResponse = Http::withToken($token)->get("$baseUrl/getsondesbyapplication", [
                'idapp' => $app->IDAPP
            ]);

            if ($detailResponse->successful()) {
                $detailData = $detailResponse->json();

               
                $serveurs = $detailData['serveurs'] ?? [];

                foreach ($serveurs as $serveur) {
                    $idSer = $serveur['IDESER']; 

                    
                    $sondes = $serveur['sondes'] ?? [];
                    foreach ($sondes as $sonde) {
                        SondeDetail::updateOrCreate([
                            'IDAPP'   => $app->IDAPP,
                            'IDSER'   => $idSer,
                            'SONPRTG' => $sonde['SONPRTG'] 
                        ]);
                    }
                }
            } else {
                $this->warn("Impossible de récupérer les sondes pour IDAPP: {$app->IDAPP}");
            }
        }

        $this->info('--- Synchronisation terminée avec succès ---');
    }
}