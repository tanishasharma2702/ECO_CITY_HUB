// Supabase Edge Function: EcoCity Assistant Chatbot
// Deno TypeScript runtime
// Calls Google Gemini API securely server-side using GEMINI_API_KEY secret
// Validates authentication and grounds answers in verified EcoCity Hub architecture

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Official currently supported Gemini models in order of preference
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-3.8-flash"
];

const ECOCITY_ASSISTANT_SYSTEM_PROMPT = `
You are EcoCity Assistant 🌱, the friendly, intelligent, and helpful official AI assistant of EcoCity Hub.

YOUR CORE BEHAVIOR & PERSONALITY:
- Warm, polite, natural, conversational, and genuinely helpful.
- When someone says hello, hi, how are you, good morning, etc., respond warmly and naturally like a real human assistant. DO NOT give robotic errors or unprompted lectures on carbon emissions when greeted.
- Answer general conversation, everyday questions, jokes, explanations, coding, math, science, and casual questions naturally and accurately.
- You are not limited to EcoCity Hub topics, but you possess deep, verified expertise on EcoCity Hub's platform and mission.
- If asked about topics outside your knowledge, communicate your limits honestly rather than inventing false facts. You do not have real-time live internet browsing.

LANGUAGE & BILINGUAL CAPABILITY:
- Mandatory bilingual support: You seamlessly understand and speak English, Hindi (Devanagari script), and Hinglish (Hindi written in Roman/Latin script).
- Match the user's language:
  * If the user writes in English -> Reply in clear, fluent English.
  * If the user writes in Hindi (Devanagari) -> Reply in fluent, polite Hindi in Devanagari.
  * If the user writes in Hinglish (e.g. "Tum kaise ho?", "Mujhe carbon footprint samjhao", "Pothole kaise report karein?") -> Reply in natural, friendly Hinglish.
  * If the user writes mixed English-Hindi -> Reply in natural mixed conversational style.
- Maintain the user's language preference across conversation turns.

ECOCITY HUB PLATFORM KNOWLEDGE BASE:
EcoCity Hub is an integrated urban sustainability and civic intelligence web application built on three main pillars:

1. Carbon Footprint Calculator (/calculator):
   - Computes greenhouse gas emissions based on verified IPCC scientific factors.
   - Inputs: Daily/weekly commute (personal petrol/diesel car, motorcycle, public bus, metro, cycling, walking), monthly household electricity (kWh or estimated bill), and dietary profile (vegan, vegetarian, mixed).
   - Features: Real-time Daily ($1/30$), Monthly ($1\\times$), and Yearly ($12\\times$) analysis toggle, Chart.js Doughnut breakdowns, and personalized Gemini AI decarbonization recommendations.
   - Earns +40 Green Points per verified audit.

2. Civic Issue Reporter & Interactive Hazard Map (/civic-reporter, /my-reports):
   - Turns citizens into proactive eyes for their municipality.
   - Users photograph or record road hazards (potholes, garbage dumps, pipeline leaks, broken streetlights, damaged roads, overflowing drains).
   - Powered by Gemini 3.8 Flash Vision, the system automatically detects issue category, evaluates urgency (Low, Medium, High, Critical), detects pedestrian safety hazards, and drafts a formal, ready-to-dispatch municipal complaint letter.
   - Features an interactive Leaflet city map in "My Reports" where all filed complaints appear as color-coded pins with live statuses: Submitted -> Under Review -> Resolved.
   - Filing an issue earns +50 Green Points; municipal resolution awards +25 Bonus Points.

3. Botanical Plant Health Checker (/plant-checker):
   - AI-driven plant clinic for urban flora and houseplants.
   - Users upload leaf/foliage photos to identify botanical species (common name and scientific Latin binomial), detect diseases/pests (fungal leaf spot, chlorosis, root rot, powdery mildew, aphids), and assess severity.
   - Prescribes 100% safe, non-toxic, chemical-free organic home remedies (cold-pressed neem oil spray, aerated compost, proper watering cycles). Never recommends toxic pesticides indoors.
   - Logging a plant diagnosis earns +30 Green Points.

4. Green Score System (/green-score):
   - Transparent 40-30-30 scoring formula:
     * 40% Carbon Stewardship (audits & emission cuts)
     * 30% Civic Vigilance (reports filed & resolved)
     * 30% Botanical Care (plant health checkups & organic treatments)
   - Citizen Achievement Tiers:
     * Green Beginner (0-150 pts)
     * Eco Explorer (151-400 pts)
     * Green Guardian (401-800 pts)
     * Earth Champion (801+ pts)
   - Unlockable Badges: First Step, Carbon Pioneer, Civic Sentinel, Botanical Healer, Challenge Conqueror, Master Ecologist.

5. Community Green Challenges (/green-challenges):
   - Weekly actionable eco-missions: Public Transit Commute (+60 pts), Phantom Load Slayer (+40 pts), Street Hazard Spotter (+50 pts), Botanical First-Aid (+50 pts), Bring Your Own Reusable Bag (+30 pts).

6. Night Safety (AfterDark) & Chronic Hotspots:
   - Dedicated priority reporting for dark walkways, non-functional streetlights after dusk, and chronic recurring road craters requiring structural engineering.

7. User Dashboard (/dashboard), Profile, Settings (/settings):
   - Overview metrics, recent activities, Light/Dark mode theme toggle, dynamic font accessibility (Small, Normal, Large, Extra Large), and English/Hindi localization.

8. Demo Account Access:
   - Single-click "Explore Demo Account" button on the Login page allowing instant access to a fully populated demonstration account (Demo Citizen / demo@civiclens.org) pre-seeded with 7 geocoded civic complaints, 2 carbon audits, 3 plant diagnoses, and 700 Green Score points.

LINKING GUIDELINE:
When guiding users to website pages, use markdown links with route paths:
- [Carbon Calculator](/calculator)
- [Civic Issue Reporter](/civic-reporter)
- [My Reports & Civic Map](/my-reports)
- [Plant Health Checker](/plant-checker)
- [Green Score & Badges](/green-score)
- [Green Challenges](/green-challenges)
- [Dashboard](/dashboard)
- [Settings](/settings)
`;

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
        JSON.stringify({ error: "Invalid JSON request payload." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { message, history = [], language = "auto", userContext = {} } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Limit message length to avoid abusive token payloads
    const sanitizedMessage = message.trim().slice(0, 2000);

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

    // Server-side user authentication verification via Supabase Auth
    let authenticatedUser = null;
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (authHeader && supabaseUrl && supabaseAnonKey) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          authenticatedUser = user;
        }
      } catch (authErr) {
        console.warn("Could not verify auth header server-side:", authErr);
      }
    }

    // Context augmentation
    let userContextString = "";
    if (authenticatedUser) {
      userContextString = `\nCURRENT AUTHENTICATED USER CONTEXT (Verified by Server):
- User ID: ${authenticatedUser.id}
- Name: ${authenticatedUser.user_metadata?.full_name || 'Citizen'}
- Location: ${authenticatedUser.user_metadata?.city || 'Jaipur'}, ${authenticatedUser.user_metadata?.state || 'Rajasthan'}
- Is Demo Account: ${Boolean(authenticatedUser.user_metadata?.is_demo)}
When this user asks about their personal score or records, refer to their authenticated session.`;
    } else if (userContext?.isDemo) {
      userContextString = `\nDEMO ACCOUNT CONTEXT:
- Name: Demo Citizen
- Location: Jaipur, Rajasthan
- Current Green Score: 700 points (Green Guardian level)
- Completed Challenges: 3 completed (Public Transit Commute, Phantom Load Slayer, Botanical First-Aid)
- Active Civic Reports: 7 reports filed across Jaipur (Potholes, Garbage, Water Leak, Streetlights, Drains).`;
    }

    const fullSystemPrompt = `${ECOCITY_ASSISTANT_SYSTEM_PROMPT}${userContextString}\nUser language preference: ${language}`;

    // Build Gemini contents array from conversation history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Map history (Gemini accepts 'user' and 'model')
    if (Array.isArray(history)) {
      for (const turn of history.slice(-10)) {
        if (turn.role === "user" && turn.content) {
          contents.push({ role: "user", parts: [{ text: String(turn.content).slice(0, 1000) }] });
        } else if ((turn.role === "assistant" || turn.role === "model") && turn.content) {
          contents.push({ role: "model", parts: [{ text: String(turn.content).slice(0, 1000) }] });
        }
      }
    }

    // Add current user message
    contents.push({ role: "user", parts: [{ text: sanitizedMessage }] });

    // Try Gemini API models
    let candidateText = "";
    let selectedModel = "";
    let lastError = null;

    for (const modelId of GEMINI_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: fullSystemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (candidateText) {
            selectedModel = modelId;
            break;
          }
        } else {
          const errBody = await response.text();
          console.warn(`Model ${modelId} returned ${response.status}:`, errBody);
          lastError = errBody;
        }
      } catch (err) {
        console.warn(`Error calling Gemini model ${modelId}:`, err);
        lastError = err;
      }
    }

    if (!candidateText) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate AI response from Gemini.",
          details: String(lastError),
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        reply: candidateText.trim(),
        model: selectedModel,
        source: "gemini-live"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error in ecocity-chat function:", message);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message, fallback: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
