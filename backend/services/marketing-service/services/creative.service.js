import { CreativeGeneration, CREATIVE_GENERATION_STATUS } from '../models/index.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { generateProductCreative } from './geminiImageService.js';
import { env } from '../../shared/config/env.js';

class AIProvider {
  constructor() {
    this._openai = null;
    this._gemini = null;
    this._groq = null;
  }

  get openai() {
    if (!this._openai && process.env.OPENAI_API_KEY) {
      try {
        this._openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      } catch (e) {
        console.warn('Failed to initialize OpenAI client:', e.message);
      }
    }
    return this._openai;
  }

  get gemini() {
    if (!this._gemini && process.env.GEMINI_API_KEY) {
      try {
        this._gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      } catch (e) {
        console.warn('Failed to initialize Gemini client:', e.message);
      }
    }
    return this._gemini;
  }

  get groq() {
    if (!this._groq && process.env.GROQ_API_KEY) {
      try {
        this._groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      } catch (e) {
        console.warn('Failed to initialize Groq client:', e.message);
      }
    }
    return this._groq;
  }

  buildImagePrompt(productName, userPrompt, previousContext) {
    return `You are a professional commercial product advertising image generator.

PRODUCT PRESERVATION:
Preserve the identity of the product: "${productName}".
Keep its shape, proportions, and recognizable design intact.

USER INSTRUCTION:
${userPrompt}

${previousContext ? `CURRENT CREATIVE CONTEXT:\nThe user is modifying an existing design. Previously they asked for: ${previousContext}\nBuild upon this context but apply the new instruction.` : ''}

Generate a professional commercial-quality image.
The user's instruction controls the requested modification.
Do not invent a wildly different product design.
Ensure the final result looks like a high-end advertisement or editorial photograph.`;
  }

  async generateImage(productName, prompt, previousPrompt, aiModel = 'dall-e-3', productImage, currentImage) {
    // 1. New Real Image-to-Image Generation (Gemini)
    if (aiModel.startsWith('gemini')) {
      if (!aiModel.includes('image')) {
        throw new Error("Selected model does not support image generation");
      }
      return await generateProductCreative({
        productImage,
        currentImage,
        userPrompt: prompt,
        modelName: aiModel
      });
    }

    // 2. Fallback / Existing DALL-E generation
    if (!this.openai) {
      throw new Error("OpenAI API key is missing or invalid. Please configure OPENAI_API_KEY in .env");
    }
    const fullPrompt = this.buildImagePrompt(productName, prompt, previousPrompt);
    const response = await this.openai.images.generate({
      model: aiModel,
      prompt: fullPrompt.substring(0, aiModel === 'dall-e-3' ? 4000 : 1000), // DALL-E 2 prompt limit is 1000
      n: 1,
      size: "1024x1024",
      ...(aiModel === 'dall-e-3' ? { quality: "standard" } : {})
    });
    return response.data[0].url;
  }

  buildVideoPrompt(productName, userPrompt, previousContext) {
    return `Create a cinematic VIDEO STORYBOARD FRAME for a professional commercial product video.

PRODUCT PRESERVATION:
Product: "${productName}".

USER REQUEST:
${userPrompt}

${previousContext ? `PREVIOUS CONTEXT: ${previousContext}` : ''}

VIDEO REQUIREMENTS:
- Smooth cinematic camera movement implied (motion blur, dynamic angle)
- Natural lighting
- Professional commercial composition
- This should look like a still frame from a high-budget video advertisement.`;
  }

  async generateVideo(productName, prompt, previousPrompt, aiModel = 'dall-e-3', productImage, currentImage) {
    if (aiModel.startsWith('gemini')) {
      if (!aiModel.includes('image') && !aiModel.includes('video')) {
         throw new Error("Selected model does not support video/image generation");
      }
      return await generateProductCreative({
        productImage,
        currentImage,
        userPrompt: this.buildVideoPrompt(productName, prompt, previousPrompt),
        modelName: aiModel
      });
    }

    if (!this.openai) {
      throw new Error("OpenAI API key is missing or invalid. Please configure OPENAI_API_KEY in .env");
    }

    const fullPrompt = this.buildVideoPrompt(productName, prompt, previousPrompt);
    const response = await this.openai.images.generate({
      model: aiModel,
      prompt: fullPrompt.substring(0, aiModel === 'dall-e-3' ? 4000 : 1000),
      n: 1,
      size: "1024x1024",
      ...(aiModel === 'dall-e-3' ? { style: "vivid" } : {})
    });
    return response.data[0].url;
  }
}

