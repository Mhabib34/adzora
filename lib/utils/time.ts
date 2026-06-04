import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Formats a Date to a time string.
 * @param date - The date to format.
 * @param showSeconds - Whether to include seconds.
 * @returns "HH:MM" or "HH:MM:SS"
 */
export function formatTime(date: Date, showSeconds: boolean): string {
  return format(date, showSeconds ? "HH:mm:ss" : "HH:mm");
}

/**
 * Formats a Date to a full Indonesian day+date string.
 * Example: "Senin, 20 Januari 2025"
 */
export function formatDate(date: Date): string {
  return format(date, "EEEE, d MMMM yyyy", { locale: id });
}

/**
 * Converts a total number of seconds to a MM:SS string.
 * Example: 330 → "05:30"
 */
export function secondsToMMSS(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * Converts a Date to a "YYYY-MM-DD" key string (local time).
 */
export function dateToKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns true if two dates fall on the same calendar day (local time).
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Adds a given number of minutes to a Date and returns a new Date.
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
