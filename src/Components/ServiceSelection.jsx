import { useState, useEffect, useMemo } from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";
import { servicesService } from "../services/api";

function getServiceId(service) {
  return String(service?.id || service?._id || service?.serviceId || "");
}

export default function ServiceSelection({
  selectedServices,
  onChange,
  maxSelection = 5,
}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(true);

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
    if (selectedServices.length === 0) {
      setPickerOpen(true);
    }
  }, [selectedServices.length]);

  const atMax = selectedServices.length >= maxSelection;

  const availableServices = useMemo(() => {
    const selectedIds = new Set(
      selectedServices.map((s) => String(s.serviceId)),
    );
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      const id = getServiceId(service);
      if (!id || selectedIds.has(id)) return false;
      if (!q) return true;
      return (
        String(service.name || "")
          .toLowerCase()
          .includes(q) ||
        String(service.category || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [services, search, selectedServices]);

  const addPendingService = () => {
    if (!pendingId || atMax) return;
    const service = services.find((s) => getServiceId(s) === pendingId);
    if (!service) return;
    onChange([
      ...selectedServices,
      {
        serviceId: getServiceId(service),
        serviceName: service.name,
        serviceCategory: service.category || "",
      },
    ]);
    setPendingId("");
    setSearch("");
    setPickerOpen(false);
  };

  const removeService = (id) => {
    onChange(
      selectedServices.filter((s) => String(s.serviceId) !== String(id)),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Loading services…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
        No services available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedServices.length > 0 && (
        <ul className="space-y-2">
          {selectedServices.map((item, index) => (
            <li
              key={item.serviceId}
              className="flex items-center justify-between gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {index + 1}. {item.serviceName}
                </p>
                {item.serviceCategory ? (
                  <p className="truncate text-xs text-slate-500">
                    {item.serviceCategory}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeService(item.serviceId)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-600"
                aria-label={`Remove ${item.serviceName}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && !atMax && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPendingId("");
              }}
              placeholder="Search services…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Select service
            </label>
            <select
              value={pendingId}
              onChange={(e) => setPendingId(e.target.value)}
              size={Math.min(6, Math.max(3, availableServices.length))}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
            >
              <option value="" disabled>
                {availableServices.length
                  ? "Choose a service from the list"
                  : "No matching services"}
              </option>
              {availableServices.map((service) => (
                <option key={getServiceId(service)} value={getServiceId(service)}>
                  {service.name}
                  {service.category ? ` — ${service.category}` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={addPendingService}
            disabled={!pendingId}
            className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add service
          </button>
        </div>
      )}

      {!pickerOpen && !atMax && selectedServices.length > 0 && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50"
        >
          <Plus size={16} />
          Add more
        </button>
      )}

      <p className="text-xs text-slate-500">
        {selectedServices.length} of {maxSelection} services selected
      </p>
    </div>
  );
}
