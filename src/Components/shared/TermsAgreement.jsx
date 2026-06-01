import { openLegalModal } from "../../utils/openLegal.js";

/**
 * Checkbox + "terms and conditions" link that opens the legal modal.
 */
export default function TermsAgreement({
  checked,
  onChange,
  prefix = "I agree to the",
  className = "",
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
      />
      <span className="text-xs leading-snug text-slate-600">
        {prefix}{" "}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            openLegalModal();
          }}
          className="font-semibold text-orange-600 underline hover:text-orange-700"
        >
          terms and conditions
        </button>
      </span>
    </label>
  );
}
