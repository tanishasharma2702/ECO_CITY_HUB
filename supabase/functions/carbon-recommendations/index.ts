// Supabase Edge Function: Carbon Recommendations
// Deno TypeScript runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { totalEmissions, transportEmissions, electricityEmissions, foodEmissions, details, language = "en" } = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase Edge Function secrets.",
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = `
Act as a sustainability and environmental engineering expert.
A user has calculated their monthly carbon footprint with deterministic calculations:
- Total Emissions: ${totalEmissions} kg CO2e / month
- Transport: ${transportEmissions} kg CO2e
- Electricity: ${electricityEmissions} kg CO2e
- Food/Diet: ${foodEmissions} kg CO2e
- Additional context: Car km/wk: ${details?.carKm || 0}, Bike km/wk: ${details?.bikeKm || 0}, Transit km/wk: ${details?.transitKm || 0}, Electricity: ${details?.electricityKwh || 0} kWh, Diet: ${details?.dietType || 'mixed'}.

Please provide a structured, encouraging, and highly practical decarbonization report in language code "${language}".
Format the output as a valid JSON object with the following keys:
{
  "summary": "2-3 sentences explaining the results in clear language",
  "highEmissionActivities": ["Top contributor 1", "Top contributor 2"],
  "personalizedTips": [
    {"action": "Action title", "impact": "Estimated CO2 reduction", "practicalStep": "Concrete everyday advice"},
    {"action": "Action title", "impact": "Estimated CO2 reduction", "practicalStep": "Concrete everyday advice"},
    {"action": "Action title", "impact": "Estimated CO2 reduction", "practicalStep": "Concrete everyday advice"}
  ],
  "longTermGoal": "A motivating realistic target for the next 3 months",
  "greenScoreBonusTip": "A specific civic or plant care task to offset emissions"
}
Output only the raw JSON string without markdown fencing.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || "{}");

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
