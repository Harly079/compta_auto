# Softr - Configuration Compta-Auto PME

## Pages

1. **Accueil KPI** (page principale)
   - Bloc Statistiques (Total ventes mois, Total dépenses, Solde).
   - Bloc Diagramme (bar chart par catégorie de dépenses).
   - Bloc Actions rapides (boutons vers Ajout vente, Ajout dépense, Générer facture).
2. **Mouvements**
   - Liste filtrable sur table Airtable `T_Mouvements` vue `Validés`.
   - Bouton "Exporter CSV" (intégration Softr native).
3. **À valider**
   - Liste Kanban basée sur vue `Brouillon - À valider`.
   - Carte montrant `description`, `montant`, `categorie`, `ai_confiance`.
   - Boutons actions : "Valider" (mise à jour statut) et "Corriger" (ouvre formulaire).
4. **Factures**
   - Table view sur `T_Factures` avec filtres `statut`.
   - Bouton "Créer facture" (formulaire modal).
5. **Rapports**
   - Liste PDF (cards) reliant `T_Rapports`.
   - Bouton "Télécharger".
6. **Profil entreprise**
   - Bloc Form pour mise à jour `T_Entreprises` (pour Admin).

## Formulaires

### Ajout vente
- Table `T_Mouvements` avec champs: date (pré-rempli aujourd'hui), montant, devise (FDJ/ USD), tier (lookup), description, pièce jointe.
- Champ caché `type=vente`, `statut=brouillon`, `source=form`.

### Ajout dépense
- Similaire mais `type=depense`.
- Bouton "Scanner ticket" reliant flux WhatsApp.

### Création facture
- Form multi-étapes (Softr + Airtable) pour `T_Factures`.
- Étape 1: Client & dates.
- Étape 2: Items (utiliser "Repeating group" + script ou champ long texte JSON guidé).
- Étape 3: Bouton "Envoyer" → déclenche Make scenario `invoice_pdf_send` via webhook.

## Rôles & permissions Softr

- **Admin**: accès toutes pages + édition.
- **Comptable**: Accueil, Mouvements, À valider, Factures, Rapports.
- **Employé**: Accueil, Ajout vente/dépense, Factures (lecture), Rapports (lecture).
- **Lecteur**: Accueil (lecture), Rapports.

## Paramètres PWA

- Activer PWA dans Softr (icône 512x512 compressée < 50kb).
- Mode offline: activer caching pages critiques + fallback.
- Color scheme: bleu (#1C4E80) / orange (#FFB703).

## Automations intégrées

- Bouton "Synchroniser" appelle webhook `sync/offline` (micro-service, backlog) pour recharger modifications hors-ligne.
- Notification push (OneSignal) branchée sur record `T_Mouvements` statut `valide`.
