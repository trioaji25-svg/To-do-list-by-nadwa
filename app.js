// Login demo: kredensial berada di sisi klien dan bukan untuk keamanan sensitif.
const ADMIN_USERNAME = "Nadwacantik";
const ADMIN_PASSWORD = "Nadwa1234";
const TASKS_KEY = "nadwa_todo_tasks_v1";

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
function showDashboard() {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");
  document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date());
  renderTasks();
}
function showLogin() {
  dashboardPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
}
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("nadwa_admin_logged_in", "true");
    loginError.textContent = "";
    showDashboard();
  } else {
    loginError.textContent = "Username atau password tidak sesuai.";
  }
});
document.getElementById("togglePassword").addEventListener("click", () => {
  const field = document.getElementById("password");
  const visible = field.type === "password";
  field.type = visible ? "text" : "password";
  document.getElementById("togglePassword").textContent = visible ? "tutup" : "lihat";
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("nadwa_admin_logged_in");
  showLogin();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  tasks.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    title,
    done: false,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  taskInput.value = "";
  renderTasks();
  taskInput.focus();
});
function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? {...task, done: !task.done} : task);
  saveTasks();
  renderTasks();
}
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}
function renderTasks() {
  const total = tasks.length;
  const done = tasks.filter(task => task.done).length;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("doneCount").textContent = done;
  document.getElementById("pendingCount").textContent = total - done;
  document.getElementById("taskTotalLabel").textContent = `${total} tugas`;
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(task => activeFilter === "all" ||
    (activeFilter === "done" && task.done) ||
    (activeFilter === "pending" && !task.done));

  emptyState.classList.toggle("hidden", visibleTasks.length !== 0);
  if (total === 0) {
    emptyState.querySelector("h3").textContent = "Belum ada tugas";
    emptyState.querySelector("p").textContent = "Tambahkan tugas pertamamu di kolom atas.";
  } else if (visibleTasks.length === 0) {
    emptyState.querySelector("h3").textContent = "Tidak ada tugas di sini";
    emptyState.querySelector("p").textContent = "Coba pilih filter yang lain.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const check = document.createElement("button");
    check.className = "check-btn";
    check.type = "button";
    check.textContent = task.done ? "✓" : "";
    check.setAttribute("aria-label", task.done ? "Tandai belum selesai" : "Tandai selesai");
    check.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = new Intl.DateTimeFormat("id-ID", {day:"numeric", month:"short"}).format(new Date(task.createdAt));

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "×";
    del.setAttribute("aria-label", "Hapus tugas");
    del.addEventListener("click", () => {
      if (confirm(`Hapus tugas "${task.title}"?`)) deleteTask(task.id);
    });

    item.append(check, title, date, del);
    taskList.appendChild(item);
  });
}
document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn === button));
    renderTasks();
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.error("Service worker gagal didaftarkan:", error);
    });
  });
}
if (sessionStorage.getItem("nadwa_admin_logged_in") === "true") showDashboard();
else showLogin();
