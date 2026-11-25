// Supabase Edge Function: Plant Health Vision Analysis
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

    const { imageBase64, mimeType = "image/jpeg", notes = "", language = "en" } = body || {};

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
You are an expert botanical scientist and plant pathologist.
Analyze this plant leaf or whole plant photograph with high scientific precision.
Citizen notes/symptoms described: "${notes}".

Safety & Scientific Instructions:
- Do NOT present uncertain diagnoses as absolute facts.
- Include an estimated confidence percentage (e.g. 85).
- NEVER suggest unsafe, toxic, synthetic, or hazardous chemical treatments.
- Focus strictly on safe organic care, pruning, soil aeration, diluted neem oil, baking soda wash, watering adjustments, vermicompost, and natural biological remedies.
- Recommend consulting an agricultural extension officer or certified botanist for commercial crops or serious infestations.

Target Language: ${isHindi ? "Hindi (Devanagari script)" : "English"}.
${isHindi ? "CRITICAL: Return ALL string values strictly in pure, fluent Hindi (Devanagari script). Do not output English words." : ""}

Tasks:
1. Plant Identification (common name and scientific botanical name if discernable).
2. Health Status: Healthy, Mild Issue, Moderate Disease, or Severe Disease.
3. Confidence Score: number (0 to 100).
4. Likely Condition or Disease Name (or state if healthy).
5. Visible Symptoms: array of observed indicators (chlorosis, spots, wilting, curling, etc.).
6. Possible Causes: array of underlying factors (overwatering, underwatering, fungal spores, nutrient deficiency, pest activity).
7. Recommended Organic Treatment: safe, actionable non-toxic remedy.
8. Home Care Suggestions: 3 concrete daily/weekly care steps.
9. Prevention Tips: 2 long-term preventative measures.
10. Safety Disclaimer: guideline reminder to consult local agricultural experts for critical cases.

Format the response strictly as a JSON object matching this schema:
{
  "plantName": "string (Common Name and Latin Name)",
  "healthStatus": "Healthy" | "Mild Issue" | "Moderate Disease" | "Severe Disease",
  "confidenceScore": number,
  "likelyCondition": "string",
  "visibleSymptoms": ["symptom 1", "symptom 2"],
  "possibleCauses": ["cause 1", "cause 2"],
  "recommendedTreatment": "string",
  "homeCareSuggestions": ["step 1", "step 2", "step 3"],
  "preventionTips": ["tip 1", "tip 2"],
  "safetyDisclaimer": "string"
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
