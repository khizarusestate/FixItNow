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
  DEBIT_CARD: "debit-card",
  CREDIT_CARD: "credit-card",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD_VALUES.EASYPAISA]: "EasyPaisa",
  [PAYMENT_METHOD_VALUES.JAZZCASH]: "JazzCash",
  [PAYMENT_METHOD_VALUES.DEBIT_CARD]: "Debit card",
  [PAYMENT_METHOD_VALUES.CREDIT_CARD]: "Credit card",
};

/** Short text stored on the booking for admin / history. */
export function buildPayToSummary(method) {
  const m = String(method || "").trim().toLowerCase();
  if (m === PAYMENT_METHOD_VALUES.EASYPAISA) {
    return `EasyPaisa → ${getEasypaisaMsisdn()}`;
  }
  if (m === PAYMENT_METHOD_VALUES.JAZZCASH) {
    return `JazzCash → ${getJazzcashMsisdn()}`;
  }
  if (m === PAYMENT_METHOD_VALUES.DEBIT_CARD || m === PAYMENT_METHOD_VALUES.CREDIT_CARD) {
    return `${PAYMENT_METHOD_LABELS[m] || m} → demo gateway (see booking)`;
  }
  return "";
}
