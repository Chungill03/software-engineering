// ===============================
// 할 일(TODO) 데이터 및 DOM 요소
// ===============================

/**
 * 서버에서 가져온 할 일 목록이 저장되는 배열
 * 각 항목은 { id, text, completed, date } 형태
 */
let todos = [];

// 입력/버튼/리스트 DOM
const todoTextInput = document.getElementById("todoInput");
const todoDateInput = document.getElementById("todoDate");
const addTodoButton = document.getElementById("addBtn");
const todoListContainer = document.getElementById("todoList");

// ===============================
// 할 일 목록 불러오기 (READ ALL)
// ===============================
async function loadTodos() {
  try {
    const response = await axios.get(TODO_API_URL);
    todos = response.data;

    renderTodos();

    // 캘린더에게 "todo 목록이 준비됨" 신호 보내기
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    console.error(error);
    showErrorMessage("할 일 목록을 불러오지 못했습니다.");
  }
}

// ===============================
// 새 할 일 추가 (CREATE)
// ===============================
async function addTodo() {
  const text = todoTextInput.value.trim();
  const selectedDate = todoDateInput.value;

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

    // 서버에서 돌아온 todo를 배열에 추가
    todos.push(response.data);

    // 입력 초기화
    todoTextInput.value = "";
    todoDateInput.value = "";

    renderTodos();
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    console.error(error);
    showErrorMessage("할 일을 추가하는 데 실패했습니다.");
  }
}

// ===============================
// 완료 상태 토글 (UPDATE - completed만)
// ===============================
async function toggleTodo(id) {
  const targetTodo = todos.find((todoItem) => todoItem.id === id);
  if (!targetTodo) return;

  // 화면을 빠르게 업데이트하기 위해 먼저 토글
  targetTodo.completed = !targetTodo.completed;
  renderTodos();

  try {
    await axios.patch(`${TODO_API_URL}${id}/toggle`);
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    console.error(error);
    showErrorMessage("상태 변경에 실패했습니다.");
  }
}

// ===============================
// 할 일 삭제 (DELETE)
// ===============================
async function deleteTodo(id) {
  try {
    await axios.delete(`${TODO_API_URL}${id}`);

    // 배열에서 제거
    todos = todos.filter((todoItem) => todoItem.id !== id);

    renderTodos();
    document.dispatchEvent(new Event("todosLoaded"));
  } catch (error) {
    console.error(error);
    showErrorMessage("할 일을 삭제하는 데 실패했습니다.");
  }
}

// ===============================
// 화면에 할 일 목록 그리기 (렌더링)
// ===============================
function renderTodos() {
  if (!todoListContainer) return;

  // 1) 상단 통계(전체/진행중/완료) 업데이트
  const totalCountElement = document.getElementById("totalCount");
  const activeCountElement = document.getElementById("activeCount");
  const completedCountElement = document.getElementById("completedCount");

  if (totalCountElement) {
    totalCountElement.textContent = todos.length;
  }
  if (activeCountElement) {
    activeCountElement.textContent = todos.filter(
      (todoItem) => !todoItem.completed
    ).length;
  }
  if (completedCountElement) {
    completedCountElement.textContent = todos.filter(
      (todoItem) => todoItem.completed
    ).length;
  }

  // 2) 할 일 목록이 없을 때는 빈 상태 UI 표시
  if (todos.length === 0) {
    todoListContainer.innerHTML = `
      <div class="empty-state">
        <p>할 일이 없습니다.</p>
        <p style="font-size: 14px; margin-top: 10px;">
          새로운 할 일을 추가해보세요!
        </p>
      </div>
    `;
    return;
  }

  // 3) 할 일 목록 HTML 생성
  todoListContainer.innerHTML = todos
    .map(
      (todoItem) => `
      <div class="todo-item ${todoItem.completed ? "completed" : ""}">
        <div
          class="checkbox ${todoItem.completed ? "checked" : ""}"
          onclick="toggleTodo(${todoItem.id})"
        ></div>

        <div class="todo-text">${todoItem.text}</div>
        <div class="todo-date">${todoItem.date || "-"}</div>

        <button
          class="delete-btn"
          onclick="deleteTodo(${todoItem.id})"
        >
          삭제
        </button>
      </div>
    `
    )
    .join("");
}

// ===============================
// 페이지 로드 시 이벤트 연결
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // 달력 아이콘 클릭 → 숨겨진 date input 열기
  const dateIconElement = document.querySelector(".todo-date-icon");
  if (dateIconElement && todoDateInput && todoDateInput.showPicker) {
    dateIconElement.addEventListener("click", () => {
      todoDateInput.showPicker();
    });
  }

  // 추가 버튼 클릭
  if (addTodoButton) {
    addTodoButton.addEventListener("click", addTodo);
  }

  // Enter 키로 추가
  if (todoTextInput) {
    todoTextInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        addTodo();
      }
    });
  }

  // 최초 할 일 목록 불러오기
  loadTodos();
});
