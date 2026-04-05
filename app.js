/* ===========================
   APP.JS — Core Application Logic
   Fixed Navigation, Error Signals, Enhanced Feedback
   =========================== */

// ===== STATE =====
let currentPage = 'landing';
let currentExercise = null;
let workoutState = {
  reps: 0,
  sets: 1,
  totalReps: 0,
  phase: null,
  paused: false,
  startTime: null,
  timerInterval: null,
  accuracySum: 0,
  accuracyCount: 0,
  calories: 0,
  elapsed: 0,
  lastFeedbackTime: 0,
  errorCount: 0
};
let exerciseAnimInterval = null;
let feedbackTimeout = null;

// ===== VOICE ENGINE (EYES-FREE ASSISTANT) =====
const VoiceEngine = {
  enabled: true,
  synth: window.speechSynthesis,
  voices: [],
  lastCorrectionTime: 0,
  lastGoodTime: 0,

  init() {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('voice-toggle-btn');
    if (btn) {
      btn.innerHTML = this.enabled ? '🔊 Voice: ON' : '🔈 Voice: OFF';
      btn.classList.toggle('muted', !this.enabled);
    }
    if (!this.enabled) this.synth.cancel();
  },

  speak(text, priority = false) {
    if (!this.enabled) return;
    if (priority) this.synth.cancel(); // Interrupt whatever is currently playing

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = this.voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.15; // Faster, energetic
    utterance.pitch = 1.1; 
    this.synth.speak(utterance);
  },

  speakRep(number) {
    this.speak(number.toString(), true);
  },

  speakCorrection(text) {
    const now = Date.now();
    if (now - this.lastCorrectionTime > 3500) { // Debounce complaints every 3.5s
       // Remove emojis and special chars for clean speech
       let cleanText = text.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}]/gu, '').trim();
       if (cleanText) {
         this.speak(cleanText, true);
         this.lastCorrectionTime = now;
       }
    }
  },
  
  speakGood() {
    const now = Date.now();
    if (now - this.lastGoodTime > 5000) { // Praise occasionally
       const phrases = ["Good!", "Nice form!", "Keep it up!", "Great job!"];
       this.speak(phrases[Math.floor(Math.random() * phrases.length)], false);
       this.lastGoodTime = now;
    }
  }
};

// ===== INITIALIZATION & ROBUST LOADING =====
function forceHideLoader() {
  const loader = document.getElementById('loading-screen');
  console.log("Forcing loader hide...");
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 600);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded: Starting initialization...");
  
  // Initialize Voice Engine
  VoiceEngine.init();

  // 1. Initial UI Setup (Particles, etc.)
  try { generateParticles(); } catch(e) { console.error("Particles fail:", e); }
  
  // 2. Navbar behavior
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  });

  // 3. Initialize Stat Counters
  initStatCounters();

  // 3. Fallback Loader Logic
  // Show 'Skip' button if truly stuck
  setTimeout(() => {
    const skipBtn = document.getElementById('skip-loading');
    if (skipBtn) skipBtn.style.display = 'block';
  }, 3000);

  // Default hide after 2s (UI should be ready)
  setTimeout(forceHideLoader, 2000);

  // 4. Component Init
  try {
    if (typeof populateExerciseGrid === 'function') populateExerciseGrid();
  } catch(e) { console.error("Grid fail:", e); }

  try {
    if (typeof renderCalendar === 'function') renderCalendar();
  } catch(e) { console.error("Calendar fail:", e); }

  try {
    if (typeof renderDashboard === 'function') renderDashboard();
  } catch(e) { console.error("Dashboard fail:", e); }

  console.log("Initialization sequence complete.");
});
// ===== STAT COUNTERS ANIMATION =====
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  let hasRun = false;

  const runCounters = () => {
    if (hasRun) return;
    hasRun = true;
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1500; // ms
      const increment = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      updateCounter();
    });
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runCounters();
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const trustBar = document.querySelector('.trust-bar');
  if (trustBar) {
    observer.observe(trustBar);
  } else {
    runCounters(); // fallback if not found
  }
}

