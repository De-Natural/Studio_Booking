// Session type as a plain string union — matches admin settings IDs
export type SessionType = "AUDIO" | "PODCAST" | "PHOTOGRAPHY" | "VIDEO" | "OTHER";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  AUDIO: "Music Recording",
  PODCAST: "Podcast",
  PHOTOGRAPHY: "Photography",
  VIDEO: "Video Shoot",
  OTHER: "Other",
};

export const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  AUDIO: "🎵",
  PODCAST: "🎙️",
  PHOTOGRAPHY: "📸",
  VIDEO: "🎬",
  OTHER: "✨",
};

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 = Sunday

  const days: (number | null)[] = [];

  // Fill leading empty cells
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return days;
}

export function isDatePast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
