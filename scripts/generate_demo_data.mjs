import fs from 'fs';
import path from 'path';

const OUTPUT_DIR_AIRTABLE = path.resolve('infra/airtable');
const OUTPUT_DIR_DEMO = path.resolve('infra/demo');

if (!fs.existsSync(OUTPUT_DIR_DEMO)) {
  fs.mkdirSync(OUTPUT_DIR_DEMO, { recursive: true });
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20240530);

function pick(array) {
  return array[Math.floor(rng() * array.length)];
}

function roundTo(value, step = 500) {
  return Math.round(value / step) * step;
}

const companyId = 'ENTREPRISE_DEMO';
const devise = 'FDJ';

const paymentModes = ['cash', 'mobile_money', 'carte', 'virement'];

const clients = [
  { id: 'CLIENT001', nom: 'Marché Central' },
  { id: 'CLIENT002', nom: 'Bistro Nomade' },
  { id: 'CLIENT003', nom: 'Coopérative Soleil' },
  { id: 'CLIENT004', nom: 'Clinique Wadajir' },
  { id: 'CLIENT005', nom: 'Station Horizon' }
];

const suppliers = [
  { id: 'FOUR001', nom: 'Djibouti Energie' },
  { id: 'FOUR002', nom: 'Transports Marins' },
  { id: 'FOUR003', nom: 'Papeterie La plume' },
  { id: 'FOUR004', nom: 'ComTech Telecom' },
  { id: 'FOUR005', nom: 'Impression Express' }
];

const saleTemplates = [
  {
    categorie: 'Ventes-Produits',
    description: 'Livraison panier gourmand',
    montantRange: [45000, 125000]
  },
  {
    categorie: 'Ventes-Services',
    description: 'Installation système POS',
    montantRange: [60000, 180000]
  },
  {
    categorie: 'Ventes-Services',
    description: 'Formation équipe client',
    montantRange: [35000, 90000]
  },
  {
    categorie: 'Ventes-Produits',
    description: 'Commande coffrets cadeaux',
    montantRange: [30000, 78000]
  },
  {
    categorie: 'Ventes-Produits',
    description: 'Fourniture pièces détachées',
    montantRange: [50000, 110000]
  }
];

const expenseTemplates = [
  {
    categorie: 'Fournitures',
    description: 'Achat consommables bureau',
    montantRange: [12000, 38000]
  },
  {
    categorie: 'Transport',
    description: 'Logistique livraison régionale',
    montantRange: [18000, 64000]
  },
  {
    categorie: 'Telecom-Internet',
    description: 'Abonnement internet fibre',
    montantRange: [25000, 35000]
  },
  {
    categorie: 'Energie',
    description: 'Facture électricité mensuelle',
    montantRange: [28000, 52000]
  },
  {
    categorie: 'Marketing',
    description: 'Campagne réseaux sociaux',
    montantRange: [20000, 45000]
  }
];

const months = [
  { label: '2025-01', days: 31 },
  { label: '2025-02', days: 28 },
  { label: '2025-03', days: 31 }
];

let counter = 1;

function formatId(index) {
  return `MVT${index.toString().padStart(4, '0')}`;
}

function makeDate(month, day) {
  const [year, monthNumber] = month.label.split('-');
  return `${year}-${monthNumber}-${day.toString().padStart(2, '0')}`;
}

function makeMovement({ month, type }) {
  const template = type === 'vente' ? pick(saleTemplates) : pick(expenseTemplates);
  const [min, max] = template.montantRange;
  const montant = roundTo(min + (max - min) * rng(), 500);
  const jour = 1 + Math.floor(rng() * (month.days - 2));
  const id = formatId(counter++);
  const tier = type === 'vente' ? pick(clients) : pick(suppliers);
  const description = `${template.description} (${month.label})`;
  const confidenceBase = type === 'vente' ? 0.82 : 0.78;
  const confidenceVariance = rng() * 0.15;
  const confidence = Math.min(0.98, Math.max(0.58, confidenceBase + confidenceVariance));
  const statut = confidence >= 0.7 ? 'valide' : 'brouillon';

  return {
    id_mvt: id,
    id_entreprise: companyId,
    date: makeDate(month, jour),
    type,
    montant: Math.round(montant),
    devise,
    mode_paiement: pick(paymentModes),
    id_tier: tier.id,
    categorie: template.categorie,
    description,
    ai_confiance: Number(confidence.toFixed(2)),
    statut,
    source: 'demo-script',
    commentaire: confidence < 0.7 ? 'Vérification humaine recommandée' : 'OK auto'
  };
}

