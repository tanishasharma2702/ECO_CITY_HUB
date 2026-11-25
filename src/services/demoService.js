// =============================================================================
// CivicLens / EcoCity Hub – Demo Account Engine & Data Seeding
// =============================================================================
// Provides rich, realistic, interconnected sample records for the official
// CivicLens Demo Account (demo@civiclens.org / Demo Citizen).
// Isolated safely from production users and persistent across browser reloads.

export const DEMO_USER_ID = 'demo-user-civiclens-001';
export const DEMO_EMAIL = 'demo@civiclens.org';

/**
 * Checks whether a given userId or active session corresponds to the official Demo Account.
 */
export function isDemoUser(userId) {
  if (!userId) {
    try {
      const active = localStorage.getItem('ecocity_demo_session');
      return Boolean(active);
    } catch {
      return false;
    }
  }
  if (userId === DEMO_USER_ID || userId === 'demo-user-ecocity-001') return true;
  try {
    const saved = localStorage.getItem('ecocity_demo_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.user?.id === userId || parsed?.user?.user_metadata?.is_demo) {
        return true;
      }
    }
  } catch {
    // Ignore storage parse issues
  }
  return false;
}

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  user_metadata: {
    full_name: 'Demo Citizen',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    theme_preference: 'light',
    font_size: 'md',
    language_preference: 'en',
    jurisdiction: 'Jaipur Municipal Corporation (Greater & Heritage)',
    phone: '+91 98765 43210',
    is_demo: true
  }
};

/**
 * Initializes baseline sample records for the Demo Account.
 * Populates:
 * 1. Profile metadata
 * 2. 7 Interconnected Civic Complaints (Potholes, Garbage, Broken Streetlights/AfterDark,
 *    Water Leak, Chronic Sinkhole/Silent Hotspots, Overflowing Drains, Open Manhole)
 * 3. 2 Carbon Audits showing -14.2% reduction trend with Gemini decarbonization roadmap
 * 4. 3 Botanical Diagnoses (Healthy Money Plant, Tomato Early Blight with organic cures, Tulsi)
 * 5. 520 Total Green Score points (Green Guardian level)
 * 6. 3 Completed + 2 Active Community Green Challenges
 */
