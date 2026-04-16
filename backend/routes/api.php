<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SondeController;


// --- VUE 1 : ACCUEIL (DASHBOARD) ---
// Récupère la liste des familles (quartiers) et les stats globales
Route::get('/dashboard/stats', [DashboardController::class, 'index']);


// --- VUE 2 : FAMILLES ---
// Récupère les applications appartenant à une famille spécifique
Route::get('/families/{id}', [ApplicationController::class, 'getByFamily']);


// --- VUE 3 : APPLICATIONS (LIVE PRTG) ---
// Récupère les détails d'une app et lance le scan curl_multi sur PRTG
Route::get('/applications/{id}', [ApplicationController::class, 'show']);

// Route optionnelle si tu as besoin de lister toutes les apps sans filtre
Route::get('/applications', [ApplicationController::class, 'index']);


// --- SONDES ---
// Détails spécifiques d'une sonde si nécessaire
Route::get('/sondes/{id}', [SondeController::class, 'show']);