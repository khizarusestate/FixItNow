/** MSISDN for JazzCash (set in `.env` — never commit real secrets). */
export function getJazzcashMsisdn() {
  return String(
    import.meta.env.VITE_PLATFORM_JAZZCASH_MSISDN ||
      import.meta.env.VITE_PLATFORM_WALLET_MSISDN ||
      "",
  ).trim();
}

/** Account title for JazzCash. */
export function getJazzcashAccountTitle() {
  return String(
    import.meta.env.VITE_PLATFORM_JAZZCASH_ACCOUNT_TITLE ||
      "FixItNow Platform",
  ).trim();
}

/** Bank transfer details from env (demo / production account info). */
export function getBankTransferDetails() {
  return {
    bankName: String(import.meta.env.VITE_PLATFORM_BANK_NAME || "Demo Bank").trim(),
    accountTitle: String(
      import.meta.env.VITE_PLATFORM_BANK_ACCOUNT_TITLE || "Fix It Now",
    ).trim(),
    accountNumber: String(
      import.meta.env.VITE_PLATFORM_BANK_ACCOUNT_NUMBER || "01234567890123",
    ).trim(),
    iban: String(
      import.meta.env.VITE_PLATFORM_BANK_IBAN || "PK00DEMO0000001234567890",
    ).trim(),
  };
}

export const PAYMENT_METHOD_VALUES = {
  JAZZCASH: "jazzcash",
  BANK_TRANSFER: "bank-transfer",
  PAY_AFTER_WORK: "pay-after-work",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD_VALUES.JAZZCASH]: "JazzCash",
  [PAYMENT_METHOD_VALUES.BANK_TRANSFER]: "Bank transfer",
  [PAYMENT_METHOD_VALUES.PAY_AFTER_WORK]: "Payment after work",
};

export function parsePayAfterWorkFlag(value) {
  return value === true || value === "true" || value === "1";
}

export function isUpfrontPaymentMethod(method) {
  const m = String(method || "").trim().toLowerCase();
  return (
    m === PAYMENT_METHOD_VALUES.JAZZCASH ||
    m === PAYMENT_METHOD_VALUES.BANK_TRANSFER
  );
}

/** @deprecated use isUpfrontPaymentMethod */
export function isWalletPaymentMethod(method) {
  return isUpfrontPaymentMethod(method);
}

/** Receipt required for JazzCash / bank transfer when paying upfront. */
export function requiresPaymentReceipt(method, payAfterWork) {
  if (parsePayAfterWorkFlag(payAfterWork)) return false;
  return isUpfrontPaymentMethod(method);
}

/** Short text stored on the booking for admin / history. */
export function buildPayToSummary(method) {
  const m = String(method || "").trim().toLowerCase();
  if (m === PAYMENT_METHOD_VALUES.PAY_AFTER_WORK) {
    return "Payment after work is completed";
  }
  if (m === PAYMENT_METHOD_VALUES.JAZZCASH) {
    return `JazzCash → ${getJazzcashAccountTitle()} / ${getJazzcashMsisdn()}`;
  }
  if (m === PAYMENT_METHOD_VALUES.BANK_TRANSFER) {
    const b = getBankTransferDetails();
    return `Bank → ${b.bankName} / ${b.accountTitle} / ${b.accountNumber}${b.iban ? ` / IBAN ${b.iban}` : ""}`;
  }
  return "";
}

export function isPayAfterWorkBooking(paymentDetails) {
  if (!paymentDetails) return false;
  return Boolean(
    paymentDetails.payAfterWork ||
      String(paymentDetails.paymentMethod || "").toLowerCase() ===
        PAYMENT_METHOD_VALUES.PAY_AFTER_WORK,
  );
}