// GLOBAL BATTLE-TESTED FALLBACK:
// Force hide loader after 5s regardless of ANY script errors, and show an error UI if still stuck.
setTimeout(() => {
  const loader = document.getElementById('loading-screen');
  const statusLbl = document.getElementById('loader-status');
  const skipBtn = document.getElementById('skip-loading');

  if (loader && !loader.classList.contains('fade-out')) {
    console.warn("Loader still present after 5s, triggering manual backup...");
    if (statusLbl) statusLbl.innerHTML = '<strong>Initialization taking longer than expected...</strong><br>Check your internet connection or browser console if the app fails.';
    if (skipBtn) skipBtn.style.display = 'block';
    
    // Auto-hide after 8 seconds total just to let them see the app
    setTimeout(forceHideLoader, 3000);
  }
}, 5000);

// ===== PARTICLES =====
function generateParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    p.style.opacity = 0.1 + Math.random() * 0.3;
    container.appendChild(p);
  }
}

// ===== SPA NAVIGATION (FIXED) =====
function navigateTo(page) {
  // Prevent double navigation
  if (currentPage === page && page !== 'exercises') return;

  // Stop workout if navigating away from workout
  if (currentPage === 'workout' && page !== 'workout') {
    cleanupWorkout();
  }

  // Hide all pages
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
  }

  // Update nav active state
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Refresh page-specific content
  if (page === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
  if (page === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
  if (page === 'nutrition' && typeof initNutritionPage === 'function') initNutritionPage();
}

function toggleMobileMenu() {
  const links = document.getElementById('nav-links');
  if (links.style.display === 'flex') {
    links.style.display = 'none';
  } else {
    links.style.display = 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '60px';
    links.style.right = '20px';
    links.style.background = 'var(--bg-secondary)';
    links.style.padding = '16px';
    links.style.borderRadius = '12px';
    links.style.border = '1px solid var(--border-glass)';
    links.style.zIndex = '100';
  }
}

// ===== CUSTOM SETS STORAGE =====
let customSets = {};

function getExerciseSets(exerciseId) {
  return customSets[exerciseId] !== undefined ? customSets[exerciseId] : EXERCISES[exerciseId].totalSets;
}

function updateCardNumbers(exerciseId) {
  const ex = EXERCISES[exerciseId];
  const sets = getExerciseSets(exerciseId);
  const setsDisplay = document.getElementById('sets-val-' + exerciseId);
  const metaDisplay = document.getElementById('meta-info-' + exerciseId);
  const calDisplay = document.getElementById('cal-info-' + exerciseId);
  
  if (setsDisplay) setsDisplay.textContent = sets;
  if (metaDisplay) metaDisplay.textContent = `${ex.repsPerSet} reps × ${sets} sets`;
  if (calDisplay) calDisplay.textContent = `~${Math.round(ex.calPerRep * ex.repsPerSet * sets)} kCal`;
}

function changeSets(exerciseId, delta, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const ex = EXERCISES[exerciseId];
  const current = getExerciseSets(exerciseId);
  const newVal = Math.max(1, Math.min(10, current + delta));
  customSets[exerciseId] = newVal;
  updateCardNumbers(exerciseId);
}

// ===== EXERCISE GRID (WITH INTERACTIVE SETS SELECTOR) =====
function populateExerciseGrid() {
  const grid = document.getElementById('exercise-grid');
  if (!grid) return;

  const gradients = {
    'bicep-curls': 'linear-gradient(135deg, #7c3aed22, #7c3aed08)',
    'squats': 'linear-gradient(135deg, #2563eb22, #2563eb08)',
    'push-ups': 'linear-gradient(135deg, #06b6d422, #06b6d408)',
    'lunges': 'linear-gradient(135deg, #f9731622, #f9731608)',
    'jumping-jacks': 'linear-gradient(135deg, #ec489922, #ec489908)',
    'shoulder-press': 'linear-gradient(135deg, #ef444422, #ef444408)'
  };

  let html = '';
  Object.values(EXERCISES).forEach((ex, i) => {
    const diffClass = ex.difficulty === 'easy' ? 'difficulty-easy' : (ex.difficulty === 'medium' ? 'difficulty-medium' : 'difficulty-hard');
    const sets = getExerciseSets(ex.id);
    const totalCal = Math.round(ex.calPerRep * ex.repsPerSet * sets);
    html += `
      <div class="exercise-card animate-in animate-delay-${i+1}" id="card-${ex.id}" style="cursor:pointer;">
        <span class="exercise-difficulty ${diffClass}">${ex.difficulty}</span>
        <div class="exercise-preview" style="pointer-events:none;">
          <div class="exercise-preview-bg" style="background:${gradients[ex.id] || 'var(--gradient-card)'}"></div>
          <div class="exercise-anim" style="font-size:5rem;line-height:1;display:flex;align-items:center;justify-content:center;">${ex.icon}</div>
        </div>
        <div class="exercise-card-body">
          <h3>${ex.name}</h3>
          <p>${ex.description}</p>
          <div class="sets-selector" style="pointer-events:auto; display:flex; align-items:center; gap:10px; margin-bottom:14px; padding:10px 14px; background:rgba(148,0,211,0.08); border:1px solid rgba(148,0,211,0.2); border-radius:12px;">
            <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:600; margin-right:auto;">Sets:</span>
            <button class="sets-btn" id="sets-minus-${ex.id}" style="width:32px;height:32px;border-radius:50%;border:1px solid var(--border-glass);background:var(--bg-glass);color:var(--text-primary);font-size:1.1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;pointer-events:auto;">−</button>
            <span id="sets-val-${ex.id}" style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;min-width:28px;text-align:center;background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${sets}</span>
            <button class="sets-btn" id="sets-plus-${ex.id}" style="width:32px;height:32px;border-radius:50%;border:1px solid var(--border-glass);background:var(--bg-glass);color:var(--text-primary);font-size:1.1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;pointer-events:auto;">+</button>
          </div>
          <div class="exercise-meta" style="pointer-events:none;">
            <div class="exercise-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3"/></svg>
              <span id="meta-info-${ex.id}">${ex.repsPerSet} reps × ${sets} sets</span>
            </div>
            <div class="exercise-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span id="cal-info-${ex.id}">~${totalCal} kCal</span>
            </div>
            <div class="exercise-meta-item">
              💪 ${ex.muscles}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  grid.innerHTML = html;

  // Attach click handlers AFTER adding to DOM
  Object.values(EXERCISES).forEach(ex => {
    const card = document.getElementById('card-' + ex.id);
    if (card) {
      card.addEventListener('click', (e) => {
        // Don't start exercise if clicking on sets buttons
        if (e.target.closest('.sets-selector')) return;
        e.preventDefault();
        e.stopPropagation();
        startExercise(ex.id);
      });
    }

    // Attach +/- button handlers
    const minusBtn = document.getElementById('sets-minus-' + ex.id);
    const plusBtn = document.getElementById('sets-plus-' + ex.id);
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => changeSets(ex.id, -1, e));
      minusBtn.addEventListener('mouseenter', () => { minusBtn.style.background = 'rgba(148,0,211,0.3)'; minusBtn.style.borderColor = 'var(--accent)'; });
      minusBtn.addEventListener('mouseleave', () => { minusBtn.style.background = 'var(--bg-glass)'; minusBtn.style.borderColor = 'var(--border-glass)'; });
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => changeSets(ex.id, 1, e));
      plusBtn.addEventListener('mouseenter', () => { plusBtn.style.background = 'rgba(148,0,211,0.3)'; plusBtn.style.borderColor = 'var(--accent)'; });
      plusBtn.addEventListener('mouseleave', () => { plusBtn.style.background = 'var(--bg-glass)'; plusBtn.style.borderColor = 'var(--border-glass)'; });
    }
  });
}

// ===== START EXERCISE =====
function startExercise(exerciseId) {
  currentExercise = EXERCISES[exerciseId];
  if (!currentExercise) return;

  // Apply custom sets for this workout
  const targetSets = getExerciseSets(exerciseId);

  // Reset state
  workoutState = {
    reps: 0,
    sets: 1,
    targetSets: targetSets,
    totalReps: 0,
    phase: null,
    paused: false,
    startTime: Date.now(),
    timerInterval: null,
    accuracySum: 0,
    accuracyCount: 0,
    calories: 0,
    elapsed: 0,
    lastFeedbackTime: 0,
    errorCount: 0
  };

  // Update UI
  document.getElementById('workout-title').textContent = currentExercise.name;
  document.getElementById('rep-count').textContent = '0';
  document.getElementById('set-count').textContent = `1 / ${targetSets}`;
  
  const totalSetsEl = document.getElementById('total-sets');
  if (totalSetsEl) totalSetsEl.textContent = currentExercise.totalSets;
  
  document.getElementById('live-calories').textContent = '0';
  document.getElementById('live-avg-acc').textContent = '—';
  document.getElementById('live-total-reps').textContent = '0';
  document.getElementById('workout-timer').textContent = '00:00';
  document.getElementById('accuracy-value').textContent = '—';
  document.getElementById('form-feedback').textContent = '📷 Get in position to start your exercise...';
  document.getElementById('form-feedback').className = 'form-feedback';

  // Reset camera section error styling
  const camSection = document.getElementById('camera-section');
  camSection.classList.remove('error-flash', 'warning-flash', 'good-glow');

  // Set progress dots
  renderSetProgress();

  // Guide steps
  renderGuide();

  // Navigate to workout page
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.getElementById('page-workout').classList.add('active');
  currentPage = 'workout';
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Start pose engine
  const video = document.getElementById('webcam-video');
  const canvas = document.getElementById('pose-canvas');
  initPoseEngine(video, canvas, handlePoseFrame);

  // Start timer
  workoutState.timerInterval = setInterval(updateTimer, 1000);

  // Start exercise animation
  startExerciseAnimation();
}

// ===== HANDLE POSE FRAME (ENHANCED FEEDBACK) =====
function handlePoseFrame(landmarks) {
  if (!currentExercise || workoutState.paused) return;

  const result = currentExercise.checkAngles(landmarks);
  if (!result) return;

  const accBadge = document.getElementById('accuracy-badge');
  const accValue = document.getElementById('accuracy-value');
  const feedbackEl = document.getElementById('form-feedback');
  const camSection = document.getElementById('camera-section');

  if (landmarks) {
    // Update accuracy display
    accValue.textContent = result.accuracy + '%';

    // Remove all state classes
    accBadge.className = 'accuracy-badge';
    camSection.classList.remove('error-flash', 'warning-flash', 'good-glow');

    // Color code by accuracy with error signals
    if (result.accuracy >= 80) {
      accBadge.classList.add('accuracy-good');
      camSection.classList.add('good-glow');
      feedbackEl.className = 'form-feedback';
    } else if (result.accuracy >= 50) {
      accBadge.classList.add('accuracy-warning');
      camSection.classList.add('warning-flash');
      feedbackEl.className = 'form-feedback warning';
    } else {
      accBadge.classList.add('accuracy-bad');
      camSection.classList.add('error-flash');
      feedbackEl.className = 'form-feedback error';
      workoutState.errorCount++;
    }

    // Show feedback text — show ALL errors if multiple
    if (result.allFeedbacks && result.allFeedbacks.length > 1) {
      const fbText = result.allFeedbacks.slice(0, 3).join('<br>');
      feedbackEl.innerHTML = fbText;
      if (result.accuracy < 80) VoiceEngine.speakCorrection(result.allFeedbacks[0]); // Speak the worst error
    } else {
      feedbackEl.textContent = result.feedback;
      if (result.accuracy < 80) {
        VoiceEngine.speakCorrection(result.feedback);
      } else if (result.accuracy >= 90) {
        VoiceEngine.speakGood();
      }
    }

    // Track accuracy (throttled to avoid noise)
    const now = Date.now();
    if (now - workoutState.lastFeedbackTime > 200) {
      workoutState.accuracySum += result.accuracy;
      workoutState.accuracyCount++;
      workoutState.lastFeedbackTime = now;
    }

    // Update live avg accuracy
    if (workoutState.accuracyCount > 0) {
      const avgAcc = Math.round(workoutState.accuracySum / workoutState.accuracyCount);
      document.getElementById('live-avg-acc').textContent = avgAcc + '%';
    }

    // Strict Rep Counting — only count if form is in the GREEN ZONE (>= 80%)
    if (result.angle !== undefined) {
      const newPhase = currentExercise.getPhase(result.angle, workoutState.phase);
      
      if (newPhase !== workoutState.phase) {
        if (workoutState.phase && currentExercise.repCompleted(newPhase, workoutState.phase)) {
          // Strict check: Only count if the completion frame is highly accurate (green zone)
          if (result.accuracy >= 80) {
            workoutState.reps++;
            workoutState.totalReps++;
            workoutState.calories += currentExercise.calPerRep;

            document.getElementById('rep-count').textContent = workoutState.reps;
            document.getElementById('live-total-reps').textContent = workoutState.totalReps;
            document.getElementById('live-calories').textContent = Math.round(workoutState.calories);

            // Flash animation on rep count
            const repEl = document.getElementById('rep-count');
            repEl.style.animation = 'none';
            repEl.offsetHeight; // Force reflow
            repEl.style.animation = 'countUp 0.4s ease';

            // Auditory feedback for the rep
            VoiceEngine.speakRep(workoutState.reps);

            // Check if set complete
            if (workoutState.reps >= currentExercise.repsPerSet) {
              completeSet();
            }
          } else {
            // Give specific feedback that the rep was rejected
            const feedbackEl = document.getElementById('form-feedback');
            feedbackEl.innerHTML = '❌ <strong>Rep rejected — fix your form!</strong><br>' + feedbackEl.innerHTML;
            feedbackEl.className = 'form-feedback error';
            
            // Flash red to indicate rejected rep
            const camSection = document.getElementById('camera-section');
            camSection.classList.remove('warning-flash', 'good-glow');
            camSection.classList.add('error-flash');
          }
        }
        // Always track phase so the movement cycle continues
        workoutState.phase = newPhase;
      }
    }

    // Highlight active guide step based on phase
    updateGuideHighlight();

  } else {
    accValue.textContent = '—';
    feedbackEl.innerHTML = '❌ <strong>No body detected!</strong><br>Step fully into the camera frame';
    feedbackEl.className = 'form-feedback error';
    camSection.classList.add('error-flash');
    accBadge.className = 'accuracy-badge accuracy-bad';
  }
}

// ===== SET MANAGEMENT =====
function completeSet() {
  workoutState.paused = true;
  workoutState.reps = 0;
  document.getElementById('rep-count').textContent = '0';

  if (workoutState.sets >= workoutState.targetSets) {
    if (typeof finishWorkout === 'function') finishWorkout();
    return;
  }

  workoutState.sets++;
  document.getElementById('set-count').textContent = `${workoutState.sets} / ${workoutState.targetSets}`;
  renderSetProgress();

  const feedbackEl = document.getElementById('form-feedback');
  feedbackEl.innerHTML = `🎉 <strong>Set ${workoutState.sets - 1} complete!</strong> Rest for 10 seconds.`;
  feedbackEl.className = 'form-feedback';
  
  VoiceEngine.speak(`Set complete! Rest.`, true);
  
  // Auto-resume after rest
  setTimeout(() => {
    workoutState.paused = false;
    feedbackEl.innerHTML = `💪 <strong>Set ${workoutState.sets} starting!</strong> Let's go!`;
  }, 10000);
}

function renderSetProgress() {
  const container = document.getElementById('set-progress');
  if (!container || !currentExercise) return;

  let html = '';
  const totalSets = workoutState.targetSets || currentExercise.totalSets;
  for (let i = 1; i <= totalSets; i++) {
    let cls = 'set-dot';
    if (i < workoutState.sets) cls += ' completed';
    if (i === workoutState.sets) cls += ' active';
    html += `<div class="${cls}">${i}</div>`;
  }
  container.innerHTML = html;
}

// ===== GUIDE =====
function renderGuide() {
  const container = document.getElementById('guide-content');
  if (!container || !currentExercise) return;

  let html = '';
  currentExercise.guide.forEach((step, i) => {
    html += `
      <div class="guide-step ${i === 0 ? 'active' : ''}" id="guide-step-${i}">
        <div class="guide-step-num">${i + 1}</div>
        <div>${step}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateGuideHighlight() {
  if (!currentExercise) return;
  const steps = currentExercise.guide.length;
  let activeIdx = 0;

  // Highlight step based on phase
  if (workoutState.phase === 'down') {
    activeIdx = Math.min(2, steps - 1);
  } else if (workoutState.phase === 'up') {
    activeIdx = Math.min(4, steps - 1);
  }

  for (let i = 0; i < steps; i++) {
    const el = document.getElementById('guide-step-' + i);
    if (el) el.classList.toggle('active', i === activeIdx);
  }
}

// ===== TIMER =====
function updateTimer() {
  if (workoutState.paused) return;
  workoutState.elapsed = Math.floor((Date.now() - workoutState.startTime) / 1000);
  const mins = Math.floor(workoutState.elapsed / 60);
  const secs = workoutState.elapsed % 60;
  document.getElementById('workout-timer').textContent =
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// ===== PAUSE/RESUME =====
function togglePause() {
  workoutState.paused = !workoutState.paused;
  const btn = document.getElementById('btn-pause');
  btn.textContent = workoutState.paused ? '▶ Resume' : '⏸ Pause';

  const feedbackEl = document.getElementById('form-feedback');
  if (workoutState.paused) {
    feedbackEl.textContent = '⏸ Workout paused — click Resume to continue';
    feedbackEl.className = 'form-feedback warning';
  }
}

// ===== CLEANUP (fixes the "back" issue) =====
function cleanupWorkout() {
  // Clear timer
  if (workoutState.timerInterval) {
    clearInterval(workoutState.timerInterval);
    workoutState.timerInterval = null;
  }
  // Stop pose engine
  if (typeof stopPoseEngine === 'function') {
    stopPoseEngine();
  }
  // Stop animation
  stopExerciseAnimation();
  // Clear feedback timeout
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }
}

// ===== FINISH WORKOUT =====
function finishWorkout() {
  cleanupWorkout();

  // Calculate final stats
  const avgAccuracy = workoutState.accuracyCount > 0
    ? Math.round(workoutState.accuracySum / workoutState.accuracyCount)
    : 0;
  const duration = workoutState.elapsed;
  const totalReps = workoutState.totalReps;
  const calories = Math.round(workoutState.calories);
  const setsCompleted = workoutState.sets;

  // Save session
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (typeof saveSession === 'function') {
    saveSession({
      exercise: currentExercise.id,
      date: dateStr,
      totalReps,
      sets: setsCompleted,
      calories,
      duration,
      avgAccuracy,
      timestamp: Date.now()
    });
  }

  // Show summary
  document.getElementById('sum-reps').textContent = totalReps;
  document.getElementById('sum-sets').textContent = setsCompleted;
  document.getElementById('sum-cal').textContent = calories;
  document.getElementById('sum-acc').textContent = avgAccuracy + '%';
  document.getElementById('summary-exercise-name').textContent = currentExercise.name + ' Session';

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  document.getElementById('sum-time').textContent =
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

  currentExercise = null;
  navigateTo('summary');
}

// ===== STOP WORKOUT (back button — FIXED) =====
function stopWorkout() {
  // Save partial session if any reps done
  if (workoutState.totalReps > 0 && currentExercise) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const avgAccuracy = workoutState.accuracyCount > 0
      ? Math.round(workoutState.accuracySum / workoutState.accuracyCount) : 0;
    if (typeof saveSession === 'function') {
      saveSession({
        exercise: currentExercise.id,
        date: dateStr,
        totalReps: workoutState.totalReps,
        sets: workoutState.sets,
        calories: Math.round(workoutState.calories),
        duration: workoutState.elapsed,
        avgAccuracy,
        timestamp: Date.now()
      });
    }
  }

  cleanupWorkout();
  currentExercise = null;
  navigateTo('exercises');
}

// ===== 2D VECTOR EXERCISE ANIMATION =====
function startExerciseAnimation() {
  if (!currentExercise) return;
  
  if (typeof init3DAnimation === 'function') {
    init3DAnimation('anim-canvas');
    update3DAnimation(currentExercise.id);
  }
}

function stopExerciseAnimation() {
  if (exerciseAnimInterval) {
    clearInterval(exerciseAnimInterval);
    exerciseAnimInterval = null;
  }
  
  if (typeof stop3DAnimation === 'function') {
    stop3DAnimation();
  }
}
