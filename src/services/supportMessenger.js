import { apiRequestWithAuth } from "./api.js";

const role = () => {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    return user?.type || user?.role;
  } catch {
    return undefined;
  }
};

const authOptions = () => ({ role: role() });

export const supportMessengerService = {
  open: (adminId) => apiRequestWithAuth("/messages/support/open", { ...authOptions(), method: "POST", body: { adminId } }),
  list: () => apiRequestWithAuth("/messages/support/mine", authOptions()),
  getMessages: (conversationId) => apiRequestWithAuth(`/messages/support/${conversationId}`, authOptions()),
  sendMessage: (conversationId, text) => apiRequestWithAuth(`/messages/support/${conversationId}`, { ...authOptions(), method: "POST", body: { text } }),
  markRead: (conversationId) => apiRequestWithAuth(`/messages/support/${conversationId}/read`, { ...authOptions(), method: "PATCH", body: {} }),
};
