<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SondeDetail extends Model
{
    protected $table = 'sondes_details';

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