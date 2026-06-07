import { isValidPhoneNumber } from "react-phone-number-input";

export function isPhoneValid(value) {
  if (!value || typeof value !== "string") return false;
  return isValidPhoneNumber(value);
}

export function phoneValidationMessage(value) {
  if (!value?.trim()) return "Phone number is required.";
  if (!isValidPhoneNumber(value)) return "Please enter a valid phone number.";
  return "";
}
