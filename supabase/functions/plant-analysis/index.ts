// Supabase Edge Function: Plant Health Vision Analysis
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
    const { imageBase64, mimeType = "image/jpeg", notes = "", language = "en" } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 data." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

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
You are a botanical expert and plant pathologist.
Analyze this plant leaf or whole plant photograph.
User remarks: "${notes}".

Safety & Scientific Instructions:
- Do NOT present uncertain diagnoses as confirmed facts.
- Include a confidence percentage (e.g. 85%).
- Recommend consulting an agricultural extension officer or certified botanist for serious/farm cases.
- NEVER suggest unsafe, toxic, or hazardous chemical treatments; focus on safe organic care, pruning, soil aeration, neem oil, baking soda wash, watering adjustment, and natural remedies.

Tasks:
1. Plant Identification (common name and scientific botanical name if discernable).
2. Likely Health Problem / Disease (or state if healthy).
3. Visible Symptoms (chlorosis, wilting, leaf spots, pest damage, nutrient deficiency, etc.).
4. Possible Underlying Causes (overwatering, underwatering, fungal infection, insect infestation, sun scorch, soil compaction).
5. Recommended Organic Treatment.
6. Safe Home Care Suggestions.
7. Long-term Prevention Tips.

Write the output in language code "${language}".
Format the response strictly as a JSON object:
{
  "plantName": "string (Common Name and Latin Name)",
  "healthStatus": "Healthy" | "Mild Issue" | "Moderate Disease" | "Severe Disease",
  "confidenceScore": number (0-100),
  "likelyCondition": "string",
  "visibleSymptoms": ["symptom 1", "symptom 2"],
  "possibleCauses": ["cause 1", "cause 2"],
  "recommendedTreatment": "string",
  "homeCareSuggestions": ["step 1", "step 2", "step 3"],
  "preventionTips": ["tip 1", "tip 2"],
  "safetyDisclaimer": "Guideline only. Consult certified plant nursery or agricultural extension for severe blights."
}
Output only raw JSON without markdown fencing.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
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
