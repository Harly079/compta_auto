import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateInvoicePDF(payload: any) {
  const outPath = path.join(__dirname, "..", "..", "..", "demo", `facture_demo_${Date.now()}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const { entreprise={}, client={}, items=[], date, due_date } = payload;
  doc.fontSize(18).text("FACTURE", { align: "left" });
  doc.moveDown();
  doc.fontSize(10).text(`${entreprise.nom || "PME Alpha"} - Djibouti`);
  doc.text(`Client: ${client.nom || "Client A"} (${client.email || ""})`);
  doc.text(`Date: ${date || ""}  |  Échéance: ${due_date || ""}`);
  doc.moveDown();

  doc.fontSize(12).text("Désignation                               Montant (FDJ)");
  doc.moveDown(0.5);

  let total_ht = 0;
  for (const it of items) {
    const line = `${it.designation} (x${it.qte} @ ${it.pu})`;
    const amount = (it.qte || 0) * (it.pu || 0);
    total_ht += amount;
    doc.fontSize(11).text(`${line.padEnd(40, " ")} ${amount.toLocaleString("fr-FR")}`);
  }

  const taux = (entreprise.tva ?? 0.10);
  const tva = Math.round(total_ht * taux);
  const total_ttc = total_ht + tva;

  doc.moveDown();
  doc.fontSize(12).text(`Total HT : ${total_ht.toLocaleString("fr-FR")} FDJ`);
  doc.fontSize(12).text(`TVA (${Math.round(taux*100)}%) : ${tva.toLocaleString("fr-FR")} FDJ`);
  doc.fontSize(14).text(`TOTAL TTC : ${total_ttc.toLocaleString("fr-FR")} FDJ`, { underline: true });

  doc.moveDown();
  doc.fontSize(9).text("Merci de votre confiance. Règlement sous 15 jours.");

  doc.end();
  await new Promise((r) => stream.on("finish", r));
  return outPath;
}
