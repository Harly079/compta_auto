import { Router } from "express";
import { load, save } from "../lib/store.local.js";
export const router = Router();

/** Vérification (Meta) */
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "verify_me";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

/** Ingestion (DEMO ou CLOUD) */
router.post("/", async (req, res) => {
  // DEMO: simule création d'un mouvement brouillon
  const data = await load("T_Mouvements");
  const id = `MVT-LOCAL-${Date.now()}`;
  data.push({
    id_mvt:id, id_entreprise:"ENTR-001", date:new Date().toISOString().slice(0,10),
    type:"depense", montant:25000, devise:"FDJ", mode_paiement:"cash", id_tier:"FOU-001",
    categorie:"Fournitures", description:"Achat fournitures bureau - 25 000 FDJ",
    piece_jointe_url:"", ai_confiance:0.86, statut:"brouillon", source:"whatsapp"
  });
  await save("T_Mouvements", data);
  return res.json({ ok:true, created:id });
});
