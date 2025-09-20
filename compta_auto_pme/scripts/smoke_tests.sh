#!/usr/bin/env bash
set -e
echo "🔎 /health"
curl -s http://localhost:8080/health; echo
echo "🧠 /ai/classify"
curl -s -X POST http://localhost:8080/ai/classify -H "Content-Type: application/json" \
  -d '{"description":"Achat fournitures bureau","type":"depense","montant":25000,"devise":"FDJ","date":"2025-09-20","tier":"Fournisseur B"}'; echo
echo "📄 /pdf/invoice"
curl -s -X POST http://localhost:8080/pdf/invoice -H "Content-Type: application/json" \
  -d '{"entreprise":{"nom":"PME Alpha","devise":"FDJ","tva":0.10},"client":{"nom":"Client A","email":"client.a@example.com"},"items":[{"designation":"Produit X","qte":5,"pu":15000}],"date":"2025-09-15","due_date":"2025-09-30"}'; echo
echo "✅ Fini."
