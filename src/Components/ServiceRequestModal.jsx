import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { apiRequestWithAuth } from "../services/api.js";

const initialForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  estimatedDuration: "",
};

export default function ServiceRequestModal({ open, onClose, categories = [] }) {
  const [form, setForm] = useState(initialForm);
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!open) return null;

  const reset = () => {
    setForm(initialForm);
    setRequirements([]);
    setRequirementInput("");
    setError("");
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const addRequirement = () => {
    const val = requirementInput.trim();
    if (val && !requirements.includes(val)) {
      setRequirements((prev) => [...prev, val]);
    }
    setRequirementInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();

    if (!name || !category || !description) {
      setError("Service name, category, and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequestWithAuth("/worker/service-requests", {
        role: "worker",
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          description,
          price: form.price ? Number(form.price) : 0,
          estimatedDuration: form.estimatedDuration.trim() || undefined,
          requirements,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            {done ? "Request Submitted" : "Request a New Service Type"}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Your request has been sent to the admin team for review. You'll be notified once it's approved.
            </p>
            <button
              onClick={handleClose}
              className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
            <p className="text-xs text-slate-500">
              Can't find your trade in the list? Tell us about it and our team will review it.
            </p>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Service name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Solar Panel Cleaning"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
              <input
                type="text"
                list="service-request-categories"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Pick an existing category or type a new one"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
              <datalist id="service-request-categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="What does this service involve?"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Typical price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Duration</label>
                <input
                  type="text"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                  placeholder="e.g., 1-2 hours"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Requirements <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="Press Enter to add"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
              {requirements.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {requirements.map((req, idx) => (
                    <span
                      key={`${req}-${idx}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                    >
                      {req}
                      <button
                        type="button"
                        onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== idx))}
                        className="hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
