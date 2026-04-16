<?php

namespace App\Models; 

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{

    protected $table = 'applications'; 

    protected $primaryKey = 'IDAPP';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'IDAPP', 'IDIURB', 'APPNOM', 'APPCOD', 'APPACT', 
        'APPDAT', 'APPHEB', 'APPCRI', 'IDTAPP', 'APPLIB', 'APPFAMILLE'
    ];

    protected $casts = [
        'APPACT' => 'boolean',
        'APPDAT' => 'date',
    ];

    /**
     * Relation avec le Quartier (Famille)
     * On lie APPFAMILLE de cette table à l'ID de URBA_QUARTIER
     */
    public function quartier(): BelongsTo
    {
        // On lie le champ APPFAMILLE à l'ID du quartier
        return $this->belongsTo(UrbaQuartier::class, 'APPFAMILLE', 'id');
    }

    /**
     * Relation avec les détails des sondes.
     */
    public function sondes(): HasMany
    {
        return $this->hasMany(SondeDetail::class, 'IDAPP', 'IDAPP');
    }
}