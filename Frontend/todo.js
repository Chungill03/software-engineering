let allTodos = [];

const todoInputTextBox = document.getElementById("todoInput");
const todoInputDateBox = document.getElementById("todoDate");
const todoAddBtn = document.getElementById("addBtn");
const todoListBox = document.getElementById("todoList");

async function fetchAllTodos() {
  try {
    const response = await axios.get(TODO_API_URL);
    allTodos = response.data;

    showTodoList();
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    showErrorMessage("할 일 목록을 불러오지 못했습니다.");
  }
}

async function saveTodoItem() {
  const text = todoInputTextBox.value.trim();
  const selectedDate = todoInputDateBox.value;

  if (!text) {
    showErrorMessage("할 일을 입력하세요.");
    return;
  }
  if (!selectedDate) {
    showErrorMessage("날짜를 선택하세요.");
    return;
  }

  try {
    const response = await axios.post(TODO_API_URL, {
      text,
      date: selectedDate,
    });

    allTodos.push(response.data);
    todoInputTextBox.value = "";
    todoInputDateBox.value = "";

    showTodoList();
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    showErrorMessage("할 일을 추가하는 데 실패했습니다.");
  }
}

async function toggleTodoCompleted(id) {
  const targetTodo = allTodos.find((t) => t.id === id);
  if (!targetTodo) return;

  targetTodo.completed = !targetTodo.completed;
  showTodoList();

  try {
    await axios.patch(`${TODO_API_URL}${id}/toggle`);
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    showErrorMessage("상태 변경에 실패했습니다.");
  }
}

async function deleteTodoItem(id) {
  try {
    await axios.delete(`${TODO_API_URL}${id}`);
    allTodos = allTodos.filter((t) => t.id !== id);

    showTodoList();
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    showErrorMessage("할 일을 삭제하는 데 실패했습니다.");
  }
}

function showTodoList() {
  if (!todoListBox) return;

  const todoTotalCountBox = document.getElementById("totalCount");
  const todoActiveCountBox = document.getElementById("activeCount");
  const todoCompletedCountBox = document.getElementById("completedCount");

  if (todoTotalCountBox) todoTotalCountBox.textContent = allTodos.length;
  if (todoActiveCountBox)
    todoActiveCountBox.textContent = allTodos.filter(
      (t) => !t.completed
    ).length;
  if (todoCompletedCountBox)
    todoCompletedCountBox.textContent = allTodos.filter(
      (t) => t.completed
    ).length;

  if (allTodos.length === 0) {
    todoListBox.innerHTML = `
      <div class="empty-state">
        <p>할 일이 없습니다.</p>
        <p style="font-size: 14px; margin-top: 10px;">새로운 할 일을 추가해보세요!</p>
      </div>
    `;
    return;
  }

  todoListBox.innerHTML = allTodos
    .map(
      (todo) => `
      <div class="todo-item ${todo.completed ? "completed" : ""}">
        <div
          class="checkbox ${todo.completed ? "checked" : ""}"
          onclick="toggleTodoCompleted(${todo.id})"
        ></div>

        <div class="todo-text">${todo.text}</div>
        <div class="todo-date">${todo.date || "-"}</div>

        <button class="delete-btn" onclick="deleteTodoItem(${todo.id})">
          삭제
        </button>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const dateIcon = document.querySelector(".todo-date-icon");
  if (dateIcon && todoInputDateBox && todoInputDateBox.showPicker) {
    dateIcon.addEventListener("click", () => {
      todoInputDateBox.showPicker();
    });
  }

  todoAddBtn?.addEventListener("click", saveTodoItem);

  todoInputTextBox?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveTodoItem();
    }
  });

  fetchAllTodos();
});
