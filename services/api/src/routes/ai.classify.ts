import { Router } from 'express';
import axios from 'axios';
import { buildClassificationMessages, type ClassificationInput } from '../lib/prompts.js';
import { requireAuth } from '../lib/auth.js';

interface ClassificationResponse {
  categorie: string;
  score_confiance: number;
  commentaire?: string;
}

async function callClassification(input: ClassificationInput): Promise<ClassificationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      categorie: 'Divers',
      score_confiance: 0.1,
      commentaire: 'OPENAI_API_KEY absent, classification par défaut.'
    };
  }

  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: process.env.OPENAI_MODEL_TEXT || 'gpt-5o-mini',
      input: buildClassificationMessages(input)
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const text = response.data?.output?.[0]?.content?.[0]?.text ?? '{}';
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.warn('[ai] JSON parsing error', error, text);
    return {
      categorie: 'Divers',
      score_confiance: 0.2,
      commentaire: 'Impossible de parser la réponse IA.'
    };
  }
}

export const router = Router();

router.post('/classify', requireAuth(['admin', 'comptable', 'employe']), async (req, res, next) => {
  try {
    const input = req.body as ClassificationInput;
    if (!input || !input.description || typeof input.montant !== 'number' || !input.type || !input.devise) {
      return res.status(400).json({ error: 'Payload invalide' });
    }
    const result = await callClassification(input);
    const needsReview = result.score_confiance < 0.7;
    res.json({ ...result, a_valider: needsReview });
  } catch (error) {
    next(error);
  }
});

export { callClassification };
