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

    // 다양한 스타일 목록 (랜덤 3개 추출)
    const styleVariations = [
      { style: 'Flat Minimal', colors: 'pastel colors', description: 'flat vector, minimalist, clean lines, pastel palette' },
      { style: 'Warm Pastel', colors: 'soft pastel palette', description: 'warm friendly, hand-drawn feel' },
      { style: 'Watercolor', colors: 'soft gradients', description: 'watercolor wash, soft blended tones' },
      { style: 'Pastel Crayon', colors: 'pastel chalk', description: 'crayon texture, soft edges' },
      { style: 'Pencil Sketch', colors: 'graphite gray', description: 'pencil sketch, clean line art' },
      { style: 'Charcoal', colors: 'charcoal gray', description: 'charcoal drawing, textured strokes' },
      { style: 'Anime', colors: 'vibrant', description: 'anime style, cel shading' },
      { style: 'Cartoon', colors: 'bold bright', description: 'cartoon, bold outlines' },
      { style: 'Pixel Art', colors: '8-bit palette', description: 'pixel art' },
      { style: 'Low Poly', colors: 'pastel poly', description: 'low poly, faceted shapes' },
      { style: 'Clay Render', colors: 'soft clay', description: 'clay render, smooth soft shadows' },
      { style: 'Paper Cut', colors: 'paper off-white', description: 'paper cut style, layered paper' },
      { style: 'Isometric', colors: 'soft tech', description: 'isometric view, geometric blocks' },
      { style: 'Blueprint', colors: 'blue/white', description: 'blueprint style, technical lines' },
      { style: 'Cinematic', colors: 'film still tones', description: 'cinematic lighting, film still' },
      { style: 'Neon Cyberpunk', colors: 'neon magenta/cyan', description: 'neon cyberpunk, vaporwave' },
    ];

    const selectedStyles = [...styleVariations]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 3개의 이미지를 병렬로 생성
    const imagePromises = selectedStyles.map(async (variation) => {
      const prompt = `
        Design a minimalist logo for a small business.

        ⚠️ CRITICAL TEXT REQUIREMENT:
        - The logo MUST include the business name "${data.businessName}" as readable text
        - Spelling must be EXACTLY: "${data.businessName}"
        - Text should be clean, legible, and well-integrated with the symbol
        - Use a modern, friendly font style
        - Text MUST contain only the business name (no category, no extra words)

        STYLE: ${variation.style}
        - Colors: ${variation.colors}
        - Aesthetic: ${variation.description}
        - Feel: Warm, friendly, approachable, human-made quality (NOT AI-generated looking)

        DESIGN SPECIFICATIONS:
        1. **Type**: Combination mark - Simple symbol/icon WITH the business name text
        2. **Layout**: Symbol above or beside the text "${data.businessName}"
        3. **Shape**: Clean geometric shapes, smooth curves, balanced composition
        4. **Complexity**: Simple and memorable - easy to recognize
        5. **Background**: Solid pastel or soft cream/white background
        6. **NO**: Heavy gradients, 3D effects, shadows, complex details, photorealistic elements
        7. Symbol can reflect category/theme: ${data.cuisine}, but do NOT write category text

        BUSINESS CONTEXT:
        - Business Name: ${data.businessName}
        - Category (for symbol inspiration only, not for text): ${data.cuisine}
        - Special Request: ${data.additionalDetails || 'None'}

        Create a logo with both a symbol AND the text "${data.businessName}".
        The result should look like it was designed by a professional human designer.
      `;

      try {
        // 텍스트 + (선택) 이미지 파트 구성
        const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [
          { text: prompt },
        ];

        if (data.referenceImage) {
          const match = data.referenceImage.match(/^data:(.*);base64,(.*)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType,
              },
            });
          }
        }

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
                  parts,
                },
              ],
              generationConfig: {
                responseModalities: ['image', 'text'],
              },
            }),
          }
        );

        if (!response.ok) {
          console.error('Gemini API Error for style:', variation.style);
          return null;
        }

        const result = await response.json();

        if (result.candidates && result.candidates[0]?.content?.parts) {
          for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              return `data:${mimeType};base64,${part.inlineData.data}`;
            }
          }
        }
        return null;
      } catch (error) {
        console.error('Error generating image for style:', variation.style, error);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    const validImages = images.filter((img): img is string => img !== null);

    if (validImages.length === 0) {
      return res.status(500).json({ error: '이미지를 생성하지 못했습니다. 다시 시도해주세요.' });
    }

    return res.status(200).json({
      images: validImages,
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: '로고 생성 중 오류가 발생했습니다.' });
  }
}
