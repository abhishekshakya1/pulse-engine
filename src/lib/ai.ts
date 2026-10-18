import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in environment variables.");
}

// Google GenAI client instance
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Primary ultra-fast high-capacity SRE Model (<2.5s latency, 0% congestion)
export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Secondary fallback model
export const FALLBACK_AI_MODEL = "gemini-3.5-flash";
