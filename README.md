# Compta-Auto PME – MVP No-Code assisté IA

Plateforme hybride no-code/low-code pour automatiser la pré-comptabilité de PME djiboutiennes. L'architecture combine Airtable/SmartSuite, Softr, Make et un micro-service Node/TypeScript pour les traitements critiques (webhooks WhatsApp, génération PDF, IA de catégorisation).

## Sommaire
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Configuration](#configuration)
- [Lancement local](#lancement-local)
- [Commandes utiles](#commandes-utiles)
- [Schéma Airtable & jeux de données](#schéma-airtable--jeux-de-données)
- [Blueprints Make](#blueprints-make)
- [Configuration Softr (PWA)](#configuration-softr-pwa)
- [Flux IA](#flux-ia)
- [Sécurité & conformité](#sécurité--conformité)
- [Roadmap & modes avancés](#roadmap--modes-avancés)

## Architecture

| Composant | Rôle |
|-----------|------|
| Softr (PWA) | Interface mobile-first, formulaires ventes/dépenses, dashboards KPI, offline cache. |
| Airtable / SmartSuite | Base maîtresse (mouvements, factures, rapports, tiers, entreprises). |
| Make (Integromat) | Automations : ingestion WhatsApp + OCR, génération + diffusion PDF, rapports mensuels. |
| Micro-service Node (`services/api`) | Webhooks WhatsApp Cloud, endpoint IA de catégorisation, génération PDF, endpoints utilitaires. |
| OpenAI | Modèles texte (classification + résumé), vision (OCR). |
| WhatsApp Cloud API | Réception/envoi de pièces et factures. |

## Prérequis

- Node.js 18+ et [pnpm](https://pnpm.io/) 8+
- Docker (optionnel, pour exécuter `docker-compose`)
- Comptes/services:
  - Airtable **ou** SmartSuite (l'adaptateur Airtable peut servir de référence)
  - Make (ou n8n, blueprint compatible conceptuellement)
  - Meta WhatsApp Cloud API
  - OpenAI (accès modèles GPT-5o texte & vision)
  - Google Drive / stockage équivalent pour héberger les PDF (pré-signed URL recommandé)

## Configuration

1. Copier `.env.example` → `.env` et renseigner toutes les valeurs.
2. Airtable :
   - Créer une base vide puis importer `infra/airtable/schema.csv` (mapping des colonnes en respectant les types).
   - Configurer les vues décrites dans `infra/airtable/views.json` et attribuer les rôles (Admin, Comptable, Employé, Lecteur).
   - Importer les jeux de données `infra/airtable/sample_data.csv` pour disposer d'exemples (10 ventes / 10 dépenses).
3. Make :
   - Importer les blueprints JSON dans `infra/make_blueprints/`.
   - Créer les connexions (Airtable, OpenAI, WhatsApp, Slack/Gmail) et renseigner les variables `{{...}}`.
4. Softr :
   - Configurer les pages/formulaires décrits dans `infra/pwa/softr_config.md`.
   - Activer le mode PWA + offline cache.
5. WhatsApp Cloud :
   - Configurer l'URL du webhook → `https://<votre-api>/webhook/whatsapp`.
   - Utiliser le `WHATSAPP_VERIFY_TOKEN` défini dans `.env`.
6. OpenAI :
   - Créer les clés API et vérifier l'accès aux modèles `gpt-5o-mini` (texte) et `gpt-5o-vision` (vision).

## Lancement local

```bash
cd services/api
pnpm install
pnpm run dev
# ou via Docker
cd ..
docker compose up --build
```

L'API écoute par défaut sur `http://localhost:8080`.

## Commandes utiles

```bash
# Santé
curl -s http://localhost:8080/health

# Catégorisation (vente)
curl -X POST http://localhost:8080/ai/classify \
  -H "Content-Type: application/json" \
  -d '{"description":"Vente de 5 unités produit X", "montant":75000, "type":"vente", "devise":"FDJ","date":"2025-09-15","tier":"Client A"}'

# Génération facture PDF
curl -X POST http://localhost:8080/pdf/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise":{"nom":"PME Alpha","devise":"FDJ","tva":0.10},
    "client":{"nom":"Client A","email":"a@example.com"},
    "items":[{"designation":"Produit X","qte":5,"pu":15000}],
    "date":"2025-09-15", "due_date":"2025-09-30"
  }'
```

> ⚠️ En mode production, fournissez un JWT (`Authorization: Bearer ...`). Tant que `JWT_SECRET` reste `change_me`, le middleware est en mode démo et laisse passer les requêtes (console warning).

## Schéma Airtable & jeux de données

- **Schéma complet** : `infra/airtable/schema.csv`
- **Vues & rôles** : `infra/airtable/views.json`
- **Dataset test (20 lignes)** : `infra/airtable/sample_data.csv`

## Blueprints Make

| Fichier | Description |
|---------|-------------|
| `infra/make_blueprints/whatsapp_ingest.json` | Webhook WhatsApp → OCR → création brouillon → IA → notification faible confiance. |
| `infra/make_blueprints/invoice_pdf_send.json` | Déclencheur Airtable `À envoyer` → API PDF → WhatsApp + email. |
| `infra/make_blueprints/monthly_report.json` | Scheduler mensuel → agrégations → résumé IA → PDF → diffusion dirigeant. |

## Configuration Softr (PWA)

Voir `infra/pwa/softr_config.md` pour les pages, formulaires et rôles. Recommandations :
- Images < 50kb, police système pour performance.
- Bouton "Synchroniser" pour relancer les automations en cas de connexion faible.
- Utiliser Softr `Data sync` + `Local storage` pour meilleure tolérance offline.

## Flux IA

- **Catégorisation** : prompt strict JSON dans `services/api/src/lib/prompts.ts`. Score < 0.7 ⇒ statut `brouillon` + notification.
- **Résumé mensuel** : instructions orientées dirigeants (150–200 mots + 3 actions).
- **OCR** : endpoint OpenAI Vision, fallback texte si clé absente.

## Sécurité & conformité

Checklist à valider avant production :
- [ ] `.env` complet (jamais commité). Rotation des clés tous les 90 jours.
- [ ] `JWT_SECRET` robuste (>32 caractères) + tokens limités à 12h.
- [ ] Endpoints sensibles derrière HTTPS + JWT.
- [ ] URLs PDF temporisées (pré-signed) – ici `FILES_BASE_URL` doit générer un lien expirant.
- [ ] Logs applicatifs anonymisés (pas de montants/téléphones en clair).
- [ ] Sauvegarde quotidienne Airtable (export CSV + sauvegarde cloud chiffrée).
- [ ] Politique RGPD/CCPA : informer les clients sur l'usage IA.

## Roadmap & modes avancés

1. **Mode offline-first** : implémenter une file locale (IndexedDB) côté Softr/Glide avec micro-service `/sync/offline` pour rejouer les requêtes dès que la connexion revient.
2. **Hébergement local/régional** : prévoir variables `API_REGION`/`STORAGE_REGION` pour cibler un datacenter Afrique de l'Est (par ex. OVH GRA, Scaleway). Possibilité de déployer l'API sur un VPS local avec Docker Swarm.
3. **Adaptateur Airtable ↔ SmartSuite** : factoriser les appels base dans `services/api/src/lib/airtable.ts` en une interface `BaseAdapter` afin de brancher une implémentation SmartSuite (API compatible REST) sans toucher aux routes.

## Tests & validation

- Import CSV de 200 lignes sans erreurs (Airtable `CSV import`).
- Vérifier sur 20 pièces test : >=85% de catégorisation correcte après une itération de correction.
- Génération facture (Make ou API directe) < 5s (chrono). Lien PDF accessible.
- Rapport mensuel auto envoyé (WhatsApp + email) avec agrégats cohérents.
- Contrôler les permissions par rôle sur Softr/Airtable.

Bon build !
