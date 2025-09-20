import Airtable from 'airtable';

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_MOVEMENTS = 'T_Mouvements',
  AIRTABLE_TABLE_INVOICES = 'T_Factures',
  AIRTABLE_TABLE_REPORTS = 'T_Rapports'
} = process.env;

let cachedBase: Airtable.Base | null = null;

function getBase(): Airtable.Base | null {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('[airtable] API key/base id missing, returning null adapter');
    return null;
  }
  if (!cachedBase) {
    Airtable.configure({ apiKey: AIRTABLE_API_KEY });
    cachedBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  }
  return cachedBase;
}

export interface MovementDraft {
  id_entreprise: string;
  date: string;
  type: 'vente' | 'depense';
  montant: number;
  devise: string;
  mode_paiement?: string;
  id_tier?: string;
  description?: string;
  categorie?: string;
  piece_jointe_url?: string;
  ai_confiance?: number;
  statut?: 'brouillon' | 'valide';
  source?: string;
}

export interface ClassificationResult {
  categorie: string;
  score_confiance: number;
  commentaire?: string;
}

export async function createDraftMovement(fields: MovementDraft): Promise<{ id: string; fields: MovementDraft }> {
  const base = getBase();
  const payload = {
    ...fields,
    statut: fields.statut || 'brouillon'
  };
  if (!base) {
    return { id: `local_${Date.now()}`, fields: payload };
  }
  const record = await base(AIRTABLE_TABLE_MOVEMENTS).create({ fields: payload });
  return { id: record.id, fields: payload };
}

export async function updateMovementClassification(recordId: string, classification: ClassificationResult & { statut?: string }): Promise<void> {
  const base = getBase();
  if (!base) {
    console.warn('[airtable] skip update, offline mode');
    return;
  }
  await base(AIRTABLE_TABLE_MOVEMENTS).update(recordId, {
    categorie: classification.categorie,
    ai_confiance: classification.score_confiance,
    statut: classification.statut
  } as any);
}

export async function storeInvoicePdf(recordId: string, pdfUrl: string): Promise<void> {
  const base = getBase();
  if (!base) {
    console.warn('[airtable] skip invoice PDF update in offline mode');
    return;
  }
  await base(AIRTABLE_TABLE_INVOICES).update(recordId, { pdf_url: pdfUrl } as any);
}

export async function storeMonthlyReport(recordId: string, summary: string, pdfUrl: string): Promise<void> {
  const base = getBase();
  if (!base) {
    console.warn('[airtable] skip report update in offline mode');
    return;
  }
  await base(AIRTABLE_TABLE_REPORTS).update(recordId, {
    resume_txt: summary,
    pdf_url: pdfUrl
  } as any);
}
