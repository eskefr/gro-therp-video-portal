import { format, formatDistanceToNowStrict, isAfter } from "date-fns";
import { da, enGB } from "date-fns/locale";

const LOCALE = enGB;

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMM yyyy", { locale: LOCALE });
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMM yyyy, HH:mm", { locale: LOCALE });
}

export function formatShortDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMM, HH:mm", { locale: LOCALE });
}

export function formatShootDates(start: string | null, end: string | null) {
  if (!start && !end) return "Dates to be confirmed";
  if (!start) return formatDate(end);
  if (!end || start === end) return formatDate(start);
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export function formatExpiryCountdown(expiresAt: string) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime()) || !isAfter(date, new Date())) {
    return "Expired";
  }
  return `Expires ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function toDateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function addHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export const dateFnsLocale = da;
