 WEEZER-APP

**Weezer** est une solution de monitoring haute performance au design futuriste,conçue pour centraliser et visualiser l'état de santé de vos infrastructures et applications via l'API PRTG.

## 🚀 Architecture Technique

L'application est entièrement conteneurisée avec **Docker** et repose sur la stack suivante :

* **Frontend** : React 18 + Vite (Tailwind CSS / Lucide Icons).
* **Backend** : Laravel 10 (PHP 8.2) agissant comme API.
* **Database** : PostgreSQL 15 (Données métiers) & PostgreSQL 16 (Système).
* **Reverse Proxy** : Nginx (Gestion des ports et du routage).
* **Scheduler** : Worker Laravel pour la synchronisation automatique des sondes PRTG.

## 📥 Pré-requis

Avant de commencer, assurez-vous d'avoir installé :
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Git](https://git-scm.com/)

## 🛠️ Installation & Lancement

### 1. Cloner le repository
```bash
git clone https://gitlab.com/votre-compte/weezer-app.git
cd weezer-app`

### 2. Configuration de l'environnement

Copiez les fichiers d'exemple et configurez vos accès (notamment les clés API PRTG) :

**Pour le Backend :**

Bash

`cp backend/.env.example backend/.env
# Editez le fichier .env pour configurer DB_PORT=5433 et les accès PRTG`

**Pour le Frontend :**

Bash

`cp frontend/.env.example frontend/.env`

### 3. Build et Démarrage des conteneurs

Bash

`docker compose up -d --build`

### 4. Initialisation du projet

Exécutez les commandes suivantes pour préparer la base de données et les dépendances :

Bash

# Installation des dépendances PHP
docker compose exec api composer install

# Génération de la clé d'application
docker compose exec api php artisan key:generate

# Migration de la base de données
docker compose exec api php artisan migrate --seed

# Nettoyage des caches (recommandé au premier lancement)
docker compose exec api php artisan config:clear`

🌐 Accès aux services

Une fois lancé, Weezer est accessible aux adresses suivantes :

| **Frontend (React)** | `http://nebula.leader-sys.com` | `5173` |
| **API (Laravel)** | `http://nebula.leader-sys.com:8080/api` | `8080` |
| **Base de données** | `localhost` | `5433` |


🛠️ Commandes Utiles

**Arrêter le projet :**

Bash

`docker compose down`

**Voir les logs de l'API :**

Bash

`docker compose logs -f api`

**Forcer une synchronisation PRTG :**

Bash

`docker compose exec api php artisan app:sync-prtg`

**Vider le cache Laravel :**

Bash

`docker compose exec api php artisan config:clear`



## 🛰️ Monitoring des conteneurs

Pour vérifier que tous les services sont "Up", utilisez :

Bash

`docker ps`

Les conteneurs suivants doivent être actifs : `weezer-api`, `weezer-frontend`, `weezer-web`, `weezer-db`, `weezer-scheduler`.

---

© 2026 // **NEBULA SYSTEM** - Développé par le service DEV.