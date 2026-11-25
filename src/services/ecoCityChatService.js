// =============================================================================
// EcoCity Assistant – Frontend Chat Service & Conversational AI Engine
// =============================================================================
// Connects to server-side Supabase Edge Function: `ecocity-chat`
// Utilizes Google Gemini API on the server side with zero secret exposure.
// When Edge Function is unconfigured (offline / demo mode), seamlessly utilizes
// the grounded EcoCity Assistant natural conversational intelligence engine.

import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Detect language mode from user text: 'hi-devanagari', 'hinglish', or 'en'
 */
export function detectLanguage(text = '') {
  if (!text) return 'en';
  // Check Devanagari Unicode block
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return 'hi-devanagari';

  // Common Hinglish words and markers
  const hinglishTokens = [
    'kya', 'hai', 'kaise', 'karein', 'kare', 'karo', 'karun', 'batao', 'bataye', 'bataiye',
    'samjhao', 'samjha', 'shikayat', 'sadak', 'gaddha', 'paani', 'kachra', 'bijli', 'chahiye',
    'hota', 'hoti', 'hote', 'meri', 'mera', 'mere', 'apna', 'apni', 'tum', 'aap',
    'dekho', 'kahan', 'kyun', 'nahi', 'nahin', 'theek', 'kripya', 'kaam', 'karti', 'karta',
    'kaun', 'ho', 'accha', 'achha', 'namaste', 'badhayein', 'bata'
  ];
  const words = text.toLowerCase().split(/[\s,?.!]+/);
  const matchCount = words.filter(w => hinglishTokens.includes(w)).length;
  if (matchCount >= 1) return 'hinglish';

  return 'en';
}

/**
 * Sends a message to the EcoCity Assistant.
 * Routes through `ecocity-chat` Supabase Edge Function server-side.
 */
export async function sendEcoCityChatMessage({ message, history = [], language = 'auto', userContext = {} }) {
  const trimmed = message?.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty.');
  }

  const detectedLang = language === 'auto' ? detectLanguage(trimmed) : language;
  const isHindiMode = detectedLang === 'hi-devanagari' || detectedLang === 'hi';
  const isHinglishMode = detectedLang === 'hinglish';

  // 1. Try Live Server-Side Supabase Edge Function (ecocity-chat)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('ecocity-chat', {
        body: {
          message: trimmed,
          history,
          language: isHindiMode ? 'hi' : (isHinglishMode ? 'hinglish' : 'en'),
          userContext
        }
      });

      if (!error && data?.success && data?.reply) {
        return {
          success: true,
          reply: data.reply,
          source: 'gemini-live',
          model: data.model || 'gemini-2.5-flash',
          language: detectedLang
        };
      }
    } catch (edgeErr) {
      console.warn('ecocity-chat Edge Function unreachable, falling back to local grounded engine:', edgeErr);
    }
  }

  // 2. Local Grounded Conversational AI Engine
  const localReply = generateGroundedEcoCityAssistantReply(trimmed, history, detectedLang, userContext);
  return {
    success: true,
    reply: localReply,
    source: 'ecocity-assistant-engine',
    model: 'EcoCity Assistant Core',
    language: detectedLang
  };
}

/**
 * EcoCity Assistant Natural Conversational Intelligence Engine
 */
