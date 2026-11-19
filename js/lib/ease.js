export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/** Runs onFrame(progress) with eased 0..1 progress over `duration` ms, ending exactly on 1. */
export function animate(duration, onFrame, easing = easeOutQuart) {
  const startedAt = performance.now();
  const frame = (now) => {
    // The frame timestamp can precede performance.now() taken a moment earlier
    const t = Math.min(Math.max((now - startedAt) / duration, 0), 1);
    onFrame(easing(t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
