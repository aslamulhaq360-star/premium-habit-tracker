
// ===================================
// HABITFLOW - HABIT TRACKER
// ===================================

const STORAGE_KEY = "habitflow_habits";

let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const today = new Date().toISOString().split("T")[0];

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ===================================
// ADD NEW HABIT
// ===================================

function addHabit() {
  const name = prompt("Enter your new habit name:");

  if (!name || !name.trim()) return;

  const habit = {
    id: Date.now(),
    name: name.trim(),
    icon: "🌱",
    color: "#6755E8",
    completedDates: [],
    createdAt: today
  };

  habits.push(habit);

  saveData();
  renderHabits();
}

// ===================================
// COMPLETE / UNCOMPLETE HABIT
// ===================================

function toggleHabit(id) {
  const habit = habits.find(h => h.id === id);

  if (!habit) return;

  if (habit.completedDates.includes(today)) {
    habit.completedDates =
      habit.completedDates.filter(date => date !== today);
  } else {
    habit.completedDates.push(today);
  }

  saveData();
  renderHabits();
}

// ===================================
// DELETE HABIT
// ===================================

function deleteHabit(id) {
  if (!confirm("Do you want to delete this habit?")) return;

  habits = habits.filter(h => h.id !== id);

  saveData();
  renderHabits();
}

// ===================================
// CALCULATE PROGRESS
// ===================================

function updateProgress() {
  const total = habits.length;

  const completed = habits.filter(h =>
    h.completedDates.includes(today)
  ).length;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("progress-text").textContent =
    percentage + "%";

  document.getElementById("circle-text").textContent =
    percentage + "%";

  document.getElementById("completed").textContent =
    completed;

  document.getElementById("progress-circle").style.background =
    `conic-gradient(#6755E8 ${percentage}%, #EDEAF8 ${percentage}%)`;

  return completed;
}

// ===================================
// CALCULATE STREAK
// ===================================

function calculateStreak() {
  const activeDates = new Set();

  habits.forEach(habit => {
    habit.completedDates.forEach(date => {
      activeDates.add(date);
    });
  });

  let streak = 0;
  let date = new Date();

  while (activeDates.has(date.toISOString().split("T")[0])) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  document.getElementById("streak").textContent = streak;
}

// ===================================
// DISPLAY HABITS
// ===================================

function renderHabits() {
  const container = document.getElementById("habit-list");

  if (habits.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🌱</span>
        <h3>Start your journey</h3>
        <p>Add your first habit to get started.</p>
      </div>
    `;
  } else {
    container.innerHTML = habits.map(habit => {
      const completed = habit.completedDates.includes(today);

      return `
        <div class="habit-item" style="
          background:white;
          padding:17px;
          border-radius:18px;
          display:flex;
          align-items:center;
          gap:12px;
          box-shadow:0 5px 20px rgba(40,30,90,.04);
        ">
          <span style="font-size:27px">${habit.icon}</span>

          <div style="flex:1;min-width:0">
            <h3 style="font-size:14px">
              ${escapeHTML(habit.name)}
            </h3>
            <p style="font-size:10px;color:#9290A5;margin-top:5px">
              ${completed ? "Completed today ✓" : "Keep going today"}
            </p>
          </div>

          <button
            onclick="toggleHabit(${habit.id})"
            aria-label="Complete habit"
            style="
              width:36px;
              height:36px;
              border-radius:12px;
              background:${completed ? "#21B58B" : "#F0EDFF"};
              color:${completed ? "white" : "#6755E8"};
              font-size:19px;
            "
          >${completed ? "✓" : "○"}</button>

          <button
            onclick="deleteHabit(${habit.id})"
            aria-label="Delete habit"
            style="
              background:transparent;
              color:#B5B1C5;
              font-size:17px;
            "
          >🗑</button>
        </div>
      `;
    }).join("");
  }

  updateProgress();
  calculateStreak();
}

// ===================================
// INITIALIZE APP
// ===================================

document.getElementById("add-habit-btn")
  .addEventListener("click", addHabit);

renderHabits();
