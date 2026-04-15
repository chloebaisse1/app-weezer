<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SondeDetail;
use App\Services\PrtgService;
use Illuminate\Http\JsonResponse;

class SondeController extends Controller
{
    
    public function show($id, PrtgService $prtgService): JsonResponse
    {
        $sonde = SondeDetail::find($id);

        if (!$sonde) {
            return response()->json(['message' => 'Sonde non trouvée'], 404);
        }

        $prtgDetails = $prtgService->getSensorStatus($sonde->SONPRTG);

        return response()->json([
            'status' => 'success',
            'data' => [
                'info' => $sonde,
                'live' => $prtgDetails
            ]
        ]);
    }
}