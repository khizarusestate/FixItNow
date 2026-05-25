import { describe, it, expect } from "vitest";
import {
  PAYMENT_METHOD_VALUES,
  requiresPaymentReceipt,
  parsePayAfterWorkFlag,
} from "../utils/platformPayment.js";

describe("platformPayment", () => {
  it("exposes wallet and hand-to-hand payment methods", () => {
    expect(PAYMENT_METHOD_VALUES.EASYPAISA).toBe("easypaisa");
    expect(PAYMENT_METHOD_VALUES.JAZZCASH).toBe("jazzcash");
    expect(PAYMENT_METHOD_VALUES.HAND_TO_HAND).toBe("hand-to-hand");
  });

  it("requires receipt only for wallet when paying upfront", () => {
    expect(requiresPaymentReceipt("jazzcash", false)).toBe(true);
    expect(requiresPaymentReceipt("hand-to-hand", false)).toBe(false);
    expect(requiresPaymentReceipt("easypaisa", true)).toBe(false);
  });

  it("parses pay-after-work flag", () => {
    expect(parsePayAfterWorkFlag(true)).toBe(true);
    expect(parsePayAfterWorkFlag("false")).toBe(false);
  });
});
