'use server';

import OpenAI from 'openai';
import { unstable_noStore as noStore } from 'next/cache';
import { type TextAnalysis, type ImageAnalysis, type DashboardInsights } from '../types/openai';

// Debug helper
function debugLog(stage: string, data: any) {
  console.log(`[${stage}]`, JSON.stringify(data, null, 2));
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeText(content: string): Promise<TextAnalysis> {
  noStore();
  try {
    debugLog('Input', { content: content.substring(0, 100) });

    const systemPrompt = `You are a text analysis assistant that provides structured analysis in JSON format.
The response should include:
{
  "sentiment": {
    "score": number between -1 and 1,
    "label": "positive", "negative", or "neutral"
  },
  "keywords": array of important keywords,
  "categories": array of relevant categories,
  "summary": brief summary of the text
}`;

    const userPrompt = `Analyze this text: "${content}"`;

    debugLog('Prompts', { system: systemPrompt, user: userPrompt });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    debugLog('Raw Response', completion.choices[0].message);
    
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(response) as TextAnalysis;
    debugLog('Parsed Result', result);
    
    return result;
  } catch (error) {
    console.error('Error in analyzeText:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function analyzeImage(imageData: string): Promise<ImageAnalysis> {
  noStore();
  try {
    debugLog('Input', { imageUrl: imageData.substring(0, 50) + '...' });

    const systemPrompt = `You are an image analysis assistant that provides structured analysis in JSON format.
The response should include:
{
  "labels": array of detected labels,
  "objects": array of detected objects,
  "description": detailed description,
  "confidence": confidence score between 0 and 1,
  "dominantColors": array of dominant colors
}`;

    debugLog('System Prompt', systemPrompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image." },
            {
              type: "image_url",
              image_url: { url: imageData }
            }
          ],
        }
      ],
    });

    debugLog('Raw Response', completion.choices[0].message);
    
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(response) as ImageAnalysis;
    debugLog('Parsed Result', result);
    
    return result;
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function generateInsights(data: any): Promise<DashboardInsights> {
  noStore();
  try {
    debugLog('Input Data', data);

    const systemPrompt = `You are a dashboard insights assistant that provides structured analysis in JSON format.
The response should include:
{
  "patterns": array of identified patterns,
  "themes": array of common themes,
  "correlations": array of notable correlations,
  "recommendations": array of actionable recommendations
}`;

    const userPrompt = `Generate insights from this dashboard data:
${JSON.stringify(data, null, 2)}`;

    debugLog('Prompts', { system: systemPrompt, user: userPrompt });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    debugLog('Raw Response', completion.choices[0].message);
    
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(response) as DashboardInsights;
    debugLog('Parsed Result', result);
    
    return result;
  } catch (error) {
    console.error('Error in generateInsights:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}
