# Togo Pharma

Plateforme web (mobile-first) pour trouver les pharmacies de garde au Togo, vérifier la disponibilité d'un
médicament, réserver et envoyer une ordonnance. Un espace permet aux pharmaciens de gérer garde, stock et demandes.

- **Tg_pharma_frontent/** : React 18 + Vite, React Router, Axios, Leaflet (cartes OpenStreetMap)
- **Tg_pharma_backend/** : Django 5 + Django REST Framework, PostgreSQL, Django Admin

## Prérequis (Windows)
Python 3.11+, Node.js 20+, PostgreSQL 15+ (ou SQLite pour un essai rapide).

## 1. Backend (PowerShell, depuis le dossier qui contient les deux projets)
```powershell
cd Tg_pharma_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Éditez `.env` : changez `DJANGO_SECRET_KEY` et renseignez PostgreSQL (`DB_*`).
Créez la base : `psql -U postgres -c "CREATE DATABASE togo_pharma;"`
(Essai sans PostgreSQL : mettez `DB_ENGINE=sqlite` dans `.env`.)
```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo      # OPTIONNEL : données FICTIVES de démonstration
python manage.py runserver
```
API : http://localhost:8000/api/ — Administration : http://localhost:8000/admin/

## 2. Frontend (second terminal)
```powershell
cd Tg_pharma_frontent
npm install
copy .env.example .env.development
npm run dev
```
Site : http://localhost:5173

## Comptes de démonstration (après `seed_demo`)
`demo_client` et `demo_pharmacien`, mot de passe `demo12345` (changez-le avec `--password`). **Ne pas utiliser en production.**

## Créer un vrai compte pharmacien
Dans `/admin/` : créez un utilisateur, puis dans **Pharmacies** ouvrez la pharmacie et choisissez-le dans « Compte pharmacien ».
Les inscriptions publiques créent uniquement des comptes clients.

## Tests
```powershell
cd Tg_pharma_backend
python manage.py test
```

## Principales routes API
| Route | Rôle |
|---|---|
| `GET /api/pharmacies/` | recherche : `search, on_call, open_now, is_24h, delivery, quartier, favorites, lat, lng` |
| `GET /api/pharmacies/{id}/` | fiche détaillée |
| `GET /api/gardes/current/` | semaine de garde |
| `POST /api/requests/` | demande client (vérifier / réserver / ordonnance) |
| `POST /api/auth/register|login|logout/`, `GET /api/auth/me/` | authentification par jeton |
| `/api/pharmacist/...` | tableau de bord, demandes, stock, gardes, horaires (réservé aux pharmaciens) |

## Règle de garde
Une pharmacie est « de garde » uniquement si l'instant présent est compris entre le début et la fin d'une période
enregistrée (fuseau Africa/Lome). Les gardes périmées ou futures ne sont jamais affichées comme actives.

## Production
`DJANGO_DEBUG=False`, clé secrète unique, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS`
avec votre domaine HTTPS ; `VITE_API_URL` vers l'API de production puis `npm run build`. Servez les fichiers
`media/` (ordonnances) via un stockage protégé.
