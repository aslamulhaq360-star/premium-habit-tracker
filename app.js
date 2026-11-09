
const STORAGE_KEY = "habitflow_habits";

let habits = [];

try {
  habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
  habits = [];
}

let editingHabitId = null;

// LOCAL DATE
function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = getLocalDate();

// CALENDAR MONTH
let calendarDate = new Date();
calendarDate.setDate(1);

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

// OPEN NEW HABIT MODAL
function openHabitModal() {
  editingHabitId = null;

  document.querySelector(".modal-content h2").textContent = "Create New Habit";
  document.getElementById("save-habit").textContent = "Save Habit";

  document.getElementById("habit-name").value = "";
  document.getElementById("habit-icon").value = "🌱";
  document.getElementById("habit-category").value = "Health";
  document.getElementById("habit-frequency").value = "daily";

  document.getElementById("habit-modal").style.display = "flex";
}

// EDIT HABIT
function editHabit(id) {
  const habit = habits.find(item => item.id === id);
  if (!habit) return;

  editingHabitId = id;

  document.querySelector(".modal-content h2").textContent = "Edit Habit";
  document.getElementById("save-habit").textContent = "Update Habit";

  document.getElementById("habit-name").value = habit.name;
  document.getElementById("habit-icon").value = habit.icon || "🌱";
  document.getElementById("habit-category").value = habit.category || "Personal";
  document.getElementById("habit-frequency").value = habit.frequency || "daily";

  document.getElementById("habit-modal").style.display = "flex";
}

// CLOSE MODAL
function closeHabitModal() {
  document.getElementById("habit-modal").style.display = "none";
  editingHabitId = null;
}

// SAVE HABIT
function createHabit() {
  const name = document.getElementById("habit-name").value.trim();
  const icon = document.getElementById("habit-icon").value.trim() || "🌱";
  const category = document.getElementById("habit-category").value;
  const frequency = document.getElementById("habit-frequency").value;

  if (!name) {
    alert("Please enter a habit name!");
    document.getElementById("habit-name").focus();
    return;
  }

  if (editingHabitId !== null) {
    const habit = habits.find(item => item.id === editingHabitId);

    if (habit) {
      habit.name = name;
      habit.icon = icon;
      habit.category = category;
      habit.frequency = frequency;
    }
  } else {
    habits.push({
      id: Date.now(),
      name,
      icon,
      category,
      frequency,
      color: "#6755E8",
      completedDates: [],
      createdAt: today
    });
  }

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
    habit.completedDates = habit.completedDates.filter(date => date !== today);
  } else {
    habit.completedDates.push(today);
  }

  saveData();
  renderHabits();
}

// DELETE HABIT
function deleteHabit(id) {
  if (!confirm("Do you want to delete this habit?")) return;

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

  document.getElementById("progress-text").textContent = percentage + "%";
  document.getElementById("circle-text").textContent = percentage + "%";

  document.getElementById("progress-circle").style.background =
    `conic-gradient(#6755E8 ${percentage}%, #EDEAF8 ${percentage}%)`;

  document.getElementById("completed").textContent = completedToday;
}

// CALCULATE STREAK
function calculateStreak() {
  if (habits.length === 0) return 0;

  const allDates = new Set();

  habits.forEach(habit => {
    (habit.completedDates || []).forEach(date => allDates.add(date));
  });

  let checkDate = new Date();

  if (!allDates.has(today)) {
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
              · ${habit.frequency === "weekly" ? "Weekly" : "Daily"}
            </p>
          </div>

          <button class="complete-btn"
            data-action="toggle"
            data-id="${habit.id}">
            ${completed ? "✓" : "○"}
          </button>

          <button class="edit-btn"
            data-action="edit"
            data-id="${habit.id}"
            aria-label="Edit habit">✏️</button>

          <button class="delete-btn"
            data-action="delete"
            data-id="${habit.id}"
            aria-label="Delete habit">🗑️</button>
        </div>
      `;
    }).join("");
  }

  document.getElementById("streak").textContent = calculateStreak();

  updateProgress();
  renderCalendar();
}

// RENDER HABIT CALENDAR
function renderCalendar() {
  const calendarDays = document.getElementById("calendar-days");
  const calendarMonth = document.getElementById("calendar-month");

  if (!calendarDays || !calendarMonth) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  calendarMonth.textContent = monthName;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const completedDates = new Set();

  habits.forEach(habit => {
    (habit.completedDates || []).forEach(date => {
      completedDates.add(date);
    });
  });

  let calendarHTML = "";

  // EMPTY DAYS BEFORE FIRST DATE
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += `<div class="calendar-day empty"></div>`;
  }

  // MONTH DATES
  for (let day = 1; day <= totalDays; day++) {
    const monthString = String(month + 1).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");

    const dateString = `${year}-${monthString}-${dayString}`;

    const isCompleted = completedDates.has(dateString);
    const isToday = dateString === today;

    let classes = "calendar-day";

    if (isCompleted) classes += " completed";
    if (isToday) classes += " today";

    calendarHTML += `
      <div class="${classes}">
        ${day}
      </div>
    `;
  }

  calendarDays.innerHTML = calendarHTML;
}

// PREVIOUS MONTH
document.getElementById("prev-month").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

// NEXT MONTH
document.getElementById("next-month").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

// SHOW HOME OR CALENDAR
const homeSections = [
  document.querySelector(".welcome-section"),
  document.querySelector(".progress-card"),
  document.querySelector(".stats-grid"),
  document.querySelector(".habits-section")
];

const calendarSection = document.getElementById("calendar-section");

function showHome() {
  homeSections.forEach(section => {
    section.style.display = "";
  });

  calendarSection.style.display = "none";
}

function showCalendar() {
  homeSections.forEach(section => {
    section.style.display = "none";
  });

  calendarSection.style.display = "block";
  renderCalendar();
}

// BOTTOM NAVIGATION
document.querySelectorAll(".bottom-nav button").forEach(button => {
  button.addEventListener("click", () => {
    const label = button.querySelector("span")?.textContent.trim();

    if (label === "Home") {
      showHome();
    } else if (label === "Calendar") {
      showCalendar();
    } else {
      return;
    }

    document.querySelectorAll(".bottom-nav button").forEach(navButton => {
      navButton.classList.remove("active");
    });

    button.classList.add("active");
  });
});

// MAIN BUTTON EVENTS
document.getElementById("add-habit-btn")
  .addEventListener("click", openHabitModal);

document.getElementById("cancel-habit")
  .addEventListener("click", closeHabitModal);

document.getElementById("save-habit")
  .addEventListener("click", createHabit);

// HABIT ACTIONS
document.getElementById("habit-list").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle") toggleHabit(id);
  if (action === "edit") editHabit(id);
  if (action === "delete") deleteHabit(id);
});

// CLOSE MODAL OUTSIDE CLICK
document.getElementById("habit-modal").addEventListener("click", event => {
  if (event.target.id === "habit-modal") {
    closeHabitModal();
  }
});

// INITIALIZE APP
renderHabits();
