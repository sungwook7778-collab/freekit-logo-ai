import { GoogleGenAI } from "@google/genai";

interface LogoFormData {
  businessName: string;
  cuisine: string;
  additionalDetails: string;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const data: LogoFormData = await request.json();

    if (!data.businessName) {
      return new Response(JSON.stringify({ error: '상호명을 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API 키가 설정되지 않았습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    // Extract the image from the response
    let imageData = '';
    let mimeType = 'image/png';

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data || '';
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!imageData) {
      return new Response(JSON.stringify({ error: '이미지를 생성하지 못했습니다. 다시 시도해주세요.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      imageUrl: `data:${mimeType};base64,${imageData}` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: '로고 생성 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

