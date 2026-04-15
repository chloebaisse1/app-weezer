<?php

use App\Http\Controllers\Api\ApplicationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SondeController;

Route::get('/applications', [ApplicationController::class, 'index']);
Route::get('/applications/{id}', [ApplicationController::class, 'show']);

Route::get('/sondes/{id}', [SondeController::class, 'show']);