const movements = [];

months.forEach((month) => {
  for (let i = 0; i < 3; i += 1) {
    movements.push(makeMovement({ month, type: 'vente' }));
    movements.push(makeMovement({ month, type: 'depense' }));
  }
});

movements.sort((a, b) => a.date.localeCompare(b.date));

function computeMonthlySummary(data) {
  const summary = new Map();
  data.forEach((item) => {
    const monthKey = item.date.slice(0, 7);
    if (!summary.has(monthKey)) {
      summary.set(monthKey, {
        month: monthKey,
        ventes: 0,
        depenses: 0,
        categoriesDepenses: {}
      });
    }
    const bucket = summary.get(monthKey);
    if (item.type === 'vente') {
      bucket.ventes += item.montant;
    } else {
      bucket.depenses += item.montant;
      const key = item.categorie;
      bucket.categoriesDepenses[key] = (bucket.categoriesDepenses[key] || 0) + item.montant;
    }
  });

  return Array.from(summary.values()).map((entry) => {
    const topCategories = Object.entries(entry.categoriesDepenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categorie, montant]) => ({ categorie, montant }));
    return {
      month: entry.month,
      total_ventes: entry.ventes,
      total_depenses: entry.depenses,
      solde: entry.ventes - entry.depenses,
      top_depenses: topCategories
    };
  });
}

const monthlySummary = computeMonthlySummary(movements);

const invoicePreview = {
  id_facture: 'FAC-2025-031',
  entreprise: {
    nom: 'PME Alpha',
    devise: 'FDJ',
    tva: 0.1
  },
  client: {
    nom: clients[0].nom,
    email: 'contact@marche-central.dj'
  },
  items: [
    { designation: 'Installation système POS', qte: 1, pu: 165000 },
    { designation: 'Formation équipe client', qte: 1, pu: 68000 }
  ],
  date: '2025-03-12',
  due_date: '2025-03-27'
};

const totalHT = invoicePreview.items.reduce((sum, item) => sum + item.qte * item.pu, 0);
const totalTVA = Math.round(totalHT * invoicePreview.entreprise.tva);
const totalTTC = totalHT + totalTVA;

const reportPreview = {
  resume: `En mars 2025, le chiffre d'affaires atteint ${totalHT} ${devise} pour trois contrats majeurs, tandis que les dépenses restent maîtrisées grâce à une réduction de 12% des frais logistiques. La marge opérationnelle progresse de 7 points vs février et le flux de trésorerie reste positif. Les postes marketing et énergie demeurent sous contrôle, mais la connexion fibre a connu deux incidents signalés par l'équipe terrain. Les encaissements clients sont conformes aux échéances et aucun retard critique n'est recensé, ce qui sécurise la clôture du trimestre.`,
  actions: [
    'Planifier une maintenance préventive pour la connexion fibre',
    'Lancer une relance commerciale auprès des clients de février',
    'Valider les budgets marketing du prochain trimestre'
  ]
};

const csvHeader = 'id_mvt,id_entreprise,date,type,montant,devise,mode_paiement,id_tier,categorie,description,ai_confiance,statut,source,commentaire';
const csvLines = movements.map((row) => [
  row.id_mvt,
  row.id_entreprise,
  row.date,
  row.type,
  row.montant,
  row.devise,
  row.mode_paiement,
  row.id_tier,
  row.categorie,
  row.description,
  row.ai_confiance,
  row.statut,
  row.source,
  row.commentaire
].join(','));

const csvContent = [csvHeader, ...csvLines].join('\n');

fs.writeFileSync(path.join(OUTPUT_DIR_AIRTABLE, 'sample_data_generated.csv'), csvContent, 'utf-8');

const demoPayload = {
  generated_at: new Date().toISOString(),
  movements,
  monthly_summary: monthlySummary,
  invoice_preview: {
    ...invoicePreview,
    total_ht: totalHT,
    total_tva: totalTVA,
    total_ttc: totalTTC
  },
  report_preview: reportPreview
};

fs.writeFileSync(path.join(OUTPUT_DIR_DEMO, 'demo_run.json'), JSON.stringify(demoPayload, null, 2), 'utf-8');

console.log('✅ Jeu de données de démonstration généré :');
console.log(`- infra/airtable/sample_data_generated.csv (${movements.length} mouvements)`);
console.log('- infra/demo/demo_run.json (résumé complet)');
