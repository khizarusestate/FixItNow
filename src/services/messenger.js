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

export const messengerService = {
  getConversations: () =>
    apiRequestWithAuth("/messages/conversations", authOptions()),

  getMessages: (bookingId) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}`, authOptions()),

  sendMessage: (bookingId, text) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}`, {
      ...authOptions(),
      method: "POST",
      body: { text },
    }),

  markRead: (bookingId) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}/read`, {
      ...authOptions(),
      method: "PATCH",
      body: {},
    }),
};
