let locked = false;
let scrollY = 0;

export function lockPageScroll() {
  if (locked || typeof document === "undefined") return;
  scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  locked = true;
}

export function unlockPageScroll() {
  if (!locked || typeof document === "undefined") return;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  window.scrollTo(0, scrollY);
  locked = false;
}
