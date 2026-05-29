import { Check } from "lucide-react";

export default function CompletionTicks({
  guestOnly = false,
  customerMarkedDone = false,
  workerMarkedDone = false,
  size = 16,
  className = "",
}) {
  if (guestOnly) {
    if (!workerMarkedDone) return null;
    return (
      <span
        className={`inline-flex items-center ${className}`}
        title="Job completed by worker"
      >
        <Check size={size} strokeWidth={2.75} className="text-blue-500" />
      </span>
    );
  }

  if (!customerMarkedDone && !workerMarkedDone) return null;

  return (
    <span
      className={`inline-flex items-center ${className}`}
      title="Completion: orange = customer, blue = worker"
    >
      <Check
        size={size}
        strokeWidth={2.75}
        className={customerMarkedDone ? "text-orange-500" : "text-slate-300"}
      />
      <Check
        size={size}
        strokeWidth={2.75}
        className={`-ml-1.5 ${workerMarkedDone ? "text-blue-500" : "text-slate-300"}`}
      />
    </span>
  );
}
