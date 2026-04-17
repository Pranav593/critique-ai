import { NextResponse } from "next/server";
import { callGemini } from "../../../lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, context } = body;

    if (!text) {
      return NextResponse.json(
        { error: "The 'text' field is required." },
        { status: 400 }
      );
    }

    // AI Prompt Structure
    const prompt = `You are an academic feedback assistant.

Assignment: ${text}
Rubric / Context: ${context || "Provide general academic feedback"}

Return ONLY a valid JSON object with no extra text:
{
  "scores": {
    "clarity": 0-10,
    "structure": 0-10,
    "evidence": 0-10,
    "depth": 0-10
  },
  "feedback": [
    "specific thing to improve",
    "specific thing to improve"
  ]
}

Do not rewrite anything. Only tell the student what to improve.`;

    const geminiResponse = await callGemini(prompt);
    
    // Parse the JSON response
    let parsedData;
    try {
      // Clean the response just in case the model returns markdown formatting like ```json ... ```
      const cleanedResponse = geminiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
        
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", geminiResponse);
      return NextResponse.json(
        { error: "Received an invalid format from the AI. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Could not process your request." },
      { status: 500 }
    );
  }
}
