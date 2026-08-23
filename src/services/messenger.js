import { apiRequestWithAuth } from "./api.js";

export const messengerService = {
  getConversations: () => apiRequestWithAuth("/messages/conversations"),

  getMessages: (bookingId) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}`),

  sendMessage: (bookingId, text) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}`, {
      method: "POST",
      body: { text },
    }),

  markRead: (bookingId) =>
    apiRequestWithAuth(`/messages/bookings/${bookingId}/read`, {
      method: "PATCH",
    }),
};
