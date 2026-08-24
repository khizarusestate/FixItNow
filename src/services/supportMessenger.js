import { apiRequestWithAuth } from "./api.js";

const getSessionRole = () => {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const role = user?.type || user?.role;
    return ["customer", "worker"].includes(role) ? role : undefined;
  } catch {
    return undefined;
  }
};

const authOptions = () => ({ role: getSessionRole() });

export const supportMessengerService = {
  getConversation: () => apiRequestWithAuth("/support-messages/conversations", authOptions()),
  createConversation: () => apiRequestWithAuth("/support-messages/conversations", { ...authOptions(), method: "POST", body: {} }),
  getMessages: (conversationId) => apiRequestWithAuth(`/support-messages/conversations/${conversationId}`, authOptions()),
  sendMessage: (conversationId, text) => apiRequestWithAuth(`/support-messages/conversations/${conversationId}/messages`, { ...authOptions(), method: "POST", body: { text } }),
  markRead: (conversationId) => apiRequestWithAuth(`/support-messages/conversations/${conversationId}/read`, { ...authOptions(), method: "PATCH", body: {} }),
};
