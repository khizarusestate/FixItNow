import { useState } from "react";
import { resolveUploadMediaUrl } from "../../utils/mediaUrl.js";

export default function ProfileAvatar({
  src,
  name = "",
  className = "w-10 h-10",
  textClassName = "text-sm",
}) {
  const [broken, setBroken] = useState(false);
  const url = src ? resolveUploadMediaUrl(src) : "";
  const initial = (name || "?").charAt(0).toUpperCase();

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name ? `${name} profile` : "Profile"}
        className={`${className} rounded-full object-cover shadow-sm`}
        onError={() => setBroken(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold shadow-sm ${textClassName}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
