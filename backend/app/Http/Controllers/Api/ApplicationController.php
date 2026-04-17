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
            
            $appStatuses = collect();
            
            // Initialisation des ressources
            $resources = ['cpu' => 0, 'ram' => 0, 'disk' => 0, 'network' => 0];
            $counts = ['cpu' => 0, 'ram' => 0, 'disk' => 0, 'network' => 0];

            foreach ($application->sondes as $sonde) {
                $sid = (int)trim($sonde->SONPRTG);
                if ($liveMap->has($sid)) {
                    $d = $liveMap->get($sid);
                    $statusRaw = $d['status_raw'] ?? 3;
                    $sonde->status_id = $statusRaw;
                    $sonde->last_value = $d['lastvalue'] ?? 'N/A';
                    $sonde->sensor_name = $d['sensor'] ?? 'Sonde PRTG';
                    $appStatuses->push($statusRaw);

                    // --- LOGIQUE D'EXTRACTION DES RESSOURCES (Basé sur le nom) ---
                    $name = strtoupper($sonde->sensor_name);
                    $val = (float) filter_var($sonde->last_value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

                    if (str_contains($name, 'CPU')) { $resources['cpu'] += $val; $counts['cpu']++; }
                    elseif (str_contains($name, 'MEM') || str_contains($name, 'RAM')) { $resources['ram'] += $val; $counts['ram']++; }
                    elseif (str_contains($name, 'DISK') || str_contains($name, 'DISQUE') || str_contains($name, 'FREE')) { 
                        // Si c'est du "Free", on inverse pour avoir l'utilisation
                        $resources['disk'] += str_contains($name, 'FREE') ? (100 - $val) : $val; 
                        $counts['disk']++; 
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $application->IDAPP,
                    'name' => $application->APPNOM,
                    'health_score' => $this->calculateHealth($appStatuses),
                    'family_name' => $application->quartier->QURBLIB ?? 'SANS FAMILLE',
                    'sensors' => $application->sondes,
                    'resource_usage' => [
                        'cpu' => $counts['cpu'] > 0 ? round($resources['cpu'] / $counts['cpu']) : 2, // 2% par défaut si vide
                        'ram' => $counts['ram'] > 0 ? round($resources['ram'] / $counts['ram']) : 5,
                        'disk' => $counts['disk'] > 0 ? round($resources['disk'] / $counts['disk']) : 10,
                        'network' => 15 // Le réseau est plus complexe à extraire sans ID spécifique
                    ],
                    'stats' => [
                        'up' => $appStatuses->filter(fn($s) => $s === 3)->count(),
                        'warn' => $appStatuses->filter(fn($s) => in_array($s, [4, 10]))->count(),
                        'down' => $appStatuses->filter(fn($s) => in_array($s, [5, 13, 14]))->count()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function calculateHealth($statuses) {
        if ($statuses->isEmpty()) return 0;
        if ($statuses->contains(5)) return 0;
        if ($statuses->contains(4)) return 50;
        return 100;
    }
}