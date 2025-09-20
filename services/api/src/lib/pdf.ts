import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface InvoiceItem {
  designation: string;
  qte: number;
  pu: number;
}

export interface InvoicePayload {
  id_facture?: string;
  entreprise: {
    nom: string;
    devise: string;
    tva?: number;
    adresse?: string;
  };
  client: {
    nom: string;
    email?: string;
    adresse?: string;
  };
  items: InvoiceItem[];
  date: string;
  due_date?: string;
  notes?: string;
}

interface GeneratedPdf {
  buffer: Buffer;
  fileName: string;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
}

export async function generateInvoicePdf(payload: InvoicePayload): Promise<GeneratedPdf> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const title = `Facture ${payload.id_facture ?? ''}`.trim();
  page.drawText(title || 'Facture', { x: 50, y: height - 50, size: 18, font, color: rgb(0.1, 0.1, 0.1) });

  let cursorY = height - 90;
  page.drawText(`Entreprise : ${payload.entreprise.nom}`, { x: 50, y: cursorY, size: 12, font });
  cursorY -= 16;
  if (payload.entreprise.adresse) {
    page.drawText(payload.entreprise.adresse, { x: 50, y: cursorY, size: 10, font });
    cursorY -= 14;
  }
  page.drawText(`Client : ${payload.client.nom}`, { x: 50, y: cursorY, size: 12, font });
  cursorY -= 16;
  if (payload.client.adresse) {
    page.drawText(payload.client.adresse, { x: 50, y: cursorY, size: 10, font });
    cursorY -= 14;
  }

  const headers = ['Désignation', 'Qté', 'PU', 'Montant'];
  const startX = 50;
  cursorY -= 10;
  headers.forEach((header, index) => {
    page.drawText(header, { x: startX + index * 120, y: cursorY, size: 11, font });
  });
  cursorY -= 14;

  let totalHT = 0;
  payload.items.forEach((item) => {
    const montant = item.qte * item.pu;
    totalHT += montant;
    page.drawText(item.designation, { x: startX, y: cursorY, size: 10, font });
    page.drawText(item.qte.toString(), { x: startX + 120, y: cursorY, size: 10, font });
    page.drawText(item.pu.toFixed(2), { x: startX + 240, y: cursorY, size: 10, font });
    page.drawText(montant.toFixed(2), { x: startX + 360, y: cursorY, size: 10, font });
    cursorY -= 14;
  });

  const tvaRate = payload.entreprise.tva ?? 0;
  const totalTVA = totalHT * tvaRate;
  const totalTTC = totalHT + totalTVA;

  cursorY -= 10;
  page.drawText(`Total HT: ${totalHT.toFixed(2)} ${payload.entreprise.devise}`, { x: startX, y: cursorY, size: 12, font });
  cursorY -= 16;
  page.drawText(`TVA (${(tvaRate * 100).toFixed(0)}%): ${totalTVA.toFixed(2)} ${payload.entreprise.devise}`, { x: startX, y: cursorY, size: 12, font });
  cursorY -= 16;
  page.drawText(`Total TTC: ${totalTTC.toFixed(2)} ${payload.entreprise.devise}`, { x: startX, y: cursorY, size: 12, font, color: rgb(0, 0.2, 0) });

  if (payload.notes) {
    cursorY -= 24;
    page.drawText(`Notes: ${payload.notes}`, { x: startX, y: cursorY, size: 10, font });
  }

  const pdfBytes = await pdfDoc.save();
  const fileName = `facture_${payload.id_facture ?? Date.now()}.pdf`;
  return {
    buffer: Buffer.from(pdfBytes),
    fileName,
    total_ht: totalHT,
    total_tva: totalTVA,
    total_ttc: totalTTC
  };
}

export function buildPublicPdfUrl(fileName: string): string {
  const base = process.env.FILES_BASE_URL || 'https://files.example.com';
  return `${base.replace(/\/$/, '')}/${fileName}`;
}
