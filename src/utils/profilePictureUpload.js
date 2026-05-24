import { apiRequestWithAuth } from "../services/api.js";

/**
 * Resize/compress image client-side so uploads stay small (avoids 413 / 1mb JSON limit).
 */
export function compressImageFile(
  file,
  { maxWidth = 1024, quality = 0.82, maxBytes = 600 * 1024 } = {},
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not process image"));
            return;
          }
          if (blob.size > maxBytes && quality > 0.5) {
            canvas.toBlob(
              (smaller) => {
                if (!smaller) {
                  reject(new Error("Image is too large"));
                  return;
                }
                resolve(
                  new File([smaller], file.name || "profile.jpg", {
                    type: "image/jpeg",
                  }),
                );
              },
              "image/jpeg",
              Math.max(0.5, quality - 0.2),
            );
            return;
          }
          resolve(
            new File([blob], file.name || "profile.jpg", {
              type: blob.type || "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file"));
    };

    img.src = url;
  });
}

function dataUrlToFile(dataUrl) {
  const [header, b64] = dataUrl.split(",");
  const mime = header?.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], "profile.jpg", { type: mime });
}

/**
 * Upload profile photo via multipart (not base64 JSON).
 * @returns {Promise<string|null>} Stored path e.g. /uploads/profile-pictures/...
 */
export async function uploadUserProfilePicture(fileOrDataUrl, userType) {
  let file;
  if (fileOrDataUrl instanceof File) {
    file = await compressImageFile(fileOrDataUrl);
  } else if (
    typeof fileOrDataUrl === "string" &&
    fileOrDataUrl.startsWith("data:image")
  ) {
    file = await compressImageFile(dataUrlToFile(fileOrDataUrl));
  } else {
    return null;
  }

  const formData = new FormData();
  formData.append("profilePicture", file);

  const path =
    userType === "worker"
      ? "/worker/profile-picture"
      : "/auth/customer/profile-picture";

  const response = await apiRequestWithAuth(path, {
    method: "POST",
    body: formData,
  });

  return (
    response?.data?.profilePicture ||
    response?.data?.profilePictureUrl ||
    null
  );
}

export function isInlineImageValue(value) {
  return typeof value === "string" && value.startsWith("data:image");
}
