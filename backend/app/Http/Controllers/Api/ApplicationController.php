<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\UrbaQuartier;
use App\Services\PrtgService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
   
    public function index(): JsonResponse
    {
        $applications = Application::withCount('sondes')
            ->orderBy('APPNOM', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $applications
        ]);
    }

    public function getByFamily($name): JsonResponse
    {
    try {
        // On utilise ILIKE pour ignorer la casse (Majuscules/Minuscules)
        // Et on s'assure de récupérer les applications liées
        $quartier = UrbaQuartier::where('QURBLIB', 'ILIKE', $name)->first();

        if (!$quartier) {
            return response()->json([
                'success' => false, 
                'message' => "Le quartier '{$name}' n'existe pas dans la base de données."
            ], 404);
        }

        // On récupère les applications dont l'APPFAMILLE (string) correspond à l'ID (int)
        // On fait le cast ici aussi pour éviter l'erreur de type de tout à l'heure
        $applications = Application::whereRaw('CAST("APPFAMILLE" AS INTEGER) = ?', [$quartier->id])
            ->whereIn('APPHEB', [2, 3])
            ->withCount('sondes')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'family_name' => $quartier->QURBLIB,
                'applications' => $applications,
                'family_stats' => [
                    'total' => $applications->count(),
                    'up'    => $applications->count(), 
                    'warn'  => 0,
                    'down'  => 0,
                ]
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false, 
            'message' => "Erreur Nebula Vue 2 : " . $e->getMessage()
        ], 500);
    }
}

    public function show($id, PrtgService $prtgService): JsonResponse
    {
        // On augmente le temps d'exécution pour le scan multi-curl
        set_time_limit(120); 

        // Récupération de l'application avec ses sondes et son quartier
        $application = Application::with(['sondes', 'quartier'])->find($id);
        
        if (!$application) {
            return response()->json(['success' => false, 'message' => 'Application Nebula introuvable'], 404);
        }

        // Extraction des IDs PRTG uniques
        $allIds = $application->sondes->pluck('SONPRTG')->filter()->unique()->toArray();
        
        $allPrtgData = [];
        if (!empty($allIds)) {
            // Chunking de sécurité (max 30 sondes par requête API PRTG)
            $chunks = array_chunk($allIds, 30); 
            foreach ($chunks as $chunk) {
                $batch = $prtgService->getSensorsStatuses($chunk);
                if (!empty($batch)) {
                    $allPrtgData = array_merge($allPrtgData, $batch);
                }
            }
        }

        // On mappe les résultats PRTG sur nos sondes locales
        $liveMap = collect($allPrtgData)->keyBy(fn($item) => (int)$item['objid']);
        
        $criticalCount = 0;
        $warningCount = 0;

        foreach ($application->sondes as $sonde) {
            $sondeId = (int)$sonde->SONPRTG;
            if ($liveMap->has($sondeId)) {
                $data = $liveMap->get($sondeId);
                $sonde->status_id = $data['status_raw'] ?? 3; // 3 = OK en PRTG
                $sonde->last_value = $data['lastvalue'] ?? 'N/A';
                $sonde->name = $data['sensor'] ?? $sonde->SONNOM;
                
                // Comptage pour le health score
                if ($sonde->status_id == 5) $criticalCount++; // 5 = Down
                if ($sonde->status_id == 4) $warningCount++;  // 4 = Warning
            } else {
                $sonde->status_id = 0; // Inconnu
                $sonde->last_value = 'No Data';
            }
        }

        
        $totalSondes = count($allIds);
        $healthScore = 100;
        if ($totalSondes > 0) {
            $penalty = ($criticalCount * 20) + ($warningCount * 5);
            $healthScore = max(0, 100 - $penalty);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $application->id,
                'name' => $application->APPNOM,
                'family_name' => $application->quartier->QURBLIB ?? 'Indéfini',
                'health_score' => $healthScore,
                'sensors' => $application->sondes,
                'last_sync' => now()->format('H:i:s')
            ]
        ]);
    }
}