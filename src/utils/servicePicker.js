/** Display label: "AC Technician - AC gas Refilling" */
export function formatServiceOptionLabel(category, name) {
  const cat = String(category || "").trim();
  const n = String(name || "").trim();
  if (cat && n) return `${cat} - ${n}`;
  return n || cat;
}

export function buildServicePickerOptions(services = []) {
  return (services || [])
    .filter((s) => s && s.isActive !== false)
    .map((s) => {
      const id = String(s.id || s._id || "");
      const category = String(s.category || "").trim();
      const name = String(s.name || "").trim();
      return {
        value: id,
        label: formatServiceOptionLabel(category, name),
        category,
        name,
      };
    })
    .filter((o) => o.value && o.label)
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function findServiceOption(options, value) {
  if (!value) return null;
  return options.find((o) => o.value === value || o.label === value) || null;
}
