import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Plus, Check, Loader2, Briefcase } from "lucide-react";
import { servicesService } from "../services/api";

function serviceIdOf(service) {
  return String(service._id || service.serviceId || "");
}

function isSelected(selectedServices, id) {
  return selectedServices.some((s) => String(s.serviceId) === String(id));
}

export default function ServiceSelection({
  selectedServices,
  onChange,
  maxSelection = 5,
  placeholder = "Search services to add…",
}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await servicesService.getAll();
        if (!cancelled) {
          setServices(res?.data?.services || []);
          setError("");
        }
      } catch (err) {
        console.error("Error loading services:", err);
        if (!cancelled) {
          setError("Failed to load services");
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const atMax = selectedServices.length >= maxSelection;

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = services;
    if (q) {
      list = services.filter(
        (s) =>
          String(s.name || "")
            .toLowerCase()
            .includes(q) ||
          String(s.category || "")
            .toLowerCase()
            .includes(q),
      );
    }
    return list.slice(0, 12);
  }, [services, query]);

  const addService = (service) => {
    const id = serviceIdOf(service);
    if (!id || isSelected(selectedServices, id) || atMax) return;
    onChange([
      ...selectedServices,
      {
        serviceId: id,
        serviceName: service.name,
        serviceCategory: service.category,
      },
    ]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeService = (id) => {
    onChange(
      selectedServices.filter((s) => String(s.serviceId) !== String(id)),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin text-slate-400" />
        Loading services…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        No services available
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow focus-within:border-slate-300 focus-within:shadow-md"
    >
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-3">
          {selectedServices.map((item) => (
            <span
              key={item.serviceId}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-sm font-medium text-slate-800 shadow-sm"
            >
              <span className="truncate">{item.serviceName}</span>
              <button
                type="button"
                onClick={() => removeService(item.serviceId)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Remove ${item.serviceName}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/15">
          <Search size={18} className="shrink-0 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            placeholder={
              atMax
                ? `Maximum ${maxSelection} services selected`
                : placeholder
            }
            disabled={atMax}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
            autoComplete="off"
          />
        </div>

        {open && !atMax && (
          <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {query.trim() ? "Search results" : "Suggested services"}
              </p>
            </div>
            <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
              {filteredServices.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-slate-500">
                  No services match &ldquo;{query}&rdquo;
                </li>
              ) : (
                filteredServices.map((service) => {
                  const id = serviceIdOf(service);
                  const selected = isSelected(selectedServices, id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={selected || atMax}
                        onClick={() => addService(service)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 disabled:cursor-default disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Briefcase size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900">
                            {service.name}
                          </span>
                          {service.category ? (
                            <span className="block truncate text-xs text-slate-500">
                              {service.category}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            selected
                              ? "bg-[#0a66c2]/10 text-[#0a66c2]"
                              : "bg-slate-100 text-slate-500 group-hover:bg-[#0a66c2]/10"
                          }`}
                        >
                          {selected ? (
                            <Check size={16} strokeWidth={2.5} />
                          ) : (
                            <Plus size={16} strokeWidth={2.5} />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
        <span>
          {selectedServices.length} of {maxSelection} selected
        </span>
        {selectedServices.length === 0 ? (
          <span className="text-slate-400">Add at least one service</span>
        ) : null}
      </div>
    </div>
  );
}
