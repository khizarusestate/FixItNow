/** MSISDNs for wallet payments (set in `.env` — never commit real secrets). */
export function getEasypaisaMsisdn() {
  return String(
    import.meta.env.VITE_PLATFORM_EASYPAISA_MSISDN ||
      import.meta.env.VITE_PLATFORM_WALLET_MSISDN ||
      "",
  ).trim();
}

export function getJazzcashMsisdn() {
  return String(
    import.meta.env.VITE_PLATFORM_JAZZCASH_MSISDN ||
      import.meta.env.VITE_PLATFORM_WALLET_MSISDN ||
      "",
  ).trim();
}

/** Dummy card gateway info (display only). */
export const CARD_PAYMENT_DUMMY = {
  title: "Card payment (demo)",
  lines: [
    "Merchant: Fix It Now (Demo)",
    "Card number: 4242 4242 4242 4242",
    "Expiry: 12 / 2030",
    "CVV: 123",
    "Reference: FIXITNOW-DEMO",
  ],
};

export const PAYMENT_METHOD_VALUES = {
  EASYPAISA: "easypaisa",
  JAZZCASH: "jazzcash",
  HAND_TO_HAND: "hand-to-hand",
  PAY_AFTER_WORK: "pay-after-work",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD_VALUES.EASYPAISA]: "EasyPaisa",
  [PAYMENT_METHOD_VALUES.JAZZCASH]: "JazzCash",
  [PAYMENT_METHOD_VALUES.HAND_TO_HAND]: "Hand to hand",
  [PAYMENT_METHOD_VALUES.PAY_AFTER_WORK]: "Payment after work",
};

export function parsePayAfterWorkFlag(value) {
  return value === true || value === "true" || value === "1";
}

export function isWalletPaymentMethod(method) {
  const m = String(method || "").trim().toLowerCase();
  return (
    m === PAYMENT_METHOD_VALUES.EASYPAISA ||
    m === PAYMENT_METHOD_VALUES.JAZZCASH
  );
}

/** Receipt required only for EasyPaisa / JazzCash when paying upfront. */
export function requiresPaymentReceipt(method, payAfterWork) {
  if (parsePayAfterWorkFlag(payAfterWork)) return false;
  return isWalletPaymentMethod(method);
}

/** Short text stored on the booking for admin / history. */
export function buildPayToSummary(method) {
  const m = String(method || "").trim().toLowerCase();
  if (m === PAYMENT_METHOD_VALUES.PAY_AFTER_WORK) {
    return "Payment after work is completed";
  }
  if (m === PAYMENT_METHOD_VALUES.EASYPAISA) {
    return `EasyPaisa → ${getEasypaisaMsisdn()}`;
  }
  if (m === PAYMENT_METHOD_VALUES.JAZZCASH) {
    return `JazzCash → ${getJazzcashMsisdn()}`;
  }
  if (m === PAYMENT_METHOD_VALUES.HAND_TO_HAND) {
    return "Hand to hand (cash in person)";
  }
  return "";
}
