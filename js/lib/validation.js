// Saudi mobile numbers: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX
const SAUDI_MOBILE = /^(?:(?:\+|00)?966|0)?5\d{8}$/;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;
const ARABIC_INDIC_ZERO = 0x0660;

const toLatinDigits = (value) => value.replace(ARABIC_INDIC_DIGITS, (digit) => digit.charCodeAt(0) - ARABIC_INDIC_ZERO);

export const isSaudiMobile = (value) => SAUDI_MOBILE.test(toLatinDigits(value).replace(/[\s-]/g, ""));

/** Why a form field is not acceptable: "required", "invalid", or null when it is fine. */
export function fieldProblem(field) {
  const value = field.value.trim();
  if (!value) return field.required ? "required" : null;
  if (field.type === "tel" && !isSaudiMobile(value)) return "invalid";
  if (field.type === "email" && field.validity.typeMismatch) return "invalid";
  return null;
}
