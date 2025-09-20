import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { generateInvoicePdf, buildPublicPdfUrl, type InvoicePayload } from '../lib/pdf.js';
import { storeInvoicePdf } from '../lib/airtable.js';
import { requireAuth } from '../lib/auth.js';

const STORAGE_DIR = path.join(process.cwd(), 'storage');

async function persistPdfLocally(fileName: string, buffer: Buffer) {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(path.join(STORAGE_DIR, fileName), buffer);
}

export const router = Router();

router.post('/invoice', requireAuth(['admin', 'comptable']), async (req, res, next) => {
  try {
    const payload = req.body as InvoicePayload;
    if (!payload?.entreprise?.nom || !payload?.entreprise?.devise || !payload?.client?.nom || !Array.isArray(payload?.items)) {
      return res.status(400).json({ error: 'Payload facture incomplet' });
    }

    const pdf = await generateInvoicePdf(payload);
    await persistPdfLocally(pdf.fileName, pdf.buffer);
    const publicUrl = buildPublicPdfUrl(pdf.fileName);

    if (payload.id_facture) {
      await storeInvoicePdf(payload.id_facture, publicUrl);
    }

    res.json({
      pdf_url: publicUrl,
      file_name: pdf.fileName,
      total_ht: pdf.total_ht,
      total_tva: pdf.total_tva,
      total_ttc: pdf.total_ttc
    });
  } catch (error) {
    next(error);
  }
});
