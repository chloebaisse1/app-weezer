<?php

namespace Database\Seeders;

use App\Models\SondeDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ImportAllSondesSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/data/all_sondes_details.json'));
        $apps = json_decode($json, true);

        $count = 0;
        $skipped = 0;

        foreach ($apps as $app) {
            if (isset($app['serveurs']) && is_array($app['serveurs'])) {
                foreach ($app['serveurs'] as $serveur) {
                    if (isset($serveur['sondes']) && is_array($serveur['sondes'])) {
                        foreach ($serveur['sondes'] as $sonde) {
                            
                            // VERIFICATION CRUCIALE : On n'importe que si on a un ID PRTG
                            if (!empty($sonde['SONPRTG'])) {
                                SondeDetail::updateOrCreate(
                                    [
                                        'IDAPP'   => $app['IDAPP'],
                                        'IDSER'   => $sonde['IDSER'],
                                        'SONPRTG' => $sonde['SONPRTG']
                                    ],
                                    []
                                );
                                $count++;
                            } else {
                                $skipped++;
                            }
                        }
                    }
                }
            }
        }

        $this->command->info("Succès ! $count sondes importées.");
        if ($skipped > 0) {
            $this->command->warn("$skipped sondes ignorées car SONPRTG était vide.");
        }
    }
}