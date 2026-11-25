// Supabase Edge Function: Civic Issue Vision Analysis
// Deno TypeScript runtime
// Calls Google Gemini 3.8 Flash Vision API securely server-side using GEMINI_API_KEY secret

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { imageBase64, mimeType = "image/jpeg", userNotes = "", location = {}, language = "en" } = body || {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid imageBase64 data in request." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sanitize base64 and extract mime type if provided as data URL
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType || "image/jpeg";
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      detectedMime = parts[0].replace("data:", "") || detectedMime;
      cleanBase64 = parts[1];
    }

    // Retrieve API key securely from server-side environment secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey || apiKey.includes("placeholder") || apiKey.includes("your_api_key")) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase Edge Function secrets.",
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const isHindi = language === "hi" || (typeof language === "string" && language.startsWith("hi"));

    const prompt = `
You are an expert municipal grievance specialist and civic infrastructure inspector.
Analyze this street or neighborhood civic infrastructure photograph carefully.
Citizen notes: "${userNotes}".
Location context: City: ${location.city || 'Local Area'}, State: ${location.state || ''}, Country: ${location.country || ''}.

Target Language: ${isHindi ? "Hindi (Devanagari script)" : "English"}.
${isHindi ? "CRITICAL: Return ALL string values strictly in pure, fluent Hindi (Devanagari script). Do not output English words." : ""}

Tasks:
1. Identify the likely civic problem (e.g., Pothole, Garbage accumulation, Water leakage, Broken streetlight, Damaged road, Overflowing drain, Illegal dumping, etc.).
2. Suggest the most appropriate category: Potholes, Garbage accumulation, Water leakage, Broken streetlights, Damaged roads, Overflowing drains, or Other civic problems.
3. Explain the visible issue clearly.
4. Estimate priority: "Low", "Medium", "High", or "Critical" (e.g. deep pothole on high-speed road, open electrical hazard, or raw sewage is High/Critical).
5. Recommend the responsible municipal department (e.g., Public Works Department / Road Maintenance, Sanitation & Solid Waste Management, Water Supply & Sewerage Board, Electricity Supply Corporation).
6. List 2 key safety or public hazards.
7. Generate a concise complaint title.
8. Generate a formal, respectful, and complete complaint letter addressed to the Municipal Commissioner / Executive Officer that the citizen can copy and submit. Include the date, subject line, description of hazard, exact location details, and a polite call for urgent resolution.

Format the response strictly as a JSON object matching this schema:
{
  "identifiedProblem": "string",
  "suggestedCategory": "Potholes" | "Garbage accumulation" | "Water leakage" | "Broken streetlights" | "Damaged roads" | "Overflowing drains" | "Other civic problems",
  "explanation": "string",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "recommendedDepartment": "string",
  "safetyHazards": ["hazard 1", "hazard 2"],
  "complaintTitle": "string",
  "formalComplaintLetter": "string (full multi-paragraph ready-to-send text)"
}
Output only raw JSON without markdown code fences.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: detectedMime,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({
          error: "Upstream Gemini Vision API error",
          status: response.status,
          details: errBody,
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let parsed = {};
    try {
      parsed = JSON.parse(rawText || "{}");
    } catch {
      const cleaned = (rawText || "").replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned || "{}");
    }

    if (!parsed || Object.keys(parsed).length === 0) {
      throw new Error("Failed to parse structured JSON from Gemini response.");
    }

    return new Response(
      JSON.stringify({ success: true, data: parsed, source: "gemini-3.8-flash" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage, fallback: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
