let allPosts = [];
let selectedPostId = null;

let postListBox;
let openWritePageBtn;
let postTitleInput;
let postContentInput;
let postSaveBtn;
let postCancelBtn;
let postWriteErrorMsg;

let goBackToListBtn;
let detailTitleBox;
let detailLikesBox;
let detailContentBox;
let likeBtn;

let commentListBox;
let commentInput;
let commentSubmitBtn;
let commentErrorMsg;

function setupBoardPage() {
  postListBox = document.getElementById("boardListContainer");
  openWritePageBtn = document.getElementById("writePostBtn");

  postTitleInput = document.getElementById("postTitleInput");
  postContentInput = document.getElementById("postContentInput");
  postSaveBtn = document.getElementById("submitPostBtn");
  postCancelBtn = document.getElementById("cancelPostBtn");
  postWriteErrorMsg = document.getElementById("postWriteError");

  goBackToListBtn = document.getElementById("backToBoardListBtn");
  detailTitleBox = document.getElementById("detailPostTitle");
  detailLikesBox = document.getElementById("detailPostLikes");
  detailContentBox = document.getElementById("detailPostContent");
  likeBtn = document.getElementById("likePostBtn");

  commentListBox = document.getElementById("commentsContainer");
  commentInput = document.getElementById("commentInput");
  commentSubmitBtn = document.getElementById("addCommentBtn");
  commentErrorMsg = document.getElementById("commentError");

  // 글쓰기 화면 이동
  openWritePageBtn?.addEventListener("click", () => {
    postSaveBtn.dataset.mode = "create";
    postTitleInput.value = "";
    postContentInput.value = "";
    postWriteErrorMsg.style.display = "none";
    switchView("post_write");
  });

  // 저장 버튼
  postSaveBtn?.addEventListener("click", savePostData);

  // 취소 버튼
  postCancelBtn?.addEventListener("click", () => {
    switchView("boardlist");
  });

  // 뒤로가기 버튼
  goBackToListBtn?.addEventListener("click", () => {
    switchView("boardlist");
  });

  // 좋아요 버튼
  likeBtn?.addEventListener("click", toggleLikeForPost);

  // 댓글 작성 버튼
  commentSubmitBtn?.addEventListener("click", submitComment);
}

async function fetchAllPosts() {
  try {
    const res = await axios.get(`${BOARD_API_URL_BASE}/posts`);
    allPosts = res.data;
    showPostList();
  } catch (err) {
    postListBox.innerHTML = `<p style="color:red; padding:10px;">게시글 로드 실패</p>`;
  }
}

function showPostList() {
  if (!allPosts.length) {
    postListBox.innerHTML = `<p style="padding:10px; color:#555;">게시글이 없습니다.</p>`;
    return;
  }

  postListBox.innerHTML = allPosts
    .map(
      (post) => `
      <li>
        <span class="title" onclick="openPostDetail(${post.id})">${post.title}</span>
        <span class="meta">좋아요 ${post.likes}개</span>
      </li>
    `
    )
    .join("");
}

async function savePostData() {
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  const mode = postSaveBtn.dataset.mode;

  if (!title || !content) {
    postWriteErrorMsg.textContent = "제목과 내용을 모두 입력해주세요.";
    postWriteErrorMsg.style.display = "block";
    return;
  }

  try {
    if (mode === "create") {
      await axios.post(`${BOARD_API_URL_BASE}/posts`, { title, content });
    } else {
      await axios.patch(`${BOARD_API_URL_BASE}/posts/${selectedPostId}`, {
        title,
        content,
      });
    }

    await fetchAllPosts();
    switchView("boardlist");
  } catch (err) {
    postWriteErrorMsg.textContent = "저장 실패했습니다.";
    postWriteErrorMsg.style.display = "block";
  }
}

async function openPostDetail(id) {
  selectedPostId = id;

  const post = allPosts.find((p) => p.id === id);
  if (!post) return;

  detailTitleBox.textContent = post.title;
  detailContentBox.textContent = post.content;
  detailLikesBox.textContent = `좋아요 ${post.likes}개`;

  switchView("post_detail");

  fetchComments(id);
  createModifyDeleteButtons();
}

async function fetchComments(postId) {
  try {
    const res = await axios.get(
      `${BOARD_API_URL_BASE}/posts/${postId}/comments`
    );
    showCommentList(res.data);
  } catch (err) {
    commentListBox.innerHTML = "<p>댓글 로드 실패</p>";
  }
}

function showCommentList(comments) {
  if (!comments.length) {
    commentListBox.innerHTML = "<p>댓글이 없습니다.</p>";
    return;
  }

  commentListBox.innerHTML = comments
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

async function submitComment() {
  const content = commentInput.value.trim();
  if (!content) return;

  try {
    await axios.post(`${BOARD_API_URL_BASE}/posts/${selectedPostId}/comments`, {
      content,
    });

    commentInput.value = "";
    fetchComments(selectedPostId);
  } catch (err) {
    commentErrorMsg.style.display = "block";
    commentErrorMsg.textContent = "댓글 작성 실패";
  }
}

async function toggleLikeForPost() {
  try {
    const res = await axios.post(
      `${BOARD_API_URL_BASE}/posts/${selectedPostId}/like`
    );

    const newLikes = res.data.total_likes;

    detailLikesBox.textContent = `좋아요 ${newLikes}개`;

    const idx = allPosts.findIndex((p) => p.id === selectedPostId);
    if (idx !== -1) {
      allPosts[idx].likes = newLikes;
      showPostList();
    }
  } catch (err) {
    console.log("좋아요 실패", err);
  }
}

function createModifyDeleteButtons() {
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
    postSaveBtn.dataset.mode = "edit";
    postTitleInput.value = detailTitleBox.textContent;
    postContentInput.value = detailContentBox.textContent;
    switchView("post_write");
  };

  // 삭제 버튼
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "cancel-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "삭제";
  deleteBtn.onclick = deleteSelectedPost;

  box.appendChild(editBtn);
  box.appendChild(deleteBtn);

  detailContentBox.after(box);
}

// ===============================
// 게시글 삭제
// ===============================
async function deleteSelectedPost() {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await axios.delete(`${BOARD_API_URL_BASE}/posts/${selectedPostId}`);
    await fetchAllPosts();
    switchView("boardlist");
  } catch (err) {
    alert("삭제 실패");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupBoardPage();
  fetchAllPosts();
});
