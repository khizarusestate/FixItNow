import { API_BASE_URL } from "../config/env.js";

export const aiService = {
  chat: async (messages) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Unable to contact FixItNow AI.");
    }
    return data;
  },
};
