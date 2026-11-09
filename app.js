
const STORAGE_KEY = "habitflow_habits";

let habits = [];

try {
  habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
  habits = [];
}

const today = getLocalDate();

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// OPEN HABIT MODAL
function openHabitModal() {
  document.getElementById("habit-modal").style.display = "flex";
  document.getElementById("habit-name").focus();
}

// CLOSE HABIT MODAL
function closeHabitModal() {
  document.getElementById("habit-modal").style.display = "none";
  document.getElementById("habit-name").value = "";
  document.getElementById("habit-icon").value = "🌱";
  document.getElementById("habit-category").value = "Health";
  document.getElementById("habit-frequency").value = "daily";
}

// CREATE NEW HABIT
function createHabit() {
  const nameInput = document.getElementById("habit-name");
  const iconInput = document.getElementById("habit-icon");

  const name = nameInput.value.trim();
  const icon = iconInput.value.trim() || "🌱";

  const category = document.getElementById("habit-category").value;
  const frequency = document.getElementById("habit-frequency").value;

  if (!name) {
    alert("Please enter a habit name!");
    nameInput.focus();
    return;
  }

  const newHabit = {
    id: Date.now(),
    name: name,
    icon: icon,
    category: category,
    frequency: frequency,
    color: "#6755E8",
    completedDates: [],
    createdAt: today
  };

  habits.push(newHabit);

  saveData();
  renderHabits();
  closeHabitModal();
}

// COMPLETE / UNCOMPLETE HABIT
function toggleHabit(id) {
  const habit = habits.find(item => item.id === id);

  if (!habit) return;

  if (!Array.isArray(habit.completedDates)) {
    habit.completedDates = [];
  }

  if (habit.completedDates.includes(today)) {
    habit.completedDates = habit.completedDates.filter(
      date => date !== today
    );
  } else {
    habit.completedDates.push(today);
  }

  saveData();
  renderHabits();
}

// DELETE HABIT
function deleteHabit(id) {
  const confirmed = confirm("Do you want to delete this habit?");

  if (!confirmed) return;

  habits = habits.filter(habit => habit.id !== id);

  saveData();
  renderHabits();
}

// UPDATE PROGRESS
function updateProgress() {
  const total = habits.length;

  const completedToday = habits.filter(habit =>
    (habit.completedDates || []).includes(today)
  ).length;

  const percentage = total === 0
    ? 0
    : Math.round((completedToday / total) * 100);

  document.getElementById("progress-text").textContent =
    percentage + "%";

  document.getElementById("circle-text").textContent =
    percentage + "%";

  document.getElementById("progress-circle").style.background =
    `conic-gradient(#6755E8 ${percentage}%, #EDEAF8 ${percentage}%)`;

  document.getElementById("completed").textContent =
    completedToday;
}

// CALCULATE CURRENT STREAK
function calculateStreak() {
  if (habits.length === 0) return 0;

  const allDates = new Set();

  habits.forEach(habit => {
    (habit.completedDates || []).forEach(date => {
      allDates.add(date);
    });
  });

  let checkDate = new Date();
  const todayString = getLocalDate();

  if (!allDates.has(todayString)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;

  while (true) {
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, "0");
    const day = String(checkDate.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    if (allDates.has(dateString)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// DISPLAY HABITS
function renderHabits() {
  const habitList = document.getElementById("habit-list");

  if (habits.length === 0) {
    habitList.innerHTML = `
      <div class="empty-state">
        <span>🌱</span>
        <h3>Start your journey</h3>
        <p>Add your first habit to get started.</p>
      </div>
    `;
  } else {
    habitList.innerHTML = habits.map(habit => {
      const completed = (habit.completedDates || []).includes(today);

      return `
        <div class="habit-card ${completed ? "completed" : ""}">
          <div class="habit-icon">${escapeHTML(habit.icon || "🌱")}</div>

          <div class="habit-info">
            <h3>${escapeHTML(habit.name)}</h3>
            <p>
              ${escapeHTML(habit.category || "Personal")}
              ·
              ${habit.frequency === "weekly" ? "Weekly" : "Daily"}
            </p>
          </div>

          <button
            class="complete-btn"
            data-action="toggle"
            data-id="${habit.id}"
            aria-label="Complete habit"
          >
            ${completed ? "✓" : "○"}
          </button>

          <button
            class="delete-btn"
            data-action="delete"
            data-id="${habit.id}"
            aria-label="Delete habit"
          >
            🗑️
          </button>
        </div>
      `;
    }).join("");
  }

  document.getElementById("streak").textContent =
    calculateStreak();

  updateProgress();
}

// BUTTON EVENTS
document.getElementById("add-habit-btn")
  .addEventListener("click", openHabitModal);

document.getElementById("cancel-habit")
  .addEventListener("click", closeHabitModal);

document.getElementById("save-habit")
  .addEventListener("click", createHabit);

// HABIT ACTIONS
document.getElementById("habit-list")
  .addEventListener("click", event => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "toggle") {
      toggleHabit(id);
    }

    if (action === "delete") {
      deleteHabit(id);
    }
  });

// CLOSE MODAL BY CLICKING OUTSIDE
document.getElementById("habit-modal")
  .addEventListener("click", event => {
    if (event.target.id === "habit-modal") {
      closeHabitModal();
    }
  });

// INITIALIZE APP
renderHabits();
