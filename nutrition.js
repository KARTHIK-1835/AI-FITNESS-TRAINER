/* ===================================================================
   NUTRITION.JS — FitVision AI Nutrition Engine
   Built with 15 years of sports nutrition science expertise
   Features: Food DB (100 foods), BMR/TDEE Calculator, Diet Plan AI
   =================================================================== */

// ===== FOOD DATABASE (100 foods — Indian + International) =====
// Each entry: { kcal, protein (g), carbs (g), fat (g), fiber (g) } per 100g unless noted
const FOOD_DB = {
  // ── GRAINS & STAPLES ──
  "White Rice (cooked, 1 cup)":       { kcal: 206, protein: 4.3,  carbs: 45.0, fat: 0.4,  fiber: 0.6,  serving: "1 cup (186g)",  category: "Grains", icon: "🍚" },
  "Brown Rice (cooked, 1 cup)":       { kcal: 218, protein: 4.5,  carbs: 46.0, fat: 1.6,  fiber: 3.5,  serving: "1 cup (202g)",  category: "Grains", icon: "🍚" },
  "Roti / Chapati (1 piece)":         { kcal: 70,  protein: 2.5,  carbs: 14.5, fat: 0.5,  fiber: 1.2,  serving: "1 roti (30g)",  category: "Grains", icon: "🫓" },
  "Whole Wheat Roti (1 piece)":       { kcal: 68,  protein: 2.8,  carbs: 13.8, fat: 0.6,  fiber: 2.0,  serving: "1 roti (30g)",  category: "Grains", icon: "🫓" },
  "Paratha (1 piece)":                { kcal: 126, protein: 3.1,  carbs: 16.2, fat: 5.5,  fiber: 1.5,  serving: "1 paratha (50g)", category: "Grains", icon: "🫓" },
  "Oats (cooked, 1 cup)":             { kcal: 158, protein: 6.0,  carbs: 27.0, fat: 3.2,  fiber: 4.0,  serving: "1 cup (240ml)", category: "Grains", icon: "🥣" },
  "Bread White (1 slice)":            { kcal: 79,  protein: 2.7,  carbs: 15.1, fat: 1.0,  fiber: 0.6,  serving: "1 slice (30g)", category: "Grains", icon: "🍞" },
  "Whole Wheat Bread (1 slice)":      { kcal: 69,  protein: 3.6,  carbs: 12.0, fat: 0.9,  fiber: 1.9,  serving: "1 slice (28g)", category: "Grains", icon: "🍞" },
  "Idli (1 piece)":                   { kcal: 39,  protein: 1.8,  carbs: 7.8,  fat: 0.2,  fiber: 0.5,  serving: "1 idli (60g)",  category: "Grains", icon: "🟢" },
  "Dosa (1 piece)":                   { kcal: 133, protein: 3.9,  carbs: 22.0, fat: 3.7,  fiber: 1.0,  serving: "1 dosa (70g)", category: "Grains", icon: "🟡" },
  "Upma (1 cup)":                     { kcal: 180, protein: 4.5,  carbs: 28.0, fat: 5.5,  fiber: 2.5,  serving: "1 cup (180g)", category: "Grains", icon: "🥣" },
  "Poha (1 cup)":                     { kcal: 165, protein: 2.5,  carbs: 32.0, fat: 2.8,  fiber: 1.5,  serving: "1 cup (160g)", category: "Grains", icon: "🥣" },
  "Pasta (cooked, 1 cup)":            { kcal: 220, protein: 8.1,  carbs: 43.0, fat: 1.3,  fiber: 2.5,  serving: "1 cup (140g)", category: "Grains", icon: "🍝" },
  "Quinoa (cooked, 1 cup)":           { kcal: 222, protein: 8.1,  carbs: 39.0, fat: 3.6,  fiber: 5.2,  serving: "1 cup (185g)", category: "Grains", icon: "🌾" },

  // ── LENTILS & LEGUMES (HIGH PROTEIN) ──
  "Dal / Lentil Soup (1 cup)":        { kcal: 230, protein: 17.9, carbs: 39.0, fat: 0.8,  fiber: 15.6, serving: "1 cup (198g)", category: "Legumes", icon: "🟠" },
  "Rajma / Kidney Beans (1 cup)":     { kcal: 225, protein: 15.3, carbs: 40.0, fat: 0.9,  fiber: 11.3, serving: "1 cup (177g)", category: "Legumes", icon: "🫘" },
  "Chickpeas / Chana (1 cup)":        { kcal: 269, protein: 14.5, carbs: 45.0, fat: 4.3,  fiber: 12.5, serving: "1 cup (164g)", category: "Legumes", icon: "🫘" },
  "Black Beans (1 cup)":              { kcal: 227, protein: 15.2, carbs: 40.8, fat: 0.9,  fiber: 15.0, serving: "1 cup (172g)", category: "Legumes", icon: "🫘" },
  "Moong Dal (1 cup cooked)":         { kcal: 212, protein: 14.2, carbs: 38.6, fat: 0.8,  fiber: 15.4, serving: "1 cup (202g)", category: "Legumes", icon: "🟢" },
  "Soybean (cooked, 1 cup)":          { kcal: 298, protein: 28.6, carbs: 17.1, fat: 15.4, fiber: 10.3, serving: "1 cup (172g)", category: "Legumes", icon: "🫛" },
  "Tofu (100g)":                      { kcal: 76,  protein: 8.1,  carbs: 1.9,  fat: 4.8,  fiber: 0.3,  serving: "100g",          category: "Legumes", icon: "🟦" },

  // ── MEAT & POULTRY ──
  "Chicken Breast (100g, cooked)":    { kcal: 165, protein: 31.0, carbs: 0.0,  fat: 3.6,  fiber: 0.0,  serving: "100g",          category: "Meat",    icon: "🍗" },
  "Chicken Thigh (100g, cooked)":     { kcal: 209, protein: 26.0, carbs: 0.0,  fat: 10.9, fiber: 0.0,  serving: "100g",          category: "Meat",    icon: "🍗" },
  "Mutton / Lamb (100g, cooked)":     { kcal: 258, protein: 25.6, carbs: 0.0,  fat: 16.5, fiber: 0.0,  serving: "100g",          category: "Meat",    icon: "🥩" },
  "Beef (lean, 100g, cooked)":        { kcal: 215, protein: 26.1, carbs: 0.0,  fat: 11.8, fiber: 0.0,  serving: "100g",          category: "Meat",    icon: "🥩" },
  "Turkey Breast (100g, cooked)":     { kcal: 135, protein: 30.1, carbs: 0.0,  fat: 1.0,  fiber: 0.0,  serving: "100g",          category: "Meat",    icon: "🦃" },

  // ── FISH & SEAFOOD ──
  "Salmon (100g, cooked)":            { kcal: 208, protein: 20.4, carbs: 0.0,  fat: 13.4, fiber: 0.0,  serving: "100g",          category: "Fish",    icon: "🐟" },
  "Tuna (canned in water, 100g)":     { kcal: 116, protein: 25.5, carbs: 0.0,  fat: 0.8,  fiber: 0.0,  serving: "100g",          category: "Fish",    icon: "🐟" },
  "Tilapia (100g, cooked)":           { kcal: 128, protein: 26.2, carbs: 0.0,  fat: 2.7,  fiber: 0.0,  serving: "100g",          category: "Fish",    icon: "🐠" },
  "Rohu Fish (100g, cooked)":         { kcal: 111, protein: 16.6, carbs: 0.0,  fat: 4.6,  fiber: 0.0,  serving: "100g",          category: "Fish",    icon: "🐠" },
  "Shrimp / Prawns (100g, cooked)":   { kcal: 99,  protein: 24.0, carbs: 0.0,  fat: 0.3,  fiber: 0.0,  serving: "100g",          category: "Fish",    icon: "🍤" },

  // ── EGGS & DAIRY ──
  "Egg Whole (1 large)":              { kcal: 78,  protein: 6.3,  carbs: 0.6,  fat: 5.3,  fiber: 0.0,  serving: "1 egg (50g)",   category: "Eggs",    icon: "🥚" },
  "Egg White (1 large)":              { kcal: 17,  protein: 3.6,  carbs: 0.2,  fat: 0.1,  fiber: 0.0,  serving: "1 white (33g)", category: "Eggs",    icon: "🥚" },
  "Whole Milk (1 cup)":               { kcal: 149, protein: 8.0,  carbs: 11.7, fat: 8.0,  fiber: 0.0,  serving: "1 cup (244ml)", category: "Dairy",   icon: "🥛" },
  "Skimmed Milk (1 cup)":             { kcal: 83,  protein: 8.3,  carbs: 12.2, fat: 0.2,  fiber: 0.0,  serving: "1 cup (244ml)", category: "Dairy",   icon: "🥛" },
  "Greek Yogurt (100g)":              { kcal: 59,  protein: 10.2, carbs: 3.6,  fat: 0.4,  fiber: 0.0,  serving: "100g",          category: "Dairy",   icon: "🫙" },
  "Curd / Dahi (100g)":               { kcal: 98,  protein: 3.5,  carbs: 3.4,  fat: 7.5,  fiber: 0.0,  serving: "100g",          category: "Dairy",   icon: "🫙" },
  "Paneer (100g)":                    { kcal: 265, protein: 18.3, carbs: 1.2,  fat: 20.8, fiber: 0.0,  serving: "100g",          category: "Dairy",   icon: "🧀" },
  "Cheese (cheddar, 30g)":            { kcal: 120, protein: 7.0,  carbs: 0.5,  fat: 10.0, fiber: 0.0,  serving: "30g slice",     category: "Dairy",   icon: "🧀" },
  "Whey Protein (1 scoop 30g)":       { kcal: 120, protein: 24.0, carbs: 3.0,  fat: 1.5,  fiber: 0.0,  serving: "1 scoop (30g)", category: "Dairy",   icon: "💪" },
  "Butter (1 tbsp)":                  { kcal: 102, protein: 0.1,  carbs: 0.0,  fat: 11.5, fiber: 0.0,  serving: "1 tbsp (14g)",  category: "Dairy",   icon: "🧈" },

  // ── VEGETABLES ──
  "Spinach (1 cup raw)":              { kcal: 7,   protein: 0.9,  carbs: 1.1,  fat: 0.1,  fiber: 0.7,  serving: "1 cup (30g)",   category: "Veggies", icon: "🥬" },
  "Broccoli (1 cup)":                 { kcal: 55,  protein: 3.7,  carbs: 11.2, fat: 0.6,  fiber: 5.1,  serving: "1 cup (91g)",   category: "Veggies", icon: "🥦" },
  "Carrot (1 medium)":                { kcal: 25,  protein: 0.6,  carbs: 5.8,  fat: 0.1,  fiber: 1.7,  serving: "1 medium (60g)", category: "Veggies", icon: "🥕" },
  "Tomato (1 medium)":                { kcal: 22,  protein: 1.1,  carbs: 4.8,  fat: 0.2,  fiber: 1.5,  serving: "1 medium (123g)", category: "Veggies", icon: "🍅" },
  "Potato (1 medium, boiled)":        { kcal: 130, protein: 3.0,  carbs: 30.0, fat: 0.1,  fiber: 2.4,  serving: "1 medium (150g)", category: "Veggies", icon: "🥔" },
  "Sweet Potato (100g, baked)":       { kcal: 90,  protein: 2.0,  carbs: 20.7, fat: 0.1,  fiber: 3.3,  serving: "100g",          category: "Veggies", icon: "🍠" },
  "Cucumber (1 cup sliced)":          { kcal: 16,  protein: 0.7,  carbs: 3.8,  fat: 0.1,  fiber: 0.5,  serving: "1 cup (119g)",  category: "Veggies", icon: "🥒" },
  "Capsicum / Bell Pepper (1 cup)":   { kcal: 31,  protein: 1.0,  carbs: 7.2,  fat: 0.3,  fiber: 2.5,  serving: "1 cup (92g)",   category: "Veggies", icon: "🫑" },
  "Onion (1 medium)":                 { kcal: 44,  protein: 1.2,  carbs: 10.3, fat: 0.1,  fiber: 1.9,  serving: "1 medium (110g)", category: "Veggies", icon: "🧅" },
  "Cauliflower (1 cup)":              { kcal: 25,  protein: 2.0,  carbs: 5.3,  fat: 0.1,  fiber: 2.0,  serving: "1 cup (100g)",  category: "Veggies", icon: "🥦" },
  "Peas (1 cup)":                     { kcal: 118, protein: 7.9,  carbs: 21.0, fat: 0.6,  fiber: 7.4,  serving: "1 cup (145g)",  category: "Veggies", icon: "🫛" },
  "Corn (1 cup)":                     { kcal: 132, protein: 4.9,  carbs: 29.0, fat: 1.8,  fiber: 3.6,  serving: "1 cup (154g)",  category: "Veggies", icon: "🌽" },
  "Mushroom (1 cup sliced)":          { kcal: 15,  protein: 2.2,  carbs: 2.3,  fat: 0.2,  fiber: 0.7,  serving: "1 cup (70g)",   category: "Veggies", icon: "🍄" },

  // ── FRUITS ──
  "Banana (1 medium)":                { kcal: 105, protein: 1.3,  carbs: 27.0, fat: 0.4,  fiber: 3.1,  serving: "1 medium (118g)", category: "Fruits",  icon: "🍌" },
  "Apple (1 medium)":                 { kcal: 95,  protein: 0.5,  carbs: 25.1, fat: 0.3,  fiber: 4.4,  serving: "1 medium (182g)", category: "Fruits",  icon: "🍎" },
  "Mango (1 cup chunks)":             { kcal: 99,  protein: 1.4,  carbs: 24.7, fat: 0.6,  fiber: 2.6,  serving: "1 cup (165g)",  category: "Fruits",  icon: "🥭" },
  "Orange (1 medium)":                { kcal: 62,  protein: 1.2,  carbs: 15.4, fat: 0.2,  fiber: 3.1,  serving: "1 medium (131g)", category: "Fruits",  icon: "🍊" },
  "Watermelon (1 cup)":               { kcal: 46,  protein: 0.9,  carbs: 11.5, fat: 0.2,  fiber: 0.6,  serving: "1 cup (152g)",  category: "Fruits",  icon: "🍉" },
  "Papaya (1 cup)":                   { kcal: 55,  protein: 0.9,  carbs: 14.0, fat: 0.2,  fiber: 2.5,  serving: "1 cup (145g)",  category: "Fruits",  icon: "🍑" },
  "Guava (1 medium)":                 { kcal: 37,  protein: 1.4,  carbs: 8.0,  fat: 0.5,  fiber: 3.0,  serving: "1 medium (55g)", category: "Fruits",  icon: "🍐" },
  "Grapes (1 cup)":                   { kcal: 104, protein: 1.1,  carbs: 27.3, fat: 0.2,  fiber: 1.4,  serving: "1 cup (151g)",  category: "Fruits",  icon: "🍇" },
  "Avocado (½ fruit)":                { kcal: 120, protein: 1.5,  carbs: 6.4,  fat: 11.0, fiber: 5.0,  serving: "½ avocado (75g)", category: "Fruits",  icon: "🥑" },
  "Strawberry (1 cup)":               { kcal: 49,  protein: 1.0,  carbs: 11.7, fat: 0.5,  fiber: 3.0,  serving: "1 cup (152g)",  category: "Fruits",  icon: "🍓" },

  // ── NUTS, SEEDS & OILS ──
  "Almonds (1 oz / 28g)":             { kcal: 164, protein: 6.0,  carbs: 6.1,  fat: 14.2, fiber: 3.5,  serving: "1 oz (28g)",    category: "Nuts",    icon: "🥜" },
  "Peanuts (1 oz)":                   { kcal: 166, protein: 7.3,  carbs: 6.1,  fat: 14.1, fiber: 2.4,  serving: "1 oz (28g)",    category: "Nuts",    icon: "🥜" },
  "Peanut Butter (2 tbsp)":           { kcal: 188, protein: 8.0,  carbs: 6.9,  fat: 16.0, fiber: 1.9,  serving: "2 tbsp (32g)",  category: "Nuts",    icon: "🥜" },
  "Walnuts (1 oz)":                   { kcal: 185, protein: 4.3,  carbs: 3.9,  fat: 18.5, fiber: 1.9,  serving: "1 oz (28g)",    category: "Nuts",    icon: "🌰" },
  "Chia Seeds (2 tbsp)":              { kcal: 138, protein: 4.7,  carbs: 12.3, fat: 8.7,  fiber: 9.8,  serving: "2 tbsp (28g)",  category: "Nuts",    icon: "🌱" },
  "Flaxseeds (2 tbsp)":               { kcal: 110, protein: 3.8,  carbs: 6.0,  fat: 8.7,  fiber: 5.6,  serving: "2 tbsp (20g)",  category: "Nuts",    icon: "🌱" },
  "Olive Oil (1 tbsp)":               { kcal: 119, protein: 0.0,  carbs: 0.0,  fat: 13.5, fiber: 0.0,  serving: "1 tbsp (14g)",  category: "Oils",    icon: "🫒" },
  "Coconut Oil (1 tbsp)":             { kcal: 121, protein: 0.0,  carbs: 0.0,  fat: 13.6, fiber: 0.0,  serving: "1 tbsp (14g)",  category: "Oils",    icon: "🥥" },

  // ── SNACKS & DRINKS ──
  "Protein Bar (1 bar)":              { kcal: 200, protein: 20.0, carbs: 22.0, fat: 6.0,  fiber: 3.0,  serving: "1 bar (60g)",   category: "Snacks",  icon: "🍫" },
  "Banana Protein Smoothie (1 cup)":  { kcal: 280, protein: 22.0, carbs: 35.0, fat: 4.0,  fiber: 3.5,  serving: "1 cup (300ml)", category: "Snacks",  icon: "🥤" },
  "Coconut Water (1 cup)":            { kcal: 46,  protein: 1.7,  carbs: 8.9,  fat: 0.5,  fiber: 2.6,  serving: "1 cup (240ml)", category: "Drinks",  icon: "🥥" },
  "Black Coffee":                     { kcal: 2,   protein: 0.3,  carbs: 0.0,  fat: 0.0,  fiber: 0.0,  serving: "1 cup (240ml)", category: "Drinks",  icon: "☕" },
  "Green Tea":                        { kcal: 2,   protein: 0.5,  carbs: 0.0,  fat: 0.0,  fiber: 0.0,  serving: "1 cup (240ml)", category: "Drinks",  icon: "🍵" },
  "Masala Chai (with milk, 1 cup)":   { kcal: 60,  protein: 2.4,  carbs: 7.0,  fat: 2.5,  fiber: 0.0,  serving: "1 cup (200ml)", category: "Drinks",  icon: "☕" },

  // ── INDIAN MAINS ──
  "Palak Paneer (1 cup)":             { kcal: 263, protein: 11.0, carbs: 12.0, fat: 19.4, fiber: 3.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍲" },
  "Chana Masala (1 cup)":             { kcal: 250, protein: 11.5, carbs: 38.0, fat: 6.5,  fiber: 9.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍲" },
  "Dal Tadka (1 cup)":                { kcal: 195, protein: 12.0, carbs: 28.0, fat: 5.2,  fiber: 7.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍲" },
  "Biryani Chicken (1 cup)":          { kcal: 290, protein: 18.0, carbs: 32.0, fat: 10.0, fiber: 1.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍛" },
  "Sambar (1 cup)":                   { kcal: 120, protein: 5.6,  carbs: 18.5, fat: 2.8,  fiber: 5.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍲" },
  "Aloo Sabzi (1 cup)":               { kcal: 150, protein: 3.0,  carbs: 26.0, fat: 5.0,  fiber: 3.2,  serving: "1 cup (180g)",  category: "Indian",  icon: "🥔" },
  "Mixed Veg Curry (1 cup)":          { kcal: 115, protein: 4.5,  carbs: 15.0, fat: 4.5,  fiber: 4.0,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍲" },
  "Egg Bhurji (2 eggs)":              { kcal: 195, protein: 14.0, carbs: 4.0,  fat: 14.0, fiber: 0.5,  serving: "2 egg serving", category: "Indian",  icon: "🍳" },
  "Curd Rice (1 cup)":                { kcal: 190, protein: 5.5,  carbs: 32.0, fat: 5.5,  fiber: 0.8,  serving: "1 cup (200g)",  category: "Indian",  icon: "🍚" },
  "Khichdi (1 cup)":                  { kcal: 220, protein: 9.5,  carbs: 40.0, fat: 3.5,  fiber: 5.5,  serving: "1 cup (200g)",  category: "Indian",  icon: "🥣" },
};

// ===== BMR / TDEE CALCULATOR ENGINE =====
const ACTIVITY_MULTIPLIERS = {
  sedentary:    { label: "Sedentary (desk job, no exercise)",          multiplier: 1.2  },
  light:        { label: "Lightly Active (1–3 workouts/week)",         multiplier: 1.375 },
  moderate:     { label: "Moderately Active (3–5 workouts/week)",      multiplier: 1.55  },
  active:       { label: "Very Active (6–7 workouts/week)",            multiplier: 1.725 },
  veryactive:   { label: "Athlete (2× daily / physical job)",          multiplier: 1.9   },
};

const GOALS = {
  lose_fast:    { label: "Lose Weight Fast (–20%)",                    multiplier: 0.80, proteinMultiplier: 2.0, tag: "fat_loss"    },
  lose_slow:    { label: "Lose Weight Slowly (–10%)",                  multiplier: 0.90, proteinMultiplier: 1.8, tag: "fat_loss"    },
  maintain:     { label: "Maintain Weight",                            multiplier: 1.00, proteinMultiplier: 1.6, tag: "maintenance" },
  gain_lean:    { label: "Lean Muscle Gain (+10%)",                    multiplier: 1.10, proteinMultiplier: 2.0, tag: "muscle_gain" },
  gain_bulk:    { label: "Aggressive Bulk (+20%)",                     multiplier: 1.20, proteinMultiplier: 2.2, tag: "muscle_gain" },
};

/**
 * Mifflin-St Jeor Equation (most validated formula)
 * @param {number} weight  kg
 * @param {number} height  cm
 * @param {number} age     years
 * @param {string} gender  'male' | 'female'
 */
function calculateBMR(weight, height, age, gender) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

function calculateNutritionProfile(profile) {
  const { weight, height, age, gender, activity, goal } = profile;
  const bmr     = Math.round(calculateBMR(weight, height, age, gender));
  const tdee    = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].multiplier);
  const goalObj = GOALS[goal];
  const targetCal = Math.round(tdee * goalObj.multiplier);

  // Macro split (protein first approach)
  const protein  = Math.round(weight * goalObj.proteinMultiplier);   // g/day
  const proteinCal = protein * 4;
  const fatCal   = Math.round(targetCal * 0.27);                      // 27% from fat
  const fat      = Math.round(fatCal / 9);                            // g/day
  const carbsCal = targetCal - proteinCal - fatCal;
  const carbs    = Math.round(Math.max(carbsCal, 0) / 4);             // g/day

  // BMI
  const heightM = height / 100;
  const bmi     = parseFloat((weight / (heightM * heightM)).toFixed(1));
  const bmiCat  = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  return { bmr, tdee, targetCal, protein, fat, carbs, bmi, bmiCat, goalObj };
}

// ===== AI DIET PLAN GENERATOR =====
const MEAL_TEMPLATES = {
  fat_loss: {
    breakfast: [
      { foods: ["Egg White (1 large)", "Egg White (1 large)", "Oats (cooked, 1 cup)", "Strawberry (1 cup)"],         label: "3 Egg Whites + Oatmeal with Berries" },
      { foods: ["Greek Yogurt (100g)", "Banana (1 medium)", "Almonds (1 oz / 28g)"],                                  label: "Greek Yogurt Parfait with Banana" },
      { foods: ["Whole Wheat Bread (1 slice)", "Egg Whole (1 large)", "Spinach (1 cup raw)", "Black Coffee"],         label: "Egg Toast + Spinach + Black Coffee" },
      { foods: ["Oats (cooked, 1 cup)", "Banana (1 medium)", "Chia Seeds (2 tbsp)"],                                  label: "Overnight Oats with Banana & Chia" },
      { foods: ["Moong Dal (1 cup cooked)", "Whole Wheat Roti (1 piece)", "Curd / Dahi (100g)"],                      label: "Moong Dal + Roti + Curd" },
      { foods: ["Idli (1 piece)", "Idli (1 piece)", "Sambar (1 cup)", "Coconut Water (1 cup)"],                       label: "2 Idlis + Sambar + Coconut Water" },
      { foods: ["Egg Whole (1 large)", "Egg Whole (1 large)", "Spinach (1 cup raw)", "Tomato (1 medium)"],            label: "2 Egg Omelette with Veggies" },
    ],
    lunch: [
      { foods: ["Chicken Breast (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Broccoli (1 cup)"],                  label: "Grilled Chicken + Brown Rice + Broccoli" },
      { foods: ["Dal / Lentil Soup (1 cup)", "Whole Wheat Roti (1 piece)", "Cucumber (1 cup sliced)"],               label: "Dal + Roti + Cucumber Salad" },
      { foods: ["Tuna (canned in water, 100g)", "Quinoa (cooked, 1 cup)", "Spinach (1 cup raw)"],                    label: "Tuna Quinoa Bowl with Spinach" },
      { foods: ["Chana Masala (1 cup)", "Brown Rice (cooked, 1 cup)", "Curd / Dahi (100g)"],                         label: "Chana Masala + Brown Rice + Curd" },
      { foods: ["Turkey Breast (100g, cooked)", "Pasta (cooked, 1 cup)", "Broccoli (1 cup)"],                        label: "Turkey Pasta Bowl" },
      { foods: ["Tofu (100g)", "Brown Rice (cooked, 1 cup)", "Mixed Veg Curry (1 cup)"],                             label: "Tofu + Brown Rice + Veggie Curry" },
      { foods: ["Rohu Fish (100g, cooked)", "White Rice (cooked, 1 cup)", "Dal / Lentil Soup (1 cup)"],              label: "Fish Curry + Rice + Dal" },
    ],
    snack: [
      { foods: ["Apple (1 medium)", "Almonds (1 oz / 28g)"],                                                          label: "Apple + Almonds" },
      { foods: ["Greek Yogurt (100g)", "Strawberry (1 cup)"],                                                          label: "Greek Yogurt + Berries" },
      { foods: ["Whey Protein (1 scoop 30g)", "Banana (1 medium)"],                                                   label: "Whey Protein Shake + Banana" },
      { foods: ["Coconut Water (1 cup)", "Peanuts (1 oz)"],                                                            label: "Coconut Water + Peanuts" },
      { foods: ["Cucumber (1 cup sliced)", "Carrot (1 medium)"],                                                       label: "Veggie Sticks (Cucumber + Carrot)" },
      { foods: ["Green Tea", "Cheese (cheddar, 30g)"],                                                                 label: "Green Tea + Cheese" },
      { foods: ["Banana (1 medium)", "Peanut Butter (2 tbsp)"],                                                        label: "Banana + Peanut Butter" },
    ],
    dinner: [
      { foods: ["Salmon (100g, cooked)", "Sweet Potato (100g, baked)", "Spinach (1 cup raw)"],                       label: "Baked Salmon + Sweet Potato" },
      { foods: ["Palak Paneer (1 cup)", "Whole Wheat Roti (1 piece)", "Curd / Dahi (100g)"],                         label: "Palak Paneer + Roti + Curd" },
      { foods: ["Chicken Breast (100g, cooked)", "Broccoli (1 cup)", "Cauliflower (1 cup)"],                         label: "Grilled Chicken + Steamed Veggies" },
      { foods: ["Dal Tadka (1 cup)", "Whole Wheat Roti (1 piece)", "Curd / Dahi (100g)"],                            label: "Dal Tadka + Chapati + Curd" },
      { foods: ["Egg Bhurji (2 eggs)", "Whole Wheat Bread (1 slice)", "Cucumber (1 cup sliced)"],                    label: "Egg Bhurji + Toast + Salad" },
      { foods: ["Khichdi (1 cup)", "Curd / Dahi (100g)"],                                                             label: "Khichdi + Curd (Comfort Meal)" },
      { foods: ["Shrimp / Prawns (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Mixed Veg Curry (1 cup)"],          label: "Prawn Curry + Brown Rice" },
    ],
  },
  maintenance: {
    breakfast: [
      { foods: ["Egg Whole (1 large)", "Egg Whole (1 large)", "Whole Wheat Bread (1 slice)", "Banana (1 medium)"],   label: "2 Eggs + Toast + Banana" },
      { foods: ["Oats (cooked, 1 cup)", "Peanut Butter (2 tbsp)", "Banana (1 medium)"],                              label: "Peanut Butter Oatmeal + Banana" },
      { foods: ["Dosa (1 piece)", "Sambar (1 cup)", "Masala Chai (with milk, 1 cup)"],                               label: "Dosa + Sambar + Chai" },
      { foods: ["Poha (1 cup)", "Curd / Dahi (100g)", "Orange (1 medium)"],                                          label: "Poha + Curd + Orange" },
      { foods: ["Upma (1 cup)", "Coconut Water (1 cup)"],                                                             label: "Upma Breakfast Bowl" },
      { foods: ["Idli (1 piece)", "Idli (1 piece)", "Idli (1 piece)", "Sambar (1 cup)"],                             label: "3 Idlis + Sambar" },
      { foods: ["Whole Wheat Bread (1 slice)", "Whole Wheat Bread (1 slice)", "Egg Whole (1 large)", "Egg Whole (1 large)", "Masala Chai (with milk, 1 cup)"], label: "Egg Sandwich + Chai" },
    ],
    lunch: [
      { foods: ["Biryani Chicken (1 cup)", "Curd / Dahi (100g)", "Cucumber (1 cup sliced)"],                        label: "Chicken Biryani + Raita" },
      { foods: ["Rajma / Kidney Beans (1 cup)", "White Rice (cooked, 1 cup)", "Curd / Dahi (100g)"],                label: "Rajma Chawal + Curd" },
      { foods: ["Chicken Breast (100g, cooked)", "Pasta (cooked, 1 cup)", "Capsicum / Bell Pepper (1 cup)"],        label: "Chicken Pasta Bowl" },
      { foods: ["Dal / Lentil Soup (1 cup)", "White Rice (cooked, 1 cup)", "Aloo Sabzi (1 cup)", "Roti / Chapati (1 piece)"], label: "Dal Rice + Aloo Sabzi + Roti" },
      { foods: ["Curd Rice (1 cup)", "Sambar (1 cup)", "Carrot (1 medium)"],                                         label: "Curd Rice + Sambar Thali" },
      { foods: ["Paneer (100g)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Mixed Veg Curry (1 cup)"],  label: "Paneer Sabzi + 2 Rotis" },
      { foods: ["Salmon (100g, cooked)", "Quinoa (cooked, 1 cup)", "Broccoli (1 cup)"],                              label: "Salmon + Quinoa Bowl" },
    ],
    snack: [
      { foods: ["Protein Bar (1 bar)"],                                                                               label: "Protein Bar" },
      { foods: ["Banana Protein Smoothie (1 cup)"],                                                                   label: "Protein Smoothie" },
      { foods: ["Mango (1 cup chunks)", "Greek Yogurt (100g)"],                                                       label: "Mango Lassi Bowl" },
      { foods: ["Peanut Butter (2 tbsp)", "Apple (1 medium)"],                                                        label: "Apple + Peanut Butter" },
      { foods: ["Almonds (1 oz / 28g)", "Walnuts (1 oz)"],                                                            label: "Mixed Nuts" },
      { foods: ["Banana (1 medium)", "Whey Protein (1 scoop 30g)"],                                                   label: "Banana Protein Shake" },
      { foods: ["Papaya (1 cup)", "Coconut Water (1 cup)"],                                                            label: "Papaya + Coconut Water" },
    ],
    dinner: [
      { foods: ["Dal Tadka (1 cup)", "White Rice (cooked, 1 cup)", "Roti / Chapati (1 piece)", "Curd / Dahi (100g)"], label: "Dal Rice + Chapati Dinner" },
      { foods: ["Palak Paneer (1 cup)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)"],                     label: "Palak Paneer + 2 Rotis" },
      { foods: ["Chicken Breast (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Peas (1 cup)"],                      label: "Chicken + Brown Rice + Peas" },
      { foods: ["Tilapia (100g, cooked)", "Sweet Potato (100g, baked)", "Broccoli (1 cup)"],                         label: "Fish + Sweet Potato + Broccoli" },
      { foods: ["Egg Bhurji (2 eggs)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)"],                      label: "Egg Bhurji + Rotis" },
      { foods: ["Khichdi (1 cup)", "Aloo Sabzi (1 cup)", "Curd / Dahi (100g)"],                                      label: "Khichdi Thali" },
      { foods: ["Chana Masala (1 cup)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Curd / Dahi (100g)"], label: "Chana Masala + Rotis + Curd" },
    ],
  },
  muscle_gain: {
    breakfast: [
      { foods: ["Egg Whole (1 large)", "Egg Whole (1 large)", "Egg Whole (1 large)", "Oats (cooked, 1 cup)", "Banana (1 medium)", "Whole Milk (1 cup)"], label: "3 Eggs + Oatmeal + Milk + Banana" },
      { foods: ["Whey Protein (1 scoop 30g)", "Oats (cooked, 1 cup)", "Banana (1 medium)", "Peanut Butter (2 tbsp)"], label: "Protein Oatmeal Power Bowl" },
      { foods: ["Paneer (100g)", "Paratha (1 piece)", "Paratha (1 piece)", "Whole Milk (1 cup)"],                    label: "Paneer Paratha + Full Cream Milk" },
      { foods: ["Egg Whole (1 large)", "Egg Whole (1 large)", "Egg Whole (1 large)", "Whole Wheat Bread (1 slice)", "Whole Wheat Bread (1 slice)", "Banana (1 medium)"], label: "3-Egg Sandwich + Banana" },
      { foods: ["Banana Protein Smoothie (1 cup)", "Oats (cooked, 1 cup)", "Almonds (1 oz / 28g)"],                 label: "Mass Gainer Smoothie + Oats" },
      { foods: ["Curd Rice (1 cup)", "Rajma / Kidney Beans (1 cup)", "Egg Whole (1 large)"],                         label: "High-Protein South Indian Breakfast" },
      { foods: ["Upma (1 cup)", "Egg Whole (1 large)", "Egg Whole (1 large)", "Whole Milk (1 cup)"],                 label: "Upma + Eggs + Milk" },
    ],
    lunch: [
      { foods: ["Chicken Breast (100g, cooked)", "Chicken Breast (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Mixed Veg Curry (1 cup)", "Curd / Dahi (100g)"], label: "Double Chicken + Brown Rice Bowl" },
      { foods: ["Soybean (cooked, 1 cup)", "Quinoa (cooked, 1 cup)", "Broccoli (1 cup)", "Avocado (½ fruit)"],       label: "Soy + Quinoa Power Bowl" },
      { foods: ["Biryani Chicken (1 cup)", "Dal / Lentil Soup (1 cup)", "Curd / Dahi (100g)"],                      label: "Chicken Biryani + Dal Combo" },
      { foods: ["Salmon (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Spinach (1 cup raw)", "Egg Whole (1 large)"], label: "Salmon Rice Bowl + Egg" },
      { foods: ["Rajma / Kidney Beans (1 cup)", "White Rice (cooked, 1 cup)", "Paneer (100g)", "Roti / Chapati (1 piece)"], label: "Rajma + Rice + Paneer Thali" },
      { foods: ["Mutton / Lamb (100g, cooked)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Dal / Lentil Soup (1 cup)"], label: "Mutton + 3 Rotis + Dal" },
      { foods: ["Tofu (100g)", "Pasta (cooked, 1 cup)", "Chickpeas / Chana (1 cup)", "Broccoli (1 cup)"],            label: "Vegan Muscle Pasta Bowl" },
    ],
    snack: [
      { foods: ["Whey Protein (1 scoop 30g)", "Banana (1 medium)", "Peanut Butter (2 tbsp)", "Whole Milk (1 cup)"],  label: "Mass Gain Protein Shake" },
      { foods: ["Protein Bar (1 bar)", "Banana (1 medium)"],                                                          label: "Protein Bar + Banana" },
      { foods: ["Almonds (1 oz / 28g)", "Walnuts (1 oz)", "Banana (1 medium)"],                                       label: "Nuts & Banana Pre-Workout" },
      { foods: ["Peanut Butter (2 tbsp)", "Banana (1 medium)", "Banana Protein Smoothie (1 cup)"],                   label: "PB Banana Protein Smoothie" },
      { foods: ["Egg Whole (1 large)", "Egg Whole (1 large)", "Whole Wheat Bread (1 slice)"],                         label: "Hard Boiled Eggs + Toast" },
      { foods: ["Greek Yogurt (100g)", "Mango (1 cup chunks)", "Chia Seeds (2 tbsp)"],                                label: "High-Protein Mango Yogurt Bowl" },
      { foods: ["Cheese (cheddar, 30g)", "Whole Wheat Bread (1 slice)", "Banana (1 medium)"],                         label: "Cheese Toast + Banana" },
    ],
    dinner: [
      { foods: ["Chicken Breast (100g, cooked)", "Chicken Breast (100g, cooked)", "Sweet Potato (100g, baked)", "Broccoli (1 cup)", "Peas (1 cup)"], label: "Double Chicken Dinner" },
      { foods: ["Salmon (100g, cooked)", "Quinoa (cooked, 1 cup)", "Spinach (1 cup raw)", "Avocado (½ fruit)"],       label: "Omega-3 Power Dinner" },
      { foods: ["Palak Paneer (1 cup)", "Paneer (100g)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)"], label: "Double Paneer + 3 Rotis" },
      { foods: ["Beef (lean, 100g, cooked)", "Brown Rice (cooked, 1 cup)", "Mushroom (1 cup sliced)", "Corn (1 cup)"], label: "Lean Beef Rice Bowl" },
      { foods: ["Turkey Breast (100g, cooked)", "Pasta (cooked, 1 cup)", "Broccoli (1 cup)", "Olive Oil (1 tbsp)"],  label: "Turkey Pasta with Olive Oil" },
      { foods: ["Dal / Lentil Soup (1 cup)", "Chickpeas / Chana (1 cup)", "Roti / Chapati (1 piece)", "Roti / Chapati (1 piece)", "Whole Milk (1 cup)"], label: "High-Protein Veg Thali + Milk" },
      { foods: ["Shrimp / Prawns (100g, cooked)", "Brown Rice (cooked, 1 cup)", "Peas (1 cup)", "Cauliflower (1 cup)"], label: "Prawn Stir-Fry + Rice" },
    ],
  }
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateDietPlan(profile) {
  const nutProfile = calculateNutritionProfile(profile);
  const tag = nutProfile.goalObj.tag;
  const templates = MEAL_TEMPLATES[tag];
  const plan = [];

  for (let d = 0; d < 7; d++) {
    const bfIdx = d % templates.breakfast.length;
    const lnIdx = d % templates.lunch.length;
    const snIdx = d % templates.snack.length;
    const dnIdx = d % templates.dinner.length;

    const dayPlan = {
      day: DAYS[d],
      meals: {
        breakfast: templates.breakfast[bfIdx],
        lunch:     templates.lunch[lnIdx],
        snack:     templates.snack[snIdx],
        dinner:    templates.dinner[dnIdx],
      },
      totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    };

    // Calculate totals for the day
    Object.values(dayPlan.meals).forEach(meal => {
      meal.foods.forEach(foodName => {
        const food = FOOD_DB[foodName];
        if (food) {
          dayPlan.totals.kcal    += food.kcal;
          dayPlan.totals.protein += food.protein;
          dayPlan.totals.carbs   += food.carbs;
          dayPlan.totals.fat     += food.fat;
        }
      });
    });
    dayPlan.totals.kcal    = Math.round(dayPlan.totals.kcal);
    dayPlan.totals.protein = Math.round(dayPlan.totals.protein);
    dayPlan.totals.carbs   = Math.round(dayPlan.totals.carbs);
    dayPlan.totals.fat     = Math.round(dayPlan.totals.fat);

    plan.push(dayPlan);
  }
  return { plan, nutProfile };
}

// ===== FOOD LOG STATE =====
let nutritionProfile = null;
let foodLog = { breakfast: [], lunch: [], snack: [], dinner: [] };
let currentMealSlot = 'breakfast';

function getNutritionProfile() {
  return nutritionProfile;
}

function setNutritionProfile(p) {
  nutritionProfile = p;
  localStorage.setItem('fitVision_nutritionProfile', JSON.stringify(p));
}

function loadNutritionProfile() {
  const saved = localStorage.getItem('fitVision_nutritionProfile');
  if (saved) {
    nutritionProfile = JSON.parse(saved);
    return nutritionProfile;
  }
  return null;
}

function loadFoodLog() {
  const saved = localStorage.getItem('fitVision_foodLog_' + getTodayStr());
  if (saved) {
    foodLog = JSON.parse(saved);
  } else {
    foodLog = { breakfast: [], lunch: [], snack: [], dinner: [] };
  }
  return foodLog;
}

function saveFoodLog() {
  localStorage.setItem('fitVision_foodLog_' + getTodayStr(), JSON.stringify(foodLog));
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addFoodToLog(foodName, mealSlot) {
  const food = FOOD_DB[foodName];
  if (!food) return false;
  if (!foodLog[mealSlot]) foodLog[mealSlot] = [];
  foodLog[mealSlot].push({ name: foodName, ...food });
  saveFoodLog();
  return true;
}

function removeFoodFromLog(mealSlot, index) {
  if (foodLog[mealSlot] && foodLog[mealSlot][index] !== undefined) {
    foodLog[mealSlot].splice(index, 1);
    saveFoodLog();
    return true;
  }
  return false;
}

function getDayTotals() {
  let kcal = 0, protein = 0, carbs = 0, fat = 0;
  Object.values(foodLog).forEach(items => {
    items.forEach(item => {
      kcal    += item.kcal    || 0;
      protein += item.protein || 0;
      carbs   += item.carbs   || 0;
      fat     += item.fat     || 0;
    });
  });
  return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
}

function searchFoods(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return Object.entries(FOOD_DB)
    .filter(([name]) => name.toLowerCase().includes(q))
    .slice(0, 12)
    .map(([name, data]) => ({ name, ...data }));
}
