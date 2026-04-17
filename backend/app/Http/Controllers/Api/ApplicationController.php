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

    
    public function getByFamily($name, PrtgService $prtgService): JsonResponse
    {
        $t_start = microtime(true);
        try {
           
            $quartier = UrbaQuartier::where('QURBLIB', 'ILIKE', $name)->first();
            if (!$quartier) return response()->json(['success' => false], 404);

            
            $applications = Application::whereRaw('CAST("APPFAMILLE" AS INTEGER) = ?', [$quartier->id])
                ->whereIn('APPHEB', [2, 3])
                ->with('sondes')
                ->get();

            
            $allIds = $applications->flatMap(fn($app) => $app->sondes->pluck('SONPRTG'))
                ->map(fn($id) => (int)trim($id))
                ->filter()
                ->unique()
                ->toArray();

            $t_sql = round(microtime(true) - $t_start, 3);

            
            $t_prtg_start = microtime(true);
            $sensors = !empty($allIds) ? $prtgService->getSensorsStatuses($allIds) : [];
            $t_prtg = round(microtime(true) - $t_prtg_start, 3);

            
            $liveMap = collect($sensors)->keyBy(fn($item) => (int)($item['objid'] ?? 0));
            $countReceived = count($sensors);

            foreach ($applications as $app) {
                $appStatuses = collect();
                $activeCount = 0; 

                foreach ($app->sondes as $sonde) {
                    $sid = (int)trim($sonde->SONPRTG);
                    
                    if ($liveMap->has($sid)) {
                        $sensorData = $liveMap->get($sid);
                        $statusRaw = (int)($sensorData['status_raw'] ?? 0);
                        
                        $sonde->status_id = $statusRaw;
                        $sonde->sensor_name = $sensorData['sensor'] ?? 'Sonde PRTG';
                        $appStatuses->push($statusRaw);
                        
                   
                        $activeCount++;
                    }
                }

                
                $app->active_sondes_count = $activeCount;

            
                if ($appStatuses->isEmpty()) {
                    $app->status_id = 0; 
                    $app->status_label = 'NON SUIVI'; 
                    $app->health_score = 0;
                } else {
                    if ($appStatuses->contains(5) || $appStatuses->contains(13) || $appStatuses->contains(14)) {
                        $app->status_id = 5; 
                        $app->status_label = 'CRITICAL'; 
                        $app->health_score = 0;
                    } elseif ($appStatuses->contains(4) || $appStatuses->contains(10)) {
                        $app->status_id = 4; 
                        $app->status_label = 'WARNING'; 
                        $app->health_score = 50;
                    } else {
                        $app->status_id = 3; 
                        $app->status_label = 'OPERATIONAL'; 
                        $app->health_score = 100;
                    }
                }
            }

            $t_total = round(microtime(true) - $t_start, 3);

            
            $familyStats = [
                'total' => $applications->count(),
                'up'    => $applications->where('status_id', 3)->count(),
                'warn'  => $applications->where('status_id', 4)->count(),
                'down'  => $applications->where('status_id', 5)->count(),
            ];

            return response()->json([
                'success' => true,
                'debug' => [
                    'time_sql' => $t_sql . 's',
                    'time_prtg' => $t_prtg . 's',
                    'time_total' => $t_total . 's',
                    'sensors_requested' => count($allIds),
                    'sensors_received' => $countReceived
                ],
                'data' => [
                    'family_name' => $quartier->QURBLIB,
                    'applications' => $applications,
                    'family_stats' => $familyStats
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Nebula API Error (getByFamily): " . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Vue détaillée d'une application spécifique
     */
    public function show($id, PrtgService $prtgService): JsonResponse
    {
        try {
            $application = Application::with(['sondes', 'quartier'])->find($id);
            if (!$application) return response()->json(['success' => false], 404);

            $allIds = $application->sondes->pluck('SONPRTG')->map(fn($id) => (int)trim($id))->filter()->unique()->toArray();
            $prtgData = !empty($allIds) ? $prtgService->getSensorsStatuses($allIds) : [];
            $liveMap = collect($prtgData)->keyBy(fn($item) => (int)($item['objid'] ?? 0));
            
            foreach ($application->sondes as $sonde) {
                $sid = (int)trim($sonde->SONPRTG);
                if ($liveMap->has($sid)) {
                    $d = $liveMap->get($sid);
                    $sonde->status_id = $d['status_raw'] ?? 3;
                    $sonde->last_value = $d['lastvalue'] ?? 'N/A';
                    $sonde->sensor_name = $d['sensor'] ?? 'Sonde PRTG';
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $application->IDAPP,
                    'name' => $application->APPNOM,
                    'sensors' => $application->sondes,
                    'health_score' => $application->status_id == 3 ? 100 : ($application->status_id == 4 ? 50 : 0)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Nebula API Error (show): " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}