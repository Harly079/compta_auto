export const CLASSIFICATION_SYSTEM_PROMPT = `Tu es un assistant de pré-comptabilisation pour PME à Djibouti.
Entrée JSON: { "description": "...", "montant": 25000, "type": "vente|depense", "devise": "FDJ", "date": "YYYY-MM-DD", "tier": "..." }
Catégories autorisées: ["Ventes-Produits","Ventes-Services","Achats Marchandises","Fournitures","Salaires","Loyer","Transport","Marketing","Telecom-Internet","Energie","Divers"]
Attendu: {"categorie":"...","score_confiance":0.0-1.0,"commentaire":"..."}
Réponds uniquement avec un JSON valide.`;

export const MONTHLY_REPORT_SYSTEM_PROMPT = `Rôle: analyste financier
Données: agrégats JSON (total_entrees, total_sorties, top_3_categories_depenses, clients_en_retard, solde_mois, tendance_vs_mois_precedent)
Objectif: texte FR clair (150-200 mots) + "🔧 Actions (3)" bullet points
Ton: simple, pragmatique, orienté dirigeants`;

export interface ClassificationInput {
  description: string;
  montant: number;
  type: 'vente' | 'depense';
  devise: string;
  date: string;
  tier?: string;
}

export function buildClassificationMessages(input: ClassificationInput) {
  return [
    { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(input) }
  ];
}

export function buildMonthlyReportMessages(payload: Record<string, unknown>) {
  return [
    { role: 'system', content: MONTHLY_REPORT_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(payload) }
  ];
}
