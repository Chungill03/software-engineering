const API_URL = "http://localhost:5000/api/todos";
let todos = [];

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 3000);
}

// 서버에서 모든 할일 가져오기
async function loadTodos() {
  try {
    const response = await axios.get(API_URL);
    todos = response.data;
    renderTodos();
  } catch (error) {
    console.error("할일 목록 조회 실패:", error);
    showError("할일 목록을 가져오는 데 실패했습니다.");
  }
}

async function addTodo() {
  const text = todoInput.value.trim();

  if (!text) {
    showError("할일 내용을 입력해주세요.");
    return;
  }

  addBtn.disabled = true; // 버튼 비활성화

  try {
    const response = await axios.post(API_URL, {
      text: text,
    });

    todos.push(response.data);
    todoInput.value = "";
    renderTodos();
  } catch (error) {
    console.error("할일 추가 실패:", error);
    const errorMessage =
      error.response?.data?.error || "할일 추가에 실패했습니다.";
    showError(errorMessage);
  } finally {
    addBtn.disabled = false;
  }
}

// ------------------------------------
// 3. 완료 토글 (PATCH /api/todos/<id>)
// ------------------------------------
async function toggleTodo(id) {
  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex === -1) return;

  const oldValue = todos[todoIndex].completed;
  todos[todoIndex].completed = !oldValue;
  renderTodos();

  try {
    await axios.patch(`${API_URL}/${id}`);
  } catch (error) {
    console.error("할일 상태 업데이트 실패:", error);
    showError("상태 변경에 실패했습니다. 다시 시도합니다.");

    todos[todoIndex].completed = oldValue;
    renderTodos();
  }
}

// ------------------------------------
// 4. 항목 삭제 (DELETE /api/todos/<id>)
// ------------------------------------
async function deleteTodo(id) {
  try {
    await axios.delete(`${API_URL}/${id}`);

    todos = todos.filter((t) => t.id !== id);
    renderTodos();
  } catch (error) {
    console.error("할일 삭제 실패:", error);
    showError("할일 삭제에 실패했습니다.");
  }
}

// ------------------------------------
// UI 렌더링 및 유틸리티 함수 (변경 없음)
// ------------------------------------

// 화면에 할일 목록 그리기
function renderTodos() {
  const todoList = document.getElementById("todoList");

  document.getElementById("totalCount").textContent = todos.length;
  document.getElementById("activeCount").textContent = todos.filter(
    (t) => !t.completed
  ).length;
  document.getElementById("completedCount").textContent = todos.filter(
    (t) => t.completed
  ).length;

  // 할일이 없으면 빈 화면 표시
  if (todos.length === 0) {
    todoList.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>할 일이 없습니다</p>
                <p style="font-size: 14px; margin-top: 10px;">새로운 할 일을 추가해보세요!</p>
            </div>
        `;
    return;
  }

  todoList.innerHTML = todos
    .map(
      (todo) => `
                <div class="todo-item ${todo.completed ? "completed" : ""}">
                    <div class="checkbox ${todo.completed ? "checked" : ""}" 
                        onclick="toggleTodo(${todo.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `
    )
    .join("");
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement("div");
  // 백엔드에서 content 필드가 null이거나 undefined일 경우 대비
  div.textContent = text === null || text === undefined ? "" : text;
  return div.innerHTML;
}

// 엔터키로 추가하기
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// 추가 버튼 클릭
addBtn.addEventListener("click", addTodo);

// 페이지 로드시 실행
loadTodos();
 