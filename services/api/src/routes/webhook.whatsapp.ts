import { Router } from 'express';
import axios from 'axios';
import { extractTextFromImage } from '../lib/ocr.js';
import { createDraftMovement, updateMovementClassification } from '../lib/airtable.js';
import { callClassification } from './ai.classify.js';

const routerInternal = Router();

routerInternal.get('/', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'verify_me';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Verification failed');
});

routerInternal.post('/', async (req, res) => {
  try {
    const entries = req.body?.entry;
    if (!Array.isArray(entries)) {
      return res.sendStatus(200);
    }

    for (const entry of entries) {
      const changes = entry?.changes;
      if (!Array.isArray(changes)) continue;
      for (const change of changes) {
        const messages = change?.value?.messages;
        if (!Array.isArray(messages)) continue;
        for (const message of messages) {
          await handleIncomingMessage(message, change?.value?.metadata);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('[whatsapp] error', error);
    res.sendStatus(500);
  }
});

async function handleIncomingMessage(message: any, metadata: any) {
  const defaultCompanyId = process.env.AIRTABLE_DEFAULT_COMPANY_ID || 'ENTREPRISE_DEMO';
  const defaultCurrency = process.env.DEFAULT_CURRENCY || 'FDJ';
  const phone = metadata?.display_phone_number || 'whatsapp';

  let description = '';
  let attachmentUrl: string | undefined;
  if (message.type === 'text') {
    description = message.text?.body || '';
  } else if (message.type === 'image') {
    const imageId = message.image?.id;
    const imageLink = message.image?.link;
    let imageUrl = imageLink;
    if (!imageUrl && imageId && process.env.WHATSAPP_TOKEN) {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${imageId}`, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
      });
      imageUrl = response.data?.url;
    }
    if (imageUrl) {
      attachmentUrl = imageUrl;
      const ocrText = await extractTextFromImage(imageUrl);
      description = ocrText;
    }
  }

  if (!description) {
    console.warn('[whatsapp] message sans description');
    return;
  }

  const movement = await createDraftMovement({
    id_entreprise: defaultCompanyId,
    date: new Date().toISOString().slice(0, 10),
    type: 'depense',
    montant: 0,
    devise: defaultCurrency,
    description,
    piece_jointe_url: attachmentUrl,
    source: 'whatsapp',
    statut: 'brouillon'
  });

  const classification = await callClassification({
    description,
    montant: 0,
    type: 'depense',
    devise: defaultCurrency,
    date: new Date().toISOString().slice(0, 10),
    tier: phone
  });

  const statut = classification.score_confiance < 0.7 ? 'brouillon' : 'valide';
  await updateMovementClassification(movement.id, { ...classification, statut });
}

export { routerInternal as router };
