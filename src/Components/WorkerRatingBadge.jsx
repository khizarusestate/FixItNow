import { Star } from "lucide-react";

export default function WorkerRatingBadge({
  rating,
  showLabel = true,
  size = "sm",
  light = false,
  className = "",
}) {
  const value = Number(rating) || 0;
  const iconSize = size === "md" ? 18 : 14;
  const textClass = size === "md" ? "text-base" : "text-sm";

  return (
    <div
      className={`inline-flex items-center gap-1 ${light ? "text-white" : "text-amber-700"} ${className}`}
      title={`${value.toFixed(1)} out of 5`}
    >
      <Star
        size={iconSize}
        className={`shrink-0 ${light ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400"}`}
      />
      <span
        className={`font-semibold ${textClass} ${light ? "text-white" : "text-slate-900"}`}
      >
        {value.toFixed(1)}
      </span>
      {showLabel ? (
        <span
          className={`text-xs font-normal ${light ? "text-slate-200" : "text-slate-500"}`}
        >
          rating
        </span>
      ) : null}
    </div>
  );
}
