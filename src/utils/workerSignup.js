export function formatCnicInput(value = "") {
    const digits = String(value).replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidCnic(value = "") {
    const digits = String(value || "").replace(/\D/g, "");
    return /^\d{13}$/.test(digits);
}
