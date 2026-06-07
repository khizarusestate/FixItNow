import PhoneInputWithCountry from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export function validatePhoneNumber(value) {
  if (!value || typeof value !== "string") return false;
  return isValidPhoneNumber(value);
}

export default function PhoneInput({
  value,
  onChange,
  className = "",
  required = false,
  placeholder,
  id,
  name,
  defaultCountry = "PK",
  disabled = false,
}) {
  return (
    <PhoneInputWithCountry
      id={id}
      name={name}
      international
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry}
      value={value || undefined}
      onChange={(next) => onChange(next || "")}
      placeholder={placeholder}
      limitMaxLength
      disabled={disabled}
      className={`fixit-phone-input ${className}`.trim()}
      numberInputProps={{
        required,
        inputMode: "tel",
        autoComplete: "tel",
      }}
    />
  );
}
