import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const demoDir = path.join(rootDir, "demo");
const seedDir = path.join(demoDir, "seed");

await fs.promises.mkdir(seedDir, { recursive: true });

const entreprise = [
  {
    id_entreprise: "ENTR-001",
    nom: "PME Alpha",
    logo_url: "https://dummyimage.com/200x200/184E77/ffffff&text=PME",
    adresse: "Quartier Industriel, Djibouti",
    telephone: "+25377123456",
    email: "contact@pmalpha.dj",
    devise_defaut: "FDJ",
    tva_applicable: true
  }
];

const tiers = [
  { id_tier: "CLI-001", type: "client", nom: "Client A", contact: "M. Hassan", telephone: "+25377000111", email: "client.a@example.com", adresse: "Djibouti-ville" },
  { id_tier: "CLI-002", type: "client", nom: "Client B", contact: "Mme. Farah", telephone: "+25377000222", email: "client.b@example.com", adresse: "Arta" },
  { id_tier: "CLI-003", type: "client", nom: "Client C", contact: "M. Omar", telephone: "+25377000333", email: "client.c@example.com", adresse: "Obock" },
  { id_tier: "CLI-004", type: "client", nom: "Client D", contact: "Mme. Nadra", telephone: "+25377000444", email: "client.d@example.com", adresse: "Tadjourah" },
  { id_tier: "FOU-001", type: "fournisseur", nom: "Fournisseur Bureau", contact: "Service commercial", telephone: "+25377999888", email: "contact@fourniburo.dj", adresse: "Balbala" },
  { id_tier: "FOU-002", type: "fournisseur", nom: "Energie Plus", contact: "Support", telephone: "+25377999777", email: "support@energieplus.dj", adresse: "Boulaos" },
  { id_tier: "FOU-003", type: "fournisseur", nom: "Djib Telecom", contact: "Relation Entreprise", telephone: "+25377999666", email: "sales@djibtelecom.dj", adresse: "Djibouti-ville" }
];

const ventes = [
  { date: "2025-09-01", montant: 450000, id_tier: "CLI-001", description: "Vente solution SaaS - Septembre", mode_paiement: "virement" },
  { date: "2025-09-04", montant: 320000, id_tier: "CLI-002", description: "Vente prestation marketing", mode_paiement: "carte" },
  { date: "2025-09-07", montant: 275000, id_tier: "CLI-003", description: "Licence annuelle ERP", mode_paiement: "virement" },
  { date: "2025-09-10", montant: 380000, id_tier: "CLI-001", description: "Projet intégration", mode_paiement: "virement" },
  { date: "2025-09-12", montant: 210000, id_tier: "CLI-004", description: "Maintenance trimestrielle", mode_paiement: "mobile_money" },
  { date: "2025-09-15", montant: 330000, id_tier: "CLI-002", description: "Support applicatif", mode_paiement: "virement" },
  { date: "2025-09-18", montant: 295000, id_tier: "CLI-003", description: "Formation équipe", mode_paiement: "carte" },
  { date: "2025-09-20", montant: 410000, id_tier: "CLI-004", description: "Solution data analytics", mode_paiement: "virement" },
  { date: "2025-09-22", montant: 265000, id_tier: "CLI-001", description: "Abonnement services cloud", mode_paiement: "mobile_money" },
  { date: "2025-09-24", montant: 355000, id_tier: "CLI-002", description: "Consulting digital", mode_paiement: "virement" },
  { date: "2025-09-26", montant: 285000, id_tier: "CLI-003", description: "Pack CRM", mode_paiement: "carte" },
  { date: "2025-09-28", montant: 390000, id_tier: "CLI-004", description: "Projet data visualisation", mode_paiement: "virement" }
];

