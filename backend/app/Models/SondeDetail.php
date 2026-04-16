<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SondeDetail extends Model
{
    protected $table = 'sondes_details';

    // Désactivation de  l'auto-incrémentation car pas de colonne 'id'
    public $incrementing = false;

    protected $fillable = [
        'IDAPP',
        'IDSER',
        'SONPRTG'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'IDAPP', 'IDAPP');
    }
}