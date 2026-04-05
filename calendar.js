/* ===========================
   CALENDAR — Workout Scheduler
   =========================== */

let calendarDate = new Date();
let selectedDate = null;
const STORAGE_KEY_SCHEDULE = 'fitvision_schedule';

function getScheduleData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SCHEDULE)) || {};
  } catch { return {}; }
}

function saveScheduleData(data) {
  localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(data));
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-month-label');
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  label.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();
  const schedule = getScheduleData();

  let html = '';

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month">${daysInPrev - i}</div>`;
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSelected = selectedDate === dateStr;
    const hasWorkout = schedule[dateStr] && schedule[dateStr].length > 0;

    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (hasWorkout) classes += ' has-workout';

    html += `<div class="${classes}" onclick="selectCalendarDate('${dateStr}')">${d}</div>`;
  }

  // Next month's leading days
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="calendar-day other-month">${i}</div>`;
  }

  grid.innerHTML = html;

  // Set date input default
  const dateInput = document.getElementById('schedule-date');
  if (dateInput && !dateInput.value) {
    const t = today;
    dateInput.value = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  // Show today's workouts by default
  if (!selectedDate) {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    showScheduledWorkouts(todayStr);
  }
}

function selectCalendarDate(dateStr) {
  selectedDate = dateStr;
  document.getElementById('schedule-date').value = dateStr;
  renderCalendar();
  showScheduledWorkouts(dateStr);
}

function showScheduledWorkouts(dateStr) {
  const container = document.getElementById('scheduled-items');
  const label = document.getElementById('selected-date-label');
  const schedule = getScheduleData();

  // Format date label
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) {
    label.textContent = 'Today';
  } else {
    label.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const items = schedule[dateStr] || [];
  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No workouts scheduled for this day</p>';
    return;
  }

  let html = '';
  items.forEach((item, idx) => {
    const ex = EXERCISES[item.exercise];
    const name = ex ? ex.name : item.exercise;
    const icon = ex ? ex.icon : '💪';
    html += `
      <div class="schedule-item">
        <div>
          <span>${icon}</span>
          <span class="ex-name">${name}</span>
        </div>
        <div class="ex-time">${item.time} · ${item.sets} sets</div>
        <button class="delete-btn" onclick="deleteScheduledWorkout('${dateStr}', ${idx})">✕</button>
      </div>
    `;
  });
  container.innerHTML = html;
}

function addScheduledWorkout() {
  const dateStr = document.getElementById('schedule-date').value;
  const exercise = document.getElementById('schedule-exercise').value;
  const time = document.getElementById('schedule-time').value;
  const sets = document.getElementById('schedule-sets').value;

  if (!dateStr) return;

  const schedule = getScheduleData();
  if (!schedule[dateStr]) schedule[dateStr] = [];
  schedule[dateStr].push({ exercise, time, sets: parseInt(sets) });
  saveScheduleData(schedule);

  selectedDate = dateStr;
  renderCalendar();
  showScheduledWorkouts(dateStr);
}

function deleteScheduledWorkout(dateStr, idx) {
  const schedule = getScheduleData();
  if (schedule[dateStr]) {
    schedule[dateStr].splice(idx, 1);
    if (schedule[dateStr].length === 0) delete schedule[dateStr];
    saveScheduleData(schedule);
    renderCalendar();
    showScheduledWorkouts(dateStr);
  }
}

function calendarPrevMonth() {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  selectedDate = null;
  renderCalendar();
}

function calendarNextMonth() {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  selectedDate = null;
  renderCalendar();
}
