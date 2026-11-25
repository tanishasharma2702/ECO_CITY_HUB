// Supabase Edge Function: Carbon Recommendations
// Deno TypeScript runtime
// Calls Google Gemini API securely server-side using GEMINI_API_KEY secret

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

    const { totalEmissions, transportEmissions = 0, electricityEmissions = 0, foodEmissions = 0, details = {}, language = "en" } = body || {};

    if (totalEmissions === undefined || totalEmissions === null) {
      return new Response(
        JSON.stringify({ error: "Missing required field: totalEmissions." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Retrieve API key securely from server-side secrets
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
Act as an environmental scientist and sustainability engineering expert.
Analyze this user's monthly carbon footprint calculated using standard IPCC emission factors:
- Total Emissions: ${totalEmissions} kg CO2e / month
- Transport Emissions: ${transportEmissions} kg CO2e
- Electricity Emissions: ${electricityEmissions} kg CO2e
- Food / Diet Emissions: ${foodEmissions} kg CO2e
- Context: Car km/wk: ${details?.carKm || 0}, Bike km/wk: ${details?.bikeKm || 0}, Transit km/wk: ${details?.transitKm || 0}, Electricity: ${details?.electricityKwh || 0} kWh/mo, Diet: ${details?.dietType || 'mixed'}.

Target Language: ${isHindi ? "Hindi (Devanagari script)" : "English"}.
${isHindi ? "CRITICAL: Return ALL string values strictly in pure, fluent Hindi (Devanagari script). Do not output English words." : ""}

Format the response strictly as a JSON object matching this schema:
{
  "summary": "Clear, encouraging explanation of their current footprint and primary driver",
  "highEmissionActivities": ["Top contributor 1", "Top contributor 2"],
  "personalizedTips": [
    {"action": "Action title", "impact": "Estimated CO2 reduction e.g. -25 kg CO2e/mo", "practicalStep": "Concrete realistic everyday habit change"},
    {"action": "Action title", "impact": "Estimated CO2 reduction e.g. -15 kg CO2e/mo", "practicalStep": "Concrete realistic everyday habit change"},
    {"action": "Action title", "impact": "Estimated CO2 reduction e.g. -10 kg CO2e/mo", "practicalStep": "Concrete realistic everyday habit change"}
  ],
  "longTermGoal": "Motivating realistic milestone for the next 90 days",
  "greenScoreBonusTip": "Specific civic action or challenge recommendation to earn Green Score points"
}
Output only raw JSON without markdown code fences.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({
          error: "Upstream Gemini API error",
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
