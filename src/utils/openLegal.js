/** Opens the global legal / terms modal (Privacy + Terms of Service). */
export function openLegalModal() {
  window.dispatchEvent(new Event("fixitnow-open-legal"));
}
