import { isSupabaseConfigured, supabase } from "./supabase-client.js";

const loginLinks = Array.from(document.querySelectorAll("[data-auth-login]"));
const logoutLinks = Array.from(document.querySelectorAll("[data-auth-logout]"));

function applyAuthMenuState(isLoggedIn) {
  loginLinks.forEach((link) => {
    link.hidden = isLoggedIn;
  });

  logoutLinks.forEach((link) => {
    link.hidden = !isLoggedIn;
  });
}

async function signOutFromMenu(event) {
  event.preventDefault();

  if (!isSupabaseConfigured || !supabase) {
    applyAuthMenuState(false);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("로그아웃 실패:", error.message);
    return;
  }

  applyAuthMenuState(false);
  window.location.href = "/";
}

async function refreshAuthMenu() {
  if (!isSupabaseConfigured || !supabase) {
    applyAuthMenuState(false);
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("세션 확인 실패:", error.message);
    applyAuthMenuState(false);
    return;
  }

  applyAuthMenuState(Boolean(data.session));
}

logoutLinks.forEach((link) => {
  link.addEventListener("click", signOutFromMenu);
});

if (isSupabaseConfigured && supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    applyAuthMenuState(Boolean(session));
  });
}

refreshAuthMenu();
