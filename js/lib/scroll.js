/**
 * Runs `update` once now and then at most once per frame while scrolling or resizing.
 * Scroll-linked behaviors share this so each one does not add its own listener loop.
 */
export function onScrollFrame(update) {
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}
