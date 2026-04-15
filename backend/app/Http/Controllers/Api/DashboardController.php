<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            
            $families = Application::select('APPFAMILLE', DB::raw('count(*) as total_apps'))
                ->whereIn('APPHEB', [2, 3])
                ->whereNotNull('APPFAMILLE')
                ->groupBy('APPFAMILLE')
                ->get();

            $formattedFamilies = $families->map(fn($f) => [
                
                'id' => $f->APPFAMILLE, 
                'name' => $f->APPFAMILLE,
                'total_apps' => $f->total_apps,
                'stats' => ['up' => 0, 'warn' => 0, 'down' => 0],
                'health_index' => 100
            ]);

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
                'error' => $e->getMessage()
            ], 500);
        }
    }
}