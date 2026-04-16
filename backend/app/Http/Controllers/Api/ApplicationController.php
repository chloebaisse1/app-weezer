<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\UrbaQuartier;
use App\Services\PrtgService;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    /**
     * Utilisé pour une recherche globale ou debug
     */
    public function index(): JsonResponse
    {
        $applications = Application::withCount('sondes')
            ->orderBy('APPNOM', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'   => $applications
        ]);
    }

    /**
     * VUE 3 : Le détail LIVE d'une application 
     */
    public function show($id, PrtgService $prtgService): JsonResponse
    {
        set_time_limit(120); 

        $application = Application::with('sondes')->find($id);
        if (!$application) return response()->json(['success' => false, 'message' => 'Application non trouvée'], 404);

        $allIds = $application->sondes->pluck('SONPRTG')->filter()->unique()->toArray();
        
        // Chunking pour éviter de saturer l'URL de l'API PRTG
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
                $sonde->live_status = 'Inconnu (PRTG)';
                $sonde->live_value  = 'N/A';
            }
        }

        return response()->json([
            'success' => true,
            'meta' => [
                'total_ids' => count($allIds),
                'recuperes' => count($allPrtgData)
            ],
            'data' => $application
        ]);
    }

    /**
     * VUE 2 : Liste des applications par Famille (Quartier)
     */
    public function getByFamily($id): JsonResponse
    {
        try {
            $quartier = UrbaQuartier::with(['applications' => function($q) {
                $q->whereIn('APPHEB', [2, 3])->withCount('sondes');
            }])->findOrFail($id);

            return response()->json([
        'success' => true,
        'data' => [
            'family_name' => $quartier->QURBLIB,
            'applications' => $quartier->applications
        ]
    ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Famille non trouvée'], 404);
        }
    }
}