<?php

namespace App\Models; 

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    // Indiquer à Laravel le nom de la nouvelle clé primaire
    protected $primaryKey = 'IDAPP';

    // Préciser que la clé primaire n'est pas un entier auto-incrémenté par la BDD
    public $incrementing = false;

    // Si IDAPP est un entier dans la BDD
    protected $keyType = 'int';

    protected $fillable = [
    'IDAPP', 'IDIURB', 'APPNOM', 'APPCOD', 'APPACT', 
    'APPDAT', 'APPHEB', 'APPCRI', 'IDTAPP', 'APPLIB', 
    ];

    protected $casts = [
    'APPACT' => 'boolean',
    'APPDAT' => 'date',
    ];

    /**
     * Relation avec les détails des sondes.
     * Une application peut avoir plusieurs sondes (PRTG, etc.)
     */
    public function sondes(): HasMany
    {
        return $this->hasMany(SondeDetail::class);
    }
}