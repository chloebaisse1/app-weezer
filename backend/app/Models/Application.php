<?php

namespace App\Models; 

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
   
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
     * Relation avec les détails des sondes.
     * Une application peut avoir plusieurs sondes (PRTG, etc.)
     */
    public function sondes(): HasMany
    {
        return $this->hasMany(SondeDetail::class, 'IDAPP', 'IDAPP');
    }
}