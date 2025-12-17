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
      Create a professional logo design for a business.

      STRICT TEXT REQUIREMENT:
      The logo MUST feature the text "${data.businessName}" clearly and legibly.
      The spelling must be EXACTLY "${data.businessName}". 
      Do not duplicate characters or add pseudo-text.

      DESIGN SPECIFICATIONS:
      1. **Type**: Wordmark (Logotype) with a small symbol.
      2. **Perspective**: Flat, 2D, Head-on view. (No 3D tilt, no perspective distortion).
      3. **Style**: Minimalist, Clean, Vector Art. High contrast.
      4. **Symbol**: A simple, abstract icon representing ${data.cuisine} placed near the text. 
         - Keep the symbol simple (e.g., simple lines, geometric shapes).
      5. **Background**: Plain white or a clean, subtle paper texture.

      INPUT DATA:
      - Business Name: ${data.businessName}
      - Category: ${data.cuisine}
      - Details: ${data.additionalDetails}

      The final image should look like a finished vector asset, ready for use.
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
