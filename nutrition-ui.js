/* ===================================================================
   NUTRITION-UI.JS — FitVision AI Nutrition Page UI Controller
   Full SPA UI: Profile Setup, Macro Rings, Food Log, Diet Plan
   =================================================================== */

// ===== INIT =====
function initNutritionPage() {
  loadFoodLog();
  const profile = loadNutritionProfile();

  if (profile) {
    showNutritionDashboard(profile);
  } else {
    showNutritionProfileSetup();
  }
}

// ===== PROFILE SETUP VIEW =====
function showNutritionProfileSetup() {
  const container = document.getElementById('nutrition-content');
  if (!container) return;

  container.innerHTML = `
    <div class="nutr-setup-wrapper">
      <div class="nutr-setup-card animate-in">
        <div class="nutr-setup-icon">🧬</div>
        <h2 class="nutr-setup-title">Set Up Your Nutrition Profile</h2>
        <p class="nutr-setup-sub">We use the Mifflin-St Jeor equation — the gold standard in sports science — to calculate your exact calorie needs.</p>

        <div class="nutr-form-grid">
          <div class="nutr-form-group">
            <label>Weight (kg)</label>
            <input type="number" id="nutr-weight" placeholder="e.g. 70" min="30" max="300" step="0.5">
          </div>
          <div class="nutr-form-group">
            <label>Height (cm)</label>
            <input type="number" id="nutr-height" placeholder="e.g. 175" min="100" max="250" step="1">
          </div>
          <div class="nutr-form-group">
            <label>Age (years)</label>
            <input type="number" id="nutr-age" placeholder="e.g. 25" min="10" max="100" step="1">
          </div>
          <div class="nutr-form-group">
            <label>Gender</label>
            <select id="nutr-gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div class="nutr-form-group nutr-full-col">
            <label>Activity Level</label>
            <select id="nutr-activity">
              <option value="sedentary">Sedentary (desk job, no exercise)</option>
              <option value="light">Lightly Active (1–3 workouts/week)</option>
              <option value="moderate" selected>Moderately Active (3–5 workouts/week)</option>
              <option value="active">Very Active (6–7 workouts/week)</option>
              <option value="veryactive">Athlete (2× daily / physical job)</option>
            </select>
          </div>
          <div class="nutr-form-group nutr-full-col">
            <label>Your Goal</label>
            <div class="nutr-goal-grid">
              <label class="nutr-goal-option">
                <input type="radio" name="nutr-goal" value="lose_fast">
                <div class="nutr-goal-card">
                  <span>🔥</span>
                  <strong>Lose Fast</strong>
                  <small>–500 kcal/day</small>
                </div>
              </label>
              <label class="nutr-goal-option">
                <input type="radio" name="nutr-goal" value="lose_slow">
                <div class="nutr-goal-card">
                  <span>🍃</span>
                  <strong>Lose Slow</strong>
                  <small>–250 kcal/day</small>
                </div>
              </label>
              <label class="nutr-goal-option">
                <input type="radio" name="nutr-goal" value="maintain" checked>
                <div class="nutr-goal-card">
                  <span>⚖️</span>
                  <strong>Maintain</strong>
                  <small>Stay stable</small>
                </div>
              </label>
              <label class="nutr-goal-option">
                <input type="radio" name="nutr-goal" value="gain_lean">
                <div class="nutr-goal-card">
                  <span>💪</span>
                  <strong>Lean Muscle</strong>
                  <small>+250 kcal/day</small>
                </div>
              </label>
              <label class="nutr-goal-option">
                <input type="radio" name="nutr-goal" value="gain_bulk">
                <div class="nutr-goal-card">
                  <span>🏋️</span>
                  <strong>Bulk Up</strong>
                  <small>+500 kcal/day</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button class="btn btn-primary nutr-submit-btn" onclick="submitNutritionProfile()" id="nutr-submit-btn">
          Calculate My Plan
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  `;

  // Goal card radio styling
  document.querySelectorAll('.nutr-goal-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.nutr-goal-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.nutr-goal-option').querySelector('.nutr-goal-card').classList.add('selected');
    });
    // Trigger for the default checked one
    if (radio.checked) {
      radio.closest('.nutr-goal-option').querySelector('.nutr-goal-card').classList.add('selected');
    }
  });
}

