export const CATEGORIES = [
  "Ventes-Produits","Ventes-Services","Achats Marchandises","Fournitures",
  "Salaires","Loyer","Transport","Marketing","Telecom-Internet","Energie","Divers"
];

export const CLASSIFY_INSTRUCTIONS = `Tu es un assistant de pré-comptabilisation pour PME à Djibouti.
Entrée JSON: { "description": "...", "montant": 25000, "type": "vente|depense", "devise": "FDJ", "date": "YYYY-MM-DD", "tier": "..." }
Catégories autorisées: ${JSON.stringify(CATEGORIES)}
Attendu: {"categorie":"...","score_confiance":0.0-1.0,"commentaire":"..."}
Réponds UNIQUEMENT avec un JSON valide.`;
