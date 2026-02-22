import {
  getSupabaseSetupMessage,
  isSupabaseConfigured,
  supabase,
} from "./supabase-client.js";

const statusEl = document.getElementById("auth-status");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

function setStatus(type, message) {
  if (!statusEl) {
    return;
  }
  statusEl.dataset.type = type;
  statusEl.textContent = message;
}

function setFormBusy(form, isBusy, busyText) {
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) {
    return;
  }

  if (!submitButton.dataset.defaultText) {
    submitButton.dataset.defaultText = submitButton.textContent;
  }

  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy
    ? busyText
    : submitButton.dataset.defaultText || "전송";
}

function disableAuthForms() {
  [signupForm, loginForm].forEach((form) => {
    if (!form) {
      return;
    }
    const inputs = form.querySelectorAll("input, button");
    inputs.forEach((input) => {
      input.disabled = true;
    });
  });
}

function sanitizeInput(value) {
  return (value || "").trim();
}

async function redirectIfLoggedIn() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus("error", `세션 확인 실패: ${error.message}`);
    return;
  }

  if (data.session) {
    window.location.replace("/account");
  }
}

async function handleSignUp(event) {
  event.preventDefault();

  if (!isSupabaseConfigured) {
    setStatus("error", getSupabaseSetupMessage());
    return;
  }

  const formData = new FormData(signupForm);
  const fullName = sanitizeInput(formData.get("full_name"));
  const email = sanitizeInput(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setStatus("error", "이메일과 비밀번호를 모두 입력해 주세요.");
    return;
  }

  if (password.length < 8) {
    setStatus("error", "비밀번호는 8자 이상으로 입력해 주세요.");
    return;
  }

  setFormBusy(signupForm, true, "가입 처리 중...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  setFormBusy(signupForm, false, "가입하기");

  if (error) {
    setStatus("error", `회원가입 실패: ${error.message}`);
    return;
  }

  if (data.session) {
    setStatus("success", "회원가입과 로그인이 완료되어 계정 페이지로 이동합니다.");
    window.location.replace("/account");
    return;
  }

  setStatus(
    "success",
    "회원가입이 완료되었습니다. 이메일 인증 링크를 클릭한 뒤 다시 로그인해 주세요.",
  );
  signupForm.reset();
}

async function handleSignIn(event) {
  event.preventDefault();

  if (!isSupabaseConfigured) {
    setStatus("error", getSupabaseSetupMessage());
    return;
  }

  const formData = new FormData(loginForm);
  const email = sanitizeInput(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setStatus("error", "이메일과 비밀번호를 모두 입력해 주세요.");
    return;
  }

  setFormBusy(loginForm, true, "로그인 중...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setFormBusy(loginForm, false, "로그인하기");

  if (error) {
    setStatus("error", `로그인 실패: ${error.message}`);
    return;
  }

  setStatus("success", "로그인 성공. 계정 페이지로 이동합니다.");
  window.location.replace("/account");
}

if (!isSupabaseConfigured) {
  setStatus("error", getSupabaseSetupMessage());
  disableAuthForms();
} else {
  setStatus("info", "회원가입 또는 로그인을 진행해 주세요.");
  redirectIfLoggedIn();
}

if (signupForm) {
  signupForm.addEventListener("submit", handleSignUp);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleSignIn);
}

document.getElementById("year").textContent = new Date().getFullYear();
