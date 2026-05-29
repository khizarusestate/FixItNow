import { Building2 } from "lucide-react";
import { getBankTransferDetails } from "../../utils/platformPayment.js";

export default function BankTransferInfo({ className = "" }) {
  const bank = getBankTransferDetails();

  return (
    <div
      className={`rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 flex gap-3 ${className}`}
    >
      <Building2 className="shrink-0 text-indigo-700 mt-0.5" size={20} />
      <div className="text-sm text-indigo-900 min-w-0">
        <p className="font-semibold">Pay via bank transfer</p>
        <ul className="mt-2 space-y-1 text-xs sm:text-sm text-indigo-800">
          <li>
            <span className="font-medium">Bank:</span> {bank.bankName}
          </li>
          <li>
            <span className="font-medium">Account title:</span> {bank.accountTitle}
          </li>
          <li>
            <span className="font-medium">Account #:</span>{" "}
            <span className="font-mono font-bold">{bank.accountNumber}</span>
          </li>
          {bank.iban ? (
            <li>
              <span className="font-medium">IBAN:</span>{" "}
              <span className="font-mono font-bold break-all">{bank.iban}</span>
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-xs text-indigo-700/90">
          Transfer the amount, then upload your payment receipt below.
        </p>
      </div>
    </div>
  );
}
