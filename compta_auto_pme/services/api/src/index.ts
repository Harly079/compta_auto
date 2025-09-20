import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import { router as health } from "./routes/health.js";
import { router as classify } from "./routes/ai.classify.js";
import { router as pdfInvoice } from "./routes/pdf.invoice.js";
import { router as webhookWhatsapp } from "./routes/webhook.whatsapp.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// Fichiers statiques (PDF démo & exports)
app.use("/files", express.static(path.join(__dirname, "..", "..", "demo")));

app.use("/health", health);
app.use("/ai/classify", classify);
app.use("/pdf/invoice", pdfInvoice);
app.use("/webhook/whatsapp", webhookWhatsapp);

app.listen(PORT, () => {
  console.log(`Compta-Auto API running on http://localhost:${PORT}`);
});
