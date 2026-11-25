import {
  formatIncompletePhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { DEFAULT_PHONE_COUNTRY } from "@/lib/constants";

export function normalizePhone(input: string, defaultCountry = DEFAULT_PHONE_COUNTRY) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(
    trimmed,
    defaultCountry as Parameters<typeof parsePhoneNumberFromString>[1],
  );

  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function isValidPhone(input: string) {
  return normalizePhone(input) !== null;
}

export function formatPhone(input: string) {
  const parsed = parsePhoneNumberFromString(input);
  if (!parsed) return input;
  return parsed.formatInternational();
}

export function formatPhoneInput(input: string) {
  try {
    return formatIncompletePhoneNumber(input, "DK");
  } catch {
    return input;
  }
}

export function phonePlaceholder() {
  return "20 12 34 56";
}