const depenses = [
  { date: "2025-09-02", montant: 25000, categorie: "Fournitures", id_tier: "FOU-001", description: "Achat fournitures bureau", mode_paiement: "cash" },
  { date: "2025-09-03", montant: 78000, categorie: "Telecom-Internet", id_tier: "FOU-003", description: "Facture internet fibre", mode_paiement: "virement" },
  { date: "2025-09-05", montant: 150000, categorie: "Loyer", id_tier: "FOU-002", description: "Loyer septembre", mode_paiement: "virement" },
  { date: "2025-09-06", montant: 52000, categorie: "Transport", id_tier: "FOU-001", description: "Livraison matériel", mode_paiement: "mobile_money" },
  { date: "2025-09-08", montant: 112000, categorie: "Salaires", id_tier: "FOU-001", description: "Prime équipe support", mode_paiement: "virement" },
  { date: "2025-09-09", montant: 46000, categorie: "Energie", id_tier: "FOU-002", description: "Facture électricité", mode_paiement: "virement" },
  { date: "2025-09-11", montant: 38000, categorie: "Marketing", id_tier: "FOU-001", description: "Campagne réseaux sociaux", mode_paiement: "carte" },
  { date: "2025-09-13", montant: 29000, categorie: "Fournitures", id_tier: "FOU-001", description: "Cartouches imprimante", mode_paiement: "cash" },
  { date: "2025-09-16", montant: 87000, categorie: "Transport", id_tier: "FOU-002", description: "Frais logistique", mode_paiement: "virement" },
  { date: "2025-09-19", montant: 62500, categorie: "Telecom-Internet", id_tier: "FOU-003", description: "Crédit data mobile", mode_paiement: "mobile_money" },
  { date: "2025-09-23", montant: 41500, categorie: "Marketing", id_tier: "FOU-001", description: "Atelier clients", mode_paiement: "carte" },
  { date: "2025-09-27", montant: 102000, categorie: "Salaires", id_tier: "FOU-001", description: "Heures supplémentaires", mode_paiement: "virement" }
];

const mouvements = [];
let mvtIndex = 1;
for (const vente of ventes) {
  mouvements.push({
    id_mvt: `MVT-${String(mvtIndex).padStart(3, "0")}`,
    id_entreprise: "ENTR-001",
    date: vente.date,
    type: "vente",
    montant: vente.montant,
    devise: "FDJ",
    mode_paiement: vente.mode_paiement,
    id_tier: vente.id_tier,
    categorie: "Ventes-Produits",
    description: vente.description,
    piece_jointe_url: "",
    ai_confiance: 0.91,
    statut: mvtIndex % 5 === 0 ? "brouillon" : "valide",
    source: mvtIndex % 4 === 0 ? "whatsapp" : "form"
  });
  mvtIndex++;
}
for (const depense of depenses) {
  mouvements.push({
    id_mvt: `MVT-${String(mvtIndex).padStart(3, "0")}`,
    id_entreprise: "ENTR-001",
    date: depense.date,
    type: "depense",
    montant: depense.montant,
    devise: "FDJ",
    mode_paiement: depense.mode_paiement,
    id_tier: depense.id_tier,
    categorie: depense.categorie,
    description: depense.description,
    piece_jointe_url: "",
    ai_confiance: 0.86,
    statut: mvtIndex % 6 === 0 ? "brouillon" : "valide",
    source: mvtIndex % 3 === 0 ? "whatsapp" : "form"
  });
  mvtIndex++;
}