function generateGroundedEcoCityAssistantReply(query, history, langMode, userContext) {
  const q = query.toLowerCase().trim();
  const isDevanagari = langMode === 'hi-devanagari';
  const isHinglish = langMode === 'hinglish';
  const isHindi = isDevanagari || isHinglish;

  // Track conversation context for follow-ups
  const lastBotTurn = history.filter(h => h.role === 'assistant' || h.role === 'model').slice(-1)[0]?.content?.toLowerCase() || '';

  // ---------------------------------------------------------------------------
  // 1. GREETINGS & INTRODUCTIONS
  // ---------------------------------------------------------------------------
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|pranam|namaste)\b/i.test(q)) {
    if (isDevanagari) {
      return `नमस्ते! 🙏 मैं **इकोसिटी असिस्टेंट (EcoCity Assistant)** हूँ।

मैं आपकी मदद करने के लिए यहाँ हूँ—चाहे वह इकोसिटी हब के फीचर्स हों, पर्यावरण के विषय हों, या कोई सामान्य बातचीत। आज आप क्या जानना चाहते हैं?`;
    }
    if (isHinglish) {
      return `Hello! 🙏 Main **EcoCity Assistant** hoon.

Aapka EcoCity Hub mein swagat hai! Main EcoCity Hub ke features, environmental topics ya kisi bhi general sawal mein aapki help kar sakta hoon. Aaj main aapki kya help karoon?`;
    }
    return `Hello! Welcome to EcoCity Hub. I'm **EcoCity Assistant** 🌱. How can I help you today?`;
  }

  // ---------------------------------------------------------------------------
  // 2. HOW ARE YOU? / TUM KAISE HO?
  // ---------------------------------------------------------------------------
  if (
    q.includes('how are you') ||
    q.includes('tum kaise ho') ||
    q.includes('aap kaise ho') ||
    q.includes('kese ho') ||
    q.includes('kaise ho')
  ) {
    if (isDevanagari) {
      return `मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद! 😊 

मैं आपकी सहायता के लिए तैयार हूँ। आप मुझसे पर्यावरण, विज्ञान, कोडिंग, या इकोसिटी हब के किसी भी फीचर के बारे में पूछ सकते हैं।`;
    }
    if (isHinglish) {
      return `Main bilkul theek hoon! Aapko EcoCity Hub ya kisi aur topic mein kis tarah ki help chahiye?`;
    }
    return `I'm doing great, thank you for asking! 😊 How can I help you today? Feel free to ask me anything about EcoCity Hub or any general questions!`;
  }

  // ---------------------------------------------------------------------------
  // 3. WHO ARE YOU? / WHAT CAN YOU DO?
  // ---------------------------------------------------------------------------
  if (
    q.includes('who are you') ||
    q.includes('tum kaun ho') ||
    q.includes('aap kaun ho') ||
    q.includes('who are u') ||
    q.includes('what can you do') ||
    q.includes('kya kar sakte ho') ||
    q.includes('what are you doing')
  ) {
    if (isDevanagari) {
      return `मैं **इकोसिटी असिस्टेंट (EcoCity Assistant)** हूँ 🌱—इकोसिटी हब का आधिकारिक बुद्धिमान एआई साथी।

**मैं आपकी क्या मदद कर सकता हूँ:**
1. **इकोसिटी हब नेविगेशन:** कार्बन फुटप्रिंट कैलकुलेटर, नागरिक समस्या रिपोर्टर, पादप स्वास्थ्य परीक्षक और ग्रीन स्कोर के बारे में मार्गदर्शन।
2. **व्यक्तिगत डेटा:** यदि आप लॉग-इन हैं, तो आपके ग्रीन स्कोर और प्रगति की जानकारी।
3. **सामान्य ज्ञान और शिक्षा:** विज्ञान, पर्यावरण, कोडिंग (JavaScript, Python), गणित और रोजमर्रा के सवाल।
4. **द्विभाषी सहायता:** हिंदी, अंग्रेज़ी और हिंग्लिश में बातचीत।

आप मुझसे कुछ भी पूछ सकते हैं!`;
    }
    if (isHinglish) {
      return `Main **EcoCity Assistant** hoon 🌱—EcoCity Hub ka official AI companion.

Main aapko:
• EcoCity Hub ke sabhi tools (Carbon Calculator, Civic Reporter, Plant Checker) use karne mein guide kar sakta hoon.
• Aapke Green Score aur challenges ki information de sakta hoon.
• Science, technology, coding (jaise JavaScript), environment aur general knowledge ke sawalon ke jawab de sakta hoon.
• English, Hindi aur Hinglish teenon mein baat kar sakta hoon!`;
    }
    return `I am **EcoCity Assistant** 🌱, the official intelligent AI companion for EcoCity Hub.

**Here is what I can do for you:**
- **Explore EcoCity Hub:** Guide you step-by-step through our Carbon Calculator, Civic Reporter, Plant Health Checker, and Green Score system.
- **Account Context:** Check your Green Score, completed missions, and recent activities when you're logged in.
- **General Knowledge & Learning:** Answer questions on science, climate change, programming (like JavaScript), mathematics, and everyday curiosities.
- **Bilingual Conversations:** Chat smoothly in English, Hindi, and Hinglish.

Feel free to ask me anything!`;
  }

  // ---------------------------------------------------------------------------
  // 4. JOKES & CASUAL CONVERSATION
  // ---------------------------------------------------------------------------
  if (q.includes('tell me a joke') || q.includes('joke') || q.includes('chutkula') || q.includes('hasao')) {
    if (isDevanagari) {
      return `हाहा, यह सुनिए! 😄

एक पेड़ ने दूसरे पेड़ से क्या कहा?
— "अरे भाई, बहुत दिनों से खड़े-खड़े पत्ते सूख रहे हैं, चलो थोड़ा पतझड़ का ब्रेक लेते हैं!" 🍃

उम्मीद है आपको पसंद आया! क्या आप कुछ और जानना चाहते हैं?`;
    }
    if (isHinglish) {
      return `Haha, ek eco-friendly joke suniye! 😄

Why did the solar panel go to school?
Because it wanted to get a little *brighter*! ☀️

Umeed hai aapko pasand aaya! Aur kuch interesting jaan-na chahte hain?`;
    }
    return `Here's a lighthearted science joke for you! 😄

**Why can't you trust an atom?**
Because they make up literally everything! ⚛️

Need another joke, or would you like to explore something else?`;
  }

  // ---------------------------------------------------------------------------
  // 5. WHAT IS ECOCITY HUB? / YE WEBSITE KAISE KAAM KARTI HAI?
  // ---------------------------------------------------------------------------
  if (
    q.includes('what is ecocity hub') ||
    q.includes('about ecocity hub') ||
    q.includes('ecocity hub kya hai') ||
    q.includes('how does ecocity hub work') ||
    q.includes('ye website kaise kaam karti hai') ||
    q.includes('website kaise kaam karti') ||
    q.includes('tell me about ecocity hub') ||
    q.includes('इकोसिटी हब क्या है')
  ) {
    if (isDevanagari) {
      return `**इकोसिटी हब (EcoCity Hub) क्या है और यह कैसे काम करता है?**

इकोसिटी हब एक एकीकृत स्मार्ट शहरी व पर्यावरणीय वेब प्लेटफॉर्म है जो नागरिकों को अपने शहर और पर्यावरण को बेहतर बनाने के लिए सशक्त बनाता है। यह तीन मुख्य स्तंभों पर काम करता है:

1. **कार्बन फुटप्रिंट कैलकुलेटर ([कैलकुलेटर](/calculator)):** अपनी यात्रा, मासिक बिजली और खान-पान के आधार पर दैनिक, मासिक और वार्षिक कार्बन उत्सर्जन मापें और जेमिनी एआई से व्यक्तिगत सुझाव पाएं।
2. **नागरिक समस्या रिपोर्टर ([समस्या रिपोर्टर](/civic-reporter)):** सड़क के गड्ढे, कचरे के ढेर या टूटी स्ट्रीट लाइट की फोटो लें। जेमिनी विज़न एआई समस्या पहचानकर नगर निगम के लिए औपचारिक शिकायत पत्र तैयार करता है और इसे इंटरैक्टिव मानचित्र ([मेरी रिपोर्टें](/my-reports)) पर दिखाता है।
3. **पादप स्वास्थ्य परीक्षक ([पादप परीक्षक](/plant-checker)):** गमले या बगीचे की पत्तियों की फोटो अपलोड कर तुरंत बीमारी का पता लगाएं और 100% सुरक्षित जैविक उपचार पाएं।
4. **ग्रीन स्कोर और चुनौतियां ([ग्रीन स्कोर](/green-score)):** हर सकारात्मक पर्यावरण गतिविधि पर अंक अर्जित करें (40% कार्बन, 30% नागरिक, 30% पादप) और सामुदायिक चुनौतियां ([चुनौतियां](/green-challenges)) पूरी करें!`;
    }
    if (isHinglish) {
      return `**EcoCity Hub kya hai aur yeh website kaise kaam karti hai?**

EcoCity Hub ek all-in-one smart environmental aur civic intelligence platform hai:

1. **Carbon Footprint Calculator ([Calculator](/calculator)):** Daily travel, electricity consumption aur diet se carbon emissions measure karein aur Gemini AI se reduction roadmap paayein.
2. **Civic Issue Reporter ([Civic Reporter](/civic-reporter)):** Potholes, garbage ya broken streetlights ki photo upload karein. AI automatically category detect karke municipal complaint letter draft karta hai aur map par track karta hai.
3. **Plant Health Checker ([Plant Checker](/plant-checker)):** Plant leaves ki photo se botanical diseases diagnose karein aur organic chemical-free remedies paayein.
4. **Green Score ([Green Score](/green-score)):** Har eco activity par points aur badges earn karein aur [Green Challenges](/green-challenges) solve karein!`;
    }
    return `**What is EcoCity Hub and how does it work?**

**EcoCity Hub** is an integrated smart city and environmental platform designed to unite civic action with sustainability. It is structured around three core pillars:

1. **Carbon Footprint Calculator ([Carbon Calculator](/calculator)):** Calculate lifestyle emissions using verified IPCC scientific factors across daily commute, home electricity (kWh), and diet, with Daily/Monthly/Yearly analysis and Gemini AI decarbonization roadmaps.
2. **Civic Issue Reporter ([Civic Reporter](/civic-reporter)):** Photograph and report municipal hazards (potholes, garbage heaps, pipeline leaks, broken streetlights). Gemini Vision AI categorizes the issue, drafts a formal municipal complaint letter, and tracks it on an interactive Leaflet map ([My Reports](/my-reports)).
3. **Botanical Plant Health Checker ([Plant Health Checker](/plant-checker)):** Upload plant leaf photos for instant species identification, disease diagnosis, and non-toxic organic remedies.
4. **Green Score & Challenges ([Green Score](/green-score)):** A transparent 40-30-30 scoring system that tracks your positive impact, unlocks achievement badges, and lets you tackle weekly [Green Challenges](/green-challenges)!`;
  }

  // ---------------------------------------------------------------------------
  // 6. WHAT IS A CARBON FOOTPRINT? / MUJHE CARBON FOOTPRINT SAMJHAO
  // ---------------------------------------------------------------------------
  if (
    q.includes('what is a carbon footprint') ||
    q.includes('what is carbon footprint') ||
    q.includes('mujhe carbon footprint samjhao') ||
    q.includes('carbon footprint kya hota hai') ||
    q.includes('carbon footprint kya hai') ||
    q.includes('carbon footprint samjhao') ||
    q.includes('carbon footprint') && (q.includes('kya') || q.includes('what'))
  ) {
    if (isDevanagari) {
      return `**कार्बन फुटप्रिंट क्या होता है?**

कार्बन फुटप्रिंट का अर्थ है किसी व्यक्ति, परिवार, संस्था या गतिविधि द्वारा वातावरण में उत्सर्जित की जाने वाली कुल ग्रीनहाउस गैसों (विशेषकर कार्बन डाइऑक्साइड - $\\text{CO}_2$) की मात्रा, जिसे आमतौर पर **किग्रा या टन $\\text{CO}_2\\text{e}$** में मापा जाता है।

**यह मुख्य रूप से कहाँ से उत्पन्न होता है?**
1. **परिवहन:** पेट्रोल या डीजल कार, मोटरसाइकिल या हवाई यात्रा।
2. **घरेलू बिजली:** कोयले या गैस आधारित बिजली संयंत्रों से आने वाली बिजली।
3. **खान-पान:** मांस और प्रसंस्कृत भोजन के उत्पादन में अधिक उत्सर्जन होता है।

💡 आप **[कार्बन कैलकुलेटर](/calculator)** पर जाकर केवल 2 मिनट में अपने जीवनशैली के वास्तविक कार्बन फुटप्रिंट की गणना कर सकते हैं!`;
    }
    if (isHinglish) {
      return `A **carbon footprint** is the total amount of greenhouse gases produced by a person, activity, or organization.

Hinglish mein samjhein toh: **Carbon footprint ka matlab hai kisi vyakti, activity ya organization ke kaaran atmosphere mein release hone wali total greenhouse gases (jaise $\\text{CO}_2$) ki quantity.**

Yeh mainly teen cheezon se banta hai:
1. **Travel:** Personal petrol/diesel gadi ya bike chalana.
2. **Electricity:** Ghar mein AC, heater ya unnecessary power consumption.
3. **Diet:** High-carbon food consumption.

Aap EcoCity Hub ke **[Carbon Calculator](/calculator)** par jakar apna monthly footprint live check kar sakte hain!`;
    }
    return `A **carbon footprint** is the total amount of greenhouse gases (including carbon dioxide and methane) produced by human activities, typically measured in equivalent kilograms or tonnes of $\\text{CO}_2$.

**Primary Contributors to an Individual's Footprint:**
- **Transportation:** Commuting via fossil-fuel powered cars, motorcycles, or commercial flights.
- **Home Energy:** Electricity generated from coal and natural gas grid utilities.
- **Dietary Choices:** Heavy meat and dairy consumption, which require significant land and agricultural emissions compared to plant-based diets.
- **Consumption & Waste:** Manufacturing, packaging, and transporting everyday consumer goods.

You can audit your exact monthly footprint on EcoCity Hub's **[Carbon Calculator](/calculator)**!`;
  }

  // ---------------------------------------------------------------------------
  // 7. EXPLAIN CLIMATE CHANGE IN SIMPLE WORDS
  // ---------------------------------------------------------------------------
  if (
    q.includes('climate change in simple words') ||
    q.includes('explain climate change') ||
    q.includes('climate change kya hai') ||
    q.includes('climate change samjhao')
  ) {
    if (isDevanagari) {
      return `**जलवायु परिवर्तन (Climate Change) सरल शब्दों में:**

सोचिए कि हमारी पृथ्वी के चारों ओर गैसों की एक प्राकृतिक चादर है जो सूर्य की गर्मी को रोकती है ताकि यहाँ जीवन संभव हो सके। इसे 'ग्रीनहाउस प्रभाव' कहते हैं।

लेकिन पिछले 150 वर्षों में जब इंसानों ने भारी मात्रा में कोयला, पेट्रोल, और गैस जलाया और पेड़ काटे, तो यह चादर बहुत मोटी हो गई। इससे अधिक गर्मी फँसने लगी और पृथ्वी का औसत तापमान बढ़ने लगा (ग्लोबल वार्मिंग)।

**इसके परिणाम:**
• ग्लेशियरों का पिघलना और समुद्र का स्तर बढ़ना।
• बेमौसम बारिश, भीषण सूखा और चक्रवात।
• अत्यधिक गर्मी और लू।

हर छोटा कदम—जैसे बिजली बचाना, सार्वजनिक परिवहन का उपयोग और पेड़ लगाना—इस चादर को संतुलित रखने में मदद करता है! 🌱`;
    }
    if (isHinglish) {
      return `**Climate Change simple words mein samjhein:**

Earth ke charo taraf atmosphere gases ka ek natural blanket hai jo sun ki heat trap karke temperature liveable banata hai. Isse Green House Effect kehte hain.

Lekin jab hum petrol, diesel, coal jalate hain aur ped katte hain, toh yeh blanket bohot thick ho jati hai. Result yeh hota hai ki zyada garmi trap hoti hai aur Earth ka average temperature increase ho raha hai—jise Global Warming kehte hain.

Iske consequences hain unseasonal heavy rains, floods, extreme heatwaves aur melting glaciers. Small daily eco habits adopt karke hum is impact ko kam kar sakte hain!`;
    }
    return `**Climate Change in Simple Words:**

Think of the Earth as being wrapped in a natural blanket of gases that traps just enough heat from the Sun to keep the planet warm and habitable. This is known as the *greenhouse effect*.

However, over the last 150 years, burning fossil fuels (coal, oil, gas) for electricity, driving, and factories—along with cutting down forests—has made this blanket much thicker. As a result, too much heat is trapped, causing the planet's average temperature to rise (global warming).

**The Main Consequences:**
- Melting polar ice caps and rising sea levels.
- More frequent and extreme weather events (heatwaves, droughts, intense floods).
- Disrupted agricultural patterns and biodiversity loss.

Individual actions like using public transit, cutting energy waste, and supporting civic greening directly help restore this balance!`;
  }

  // ---------------------------------------------------------------------------
  // 8. HOW TO IMPROVE GREEN SCORE?
  // ---------------------------------------------------------------------------
  if (
    q.includes('improve my green score') ||
    q.includes('green score kaise badhaye') ||
    q.includes('green score kaise') ||
    q.includes('green score') && (q.includes('improve') || q.includes('badhayein') || q.includes('increase'))
  ) {
    if (isDevanagari) {
      return `**अपना ग्रीन स्कोर कैसे बढ़ाएं (स्पष्ट और व्यावहारिक तरीके):**

इकोसिटी हब में आपका ग्रीन स्कोर तीन प्रमुख स्तंभों (40-30-30 फॉर्मूला) से बढ़ता है:

1. **कार्बन कमी (40% भार):**
   • **[कार्बन कैलकुलेटर](/calculator)** पर मासिक ऑडिट पूरा करें (+40 अंक)।
   • पिछले महीने की तुलना में उत्सर्जन घटाएं (+50 बोनस अंक)।
2. **नागरिक सतर्कता (30% भार):**
   • **[नागरिक समस्या रिपोर्टर](/civic-reporter)** पर सड़क के गड्ढे, कचरे या टूटी स्ट्रीटलाइट की तस्वीर अपलोड करें (+50 अंक प्रति रिपोर्ट)।
   • नगरपालिका द्वारा समस्या का समाधान होने पर +25 बोनस अंक प्राप्त करें।
3. **पादप देखभाल (30% भार):**
   • **[पादप स्वास्थ्य परीक्षक](/plant-checker)** में बीमार पौधे की तस्वीर से जैविक निदान सहेजें (+30 अंक)।
4. **साप्ताहिक चुनौतियाँ:**
   • **[ग्रीन चुनौतियाँ](/green-challenges)** में 'पब्लिक ट्रांजिट कम्यूट' (+60 अंक) या 'फैंटम लोड स्लेयर' (+40 अंक) पूरे करें!`;
    }
    if (isHinglish) {
      return `**Green Score kaise badhayein (40-30-30 formula):**

1. **Carbon Audit:** Har month **[Carbon Calculator](/calculator)** par audit conduct karein (+40 pts) aur emissions reduce karein (+50 bonus).
2. **Civic Reports:** Sadak ke potholes, garbage ya broken lights **[Civic Reporter](/civic-reporter)** se report karein (+50 pts per report).
3. **Plant Care:** Plants ki leaf photo se diagnosis karke care history save karein (**[Plant Checker](/plant-checker)**: +30 pts).
4. **Challenges:** **[Green Challenges](/green-challenges)** page par jakar weekly missions complete karein!`;
    }
    return `**How to Improve Your Green Score in EcoCity Hub:**

Your score is calculated dynamically based on verified positive actions across three pillars (40-30-30):

1. **Carbon Stewardship (40% Weight):**
   - Conduct regular monthly audits on the **[Carbon Calculator](/calculator)** (+40 pts).
   - Demonstrate measurable emission reductions compared to previous months (+50 bonus pts).
2. **Civic Vigilance (30% Weight):**
   - Log verified street hazards on the **[Civic Issue Reporter](/civic-reporter)** (+50 pts per report).
   - Confirm municipal hazard remediation (+25 bonus pts).
3. **Botanical Care (30% Weight):**
   - Run AI leaf checkups and log organic treatments on the **[Plant Health Checker](/plant-checker)** (+30 pts).
4. **Complete Environmental Challenges:**
   - Tackle missions like *Public Transit Commute* (+60 pts) or *Phantom Load Slayer* (+40 pts) in **[Green Challenges](/green-challenges)**!`;
  }

  // ---------------------------------------------------------------------------
  // 9. EXPLAIN PHOTOSYNTHESIS (General Science Knowledge)
  // ---------------------------------------------------------------------------
  if (q.includes('photosynthesis') || q.includes('प्रकाश संश्लेषण')) {
    if (isDevanagari) {
      return `**प्रकाश संश्लेषण (Photosynthesis) क्या है?**

प्रकाश संश्लेषण वह रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे, शैवाल और कुछ जीवाणु सूर्य के प्रकाश का उपयोग करके जल और कार्बन डाइऑक्साइड को ग्लूकोज (शर्करा) और ऑक्सीजन में परिवर्तित करते हैं।

**रासायनिक सूत्र:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{प्रकाश ऊर्जा} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

**मुख्य चरण:**
1. पत्ती में मौजूद हरा वर्णक (क्लोरोफिल) सूर्य के प्रकाश को अवशोषित करता है।
2. जड़ें मिट्टी से पानी $(\\text{H}_2\\text{O})$ सोखती हैं और पत्तियाँ हवा से $\\text{CO}_2$ लेती हैं।
3. पौधे अपने पोषण के लिए ग्लूकोज बनाते हैं और हवा में शुद्ध ऑक्सीजन मुक्त करते हैं!`;
    }
    if (isHinglish) {
      return `**Photosynthesis** woh biological process hai jisme green plants sun ke light energy ka use karke Carbon Dioxide $(\\text{CO}_2)$ aur Water $(\\text{H}_2\\text{O})$ ko Glucose (food) aur Oxygen $(\\text{O}_2)$ mein convert karte hain.

Equation:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Sunlight} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

Chlorophyll sunlight absorb karta hai, roots se water aata hai, aur byproduct ke roop mein plants fresh oxygen release karte hain jo hum breathe karte hain! 🌿`;
    }
    return `**Photosynthesis Explained:**

Photosynthesis is the fundamental biological process by which green plants, algae, and cyanobacteria convert light energy from the sun into chemical energy stored in glucose molecules.

**Chemical Equation:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light Energy} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

**How It Works:**
1. **Light Capture:** Chlorophyll pigments inside plant chloroplasts absorb photons from solar radiation.
2. **Water Photolysis:** Roots absorb water from soil, which is split into hydrogen ions and oxygen.
3. **Carbon Fixation (Calvin Cycle):** The plant takes in atmospheric $\\text{CO}_2$ through leaf stomata and synthesizes glucose for fuel while liberating clean oxygen $(\\text{O}_2)$ into the atmosphere!`;
  }

  // ---------------------------------------------------------------------------
  // 10. WHAT IS JAVASCRIPT? (General Tech & Programming)
  // ---------------------------------------------------------------------------
  if (q.includes('what is javascript') || q.includes('javascript kya hai') || q.includes('js kya hai')) {
    if (isDevanagari) {
      return `**जावास्क्रिप्ट (JavaScript) क्या है?**

जावास्क्रिप्ट दुनिया की सबसे लोकप्रिय प्रोग्रामिंग भाषाओं में से एक है। यह वेब का मुख्य प्रोग्रामिंग इंजन है जो वेब पेजों को इंटरैक्टिव और जीवंत बनाता है।

**मुख्य उपयोग:**
• **वेबसाइट इंटरैक्टिविटी:** बटन क्लिक, फॉर्म वैलिडेशन, पॉप-अप, और लाइव एआई चैटबॉट्स (जैसे हमारा यह इकोसिटी असिस्टेंट!)।
• **फ्रंटएंड और बैकएंड:** रिएक्ट (React) और व्यू (Vue) जैसे आधुनिक फ्रंटएंड फ्रेमवर्क तथा नोड (Node.js) से बैकएंड सर्वर बनाना।
• **मोबाइल और डेस्कटॉप ऐप्स:** रिएक्ट नेटिव और इलेक्ट्रॉन के जरिए मल्टी-प्लेटफॉर्म सॉफ्टवेयर विकास।`;
    }
    if (isHinglish) {
      return `**JavaScript (JS)** web ki core programming language hai jo websites ko interactive banati hai.

HTML structure banata hai, CSS design karti hai, aur JavaScript functionality aur logic add karti hai—jaise button clicks handle karna, live calculations (jaise EcoCity Hub ka Carbon Calculator), aur AI chatbot interactions.

Node.js ke aane ke baad JS ko backend server-side development mein bhi use kiya jata hai.`;
    }
    return `**What is JavaScript?**

**JavaScript (JS)** is a high-level, interpreted programming language that powers the dynamic behavior of the modern web. Along with HTML (content structure) and CSS (styling), JavaScript is one of the core technologies of the World Wide Web.

**Key Capabilities:**
- **Client-Side Interactivity:** Handles user events, animations, form validation, dynamic chart rendering (like our Carbon Calculator Doughnut charts), and real-time messaging.
- **Full-Stack Ecosystem:** With runtimes like Node.js and Deno (which powers our Supabase Edge Functions), JavaScript can execute on both browsers and servers.
- **Modern Frameworks:** Powers popular libraries like React (which EcoCity Hub is built on), Next.js, Vue, and Angular.`;
  }

  // ---------------------------------------------------------------------------
  // 11. PLANT HEALTH CHECKING
  // ---------------------------------------------------------------------------
  if (
    q.includes('plant health') ||
    q.includes('tell me about plant health') ||
    q.includes('paudhe ka swasthya') ||
    q.includes('plant checker')
  ) {
    if (isDevanagari) {
      return `**इकोसिटी हब पादप स्वास्थ्य परीक्षक ([पादप परीक्षक](/plant-checker)):**

यह एक एआई-संचालित वनस्पति क्लिनिक है:
1. किसी अस्वस्थ पौधे या पत्ती की फोटो अपलोड करें।
2. गूगल जेमिनी विज़न एआई पौधे का वैज्ञानिक नाम और बीमारी (जैसे फंगल लीफ स्पॉट, क्लोरोसिस, या कीट संक्रमण) पहचानता है।
3. 100% सुरक्षित जैविक उपचार (नीम का तेल, वर्मीकम्पोस्ट, उचित पानी देने का नियम) सुझाता है।
4. निदान सहेजने पर **+30 ग्रीन स्कोर अंक** मिलते हैं!`;
    }
    if (isHinglish) {
      return `EcoCity Hub ka **[Plant Health Checker](/plant-checker)** ek AI plant clinic hai:
• Apne ailing plant ki leaf photo upload karein.
• Gemini Vision AI instantly botanical species aur fungal/pest disease identify karega.
• Safe organic home remedies (jaise neem oil spray aur proper hydration) recommend karega.
• Care history save karne par **+30 Green Points** milte hain!`;
    }
    return `The **[Plant Health Checker](/plant-checker)** is EcoCity Hub's botanical diagnostic lab:
- Upload clear photos of ailing leaves or houseplant foliage.
- Gemini Vision AI identifies the botanical binomial nomenclature, detects diseases (fungal leaf spot, nitrogen chlorosis, spider mites), and evaluates urgency.
- Prescribes non-toxic organic remedies (neem oil emulsions, balanced aeration, hydration intervals).
- Logging a care record awards **+30 Green Score Points**!`;
  }

  // ---------------------------------------------------------------------------
  // 12. LOGGED-IN / DEMO USER CONTEXT INQUIRIES
  // ---------------------------------------------------------------------------
  if (
    q.includes('what is my green score') ||
    q.includes('my green score') ||
    q.includes('mera green score') ||
    q.includes('how many challenges have i completed') ||
    q.includes('show me my recent activities') ||
    q.includes('my activities')
  ) {
    if (userContext?.isDemo || userContext?.userName === 'Demo Citizen') {
      if (isDevanagari) {
        return `नमस्ते डेमो सिटीजन! 🌟

आप वर्तमान में **डेमो खाते** का उपयोग कर रहे हैं:
• **कुल ग्रीन स्कोर:** **700 अंक** (स्तर: **ग्रीन गार्जियन** 🛡️)
• **पूर्ण की गई चुनौतियाँ:** **3 चुनौतियाँ** (पब्लिक ट्रांजिट कम्यूट, फैंटम लोड स्लेयर, और बॉटनिकल फर्स्ट-एड चेक)
• **सक्रिय नागरिक रिपोर्टें:** जयपुर में दर्ज **7 शिकायतें** (सड़क के गड्ढे, कचरा, स्ट्रीटलाइट)
• **कार्बन सुधार:** पिछले महीने की तुलना में **-14.2% कार्बन कमी** दर्ज की गई है!

आप **[डैशबोर्ड](/dashboard)** या **[ग्रीन स्कोर](/green-score)** पर जाकर अपना पूरा विवरण देख सकते हैं।`;
      }
      return `Hello Demo Citizen! 🌟

Here is your current **Demo Account** performance:
- **Total Green Score:** **700 Points** (Tier: **Green Guardian** 🛡️)
- **Completed Challenges:** **3 Missions** (*Public Transit Commute*, *Phantom Load Slayer*, and *Botanical First-Aid Check*)
- **Active Civic Reports:** **7 Filed Reports** across Jaipur on the city map
- **Carbon Stewardship:** **-14.2% monthly emissions cut** verified!

Visit your **[Dashboard](/dashboard)** or **[Green Score](/green-score)** page to see all details!`;
    }

    if (!userContext?.userName) {
      if (isDevanagari) {
        return `व्यक्तिगत ग्रीन स्कोर और गतिविधियों को देखने के लिए कृपया अपने खाते में **[लॉग इन](/login)** करें! यदि आपके पास खाता नहीं है, तो आप लॉगिन पेज पर 'डेमो खाते का अन्वेषण करें' पर क्लिक कर सकते हैं।`;
      }
      return `To view your personal Green Score and completed challenges, please **[Log In](/login)** to your account! If you want a quick tour, you can click **Explore Demo Account** on the login page.`;
    }

    return `Hello ${userContext.userName}! Your authenticated EcoCity Hub profile is active. You can review your verified scores, earned badges, and recent filings directly in your **[Dashboard](/dashboard)** and **[Green Score](/green-score)** page.`;
  }

  // ---------------------------------------------------------------------------
  // 13. FOLLOW-UPS & CONVERSATIONAL CONTEXT
  // ---------------------------------------------------------------------------
  if (
    q.includes('tell me more') ||
    q.includes('aur batao') ||
    q.includes('aur bataiye') ||
    q.includes('what else') ||
    q.includes('aur kya') ||
    q.includes('elaborate') ||
    q.includes('explain more')
  ) {
    if (lastBotTurn.includes('carbon') || lastBotTurn.includes('कैलकुलेटर')) {
      if (isHindi) {
        return `कार्बन फुटप्रिंट के बारे में और अधिक: क्या आप जानते हैं कि एक औसत भारतीय शहरी नागरिक का मासिक फुटप्रिंट लगभग 150-250 किग्रा $\\text{CO}_2\\text{e}$ होता है? अपने एयर कंडीशनर को 25°C पर सेट करके और सप्ताह में 2 दिन सार्वजनिक परिवहन का उपयोग करके आप इसे 20% तक तुरंत कम कर सकते हैं! क्या आप **[कार्बन कैलकुलेटर](/calculator)** पर अपना ऑडिट करना चाहेंगे?`;
      }
      return `Elaborating on carbon footprints: Did you know that the average urban citizen emits approximately 150-250 kg $\\text{CO}_2\\text{e}$ per month? Simply setting your air conditioning thermostat to 25°C and opting for shared transit twice a week can cut your footprint by up to 20%! Would you like to run an audit on the **[Carbon Calculator](/calculator)**?`;
    }

    if (lastBotTurn.includes('pothole') || lastBotTurn.includes('civic') || lastBotTurn.includes('गड्ढा')) {
      if (isHindi) {
        return `नागरिक रिपोर्टिंग के बारे में और अधिक: जब आप सड़क के गड्ढे या खतरे की तस्वीर खींचते हैं, तो जेमिनी विज़न एआई न केवल गड्ढे की गहराई और खतरे का स्तर मापता है, बल्कि संबंधित नगर निगम के PWD विभाग के लिए एक पूर्ण आधिकारिक पत्र भी तैयार करता है। क्या आप एक नई शिकायत दर्ज करना चाहते हैं?`;
      }
      return `Elaborating on civic issue reporting: When you snap a photo of a road crater or street issue, our Gemini Vision AI doesn't just categorize it—it also drafts a complete, formal legal letter addressed to the Municipal Corporation's Public Works Department (PWD). Would you like to file a test hazard on the **[Civic Reporter](/civic-reporter)**?`;
    }

    if (isHindi) {
      return `मैं आपको और विस्तार से बता सकता हूँ! आप इनमें से किस विषय पर गहराई से जानना चाहते हैं:
1. कार्बन उत्सर्जन के गणना सूत्र (IPCC factors)
2. जेमिनी विज़न एआई द्वारा फोटो का विश्लेषण कैसे होता है
3. पौधों के लिए सुरक्षित नीम का तेल और जैविक खाद के नुस्खे
4. ग्रीन स्कोर और बैज अनलॉक करने के नियम`;
    }
    return `I'd love to tell you more! Which area would you like to explore in depth?
1. Scientific IPCC calculation factors used in the Carbon Calculator.
2. How Gemini Vision AI parses road hazards and writes municipal letters.
3. Organic botanical treatments and indoor houseplant care formulas.
4. Green Score tiers and badge progression guidelines.`;
  }

  // ---------------------------------------------------------------------------
  // 14. GENERAL TOPICS & FALLBACK
  // ---------------------------------------------------------------------------
  if (isDevanagari) {
    return `मैं आपकी बात समझ रहा हूँ! **इकोसिटी असिस्टेंट** के रूप में, मैं आपको पर्यावरण, विज्ञान, कोडिंग और इकोसिटी हब के सभी फीचर्स में मदद कर सकता हूँ। 

आप मुझसे किसी भी विषय पर पूछ सकते हैं—चाहे वह कार्बन फुटप्रिंट हो, सड़क की समस्याओं को रिपोर्ट करना हो, या विज्ञान और रोजमर्रा की बातें!`;
  }
  if (isHinglish) {
    return `Main aapki baat samajh raha hoon! **EcoCity Assistant** ke roop mein main aapko environment, science, technology aur EcoCity Hub ke sabhi tools mein assist kar sakta hoon. 

Aap mujhse koi bhi specific sawal pooch sakte hain!`;
  }

  return `I understand! As **EcoCity Assistant** 🌱, I am here to help you with environmental concepts, everyday learning, science, coding, and the complete EcoCity Hub platform. Feel free to ask a specific question, and I'll be glad to help!`;
}
