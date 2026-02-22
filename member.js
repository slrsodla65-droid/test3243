import {
  getSupabaseSetupMessage,
  isSupabaseConfigured,
  supabase,
} from "./supabase-client.js";

const statusEl = document.getElementById("account-status");
const userInfoEl = document.getElementById("account-info");
const loginHintEl = document.getElementById("login-hint");
const logoutBtn = document.getElementById("logout-btn");
const refreshBtn = document.getElementById("refresh-session-btn");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function setStatus(type, message) {
  if (!statusEl) {
    return;
  }
  statusEl.dataset.type = type;
  statusEl.textContent = message;
}

function renderLoggedOutState() {
  if (loginHintEl) {
    loginHintEl.hidden = false;
  }
  if (userInfoEl) {
    userInfoEl.innerHTML = "";
  }
  if (logoutBtn) {
    logoutBtn.disabled = true;
  }
  if (refreshBtn) {
    refreshBtn.disabled = false;
  }
  setStatus("warning", "현재 로그인되어 있지 않습니다.");
}

function renderUserState(user) {
  if (!userInfoEl) {
    return;
  }

  if (loginHintEl) {
    loginHintEl.hidden = true;
  }

  const fullName = user.user_metadata && user.user_metadata.full_name
    ? user.user_metadata.full_name
    : "(미입력)";

  userInfoEl.innerHTML = [
    `<dt>이름</dt><dd>${escapeHtml(fullName)}</dd>`,
    `<dt>이메일</dt><dd>${escapeHtml(user.email || "-")}</dd>`,
    `<dt>사용자 ID</dt><dd><code>${escapeHtml(user.id)}</code></dd>`,
    `<dt>가입일</dt><dd>${escapeHtml(formatDateTime(user.created_at))}</dd>`,
    `<dt>마지막 로그인</dt><dd>${escapeHtml(formatDateTime(user.last_sign_in_at))}</dd>`,
  ].join("");

  if (logoutBtn) {
    logoutBtn.disabled = false;
  }
  if (refreshBtn) {
    refreshBtn.disabled = false;
  }

  setStatus("success", "로그인 상태가 확인되었습니다.");
}

async function loadSession() {
  if (!isSupabaseConfigured) {
    setStatus("error", getSupabaseSetupMessage());
    if (refreshBtn) {
      refreshBtn.disabled = true;
    }
    if (logoutBtn) {
      logoutBtn.disabled = true;
    }
    return;
  }

  setStatus("info", "세션을 확인하는 중입니다...");

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus("error", `세션 확인 실패: ${error.message}`);
    return;
  }

  if (!data.session || !data.session.user) {
    renderLoggedOutState();
    return;
  }

  renderUserState(data.session.user);
}

async function handleLogout() {
  if (!isSupabaseConfigured) {
    setStatus("error", getSupabaseSetupMessage());
    return;
  }

  if (logoutBtn) {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "로그아웃 중...";
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    setStatus("error", `로그아웃 실패: ${error.message}`);
    if (logoutBtn) {
      logoutBtn.disabled = false;
      logoutBtn.textContent = "로그아웃";
    }
    return;
  }

  window.location.replace("/signin");
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", loadSession);
}

if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (!session || !session.user) {
      renderLoggedOutState();
      return;
    }
    renderUserState(session.user);
    if (event === "SIGNED_IN") {
      setStatus("success", "로그인 이벤트가 감지되었습니다.");
    }
  });
}

loadSession();
document.getElementById("year").textContent = new Date().getFullYear();
