<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UrbaQuartier extends Model
{
    use HasFactory;

    protected $table = 'urba_quartier';
    public $timestamps = false;

    // AJOUTE CETTE LIGNE :
    protected $fillable = ['QURBLIB', 'QURBCOD'];

 

    public function applications()
    {
  
    return $this->hasMany(Application::class, 'APPFAMILLE', 'id');
    }
}