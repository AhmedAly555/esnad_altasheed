(() => {
  const styles = getComputedStyle(document.documentElement);
  document.querySelectorAll("[data-token]").forEach((el) => {
    el.textContent = styles.getPropertyValue(`--${el.dataset.token}`).trim().replace(/\s+/g, " ");
  });
})();
