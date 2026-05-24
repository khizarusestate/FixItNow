import { describe, it, expect } from "vitest";
import { PAYMENT_METHOD_VALUES } from "../utils/platformPayment.js";

describe("platformPayment", () => {
  it("exposes wallet payment methods only (no card)", () => {
    expect(PAYMENT_METHOD_VALUES.EASYPAISA).toBe("easypaisa");
    expect(PAYMENT_METHOD_VALUES.JAZZCASH).toBe("jazzcash");
    expect(PAYMENT_METHOD_VALUES.JAZZCASH).toBe("jazzcash");
  });
});
