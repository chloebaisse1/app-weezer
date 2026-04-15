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
            'count'  => $applications->count(),
            'data'   => $applications
        ]);
    }

    /**
     * Récupère les détails d'une application et fusionne les statuts LIVE de PRTG.
     */
    public function show($id, PrtgService $prtgService): JsonResponse
    {
        // 1. On récupère l'appli et ses sondes depuis PostgreSQL (Données IEL6)
        $application = Application::with('sondes')->find($id);

        if (!$application) {
            return response()->json(['message' => 'Application non trouvée'], 404);
        }

        // 2. On récupère les IDs PRTG pour l'appel groupé
        $prtgIds = $application->sondes->pluck('SONPRTG')->filter()->toArray();

        // 3. On récupère les données en direct via le service PRTG
        $prtgData = $prtgService->getSensorsStatuses($prtgIds);

        // 4. On enrichit nos données locales avec le statut Live
        $application->sondes->map(function ($sonde) use ($prtgData) {
            $statusInfo = collect($prtgData)->firstWhere('objid', $sonde->SONPRTG);
            
            // Ajout des champs dynamiques pour le Front
            $sonde->live_status = $statusInfo['status'] ?? 'Inconnu';
            $sonde->live_value  = $statusInfo['lastvalue'] ?? 'N/A';
            $sonde->live_message = $statusInfo['message'] ?? null;
            
            return $sonde;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $application
        ]);
    }
}