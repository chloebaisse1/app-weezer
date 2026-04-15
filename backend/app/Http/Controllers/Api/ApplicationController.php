<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\PrtgService;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = Application::withCount('sondes')
            ->orderBy('APPNOM', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $applications
        ]);
    }

public function show($id, PrtgService $prtgService): JsonResponse
{
    
    set_time_limit(120); 

    $application = Application::with('sondes')->find($id);
    if (!$application) return response()->json(['message' => 'Application non trouvée'], 404);

    $allIds = $application->sondes->pluck('SONPRTG')->filter()->unique()->toArray();
    
   
    $chunks = array_chunk($allIds, 30); 
    $allPrtgData = [];

    foreach ($chunks as $chunk) {
        $batch = $prtgService->getSensorsStatuses($chunk);
        if (!empty($batch)) {
            $allPrtgData = array_merge($allPrtgData, $batch);
        }
    }

    $liveMap = collect($allPrtgData)->keyBy(fn($item) => (int)$item['objid']);

    foreach ($application->sondes as $sonde) {
        $sondeId = (int)$sonde->SONPRTG;
        if ($liveMap->has($sondeId)) {
            $data = $liveMap->get($sondeId);
            $sonde->live_status = $data['status'] ?? 'OK';
            $sonde->live_value  = $data['lastvalue'] ?? 'N/A';
        } else {
            // Si l'ID n'est pas revenu, on laisse Inconnu
            $sonde->live_status = 'Non trouvé sur PRTG';
            $sonde->live_value  = 'N/A';
        }
    }

    return response()->json([
        'status' => 'success',
        'meta' => [
            'total_ids' => count($allIds),
            'recuperes' => count($allPrtgData)
        ],
        'data' => $application
    ]);
}
}