import axios from 'axios';

export async function extractTextFromImage(imageUrl: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[ocr] OPENAI_API_KEY missing, returning placeholder text');
    return 'Texte OCR indisponible - vérifier configuration.';
  }

  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: process.env.OPENAI_MODEL_VISION || 'gpt-5o-vision',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Lis ce ticket de caisse et retourne le texte brut.' },
            { type: 'input_image', image_url: imageUrl }
          ]
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const content = response.data?.output?.[0]?.content?.[0]?.text;
  if (!content) {
    throw new Error('Réponse OCR invalide');
  }
  return content as string;
}
