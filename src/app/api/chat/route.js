import { generateObject } from "ai";
import systemPrompt from "./prompt";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyAZHxzJa7wF8jFkYe3dRtm76FaQeMllT5Y",
});
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Explicitly pass the API key from GOOGLE_API_KEY
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        sections: z.array(
          z.object({
            content: z.string().describe("Detailed content for the section"),
            priorityOrder: z.number().describe("Priority order of the content"),
          })
        ),
      }),
      system: systemPrompt,
      prompt: JSON.stringify(prompt),
    });

    return NextResponse.json({ content: object });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
