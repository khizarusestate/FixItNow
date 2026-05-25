/** Advertisement duration pricing (PKR) — shown in UI; admin verifies payment manually. */
export const AD_DURATION_PRICING = {
  "24 hours": { label: "24 Hours", price: 200 },
  "3 days": { label: "3 Days", price: 400 },
  "1 week": { label: "1 Week", price: 600 },
  "2 weeks": { label: "2 Weeks", price: 1000 },
  "1 month": { label: "1 Month", price: 1800 },
};

export function getAdPrice(duration) {
  return AD_DURATION_PRICING[duration]?.price ?? null;
}

export function formatAdPrice(duration) {
  const p = getAdPrice(duration);
  return p != null ? `Rs ${p.toLocaleString("en-PK")}` : "";
}
