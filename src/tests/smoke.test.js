import { describe, it, expect } from "vitest";
import {
  PAYMENT_METHOD_VALUES,
  requiresPaymentReceipt,
  parsePayAfterWorkFlag,
} from "../utils/platformPayment.js";

describe("platformPayment", () => {
  it("exposes jazzcash and pay-after-work", () => {
    expect(PAYMENT_METHOD_VALUES.JAZZCASH).toBe("jazzcash");
    expect(PAYMENT_METHOD_VALUES.PAY_AFTER_WORK).toBe("pay-after-work");
  });

  it("requires receipt only for jazzcash when paying upfront", () => {
    expect(requiresPaymentReceipt("jazzcash", false)).toBe(true);
    expect(requiresPaymentReceipt("jazzcash", true)).toBe(false);
  });

  it("parses pay-after-work flag", () => {
    expect(parsePayAfterWorkFlag(true)).toBe(true);
    expect(parsePayAfterWorkFlag("false")).toBe(false);
  });
});