const aiProvider = new AIProvider();

export const creativeService = {
  async processChatGeneration(data) {
    const { conversationId, productId, productName, productImage, message, generationType, userId } = data;

    const generation = await CreativeGeneration.create({
      conversation_id: conversationId,
      product_id: productId,
      user_id: userId,
      type: generationType,
      prompt: message,
      reference_image_url: productImage,
      status: CREATIVE_GENERATION_STATUS.PROCESSING,
    });

    try {
      let mediaUrl;
      if (generationType === 'image') {
        mediaUrl = await aiProvider.generateImage(productName, message, null);
      } else {
        mediaUrl = await aiProvider.generateVideo(productName, message, null);
      }

      generation.generated_media_url = mediaUrl;
      generation.status = CREATIVE_GENERATION_STATUS.COMPLETED;
      await generation.save();
      
      return generation;
    } catch (error) {
      generation.status = CREATIVE_GENERATION_STATUS.FAILED;
      generation.error_message = error.message;
      await generation.save();
      throw error;
    }
  },

  async generateImage(data) {
    const { productId, productName, productImage, prompt, previousImageUrl, userId, aiModel } = data;
    
    let previousPrompt = null;
    let previousGenerationId = null;

    if (previousImageUrl) {
      const prevGen = await CreativeGeneration.findOne({ where: { generated_media_url: previousImageUrl } });
      if (prevGen) {
        previousPrompt = prevGen.prompt;
        previousGenerationId = prevGen.id;
      }
    }

    const generation = await CreativeGeneration.create({
      product_id: productId,
      user_id: userId,
      type: 'image',
      prompt,
      reference_image_url: productImage,
      previous_generation_id: previousGenerationId,
      status: CREATIVE_GENERATION_STATUS.PROCESSING,
      provider: aiModel || 'dall-e-3'
    });

    try {
      const mediaUrl = await aiProvider.generateImage(productName, prompt, previousPrompt, aiModel, productImage, previousImageUrl);
      
      generation.generated_media_url = mediaUrl;
      generation.status = CREATIVE_GENERATION_STATUS.COMPLETED;
      await generation.save();
      
      return generation;
    } catch (error) {
      generation.status = CREATIVE_GENERATION_STATUS.FAILED;
      generation.error_message = error.message;
      await generation.save();
      throw error;
    }
  },

  async generateVideo(data) {
    const { productId, productName, productImage, prompt, previousVideoUrl, userId, aiModel } = data;
    
    let previousPrompt = null;
    let previousGenerationId = null;

    if (previousVideoUrl) {
      const prevGen = await CreativeGeneration.findOne({ where: { generated_media_url: previousVideoUrl } });
      if (prevGen) {
        previousPrompt = prevGen.prompt;
        previousGenerationId = prevGen.id;
      }
    }
    
    const generation = await CreativeGeneration.create({
      product_id: productId,
      user_id: userId,
      type: 'video',
      prompt,
      reference_image_url: productImage,
      previous_generation_id: previousGenerationId,
      status: CREATIVE_GENERATION_STATUS.PROCESSING,
      provider: aiModel || 'dall-e-3'
    });

    try {
      const mediaUrl = await aiProvider.generateVideo(productName, prompt, previousPrompt, aiModel, productImage, previousVideoUrl);
      
      generation.generated_media_url = mediaUrl;
      generation.status = CREATIVE_GENERATION_STATUS.COMPLETED;
      await generation.save();
      
      return generation;
    } catch (error) {
      generation.status = CREATIVE_GENERATION_STATUS.FAILED;
      generation.error_message = error.message;
      await generation.save();
      throw error;
    }
  }
};
