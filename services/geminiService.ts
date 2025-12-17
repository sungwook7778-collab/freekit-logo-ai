import { LogoFormData } from "../types";

export const generateLogoImages = async (data: LogoFormData): Promise<string[]> => {
  try {
    const response = await fetch('/api/generate-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: data.businessName,
        cuisine: data.cuisine,
        additionalDetails: data.additionalDetails,
        referenceImage: data.referenceImage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '로고 생성에 실패했습니다.');
    }

    const result = await response.json();
    
    if (!Array.isArray(result.images) || result.images.length === 0) {
      throw new Error("이미지를 생성하지 못했습니다. 다시 시도해주세요.");
    }

    return result.images as string[];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
