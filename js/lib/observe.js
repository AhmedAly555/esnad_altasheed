/** Reports an element's visibility every time it changes. Returns the observer. */
export function watchVisibility(element, onChange, options) {
  const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), options);
  observer.observe(element);
  return observer;
}

const inDocumentOrder = (a, b) =>
  a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/**
 * Calls onEnter(element, batchIndex) once per element. Elements that enter in the same
 * observer callback share a batch, so the caller can stagger them in document order.
 */
export function onceVisible(elements, onEnter, options) {
  const observer = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .sort(inDocumentOrder)
      .forEach((entry, index) => {
        observer.unobserve(entry.target);
        onEnter(entry.target, index);
      });
  }, options);
  elements.forEach((element) => observer.observe(element));
}
