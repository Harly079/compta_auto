import { Router } from "express";
import { generateInvoicePDF } from "../lib/pdf.js";
export const router = Router();

router.post("/", async (req, res) => {
  try {
    const filePath = await generateInvoicePDF(req.body || {});
    const publicUrl = `/files/${filePath.split("/").pop()}`;
    return res.status(200).json({ ok: true, url: publicUrl });
  } catch (e:any) {
    return res.status(500).json({ ok: false, error: e?.message || "pdf_error" });
  }
});
