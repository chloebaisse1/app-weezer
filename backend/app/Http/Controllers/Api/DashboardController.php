<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\UrbaQuartier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            
            $families = UrbaQuartier::all();

           
            $applicationCounts = Application::whereIn('APPHEB', [2, 3])
                ->whereNotNull('APPFAMILLE')
                ->select('APPFAMILLE', DB::raw('count(*) as total'))
                ->groupBy('APPFAMILLE')
                ->get()
                ->pluck('total', 'APPFAMILLE'); 

        
            $formattedFamilies = $families->map(function($f) use ($applicationCounts) {
               
                $count = $applicationCounts[(string)$f->id] ?? 0;

                return [
                    'id' => $f->id,
                    'name' => $f->QURBLIB, 
                    'total_apps' => $count,
                    'stats' => [
                        'up' => $count,
                        'warn' => 0,
                        'down' => 0
                    ],
                    'health_index' => 100
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'families' => $formattedFamilies,
                    'global_stats' => [
                        'total_apps' => $formattedFamilies->sum('total_apps'),
                        'enterprise_health' => 100,
                        'last_check' => now()->format('H:i:s')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'error' => "Erreur SQL Type: " . $e->getMessage()
            ], 500);
        }
    }
}