export function initDemoData(userId = DEMO_USER_ID, forceRefresh = false) {
  try {
    // -------------------------------------------------------------------------
    // 1. Carbon Audits (Demonstrating measurable month-over-month reduction)
    // -------------------------------------------------------------------------
    const carbonKey = 'ecocity_table_carbon_records';
    const existingCarbon = JSON.parse(localStorage.getItem(carbonKey) || '[]');
    const demoCarbonCount = existingCarbon.filter(r => r.user_id === userId).length;

    if (forceRefresh || demoCarbonCount < 2) {
      const nonDemoCarbon = existingCarbon.filter(r => r.user_id !== userId);
      const baselineCarbon = [
        {
          id: 'carb-demo-001',
          user_id: userId,
          car_km: 40,
          motorbike_km: 15,
          transit_km: 25,
          bicycle_km: 5,
          walking_km: 8,
          electricity_kwh: 140,
          diet_type: 'vegetarian',
          transport_emissions: 39.46,
          electricity_emissions: 114.80,
          food_emissions: 85.00,
          total_emissions: 239.26,
          ai_recommendations: {
            summary: "Your estimated monthly footprint is 239.3 kg CO2e. You achieved a 14.2% reduction from last month! Your primary driver remains domestic electricity consumption. With continued daily habit improvements, you can cut emissions below 190 kg CO2e.",
            highEmissionActivities: [
              "Domestic Air Conditioning & Electricity (114.8 kg CO2e)",
              "Motorized Urban Commuting (39.5 kg CO2e)"
            ],
            personalizedTips: [
              {
                action: "Optimize Air Conditioning & Thermal Comfort",
                impact: "-25 kg CO2e/mo",
                practicalStep: "Set AC thermostat to 25°C and turn off compressor 30 minutes before exiting rooms."
              },
              {
                action: "Consolidate Vehicle Trips & Public Metro",
                impact: "-15 kg CO2e/mo",
                practicalStep: "Combine errands into 2 multi-stop routes and take the Jaipur Metro on Wednesdays."
              },
              {
                action: "Seasonal Organic Groceries",
                impact: "-10 kg CO2e/mo",
                practicalStep: "Support local farmers' mandis in C-Scheme to eliminate long-haul food transport emissions."
              }
            ],
            longTermGoal: "Target lowering your footprint below 190 kg CO2e/month by next quarter.",
            greenScoreBonusTip: "Complete the 'Public Transit Commute' weekly mission to earn +60 Green Points."
          },
          created_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 'carb-demo-002',
          user_id: userId,
          car_km: 85,
          motorbike_km: 30,
          transit_km: 10,
          bicycle_km: 0,
          walking_km: 3,
          electricity_kwh: 165,
          diet_type: 'vegetarian',
          transport_emissions: 58.20,
          electricity_emissions: 135.70,
          food_emissions: 85.00,
          total_emissions: 278.90,
          ai_recommendations: {
            summary: "Initial baseline assessment: 278.9 kg CO2e / month. Transport and cooling loads account for 70% of total emissions.",
            highEmissionActivities: ["Electricity (135.7 kg)", "Personal Car Commute (58.2 kg)"],
            personalizedTips: [
              { action: "Switch to Shared Transit", impact: "-20 kg CO2e/mo", practicalStep: "Replace solo car drives with bus or metro twice a week." }
            ],
            longTermGoal: "Reduce overall footprint by 15% within 60 days.",
            greenScoreBonusTip: "Conduct monthly audits to monitor progress."
          },
          created_at: new Date(Date.now() - 35 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(carbonKey, JSON.stringify([...baselineCarbon, ...nonDemoCarbon]));
    }

    // -------------------------------------------------------------------------
    // 2. Civic Reports (Placed across Jaipur, connected to CivicMap, AfterDark,
    //    Silent Hotspots, and CityTracker)
    // -------------------------------------------------------------------------
    const civicKey = 'ecocity_table_civic_reports';
    const existingCivic = JSON.parse(localStorage.getItem(civicKey) || '[]');
    const demoCivicCount = existingCivic.filter(r => r.user_id === userId).length;

    if (forceRefresh || demoCivicCount < 6) {
      const nonDemoCivic = existingCivic.filter(r => r.user_id !== userId);
      const baselineCivic = [
        {
          id: 'REP-94821',
          user_id: userId,
          title: 'Deep Road Surface Crater & Pothole on MI Road',
          category: 'Potholes',
          description: 'A large pothole roughly 2 feet wide has formed near the junction. Vehicles swerve abruptly to avoid it, creating a severe two-wheeler skid hazard.',
          image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Near Panch Batti, MI Road, Jaipur',
          latitude: 26.9154,
          longitude: 75.8115,
          priority: 'High',
          suggested_department: 'Public Works Department (PWD) / Municipal Road Maintenance Cell',
          status: 'Under Review',
          generated_complaint: 'To,\nThe Executive Engineer,\nPublic Works Department (PWD),\nJaipur Municipal Corporation, Rajasthan.\n\nSubject: Urgent Rectification of Dangerous Pothole on MI Road\n\nRespected Sir/Madam,\n\nI am writing to bring to your immediate attention a severe road depression located near Panch Batti on MI Road. The road sub-base has deteriorated, causing vehicular skidding during peak rush hours.\n\nPhotographic evidence has been recorded on CivicLens. I request prompt dispatch of an asphalt patch repair squad to restore roadway safety.\n\nYours faithfully,\nDemo Citizen (Jaipur)',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          id: 'REP-81043',
          user_id: userId,
          title: 'Overflowing Municipal Solid Waste Dump near C-Scheme',
          category: 'Garbage accumulation',
          description: 'Waste container overflow has spread onto the sidewalk, blocking pedestrian access and attracting stray animals.',
          image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Subhash Marg, C-Scheme, Jaipur',
          latitude: 26.9068,
          longitude: 75.8012,
          priority: 'Medium',
          suggested_department: 'Sanitation & Solid Waste Management Department',
          status: 'Resolved',
          generated_complaint: 'To,\nThe Health & Sanitation Officer,\nJaipur Municipal Corporation Heritage.\n\nSubject: Clearance of Overflowing Dump at Subhash Marg\n\nRespected Sir,\n\nThe secondary collection bins at Subhash Marg have reached maximum capacity. Immediate compactor truck clearance is requested to eliminate foul odors and health hazards.\n\nRegards,\nDemo Citizen',
          created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'REP-72914',
          user_id: userId,
          title: 'AfterDark Safety: Non-Functional Streetlights on Pedestrian Walkway',
          category: 'Broken streetlights',
          description: 'Four consecutive sodium-vapor street poles are completely dark after dusk. Female commuters and evening walkers face significant safety risks in this 200m unlit corridor.',
          image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Sector 3 Main Market Road, Malviya Nagar, Jaipur',
          latitude: 26.8532,
          longitude: 75.8174,
          priority: 'High',
          suggested_department: 'Municipal Electrical Engineering Division',
          status: 'Submitted',
          generated_complaint: 'To,\nThe Assistant Engineer (Electrical),\nJaipur Municipal Corporation Greater.\n\nSubject: AfterDark Urgent Request: Restoration of Street Lighting in Malviya Nagar Sector 3\n\nRespected Sir,\n\nI wish to report an unlit corridor spanning four lamp posts along Sector 3 Main Market Road. After dark, total darkness endangers pedestrians and nocturnal commuters.\n\nKindly replace burnt-out luminaires and inspect the junction box at the earliest.\n\nSincerely,\nDemo Citizen',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          id: 'REP-63520',
          user_id: userId,
          title: 'Potable Water Pipeline Burst & Continuous Road Inundation',
          category: 'Water leakage',
          description: 'A municipal underground feeder pipe has ruptured under the sidewalk, discharging thousands of liters of clean drinking water and flooding the low-lying service lane.',
          image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Near Gopalpura Flyover, Tonk Road, Jaipur',
          latitude: 26.8688,
          longitude: 75.7956,
          priority: 'Critical',
          suggested_department: 'Public Health Engineering Department (PHED) & Water Works Division',
          status: 'Under Review',
          generated_complaint: 'To,\nThe Executive Engineer,\nPublic Health Engineering Department (PHED), Jaipur.\n\nSubject: Critical Emergency: Feeder Pipe Rupture at Tonk Road\n\nRespected Sir,\n\nA major drinking water distribution pipe has burst near Gopalpura Flyover. Substantial water loss and street undermining are actively occurring.\n\nEmergency valve isolation and pipeline welding are requested urgently.\n\nYours faithfully,\nDemo Citizen',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          id: 'REP-54109',
          user_id: userId,
          title: 'Silent Hotspot: Chronic Asphalt Crumbling & Foundation Failure',
          category: 'Damaged roads',
          description: 'This intersection has subsided and deteriorated repeatedly after monsoon rains. Temporary patchworks wash away within weeks, indicating sub-base drainage failure.',
          image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Kiran Path Intersection, Mansarovar, Jaipur',
          latitude: 26.8584,
          longitude: 75.7662,
          priority: 'Critical',
          suggested_department: 'Road Infrastructure Quality Assurance & Reconstruction Cell',
          status: 'Submitted',
          generated_complaint: 'To,\nThe Superintending Engineer (Civil),\nJaipur Municipal Corporation Greater.\n\nSubject: Silent Hotspot Resolution: Permanent Foundation Reconstruction at Kiran Path\n\nRespected Sir,\n\nWe submit this citizen alert regarding the chronic road failure at Kiran Path, Mansarovar. This spot has failed 3 times in 6 months.\n\nWe request structural sub-base compaction and bituminous concrete re-laying rather than superficial cold patching.\n\nRespectfully,\nDemo Citizen & Community Residents',
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
          id: 'REP-41872',
          user_id: userId,
          title: 'Stormwater Culvert Blocked with Construction Silt & Plastic Debris',
          category: 'Overflowing drains',
          description: 'The primary roadside stormwater culvert was clogged with silt from nearby building construction, causing overflow onto residential driveways.',
          image_url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Lane 4, Near Dhuleshwar Garden, Raja Park, Jaipur',
          latitude: 26.8972,
          longitude: 75.8291,
          priority: 'Medium',
          suggested_department: 'Stormwater Drainage & Silt Clearance Wing',
          status: 'Resolved',
          generated_complaint: 'To,\nThe Silt & Drainage Division Officer,\nJaipur Municipal Corporation Heritage.\n\nSubject: Culvert Clearance at Raja Park Lane 4\n\nRespected Sir,\n\nThe open drainage outlet near Dhuleshwar Garden requires mechanical suction de-silting to avert monsoon waterlogging.\n\nRegards,\nDemo Citizen',
          created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 'REP-30948',
          user_id: userId,
          title: 'Missing Cast-Iron Storm Drain Grate on Active Cycle Track',
          category: 'Other civic problems',
          description: 'A cast-iron grating cover has dislodged or been stolen, leaving an exposed 3-foot drop on the designated bicycle track.',
          image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
          country: 'India',
          state: 'Rajasthan',
          city: 'Jaipur',
          address: 'Amrapali Circle, Vaishali Nagar, Jaipur',
          latitude: 26.9126,
          longitude: 75.7428,
          priority: 'Critical',
          suggested_department: 'Emergency Municipal Safety Squad',
          status: 'Under Review',
          generated_complaint: 'To,\nThe Emergency Safety Officer,\nJaipur Municipal Corporation Greater.\n\nSubject: Critical Pedestrian Trap: Missing Drain Grating at Amrapali Circle\n\nRespected Authority,\n\nAn uncovered stormwater drain opening presents an imminent peril to cyclists and night joggers at Amrapali Circle.\n\nImmediate barricading and replacement of the heavy-duty concrete/cast iron grating is requested.\n\nYours faithfully,\nDemo Citizen',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(civicKey, JSON.stringify([...baselineCivic, ...nonDemoCivic]));
    }

    // -------------------------------------------------------------------------
    // 3. Plant Health Diagnoses (Diverse botanical specimens with organic care)
    // -------------------------------------------------------------------------
    const plantKey = 'ecocity_table_plant_analyses';
    const existingPlant = JSON.parse(localStorage.getItem(plantKey) || '[]');
    const demoPlantCount = existingPlant.filter(r => r.user_id === userId).length;

    if (forceRefresh || demoPlantCount < 3) {
      const nonDemoPlant = existingPlant.filter(r => r.user_id !== userId);
      const baselinePlant = [
        {
          id: 'plnt-demo-001',
          user_id: userId,
          plant_name: 'Epipremnum aureum (Golden Pothos / Money Plant)',
          health_status: 'Healthy',
          symptoms: ['Glossy deep-green foliage', 'Normal chlorophyll distribution', 'Strong stem turgor'],
          possible_causes: ['Appropriate indirect ambient sunlight', 'Balanced weekly hydration cycle', 'Well-draining potting medium'],
          recommended_treatment: 'Continue standard maintenance. Mist leaves gently in dry weather and wipe dust off leaf blades bi-weekly with a damp cloth.',
          home_care: '1. Water only when top 1 inch of soil is dry.\n2. Keep in bright, filtered sunlight away from direct afternoon heat.\n3. Apply balanced vermicompost every 60 days.',
          prevention_tips: 'Ensure drainage holes in the pot remain unclogged to avoid root rot.',
          confidence_score: 94,
          image_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 'plnt-demo-002',
          user_id: userId,
          plant_name: 'Solanum lycopersicum (Tomato Foliage)',
          health_status: 'Moderate Disease',
          symptoms: [
            'Concentric circular brown necrotic lesions bordered by subtle yellow chlorotic halos',
            'Lower leaves drying and dropping prematurely'
          ],
          possible_causes: [
            'Early Blight fungal spore germination (Alternaria solani)',
            'Overhead foliage watering during high ambient humidity',
            'Soil-borne splash transmission onto lower leaves'
          ],
          recommended_treatment: 'Prune away heavily diseased lower foliage with sanitized shears. Spray safe organic copper soap fungicide or cold-pressed neem oil (5ml neem oil + 2 drops mild soap per 1 liter water) every 7 days.',
          home_care: '1. Water exclusively at the root base using a watering can or drip ring.\n2. Apply organic straw or dry leaf mulch around the stem to stop soil splashing.\n3. Stake vine for improved airflow.',
          prevention_tips: 'Sanitize pruning tools with 70% alcohol between different garden plants.',
          confidence_score: 91,
          image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8f?auto=format&fit=crop&w=600&q=80',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: 'plnt-demo-003',
          user_id: userId,
          plant_name: 'Ocimum tenuiflorum (Holy Basil / Tulsi)',
          health_status: 'Healthy',
          symptoms: [
            'Vibrant green fragrant foliage with natural serrated margins',
            'Mild inward leaf margin curl during midday sun exposure'
          ],
          possible_causes: [
            'Intense afternoon direct ultraviolet radiation',
            'Rapid terracotta container drying during peak hours'
          ],
          recommended_treatment: 'Water thoroughly early in the morning. Mulch the topsoil with dried wood shavings or crushed coco peat.',
          home_care: '1. Pinch off top flower seed spikes (manjaris) regularly to stimulate dense lateral bush growth.\n2. Add a handful of aged cow-dung compost or vermicompost once a month.',
          prevention_tips: 'Inspect leaf undersides weekly for aphids or whiteflies; wash with mild soap water if observed.',
          confidence_score: 93,
          image_url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80',
          created_at: new Date(Date.now() - 11 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(plantKey, JSON.stringify([...baselinePlant, ...nonDemoPlant]));
    }

    // -------------------------------------------------------------------------
    // 4. Green Score & Badges (520 Points • Green Guardian Tier)
    // -------------------------------------------------------------------------
    const scoreKey = 'ecocity_table_green_scores';
    const existingScores = JSON.parse(localStorage.getItem(scoreKey) || '[]');
    const nonDemoScores = existingScores.filter(s => s.user_id !== userId);

    const baselineScore = [
      {
        id: 'score-demo-001',
        user_id: userId,
        total_score: 520,
        carbon_score: 180,
        civic_score: 175,
        plant_score: 165,
        level_name: 'Green Guardian',
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(scoreKey, JSON.stringify([...baselineScore, ...nonDemoScores]));

    // -------------------------------------------------------------------------
    // 5. Community Challenges (Completed & Active Missions)
    // -------------------------------------------------------------------------
    const challengeKey = 'ecocity_table_user_challenges';
    const existingChallenges = JSON.parse(localStorage.getItem(challengeKey) || '[]');
    const nonDemoChallenges = existingChallenges.filter(c => c.user_id !== userId);

    const baselineChallenges = [
      { id: 'uch-01', user_id: userId, challenge_id: 'CH-01', completed: true, completed_at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: 'uch-03', user_id: userId, challenge_id: 'CH-03', completed: true, completed_at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { id: 'uch-04', user_id: userId, challenge_id: 'CH-04', completed: true, completed_at: new Date(Date.now() - 4 * 86400000).toISOString() }
    ];
    localStorage.setItem(challengeKey, JSON.stringify([...baselineChallenges, ...nonDemoChallenges]));

    // -------------------------------------------------------------------------
    // 6. User Activity Ledger
    // -------------------------------------------------------------------------
    const actKey = 'ecocity_table_user_activities';
    const existingAct = JSON.parse(localStorage.getItem(actKey) || '[]');
    const demoActCount = existingAct.filter(a => a.user_id === userId).length;

    if (forceRefresh || demoActCount < 5) {
      const nonDemoAct = existingAct.filter(a => a.user_id !== userId);
      const baselineAct = [
        {
          id: 'act-01',
          user_id: userId,
          activity_type: 'civic',
          description: 'Reported civic hazard: Broken streetlights in Malviya Nagar Sector 3',
          points_earned: 50,
          created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          id: 'act-02',
          user_id: userId,
          activity_type: 'civic',
          description: 'Reported critical water pipeline burst near Gopalpura Flyover',
          points_earned: 50,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'act-03',
          user_id: userId,
          activity_type: 'plant',
          description: 'Diagnosed and treated Epipremnum aureum (Money Plant) with AI organic care',
          points_earned: 40,
          created_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 'act-04',
          user_id: userId,
          activity_type: 'challenge',
          description: 'Completed weekly green challenge (CH-04: Botanical Care Session)',
          points_earned: 40,
          created_at: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
          id: 'act-05',
          user_id: userId,
          activity_type: 'carbon',
          description: 'Completed monthly Carbon Footprint audit (239.3 kg CO2e, -14.2% drop)',
          points_earned: 30,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: 'act-06',
          user_id: userId,
          activity_type: 'challenge',
          description: 'Completed weekly green challenge (CH-03: Citizen Hazard Scout)',
          points_earned: 50,
          created_at: new Date(Date.now() - 6 * 86400000).toISOString()
        },
        {
          id: 'act-07',
          user_id: userId,
          activity_type: 'plant',
          description: 'Diagnosed early blight on Tomato Foliage and applied neem oil organic cure',
          points_earned: 40,
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: 'act-08',
          user_id: userId,
          activity_type: 'challenge',
          description: 'Completed weekly green challenge (CH-01: Zero Waste Grocery Run)',
          points_earned: 50,
          created_at: new Date(Date.now() - 10 * 86400000).toISOString()
        }
      ];
      localStorage.setItem(actKey, JSON.stringify([...baselineAct, ...nonDemoAct]));
    }

    // -------------------------------------------------------------------------
    // 7. Base Challenges Definition
    // -------------------------------------------------------------------------
    const chTableKey = 'ecocity_table_green_challenges';
    const existingTableCh = JSON.parse(localStorage.getItem(chTableKey) || '[]');
    if (existingTableCh.length < 5) {
      const baseChallenges = [
        { id: 'CH-01', title: 'Zero Waste Grocery Run', description: 'Use reusable cloth bags and choose unpackaged produce during your weekly market trip.', category: 'waste', points: 50, is_active: true },
        { id: 'CH-02', title: 'Public Transit Day', description: 'Commute using the Jaipur Metro or low-floor electric bus instead of a private car or scooter.', category: 'transport', points: 60, is_active: true },
        { id: 'CH-03', title: 'Citizen Hazard Scout', description: 'Report an active pothole, streetlight blackout, or garbage accumulation to municipal authorities.', category: 'civic', points: 50, is_active: true },
        { id: 'CH-04', title: 'Botanical Care Session', description: 'Inspect your house plants or garden for pests/disease and treat using organic remedies.', category: 'plants', points: 40, is_active: true },
        { id: 'CH-05', title: 'Energy Conservation Hour', description: 'Turn off all non-essential lights and appliances during peak grid hours.', category: 'energy', points: 50, is_active: true }
      ];
      localStorage.setItem(chTableKey, JSON.stringify(baseChallenges));
    }

  } catch (err) {
    console.warn('Error seeding rich demo data:', err);
  }
}

/**
 * Resets demo account data back to original pristine state
 */
export function resetDemoData() {
  initDemoData(DEMO_USER_ID, true);
}
