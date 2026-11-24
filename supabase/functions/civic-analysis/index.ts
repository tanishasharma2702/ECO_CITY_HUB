// Supabase Edge Function: Civic Issue Vision Analysis
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
    const { imageBase64, mimeType = "image/jpeg", userNotes = "", location = {}, language = "en" } = await req.json();

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
You are an expert civic infrastructure inspector and municipal grievance specialist.
Analyze this street or neighborhood photograph carefully.
User notes: "${userNotes}".
Location context: ${location.city || ''}, ${location.state || ''}, ${location.country || ''}.

Please perform the following:
1. Identify the likely civic problem (e.g., Pothole, Garbage accumulation, Water leakage, Broken streetlight, Damaged road, Overflowing drain, Illegal dumping, etc.).
2. Suggest the most appropriate category.
3. Explain the visible issue clearly.
4. Estimate priority: "Low", "Medium", "High", or "Critical" (e.g. deep pothole on high-speed road or open electric wire is Critical).
5. Recommend the municipal department responsible (e.g., Public Works Department / Road Maintenance, Sanitation & Solid Waste Management, Water Supply & Sewerage Board, Electricity Supply Corporation).
6. Generate a formal, respectful, and complete complaint letter addressed to the Municipal Commissioner / Executive Officer that the citizen can copy and submit. Include date, subject line, description of hazard, exact location details, and a polite call for urgent resolution.

Language: Write the report in language code "${language}".
Format the response strictly as a JSON object:
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
Output only raw JSON without markdown formatting.
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
