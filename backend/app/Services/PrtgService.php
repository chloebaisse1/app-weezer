<?php

namespace App\Services;

class PrtgService
{
    public function getSensorsStatuses(array $sensorIds)
{
    if (empty($sensorIds)) return [];

    $baseUrl = config('services.prtg.base_url');
    $username = config('services.prtg.username');
    $passhash = config('services.prtg.passhash');

    $mh = curl_multi_init();
    $requests = [];

    foreach ($sensorIds as $id) {
        $url = "{$baseUrl}/api/table.json?content=sensors&output=json&columns=objid,status,lastvalue&filter_objid={$id}&username={$username}&passhash={$passhash}";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        
        $requests[$id] = $ch;
        curl_multi_add_handle($mh, $ch);
    }

    // Exécution de toutes les requêtes en simultané
    $active = null;
    do {
        $mrc = curl_multi_exec($mh, $active);
    } while ($mrc == CURLM_CALL_MULTI_PERFORM || $active);

    while ($active && $mrc == CURLM_OK) {
        if (curl_multi_select($mh) == -1) {
            usleep(100);
        }
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);
    }

    // Récupération des résultats
    $allData = [];
    foreach ($requests as $id => $ch) {
        $output = curl_multi_getcontent($ch);
        if ($output) {
            $decoded = json_decode($output, true);
            if (!empty($decoded['sensors'][0])) {
                $allData[] = $decoded['sensors'][0];
            }
        }
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);

    return $allData;
}

    public function getSensorStatus(int $sensorId)
    {
        $results = $this->getSensorsStatuses([$sensorId]);
        return $results[0] ?? null;
    }
}