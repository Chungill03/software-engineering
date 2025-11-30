const TODO_API_URL = "http://localhost:5000/api/todos/";
const BOARD_API_URL_BASE = "http://localhost:5000/api/board";

const tabButtons = document.querySelectorAll(".top_convert button");
let currentTabIndex = 0;

function setActiveTab(index) {
  if (index < 0 || index >= tabButtons.length) return;
  currentTabIndex = index;

  tabButtons.forEach((b) => b.classList.remove("active"));
  tabButtons[index].classList.add("active");
}

function switchView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((v) => v.classList.remove("is-active"));

  const target = document.getElementById(viewId);
  if (target) target.classList.add("is-active");

  if (viewId === "calendar" && typeof renderCalendar === "function") {
    renderCalendar();
  }
}

tabButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    setActiveTab(index);
    switchView(btn.dataset.view);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const left = document.querySelector(".left_button");
  const right = document.querySelector(".right_button");

  left?.addEventListener("click", () => {
    currentTabIndex =
      (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
    setActiveTab(currentTabIndex);
    switchView(tabButtons[currentTabIndex].dataset.view);
  });

  right?.addEventListener("click", () => {
    currentTabIndex = (currentTabIndex + 1) % tabButtons.length;
    setActiveTab(currentTabIndex);
    switchView(tabButtons[currentTabIndex].dataset.view);
  });

  setActiveTab(0);
  switchView("board");
});
