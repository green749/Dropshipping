import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Downloads an image from a URL and converts it to a Base64 string and MimeType
 */
async function downloadImageAsBase64(imageUrl) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    };
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

/**
 * Saves a base64 image or buffer to the local uploads directory
 */
function saveGeneratedImage(base64Data, extension = 'png') {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `creative_${crypto.randomBytes(8).toString('hex')}_${Date.now()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  
  return `/uploads/campaigns/${fileName}`;
}

export async function generateProductCreative({
  productImage,
  currentImage,
  userPrompt,
  modelName = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image'
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({ model: modelName });

  const promptText = `
You are creating a commercial marketing creative using the supplied product image.

PRODUCT REFERENCE:
The supplied image contains the actual product that must appear in the generated creative.

PRODUCT PRESERVATION:
Preserve the actual product's:
- shape
- proportions
- colors
- branding
- logo
- material
- important design details
- recognizable appearance

USER REQUEST:
${userPrompt}

TASK:
Create a photorealistic marketing image based on the supplied product reference.
The product should naturally wear/use the exact product from the reference image.
Do not replace the product with a different item.
Do not invent a different product.
Do not ignore the user's requested scene.
Make the result visually suitable for a professional marketing campaign.
  `.trim();

  const parts = [];
  
  // 1. Add Text Prompt
  parts.push({ text: promptText });
  
  // 2. Add Product Image (Reference)
  const productImgPart = await downloadImageAsBase64(productImage);
  if (productImgPart) {
    parts.push(productImgPart);
  } else {
    throw new Error("Failed to load product reference image");
  }

  // 3. Add Current Image (if Iterative editing)
  if (currentImage) {
    // If the image is a local upload, we need to read it from disk or fetch it locally
    let currentImgPart;
    if (currentImage.startsWith('/uploads')) {
      const localPath = path.join(process.cwd(), 'public', currentImage);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).substring(1);
        currentImgPart = {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
          }
        };
      }
    } else {
      currentImgPart = await downloadImageAsBase64(currentImage);
    }
    
    if (currentImgPart) {
      parts.push(currentImgPart);
    }
  }

  console.log(`Starting real Gemini image generation with model: ${modelName}`);

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    
    // Inspect actual model response to extract the image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response candidates from Gemini");
    }

    const firstCandidate = candidates[0];
    
    // Some image generation models return the image as an inlineData part in the response
    const outputParts = firstCandidate.content?.parts || [];
    let base64Image = null;
    let mimeType = 'image/png';

    for (const part of outputParts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    // Fallback: Check if there's a text part that contains base64 directly (some experimental wrappers do this)
    if (!base64Image) {
      for (const part of outputParts) {
        if (part.text && (part.text.startsWith('iVBOR') || part.text.startsWith('/9j/'))) {
          base64Image = part.text.trim();
          break;
        }
      }
    }

    if (!base64Image) {
      console.warn("Raw Response:", JSON.stringify(firstCandidate));
      throw new Error("The AI model did not return a valid generated image.");
    }

    // Save the base64 image to persistent storage
    const extension = mimeType.split('/')[1] || 'png';
    const savedUrl = saveGeneratedImage(base64Image, extension);

    return savedUrl;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
