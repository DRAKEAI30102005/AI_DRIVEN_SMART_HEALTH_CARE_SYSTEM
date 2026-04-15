import {GoogleGenAI} from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({apiKey});

export async function diagnoseImage(base64Image: string, type: 'skin' | 'dental') {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const model = 'gemini-3-flash-preview';
  const prompt =
    type === 'skin'
      ? 'Analyze this skin image for potential issues. Provide a brief description, potential concerns, and a recommendation to see a specialist if needed. Format as a clear medical summary.'
      : 'Analyze this dental image for potential issues like cavities, gum disease, or misalignment. Provide a brief description and recommendation. Format as a clear dental summary.';
  const [header = 'data:image/jpeg;base64', data = ''] = base64Image.split(',');
  const mimeTypeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            {text: prompt},
            {inlineData: {data, mimeType}},
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error('AI Diagnosis failed:', error);
    throw error;
  }
}
