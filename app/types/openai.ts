import { z } from "zod";
// Text Analysis Schema
export const TextAnalysisSchema = z.object({
  sentiment: z.object({
    score: z.number(),
    label: z.string(),
  }),
  keywords: z.array(z.string()),
  categories: z.array(z.string()),
  summary: z.string(),
});

// Image Analysis Schema
export const ImageAnalysisSchema = z.object({
  labels: z.array(z.string()),
  objects: z.array(z.string()),
  description: z.string(),
  confidence: z.number(),
  dominantColors: z.array(z.string()),
});

// Dashboard Insights Schema
export const DashboardInsightsSchema = z.object({
  patterns: z.array(z.string()),
  themes: z.array(z.string()),
  correlations: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type TextAnalysis = z.infer<typeof TextAnalysisSchema>;
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;
export type DashboardInsights = z.infer<typeof DashboardInsightsSchema>;
