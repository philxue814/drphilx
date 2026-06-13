const HOME_SCROLL_KEY = "portfolio:home-scroll-y";

export function saveHomeScrollPosition() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
}

export function peekHomeScrollRestore(): number | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(HOME_SCROLL_KEY);
  if (raw === null) return null;

  const y = Number(raw);
  return Number.isFinite(y) && y >= 0 ? y : null;
}

export function clearHomeScrollRestore() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HOME_SCROLL_KEY);
}

export function consumeHomeScrollRestore(): number | null {
  const y = peekHomeScrollRestore();
  clearHomeScrollRestore();
  return y;
}