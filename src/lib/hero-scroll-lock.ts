export function setHeroScrollLocked(locked: boolean) {
  const root = document.documentElement;
  root.dataset.heroLocked = locked ? "true" : "false";

  if (locked) {
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return;
  }

  root.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
}

export function isHeroScrollLocked() {
  return document.documentElement.dataset.heroLocked === "true";
}