# Guide de déploiement — AMSAN BTP

Stack : Node.js + Express + PostgreSQL (Supabase) + Vercel

---

## Étape 1 — Créer la base de données sur Supabase (gratuit)

1. Aller sur https://supabase.com → **New project**
2. Choisir un nom de projet (ex: `amsan-btp`) et un mot de passe fort
3. Une fois créé, aller dans **SQL Editor** → **New query**
4. Copier-coller le contenu du fichier `backend/database/schema.sql` et cliquer **Run**
5. Aller dans **Project Settings → Database → Connection string → URI**
6. Copier l'URL (format : `postgresql://postgres:[PASSWORD]@...supabase.co:5432/postgres`)

---

## Étape 2 — Publier le code sur GitHub

```bash
# Dans le dossier C:\amsan-btp, ouvrir un terminal et lancer :
git init
git add .
git commit -m "Migration PostgreSQL + Vercel"
```

Ensuite :
1. Créer un nouveau dépôt sur https://github.com (ex: `amsan-btp`)
2. Copier les commandes affichées par GitHub pour lier le dépôt distant et pousser

---

## Étape 3 — Déployer sur Vercel

1. Aller sur https://vercel.com → **Add New Project**
2. Importer votre dépôt GitHub `amsan-btp`
3. Dans **Environment Variables**, ajouter :
   - `DATABASE_URL` → l'URL copiée depuis Supabase
   - `NODE_ENV` → `production`
4. Cliquer **Deploy**

Vercel détecte automatiquement `vercel.json` et configure les routes.

---

## Étape 4 — Vérifier le déploiement

Après déploiement, Vercel vous donne une URL (ex: `https://amsan-btp.vercel.app`).

Tester :
- `https://votre-url.vercel.app/` → doit afficher la page d'accueil
- `https://votre-url.vercel.app/api/ouvriers` → doit retourner `[]`

---

## Dev local avec PostgreSQL

Créer un fichier `.env` à la racine (jamais commité) :

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@...supabase.co:5432/postgres
NODE_ENV=development
```

Puis lancer :

```bash
npm install
npm run dev
```

---

## Fichiers modifiés dans cette migration

| Fichier | Changement |
|---|---|
| `backend/database/db.js` | Remplacé `sql.js` par `pg` Pool |
| `backend/database/schema.sql` | Adapté pour PostgreSQL (`SERIAL`, `NUMERIC`) |
| `backend/controllers/*.js` | Tous convertis en `async/await` avec `pg` |
| `backend/server.js` | Ajout `dotenv`, export de `app` pour Vercel |
| `package.json` | Remplacé `sql.js` par `pg` + `dotenv` |
| `vercel.json` | Nouveau — routing Vercel |
| `.gitignore` | Nouveau — exclut `.env` et `node_modules` |
| `.env.example` | Nouveau — template variables d'environnement |
