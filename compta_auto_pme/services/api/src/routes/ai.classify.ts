import { Router } from "express";
import { CATEGORIES } from "../lib/prompts.js";
export const router = Router();

/** DEMO locale: rules simples (pas d'OpenAI requis) */
function classifyLocal(desc: string, type: string) {
  const d = (desc || "").toLowerCase();
  if (type === "vente") {
    return { categorie: d.includes("service") ? "Ventes-Services" : "Ventes-Produits", score_confiance: 0.88, commentaire: "Rule-based DEMO" };
  }
  if (d.includes("internet") || d.includes("fibre")) return { categorie: "Telecom-Internet", score_confiance: 0.84, commentaire: "Rule-based DEMO" };
  if (d.includes("électricité") || d.includes("electricite")) return { categorie: "Energie", score_confiance: 0.86, commentaire: "Rule-based DEMO" };
  if (d.includes("fourniture")) return { categorie: "Fournitures", score_confiance: 0.86, commentaire: "Rule-based DEMO" };
  return { categorie: "Divers", score_confiance: 0.6, commentaire: "Rule-based DEMO" };
}

router.post("/", async (req, res) => {
  const { description, type } = req.body || {};
  if (!description || !type) return res.status(400).json({ error: "description and type required" });
  const result = classifyLocal(description, type);
  return res.status(200).json(result);
});