function submitNutritionProfile() {
  const weight   = parseFloat(document.getElementById('nutr-weight').value);
  const height   = parseFloat(document.getElementById('nutr-height').value);
  const age      = parseInt(document.getElementById('nutr-age').value);
  const gender   = document.getElementById('nutr-gender').value;
  const activity = document.getElementById('nutr-activity').value;
  const goalEl   = document.querySelector('input[name="nutr-goal"]:checked');

  // Validation
  if (!weight || !height || !age || isNaN(weight) || isNaN(height) || isNaN(age)) {
    showNutritionToast('⚠️ Please fill in all fields!', 'warning');
    return;
  }
  if (weight < 30 || weight > 300) { showNutritionToast('⚠️ Weight must be 30–300 kg', 'warning'); return; }
  if (height < 100 || height > 250) { showNutritionToast('⚠️ Height must be 100–250 cm', 'warning'); return; }
  if (age < 10 || age > 100) { showNutritionToast('⚠️ Age must be 10–100 years', 'warning'); return; }

  const btn = document.getElementById('nutr-submit-btn');
  btn.textContent = '⚡ Calculating...';
  btn.disabled = true;

  setTimeout(() => {
    const profile = { weight, height, age, gender, activity, goal: goalEl ? goalEl.value : 'maintain' };
    setNutritionProfile(profile);
    showNutritionDashboard(profile);
    showNutritionToast('✅ Your nutrition plan is ready!', 'success');
  }, 800);
}

