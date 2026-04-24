/**
 * Gemini API Helper Module
 * 
 * Handles communication with Google's Gemini AI API.
 * Used by /api/analyze to generate assignment feedback.
 * 
 * @author Danial
 * @week Week 3 - Prompt Engineering & Error Handling
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends a prompt to Gemini and returns the response text
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The AI response text
 */
export async function callGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}