let boardPosts = [];
let currentPostId = null;

let boardListContainerElement;
let writePostButton;
let postTitleInputElement;
let postContentInputElement;
let submitPostButton;
let cancelPostButton;
let postWriteErrorElement;

let backToBoardListButton;
let detailPostTitleElement;
let detailPostLikesElement;
let detailPostContentElement;
let likePostButton;

let commentsContainerElement;
let commentInputElement;
let addCommentButton;
let commentErrorElement;

function initBoardDom() {
  boardListContainerElement = document.getElementById("boardListContainer");
  writePostButton = document.getElementById("writePostBtn");

  postTitleInputElement = document.getElementById("postTitleInput");
  postContentInputElement = document.getElementById("postContentInput");
  submitPostButton = document.getElementById("submitPostBtn");
  cancelPostButton = document.getElementById("cancelPostBtn");
  postWriteErrorElement = document.getElementById("postWriteError");

  backToBoardListButton = document.getElementById("backToBoardListBtn");
  detailPostTitleElement = document.getElementById("detailPostTitle");
  detailPostLikesElement = document.getElementById("detailPostLikes");
  detailPostContentElement = document.getElementById("detailPostContent");
  likePostButton = document.getElementById("likePostBtn");

  commentsContainerElement = document.getElementById("commentsContainer");
  commentInputElement = document.getElementById("commentInput");
  addCommentButton = document.getElementById("addCommentBtn");
  commentErrorElement = document.getElementById("commentError");

  // 글쓰기 이동
  writePostButton?.addEventListener("click", () => {
    submitPostButton.dataset.mode = "create";
    postTitleInputElement.value = "";
    postContentInputElement.value = "";
    postWriteErrorElement.style.display = "none";
    switchView("post_write");
  });

  // 글 저장
  submitPostButton?.addEventListener("click", savePost);

  // 글쓰기 취소
  cancelPostButton?.addEventListener("click", () => {
    switchView("boardlist");
  });

  // 상세 화면 → 목록 돌아가기
  backToBoardListButton?.addEventListener("click", () => {
    switchView("boardlist");
  });

  // 좋아요
  likePostButton?.addEventListener("click", likePost);

  // 댓글 작성
  addCommentButton?.addEventListener("click", addComment);
}

// ===============================
// 게시글 목록 로드
// ===============================
async function loadBoardPosts() {
  try {
    const res = await axios.get(`${BOARD_API_URL_BASE}/posts`);
    boardPosts = res.data;
    renderBoardPosts();
  } catch (err) {
    boardListContainerElement.innerHTML = `
      <p style="color:red; padding:10px;">게시글 로드 실패</p>
    `;
  }
}

function renderBoardPosts() {
  if (!boardPosts.length) {
    boardListContainerElement.innerHTML = `
      <p style="padding:10px; color:#555;">게시글이 없습니다.</p>
    `;
    return;
  }

  boardListContainerElement.innerHTML = boardPosts
    .map(
      (post) => `
    <li>
      <span class="title" onclick="showPostDetail(${post.id})">${post.title}</span>
      <span class="meta">좋아요 ${post.likes}개</span>
    </li>
  `
    )
    .join("");
}

async function savePost() {
  const title = postTitleInputElement.value.trim();
  const content = postContentInputElement.value.trim();
  const mode = submitPostButton.dataset.mode;

  if (!title || !content) {
    postWriteErrorElement.textContent = "제목과 내용을 모두 입력해주세요.";
    postWriteErrorElement.style.display = "block";
    return;
  }

  try {
    if (mode === "create") {
      await axios.post(`${BOARD_API_URL_BASE}/posts`, { title, content });
    } else {
      await axios.patch(`${BOARD_API_URL_BASE}/posts/${currentPostId}`, {
        title,
        content,
      });
    }

    await loadBoardPosts();
    switchView("boardlist");
  } catch (err) {
    postWriteErrorElement.textContent = "저장 실패했습니다.";
    postWriteErrorElement.style.display = "block";
  }
}

async function showPostDetail(id) {
  currentPostId = id;

  const post = boardPosts.find((p) => p.id === id);
  if (!post) return;

  detailPostTitleElement.textContent = post.title;
  detailPostContentElement.textContent = post.content;
  detailPostLikesElement.textContent = `좋아요 ${post.likes}개`;

  switchView("post_detail");

  // 댓글 로드
  loadComments(id);

  // 수정/삭제 버튼 생성
  createEditDeleteButtons();
}

async function loadComments(postId) {
  try {
    const res = await axios.get(
      `${BOARD_API_URL_BASE}/posts/${postId}/comments`
    );

    renderComments(res.data);
  } catch (err) {
    commentsContainerElement.innerHTML = "<p>댓글 로드 실패</p>";
  }
}

function renderComments(comments) {
  if (!comments.length) {
    commentsContainerElement.innerHTML = "<p>댓글이 없습니다.</p>";
    return;
  }

  commentsContainerElement.innerHTML = comments
    .map(
      (c) => `
      <div class="comment-item">
        <p class="comment-content">${c.content}</p>
        <p class="comment-meta">ID: ${c.id}</p>
      </div>
    `
    )
    .join("");
}

async function addComment() {
  const content = commentInputElement.value.trim();
  if (!content) return;

  try {
    await axios.post(`${BOARD_API_URL_BASE}/posts/${currentPostId}/comments`, {
      content,
    });

    commentInputElement.value = "";
    loadComments(currentPostId);
  } catch (err) {
    commentErrorElement.style.display = "block";
    commentErrorElement.textContent = "댓글 작성 실패";
  }
}

async function likePost() {
  try {
    const res = await axios.post(
      `${BOARD_API_URL_BASE}/posts/${currentPostId}/like`
    );

    const newLikes = res.data.total_likes;

    // 상세화면 업데이트
    detailPostLikesElement.textContent = `좋아요 ${newLikes}개`;

    // 목록 데이터 업데이트
    const idx = boardPosts.findIndex((p) => p.id === currentPostId);
    if (idx !== -1) {
      boardPosts[idx].likes = newLikes;
      renderBoardPosts();
    }
  } catch (err) {
    console.log("좋아요 실패", err);
  }
}

function createEditDeleteButtons() {
  const old = document.getElementById("editDeleteBtns");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "editDeleteBtns";
  box.style.display = "flex";
  box.style.gap = "10px";
  box.style.margin = "15px 0";

  // 수정 버튼
  const editBtn = document.createElement("button");
  editBtn.className = "add-btn";
  editBtn.type = "button";
  editBtn.textContent = "수정";
  editBtn.onclick = () => {
    submitPostButton.dataset.mode = "edit";
    postTitleInputElement.value = detailPostTitleElement.textContent;
    postContentInputElement.value = detailPostContentElement.textContent;
    switchView("post_write");
  };

  // 삭제 버튼
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "cancel-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "삭제";
  deleteBtn.onclick = deletePost;

  box.appendChild(editBtn);
  box.appendChild(deleteBtn);

  detailPostContentElement.after(box);
}

async function deletePost() {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await axios.delete(`${BOARD_API_URL_BASE}/posts/${currentPostId}`);
    await loadBoardPosts();
    switchView("boardlist");
  } catch (err) {
    alert("삭제 실패");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initBoardDom();
  loadBoardPosts();
});