// ===== DASHBOARD VIEW =====
function showNutritionDashboard(profile) {
  const nutProfile = calculateNutritionProfile(profile);
  const todayTotals = getDayTotals();
  const container = document.getElementById('nutrition-content');
  if (!container) return;

  const pct = (val, target) => Math.min(100, Math.round((val / target) * 100));

  container.innerHTML = `
    <!-- TOP BAR -->
    <div class="nutr-topbar animate-in">
      <div class="nutr-topbar-left">
        <div class="nutr-greeting">
          <span class="nutr-tag">🧬 Your Profile</span>
          <h2 class="nutr-dash-title">Nutrition Dashboard</h2>
          <p class="nutr-dash-sub">${profile.weight}kg · ${profile.height}cm · ${profile.age}yrs · ${profile.gender === 'male' ? '♂ Male' : '♀ Female'}</p>
        </div>
      </div>
      <div class="nutr-topbar-right">
        <button class="btn btn-secondary btn-sm" onclick="resetNutritionProfile()">✏️ Edit Profile</button>
      </div>
    </div>

    <!-- BMR / TDEE CARDS -->
    <div class="nutr-stats-row animate-in">
      <div class="nutr-stat-chip nutr-bmr">
        <div class="nutr-chip-icon">🫀</div>
        <div>
          <div class="nutr-chip-val">${nutProfile.bmr.toLocaleString()}</div>
          <div class="nutr-chip-lbl">BMR (kcal/day)</div>
        </div>
      </div>
      <div class="nutr-stat-chip nutr-tdee">
        <div class="nutr-chip-icon">⚡</div>
        <div>
          <div class="nutr-chip-val">${nutProfile.tdee.toLocaleString()}</div>
          <div class="nutr-chip-lbl">TDEE (kcal/day)</div>
        </div>
      </div>
      <div class="nutr-stat-chip nutr-target">
        <div class="nutr-chip-icon">🎯</div>
        <div>
          <div class="nutr-chip-val">${nutProfile.targetCal.toLocaleString()}</div>
          <div class="nutr-chip-lbl">Target Calories</div>
        </div>
      </div>
      <div class="nutr-stat-chip nutr-bmi">
        <div class="nutr-chip-icon">📊</div>
        <div>
          <div class="nutr-chip-val">${nutProfile.bmi}</div>
          <div class="nutr-chip-lbl">BMI · ${nutProfile.bmiCat}</div>
        </div>
      </div>
    </div>

    <!-- MAIN GRID: Macros + Food Log -->
    <div class="nutr-main-grid">
      <!-- LEFT: Macro Rings + Targets -->
      <div class="nutr-macros-panel nutr-card">
        <h3 class="nutr-card-title">📊 Today's Progress</h3>
        <p class="nutr-card-sub">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        <!-- MAIN CALORIE RING -->
        <div class="nutr-calorie-ring-wrap">
          <svg class="nutr-ring-svg" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
            <circle cx="80" cy="80" r="64" fill="none" stroke="url(#kcalGrad)" stroke-width="12"
              stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 64}"
              stroke-dashoffset="${2 * Math.PI * 64 * (1 - pct(todayTotals.kcal, nutProfile.targetCal) / 100)}"
              transform="rotate(-90 80 80)" style="transition: stroke-dashoffset 1s ease;"/>
            <defs>
              <linearGradient id="kcalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8B5CF6"/>
                <stop offset="100%" stop-color="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="nutr-ring-center">
            <div class="nutr-ring-val">${todayTotals.kcal}</div>
            <div class="nutr-ring-lbl">/ ${nutProfile.targetCal}</div>
            <div class="nutr-ring-sub">kcal</div>
          </div>
        </div>

        <!-- MACRO BARS -->
        <div class="nutr-macro-bars">
          ${macroBarsHTML('protein', '💪 Protein', todayTotals.protein, nutProfile.protein, '#8b5cf6')}
          ${macroBarsHTML('carbs', '🍚 Carbs', todayTotals.carbs, nutProfile.carbs, '#06b6d4')}
          ${macroBarsHTML('fat', '🥑 Fat', todayTotals.fat, nutProfile.fat, '#fb923c')}
        </div>

        <!-- DAILY MACRO TARGETS -->
        <div class="nutr-target-chips">
          <div class="nutr-target-chip protein">💪 ${nutProfile.protein}g protein</div>
          <div class="nutr-target-chip carbs">🍚 ${nutProfile.carbs}g carbs</div>
          <div class="nutr-target-chip fat">🥑 ${nutProfile.fat}g fat</div>
        </div>
      </div>

      <!-- RIGHT: Food Log -->
      <div class="nutr-foodlog-panel nutr-card">
        <h3 class="nutr-card-title">🍽️ Food Log — Today</h3>
        <p class="nutr-card-sub">Track every meal. Stay on target.</p>

        <!-- Meal Slot Tabs -->
        <div class="nutr-meal-tabs" id="nutr-meal-tabs">
          ${['breakfast','lunch','snack','dinner'].map(m =>
            `<button class="nutr-meal-tab ${currentMealSlot === m ? 'active' : ''}" onclick="switchMealTab('${m}')">${mealIcon(m)} ${capitalize(m)}<span class="nutr-meal-count" id="tab-count-${m}">${(foodLog[m]||[]).length}</span></button>`
          ).join('')}
        </div>

        <!-- Food Search -->
        <div class="nutr-search-bar">
          <span class="nutr-search-icon">🔍</span>
          <input type="text" class="nutr-search-input" id="nutr-food-search" placeholder="Search 100+ foods... (e.g. rice, egg, chicken)" oninput="handleFoodSearch(this.value)">
          <button class="nutr-search-clear" id="nutr-search-clear" onclick="clearFoodSearch()" style="display:none;">✕</button>
        </div>
        <div class="nutr-search-results" id="nutr-search-results"></div>

        <!-- Current Meal Log -->
        <div class="nutr-log-list" id="nutr-log-list"></div>
      </div>
    </div>

    <!-- DIET PLAN SECTION -->
    <div class="nutr-card nutr-plan-section animate-in">
      <div class="nutr-plan-header">
        <div>
          <h3 class="nutr-card-title">🗓️ Your 7-Day AI Diet Plan</h3>
          <p class="nutr-card-sub">Personalized for your ${nutProfile.goalObj.label.toLowerCase()} goal · ~${nutProfile.targetCal} kcal/day</p>
        </div>
        <div class="nutr-plan-actions">
          <button class="btn btn-secondary btn-sm" onclick="regenerateDietPlan()">🔄 Regenerate</button>
        </div>
      </div>
      <div id="nutr-diet-plan"></div>
    </div>
  `;

  // Render food log for current slot
  renderFoodLog();

  // Render diet plan
  renderDietPlan(profile);
}

