# Compta-Auto PME

Compta-Auto PME est un MVP complet pour la pré-comptabilité des petites et moyennes entreprises à Djibouti. Il propose une API Node.js, des données de démonstration, une génération de PDF factures, ainsi que des ressources prêtes pour Airtable, Make et Softr. Le projet fonctionne en mode **local** (démo sans clés) ou **cloud** (connecté aux services tiers).

## Démarrer en 10 minutes

```bash
npm i -g pnpm
pnpm i --prefix services/api
node scripts/generate_demo_data.mjs
pnpm --prefix services/api dev
# ou
bash deploy.sh
bash scripts/smoke_tests.sh
```

## Fonctionnalités clés

- API Express avec routes santé, classification IA, génération PDF et webhook WhatsApp.
- Données de démonstration FDJ (mouvements, factures, règlements, rapports) générées automatiquement.
- Blueprints Make (WhatsApp ingest, envoi facture PDF, rapport mensuel).
- Schéma Airtable et configuration Softr documentés.
- Déploiement Docker prêt à l'emploi et scripts de tests fumée.

## Endpoints API

- `GET /health`
- `POST /ai/classify` → `{categorie,score_confiance,commentaire}`
- `POST /pdf/invoice` → `{ ok:true, url }`
- `GET|POST /webhook/whatsapp` (verify + ingest)

## Bascules RUN_MODE

- `RUN_MODE=local` → Mode démo sans intégration externe.
- `RUN_MODE=cloud` + `.env` complété → Active Airtable, Make, WhatsApp Cloud et modèles OpenAI.

## Sécurité

- JWT (`JWT_SECRET`) pour sécuriser les endpoints sensibles.
- Fichiers générés servis avec URLs temporaires ou stockage externe selon `FILES_BASE_URL`.
- Journaux sans PII et rotation recommandée pour les jetons.
- Limitation du périmètre des rôles (Admin, Comptable, Employé, Lecteur).

## Recette / Critères d'acceptation

- `/health` renvoie un JSON `{ ok: true }` en < 100 ms.
- `/ai/classify` retourne un JSON strict sans texte superflu.
- `/pdf/invoice` crée une facture PDF (< 5 s) accessible sous `/files/*`.
- Smoke tests `bash scripts/smoke_tests.sh` passent sans erreur.
- Données de démonstration : 24 mouvements, 6 factures, 4 règlements, 1 rapport.
- Rapport mensuel généré (mode cloud) et catégorisation IA ≥ 85%.

## Architecture

```
compta_auto_pme/
  services/api        # API Node.js (Express, TypeScript)
  demo/seed           # Données JSON de démonstration
  infra/airtable      # Schéma Airtable & rôles
  infra/make_blueprints # Scénarios Make (WhatsApp, PDF, rapport)
  infra/pwa           # Configuration Softr (PWA)
  scripts             # Génération de données & tests fumée
```

## Déploiement Cloud

1. Renseigner `.env` avec clés Airtable, WhatsApp Cloud, OpenAI puis `RUN_MODE=cloud`.
2. Importer les blueprints Make (`infra/make_blueprints/*.json`).
3. Configurer Airtable (tables, vues, rôles) via `infra/airtable/*`.
4. Créer l'application Softr en suivant `infra/pwa/softr_config.md`.
5. Utiliser `deploy.sh` pour déploiement Docker local ou pipeline CI/CD.

## Licence

Projet démonstration à adapter selon vos besoins internes.
