/**
 * LegalSection — previously a standalone page section.
 * Now converted to a modal. This file is kept so existing imports
 * don't break; it re-exports the TermsModal as the default export.
 *
 * The old <section id="legal"> is removed from App.jsx — terms are
 * only shown via TermsModal when the user clicks "Terms & Conditions"
 * in any form (Booking, Ads, Reviews, Signup, Login, Worker signup).
 */
export { default } from "./shared/TermsModal.jsx";
export { TermsCheckbox } from "./shared/TermsModal.jsx";
