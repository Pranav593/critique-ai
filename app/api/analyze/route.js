import { NextResponse } from "next/server";
import { callGemini } from "../../../lib/gemini";

// Helper function to parse JSON from Gemini response
function parseGeminiResponse(response) {
  // Clean markdown formatting if present
  const cleanedResponse = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);
}

// Retry wrapper for Gemini calls
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await callGemini(prompt);
      const parsed = parseGeminiResponse(response);

      // Validate the response structure
      if (!parsed.scores || !parsed.feedback) {
        throw new Error("Response missing required fields (scores or feedback)");
      }

      return parsed;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      lastError = error;

      // If it's not the last attempt, wait a bit before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}

export async function POST(req) {
  try {
    // Check if request body exists
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please send valid JSON." },
        { status: 400 }
      );
    }

    const { text, context } = body;

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: "The 'text' field is required." },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "The 'text' field must be a non-empty string." },
        { status: 400 }
      );
    }

    // Check if text is too short to analyze meaningfully
    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "The assignment text is too short to analyze. Please provide more content." },
        { status: 400 }
      );
    }

    // Improved AI Prompt Structure
    const prompt = `You are an academic feedback assistant helping students improve their writing.

ASSIGNMENT TEXT:
"""
${text}
"""

RUBRIC / CONTEXT:
"""
${context || "Provide general academic feedback focusing on clarity, structure, evidence, and depth of analysis."}
"""

INSTRUCTIONS:
1. Analyze the assignment based on the rubric/context provided
2. Score each category from 0-10 where:
   - 0-3: Needs significant improvement
   - 4-6: Satisfactory but could be better
   - 7-8: Good work with minor improvements needed
   - 9-10: Excellent work
3. Provide 3-5 specific, actionable feedback points
4. Focus on what the student should IMPROVE, not what they did well
5. Be constructive and encouraging in tone

RESPOND WITH ONLY THIS JSON FORMAT (no other text):
{
  "scores": {
    "clarity": <number 0-10>,
    "structure": <number 0-10>,
    "evidence": <number 0-10>,
    "depth": <number 0-10>
  },
  "feedback": [
    "<specific actionable improvement>",
    "<specific actionable improvement>",
    "<specific actionable improvement>"
  ]
}`;

    // Call Gemini with retry mechanism
    const parsedData = await callGeminiWithRetry(prompt);

    // Validate score values are numbers between 0-10
    const { scores } = parsedData;
    const scoreFields = ["clarity", "structure", "evidence", "depth"];
    
    for (const field of scoreFields) {
      if (typeof scores[field] !== "number" || scores[field] < 0 || scores[field] > 10) {
        return NextResponse.json(
          { error: "AI returned invalid scores. Please try again." },
          { status: 500 }
        );
      }
    }

    // Validate feedback is an array with at least one item
    if (!Array.isArray(parsedData.feedback) || parsedData.feedback.length === 0) {
      return NextResponse.json(
        { error: "AI returned invalid feedback. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error) {
    console.error("Error in /api/analyze:", error);

    // Provide specific error messages based on error type
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return NextResponse.json(
        { error: "AI service is temporarily busy. Please try again in a moment." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze the assignment after multiple attempts. Please try again." },
      { status: 500 }
    );
  }
}