<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class PrtgService
{
    public function getSensorsStatuses(array $sensorIds)
    {
        if (empty($sensorIds)) return [];

        $ip = "13.39.29.110"; 
        $username = config('services.prtg.username');
        $passhash = config('services.prtg.passhash');

        /**
         * AJOUT DE 'lastvalue' DANS LES COLONNES
         * Sans cela, PRTG ne renvoie pas le texte (ex: "0 msec" ou "45 GB")
         */
        $url = "https://{$ip}/api/table.json?content=sensors&output=json&columns=objid,status,status_raw,sensor,lastvalue&count=5000&username={$username}&passhash={$passhash}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Host: leader-sys.my-prtg.com']);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_ENCODING, "");                
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); 

        $output = curl_exec($ch);

        if (curl_errno($ch)) {
            Log::error('Nebula PRTG Connection Error: ' . curl_error($ch));
        }

        curl_close($ch);

        if ($output) {
            $decoded = json_decode($output, true);
            $sensors = $decoded['sensors'] ?? [];
            
            Log::info("Nebula Wide Sync : " . count($sensors) . " capteurs reçus du Cloud.");
            
            return $sensors; 
        }

        return [];
    }
}