function macroBarsHTML(id, label, current, target, color) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return `
    <div class="nutr-macro-bar-item">
      <div class="nutr-macro-bar-header">
        <span>${label}</span>
        <span class="nutr-macro-nums">${current}g <span style="color:var(--text-muted)">/ ${target}g</span></span>
      </div>
      <div class="nutr-bar-track">
        <div class="nutr-bar-fill" style="width:${pct}%; background:${color};" id="bar-${id}"></div>
      </div>
    </div>
  `;
}

function mealIcon(meal) {
  return { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' }[meal] || '🍽️';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function switchMealTab(meal) {
  currentMealSlot = meal;
  document.querySelectorAll('.nutr-meal-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.nutr-meal-tab[onclick="switchMealTab('${meal}')"]`);
  if (activeTab) activeTab.classList.add('active');
  clearFoodSearch();
  renderFoodLog();
}

// ===== FOOD LOG RENDER =====
function renderFoodLog() {
  const container = document.getElementById('nutr-log-list');
  if (!container) return;
  const items = foodLog[currentMealSlot] || [];

  if (items.length === 0) {
    container.innerHTML = `
      <div class="nutr-empty-log">
        <div class="nutr-empty-icon">${mealIcon(currentMealSlot)}</div>
        <p>No foods logged for ${capitalize(currentMealSlot)} yet.</p>
        <p class="nutr-empty-hint">Use the search above to add foods.</p>
      </div>
    `;
    return;
  }

  let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  items.forEach(i => { totalKcal += i.kcal; totalProtein += i.protein; totalCarbs += i.carbs; totalFat += i.fat; });

  container.innerHTML = `
    <div class="nutr-log-items">
      ${items.map((item, idx) => `
        <div class="nutr-log-item animate-in">
          <div class="nutr-log-item-icon">${item.icon || '🍽️'}</div>
          <div class="nutr-log-item-info">
            <div class="nutr-log-item-name">${item.name}</div>
            <div class="nutr-log-item-serving">${item.serving}</div>
          </div>
          <div class="nutr-log-item-macros">
            <span class="nutr-log-kcal">${item.kcal} kcal</span>
            <span class="nutr-log-prot">P: ${item.protein}g</span>
            <span class="nutr-log-carb">C: ${item.carbs}g</span>
            <span class="nutr-log-fat">F: ${item.fat}g</span>
          </div>
          <button class="nutr-log-remove" onclick="removeFromLog('${currentMealSlot}', ${idx})" title="Remove">✕</button>
        </div>
      `).join('')}
    </div>
    <div class="nutr-log-subtotal">
      <span>${capitalize(currentMealSlot)} Total</span>
      <span><strong>${Math.round(totalKcal)} kcal</strong> · P:${Math.round(totalProtein)}g · C:${Math.round(totalCarbs)}g · F:${Math.round(totalFat)}g</span>
    </div>
  `;

  // Update tab count badge
  const countBadge = document.getElementById('tab-count-' + currentMealSlot);
  if (countBadge) countBadge.textContent = items.length;
}

function removeFromLog(mealSlot, index) {
  removeFoodFromLog(mealSlot, index);
  refreshNutritionDashboard();
}

// ===== FOOD SEARCH =====
let searchDebounce = null;

function handleFoodSearch(query) {
  const clearBtn = document.getElementById('nutr-search-clear');
  if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    const results = searchFoods(query);
    renderSearchResults(results, query);
  }, 150);
}

