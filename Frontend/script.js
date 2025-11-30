const TODO_API_URL = "http://localhost:5000/api/todos/";
const BOARD_API_URL_BASE = "http://localhost:5000/api/board";

const tabMenuButtons = document.querySelectorAll(".top_convert button");
let currentTab = 0;

function activateTabMenu(index) {
  if (index < 0 || index >= tabMenuButtons.length) return;
  currentTab = index;

  tabMenuButtons.forEach((b) => b.classList.remove("active"));
  tabMenuButtons[index].classList.add("active");
}

function changeScreen(viewId) {
  const screens = document.querySelectorAll(".view");
  screens.forEach((s) => s.classList.remove("is-active"));

  const target = document.getElementById(viewId);
  if (target) target.classList.add("is-active");

  if (viewId === "calendar" && typeof renderCalendar === "function") {
    renderCalendar();
  }
}

tabMenuButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    activateTabMenu(index);
    changeScreen(btn.dataset.view);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const leftArrowBtn = document.querySelector(".left_button");
  const rightArrowBtn = document.querySelector(".right_button");

  leftArrowBtn?.addEventListener("click", () => {
    currentTab =
      (currentTab - 1 + tabMenuButtons.length) % tabMenuButtons.length;
    activateTabMenu(currentTab);
    changeScreen(tabMenuButtons[currentTab].dataset.view);
  });

  rightArrowBtn?.addEventListener("click", () => {
    currentTab = (currentTab + 1) % tabMenuButtons.length;
    activateTabMenu(currentTab);
    changeScreen(tabMenuButtons[currentTab].dataset.view);
  });

  activateTabMenu(0);
  changeScreen("board");
});
