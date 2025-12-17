import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LogoFormData {
  businessName: string;
  cuisine: string;
  additionalDetails: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: LogoFormData = req.body;

    if (!data.businessName) {
      return res.status(400).json({ error: '상호명을 입력해주세요.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }

    const prompt = `
      Design a minimalist symbol/icon logo for a small business.

      STYLE REQUIREMENTS:
      - Style: Flat design, geometric, hand-crafted feel (NOT AI-generated looking)
      - Colors: Soft PASTEL color palette (mint, peach, lavender, soft coral, baby blue, cream)
      - Aesthetic: Scandinavian minimalism, boutique bakery style, indie brand vibes
      - Feel: Warm, friendly, approachable, human-made quality

      DESIGN SPECIFICATIONS:
      1. **Type**: Simple SYMBOL/ICON only (minimal or no text)
      2. **Shape**: Clean geometric shapes, smooth curves, balanced composition
      3. **Complexity**: Very simple - could be drawn with few strokes
      4. **Background**: Solid pastel or soft cream/white background
      5. **NO**: Gradients, 3D effects, shadows, complex details, photorealistic elements

      INSPIRATION:
      - Think: Dribbble top logos, Japanese minimal design, Nordic branding
      - Reference: Simple icons like Apple, Airbnb, but softer and more playful

      BUSINESS CONTEXT:
      - Business Name: ${data.businessName}
      - Category: ${data.cuisine}
      - Special Request: ${data.additionalDetails || 'None'}

      Create a symbol that captures the essence of "${data.businessName}" in the "${data.cuisine}" industry.
      The result should look like it was designed by a professional human designer at a boutique agency.
    `;

    // Gemini API 직접 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['image', 'text'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.status(500).json({ error: '이미지 생성 API 호출 실패' });
    }

    const result = await response.json();

    // Extract the image from the response
    let imageData = '';
    let mimeType = 'image/png';

    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data || '';
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!imageData) {
      return res.status(500).json({ error: '이미지를 생성하지 못했습니다. 다시 시도해주세요.' });
    }

    return res.status(200).json({
      imageUrl: `data:${mimeType};base64,${imageData}`,
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: '로고 생성 중 오류가 발생했습니다.' });
  }
}