function renderSearchResults(results, query) {
  const container = document.getElementById('nutr-search-results');
  if (!container) return;

  if (!query || query.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  if (results.length === 0) {
    container.style.display = 'block';
    container.innerHTML = `<div class="nutr-no-results">No foods found for "<strong>${query}</strong>"</div>`;
    return;
  }

  container.style.display = 'block';
  container.innerHTML = results.map(food => `
    <div class="nutr-search-result-item" onclick="addFoodFromSearch('${food.name.replace(/'/g, "\\'")}')">
      <div class="nutr-result-icon">${food.icon || '🍽️'}</div>
      <div class="nutr-result-info">
        <div class="nutr-result-name">${food.name}</div>
        <div class="nutr-result-serving">${food.serving} · <span class="nutr-result-cat">${food.category}</span></div>
      </div>
      <div class="nutr-result-macros">
        <span class="nutr-log-kcal">${food.kcal}</span>
        <span class="nutr-result-unit">kcal</span>
      </div>
      <div class="nutr-result-add">+</div>
    </div>
  `).join('');
}

function addFoodFromSearch(foodName) {
  addFoodToLog(foodName, currentMealSlot);
  clearFoodSearch();
  showNutritionToast(`✅ Added to ${capitalize(currentMealSlot)}!`, 'success');
  refreshNutritionDashboard();
}

function clearFoodSearch() {
  const input = document.getElementById('nutr-food-search');
  const results = document.getElementById('nutr-search-results');
  const clearBtn = document.getElementById('nutr-search-clear');
  if (input) input.value = '';
  if (results) { results.innerHTML = ''; results.style.display = 'none'; }
  if (clearBtn) clearBtn.style.display = 'none';
}

function refreshNutritionDashboard() {
  const profile = getNutritionProfile();
  if (profile) showNutritionDashboard(profile);
}

// ===== DIET PLAN RENDER =====
function renderDietPlan(profile) {
  const planContainer = document.getElementById('nutr-diet-plan');
  if (!planContainer) return;

  const { plan } = generateDietPlan(profile);

  const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
  const mealLabels = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', snack: '🍎 Snack', dinner: '🌙 Dinner' };

  planContainer.innerHTML = `
    <div class="nutr-plan-days">
      ${plan.map((day, i) => `
        <div class="nutr-plan-day animate-in animate-delay-${(i%6)+1}">
          <div class="nutr-plan-day-header">
            <span class="nutr-plan-day-name">${day.day}</span>
            <span class="nutr-plan-day-kcal">${day.totals.kcal} kcal · P:${day.totals.protein}g · C:${day.totals.carbs}g · F:${day.totals.fat}g</span>
          </div>
          ${mealOrder.map(mSlot => {
            const meal = day.meals[mSlot];
            return `
              <div class="nutr-plan-meal">
                <div class="nutr-plan-meal-label">${mealLabels[mSlot]}</div>
                <div class="nutr-plan-meal-name">${meal.label}</div>
                <div class="nutr-plan-meal-foods">${meal.foods.map(f => {
                  const fd = FOOD_DB[f];
                  return `<span class="nutr-plan-food-tag">${fd ? fd.icon : '🍽️'} ${f}</span>`;
                }).join('')}</div>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function regenerateDietPlan() {
  const profile = getNutritionProfile();
  if (!profile) return;
  // Shuffle the index by offsetting
  renderDietPlan(profile);
  showNutritionToast('🔄 Diet plan refreshed!', 'success');
}

function resetNutritionProfile() {
  localStorage.removeItem('fitVision_nutritionProfile');
  nutritionProfile = null;
  showNutritionProfileSetup();
}

// ===== TOAST NOTIFICATION =====
function showNutritionToast(msg, type = 'success') {
  const existing = document.getElementById('nutr-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'nutr-toast';
  toast.className = `nutr-toast nutr-toast-${type}`;
  toast.innerHTML = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('nutr-toast-show'));
  setTimeout(() => {
    toast.classList.remove('nutr-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
