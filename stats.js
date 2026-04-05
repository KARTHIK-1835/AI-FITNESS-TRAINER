/* ===========================
   STATS — Dashboard & Analytics
   =========================== */

const STORAGE_KEY_SESSIONS = 'fitvision_sessions';

function getSessionHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS)) || [];
  } catch { return []; }
}

function saveSession(session) {
  const sessions = getSessionHistory();
  sessions.unshift(session); // newest first
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
}

function renderDashboard() {
  const sessions = getSessionHistory();

  // Overview stats
  const totalSessions = sessions.length;
  const totalCal = sessions.reduce((sum, s) => sum + (s.calories || 0), 0);
  const totalTimeSec = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalMins = Math.round(totalTimeSec / 60);

  document.getElementById('dash-total-sessions').textContent = totalSessions;
  document.getElementById('dash-total-cal').textContent = Math.round(totalCal);
  document.getElementById('dash-total-time').textContent = totalMins < 60 ? `${totalMins}m` : `${(totalMins/60).toFixed(1)}h`;

  // Streak
  const streak = calculateStreak(sessions);
  document.getElementById('dash-streak').textContent = streak;

  // Weekly chart
  renderWeeklyChart(sessions);

  // Session history list
  renderSessionHistory(sessions);
}

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;
  const dateSet = new Set();
  sessions.forEach(s => {
    if (s.date) dateSet.add(s.date);
  });

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      if (i === 0) continue; // Today hasn't ended yet
      break;
    }
  }
  return streak;
}

function renderWeeklyChart(sessions) {
  const canvas = document.getElementById('weekly-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Get data for last 7 days
  const days = [];
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.push(dayNames[d.getDay()]);

    const daySessions = sessions.filter(s => s.date === dateStr);
    const totalReps = daySessions.reduce((sum, s) => sum + (s.totalReps || 0), 0);
    data.push(totalReps);
  }

  // Resize canvas
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);

  const W = rect.width;
  const H = rect.height;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;
  const maxVal = Math.max(...data, 10);

  // Background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 8, y + 4);
  }

  // Bars
  const barWidth = chartW / days.length * 0.6;
  const barGap = chartW / days.length;

  data.forEach((val, i) => {
    const x = padding.left + barGap * i + (barGap - barWidth) / 2;
    const barH = (val / maxVal) * chartH;
    const y = padding.top + chartH - barH;

    // Gradient bar
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, '#7c3aed');
    grad.addColorStop(1, '#2563eb');
    ctx.fillStyle = grad;

    // Rounded bar
    const radius = Math.min(barWidth / 2, 6);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();

    // Glow effect
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = val > 0 ? 10 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Value on top
    if (val > 0) {
      ctx.fillStyle = '#f0f0f5';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barWidth / 2, y - 6);
    }

    // Day label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(days[i], x + barWidth / 2, H - padding.bottom + 20);
  });
}

function renderSessionHistory(sessions) {
  const container = document.getElementById('session-history');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No sessions recorded yet. Start training!</p>';
    return;
  }

  const recent = sessions.slice(0, 15);
  let html = '';
  recent.forEach(s => {
    const ex = EXERCISES[s.exercise];
    const icon = ex ? ex.icon : '💪';
    const name = ex ? ex.name : (s.exercise || 'Workout');
    const mins = Math.floor((s.duration || 0) / 60);
    const dateObj = new Date(s.date + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    html += `
      <div class="history-item">
        <div class="h-icon">${icon}</div>
        <div class="h-info">
          <div class="h-name">${name}</div>
          <div class="h-detail">${dateLabel} · ${s.totalReps || 0} reps · ${mins}m</div>
        </div>
        <div class="h-cal">🔥 ${Math.round(s.calories || 0)}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}
