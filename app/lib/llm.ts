"use server";
import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { TextAnalysisSchema, ImageAnalysisSchema, DashboardInsightsSchema } from '../types/openai';
import { type TextAnalysis, type ImageAnalysis, type DashboardInsights } from '../types/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to clean OpenAI response
function cleanJsonResponse(response: string): string {
  console.log('Original response:', response);
  
  // Remove markdown code block syntax if present
  const cleaned = response
    .replace(/^```json\n?/, '') // Remove leading ```json\n
    .replace(/\n?```$/, '')     // Remove trailing \n```
    .replace(/^```\n?/, '')     // Also try without 'json'
    .trim();                    // Remove any leading/trailing whitespace
  
  console.log('Cleaned response:', cleaned);
  return cleaned;
}

function safeJsonParse(str: string) {
  try {
    console.log('Attempting to parse:', str);
    const parsed = JSON.parse(str);
    console.log('Successfully parsed:', parsed);
    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Failed to parse string:', str);
    console.error('String length:', str.length);
    console.error('First 100 characters:', str.substring(0, 100));
    console.error('Last 100 characters:', str.substring(str.length - 100));
    throw error;
  }
}

export async function analyzeText(content: string): Promise<TextAnalysis> {
  try {
    console.log('Analyzing text:', content.substring(0, 100));
    
    const prompt = `Analyze the following text and provide a structured output:
Text: "${content}"
Important: Return only the JSON object without markdown formatting.`;

    console.log('Sending prompt to OpenAI');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });

    console.log('Received response from OpenAI');
    const rawResponse = completion.choices[0].message.content || "{}";
    console.log('Raw response:', rawResponse);

    const cleanedResponse = cleanJsonResponse(rawResponse);
    const parsedResponse = safeJsonParse(cleanedResponse);
    
    return parsedResponse as TextAnalysis;
  } catch (error) {
    console.error('Error in analyzeText:', error);
    throw error;
  }
}

export async function analyzeImage(imageData: string): Promise<ImageAnalysis> {
  try {
    console.log('Analyzing image data');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and provide a structured response. Important: Return only the JSON object without markdown formatting." },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log('Received image analysis response');
    const rawResponse = completion.choices[0].message.content || "{}";
    console.log('Raw response:', rawResponse);

    const cleanedResponse = cleanJsonResponse(rawResponse);
    const parsedResponse = safeJsonParse(cleanedResponse);
    
    return parsedResponse as ImageAnalysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export async function generateDashboardInsights(data: any): Promise<DashboardInsights> {
  try {
    console.log('Generating insights for dashboard data');
    const prompt = `Analyze this dashboard data and generate insights:
${JSON.stringify(data, null, 2)}
Important: Return only the JSON object without markdown formatting.`;

    console.log('Sending insights request to OpenAI');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });

    console.log('Received insights response');
    const rawResponse = completion.choices[0].message.content || "{}";
    console.log('Raw response:', rawResponse);

    const cleanedResponse = cleanJsonResponse(rawResponse);
    const parsedResponse = safeJsonParse(cleanedResponse);
    
    return parsedResponse as DashboardInsights;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}