const factures = [
  {
    id_facture: "FAC-2025-001",
    id_entreprise: "ENTR-001",
    id_client: "CLI-001",
    date: "2025-09-02",
    due_date: "2025-09-17",
    items: [
      { designation: "SaaS Septembre", qte: 1, pu: 450000 }
    ],
    total_ht: 450000,
    tva: 45000,
    total_ttc: 495000,
    statut: "paye",
    pdf_url: ""
  },
  {
    id_facture: "FAC-2025-002",
    id_entreprise: "ENTR-001",
    id_client: "CLI-002",
    date: "2025-09-05",
    due_date: "2025-09-20",
    items: [
      { designation: "Campagne marketing", qte: 1, pu: 320000 }
    ],
    total_ht: 320000,
    tva: 32000,
    total_ttc: 352000,
    statut: "envoye",
    pdf_url: ""
  },
  {
    id_facture: "FAC-2025-003",
    id_entreprise: "ENTR-001",
    id_client: "CLI-003",
    date: "2025-09-09",
    due_date: "2025-09-24",
    items: [
      { designation: "Licence ERP", qte: 1, pu: 275000 }
    ],
    total_ht: 275000,
    tva: 27500,
    total_ttc: 302500,
    statut: "envoye",
    pdf_url: ""
  },
  {
    id_facture: "FAC-2025-004",
    id_entreprise: "ENTR-001",
    id_client: "CLI-004",
    date: "2025-09-12",
    due_date: "2025-09-27",
    items: [
      { designation: "Maintenance trimestrielle", qte: 1, pu: 210000 }
    ],
    total_ht: 210000,
    tva: 21000,
    total_ttc: 231000,
    statut: "brouillon",
    pdf_url: ""
  },
  {
    id_facture: "FAC-2025-005",
    id_entreprise: "ENTR-001",
    id_client: "CLI-002",
    date: "2025-09-18",
    due_date: "2025-10-03",
    items: [
      { designation: "Support applicatif", qte: 1, pu: 330000 }
    ],
    total_ht: 330000,
    tva: 33000,
    total_ttc: 363000,
    statut: "envoye",
    pdf_url: ""
  },
  {
    id_facture: "FAC-2025-006",
    id_entreprise: "ENTR-001",
    id_client: "CLI-003",
    date: "2025-09-25",
    due_date: "2025-10-10",
    items: [
      { designation: "Pack CRM", qte: 1, pu: 285000 }
    ],
    total_ht: 285000,
    tva: 28500,
    total_ttc: 313500,
    statut: "brouillon",
    pdf_url: ""
  }
];

const reglements = [
  { id_regl: "REG-2025-001", id_facture: "FAC-2025-001", date_paiement: "2025-09-10", montant: 495000, mode_paiement: "virement" },
  { id_regl: "REG-2025-002", id_facture: "FAC-2025-002", date_paiement: "2025-09-22", montant: 352000, mode_paiement: "virement" },
  { id_regl: "REG-2025-003", id_facture: "FAC-2025-003", date_paiement: "2025-09-30", montant: 302500, mode_paiement: "carte" },
  { id_regl: "REG-2025-004", id_facture: "FAC-2025-005", date_paiement: "2025-10-05", montant: 363000, mode_paiement: "virement" }
];

const rapports = [
  {
    id_rapport: "RAP-2025-08",
    periode: "2025-08",
    resume_txt: "Les ventes progressent de 8% par rapport au mois précédent. Les dépenses marketing augmentent suite à la campagne WhatsApp. Focus à maintenir sur le recouvrement client.",
    pdf_url: ""
  }
];

const payloads = [
  { name: "T_Entreprises", data: entreprise },
  { name: "T_Tiers", data: tiers },
  { name: "T_Mouvements", data: mouvements },
  { name: "T_Factures", data: factures },
  { name: "T_Reglements", data: reglements },
  { name: "T_Rapports", data: rapports }
];

for (const { name, data } of payloads) {
  const filePath = path.join(seedDir, `${name}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const demoRun = {
  generated_at: new Date().toISOString(),
  entreprise: entreprise.length,
  tiers: tiers.length,
  mouvements: mouvements.length,
  factures: factures.length,
  reglements: reglements.length,
  rapports: rapports.length,
  notes: "Données FDJ de démonstration générées pour Compta-Auto PME."
};

await fs.promises.writeFile(path.join(demoDir, "demo_run.json"), JSON.stringify(demoRun, null, 2), "utf-8");

console.log("✅ Données de démonstration générées.");
