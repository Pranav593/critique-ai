/**
 * Gemini API Helper Module
 * 
 * @author Danial
 * @week Week 3 - Prompt Engineering & Error Handling
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends a prompt to Gemini and returns the response text
 * Includes retry logic for reliability
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<string>} - The AI response text
 */
export async function callGemini(prompt, maxRetries = 3) {
  // Validate input
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid prompt: must be a non-empty string");
  }

  // Check API key exists
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Validate response is not empty
      if (!text || text.trim().length === 0) {
        throw new Error("Gemini returned an empty response");
      }
      
      return text;
    } catch (error) {
      console.error(`Gemini API attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Don't retry on invalid API key
      if (error.message?.includes("API key")) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  
  throw new Error(`Gemini API failed after ${maxRetries} attempts: ${lastError.message}`);
}