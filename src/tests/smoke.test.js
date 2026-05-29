import { describe, it, expect } from "vitest";
import {
  PAYMENT_METHOD_VALUES,
  requiresPaymentReceipt,
  parsePayAfterWorkFlag,
  getBankTransferDetails,
} from "../utils/platformPayment.js";

describe("platformPayment", () => {
  it("exposes jazzcash, bank transfer, and pay-after-work", () => {
    expect(PAYMENT_METHOD_VALUES.JAZZCASH).toBe("jazzcash");
    expect(PAYMENT_METHOD_VALUES.BANK_TRANSFER).toBe("bank-transfer");
    expect(PAYMENT_METHOD_VALUES.PAY_AFTER_WORK).toBe("pay-after-work");
  });

  it("requires receipt for jazzcash and bank when paying upfront", () => {
    expect(requiresPaymentReceipt("jazzcash", false)).toBe(true);
    expect(requiresPaymentReceipt("bank-transfer", false)).toBe(true);
    expect(requiresPaymentReceipt("jazzcash", true)).toBe(false);
  });

  it("parses pay-after-work flag", () => {
    expect(parsePayAfterWorkFlag(true)).toBe(true);
    expect(parsePayAfterWorkFlag("false")).toBe(false);
  });

  it("provides bank transfer demo fields", () => {
    const b = getBankTransferDetails();
    expect(b.bankName).toBeTruthy();
    expect(b.accountNumber).toBeTruthy();
  });
});
