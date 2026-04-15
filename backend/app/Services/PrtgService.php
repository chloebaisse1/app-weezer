<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PrtgService
{
    protected ?string $baseUrl;
    protected ?string $username;
    protected ?string $passhash;

    public function __construct()
    {
      
        $this->baseUrl  = config('services.prtg.base_url');
        $this->username = config('services.prtg.username');
        $this->passhash = config('services.prtg.passhash');

        if (!$this->baseUrl || !$this->username || !$this->passhash) {
            Log::warning("PRTG Service : Configuration manquante dans le .env ou config/services.php");
        }
    }

    
    public function getSensorsStatuses(array $sensorIds)
    {
        if (empty($sensorIds)) return [];

        try {
            $response = Http::withOptions(['verify' => false])
                ->get("{$this->baseUrl}/api/table.json", [
                    'content'      => 'sensors',
                    'output'       => 'json',
                    'columns'      => 'objid,status,lastvalue,message',
                    'filter_objid' => implode(',', $sensorIds),
                    'username'     => $this->username,
                    'passhash'     => $this->passhash,
                ]);

            if ($response->successful()) {
                
                return $response->json('sensors') ?? [];
            }

            Log::error("PRTG Batch Error: Status " . $response->status());
            return [];
        } catch (\Exception $e) {
            Log::error("PRTG Connection Error (Batch): " . $e->getMessage());
            return [];
        }
    }

    
    public function getSensorStatus(int $sensorId)
    {
        try {
            $response = Http::withOptions(['verify' => false])
                ->get("{$this->baseUrl}/api/getsensordetails.json", [
                    'id'       => $sensorId,
                    'username' => $this->username,
                    'passhash' => $this->passhash,
                ]);

            if ($response->successful()) {
                return $response->json('sensordata');
            }

            Log::error("PRTG API Error (Unit): " . $response->status());
            return null;
        } catch (\Exception $e) {
            Log::error("PRTG Connection Error (Unit): " . $e->getMessage());
            return null;
        }
    }
}