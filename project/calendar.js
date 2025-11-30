let currentDate = new Date();

function renderCalendar() {
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth(); // 0 ~ 11
  const daysListElement = document.querySelector(".days");

  if (!daysListElement) return;

  const monthTextElement = document.querySelector(".cal_month");
  if (monthTextElement) {
    monthTextElement.textContent = `${year}년 ${monthIndex + 1}월`;
  }

  daysListElement.innerHTML = "";

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const lastDateOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const lastDateOfPrevMonth = new Date(year, monthIndex, 0).getDate();

  for (let offset = firstDayOfMonth - 1; offset >= 0; offset--) {
    const dateNumber = lastDateOfPrevMonth - offset;
    daysListElement.innerHTML += `<li class="inactive">${dateNumber}</li>`;
  }

  for (let day = 1; day <= lastDateOfMonth; day++) {
    const dateString = `${year}-${String(monthIndex + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    const hasTodoOnThisDate = window.todos?.some(
      (todoItem) => todoItem.date === dateString
    );

    daysListElement.innerHTML += `
      <li class="day-cell" data-date="${dateString}">
        <div class="day-number">${day}</div>
        ${hasTodoOnThisDate ? `<span class="todo-dot"></span>` : ""}
      </li>
    `;
  }

  const totalFilledCells = firstDayOfMonth + lastDateOfMonth;
  const extraCellsToAdd = 42 - totalFilledCells;

  for (let day = 1; day <= extraCellsToAdd; day++) {
    daysListElement.innerHTML += `<li class="inactive">${day}</li>`;
  }
}

document.querySelector(".cal_prev")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.querySelector(".cal_next")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function showTodosForDate(dateString) {
  const panelTitleElement = document.querySelector(".calendar-todo-title");
  const panelListElement = document.getElementById("calendarTodoList");

  if (!panelTitleElement || !panelListElement) return;

  panelTitleElement.textContent = `${dateString} 일정`;

  const filteredTodos = (window.todos || []).filter(
    (todoItem) => todoItem.date === dateString
  );

  if (filteredTodos.length === 0) {
    panelListElement.innerHTML = `<li>일정이 없습니다.</li>`;
    return;
  }

  panelListElement.innerHTML = filteredTodos
    .map(
      (todoItem) => `
        <li>
          ${todoItem.text}
        </li>
      `
    )
    .join("");
}

document.addEventListener("click", (event) => {
  const clickedDayCell = event.target.closest(".day-cell");
  if (!clickedDayCell) return;

  const selectedDate = clickedDayCell.dataset.date;
  if (!selectedDate) return;

  showTodosForDate(selectedDate);
});

document.addEventListener("todosLoaded", renderCalendar);
