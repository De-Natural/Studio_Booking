"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getCalendarDays, isDatePast, isSameDate } from "@/lib/utils";

export type DateStatus = "available" | "booked" | "blocked";

interface CalendarProps {
  availability: Record<string, DateStatus>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingCalendar({
  availability,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = getCalendarDays(viewYear, viewMonth);

  const goToPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const isPrevDisabled =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function getDateKey(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getStatus(day: number): DateStatus {
    const key = getDateKey(day);
    return availability[key] || "available";
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          disabled={isPrevDisabled}
          className="w-9 h-9 rounded-lg flex items-center justify-center border border-border hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-9 h-9 rounded-lg flex items-center justify-center border border-border hover:bg-surface-alt transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-xs font-medium text-muted text-center py-1.5"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const date = new Date(viewYear, viewMonth, day);
          const past = isDatePast(date);
          const status = getStatus(day);
          const isSelected = selectedDate && isSameDate(date, selectedDate);
          const isToday = isSameDate(date, today);
          const disabled = past || status === "booked" || status === "blocked";

          return (
            <button
              key={day}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              className={cn(
                "relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200",
                // Base
                !disabled && "hover:scale-105 cursor-pointer",
                // Selected
                isSelected && "bg-accent text-white shadow-md ring-2 ring-accent/30",
                // Available
                !isSelected && !disabled && status === "available" &&
                  "bg-available-light text-available hover:bg-available/20 border border-available/20",
                // Booked
                status === "booked" &&
                  "bg-booked-light text-booked/50 cursor-not-allowed line-through",
                // Blocked
                status === "blocked" &&
                  "bg-blocked-light text-blocked cursor-not-allowed",
                // Past
                past && "text-muted-light cursor-not-allowed opacity-40",
                // Today ring
                isToday && !isSelected && "ring-2 ring-accent/40"
              )}
              aria-label={`${MONTH_NAMES[viewMonth]} ${day} — ${disabled ? status : "available"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-3 h-3 rounded-sm bg-available-light border border-available/20" />
          Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-3 h-3 rounded-sm bg-booked-light border border-booked/20" />
          Booked
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-3 h-3 rounded-sm bg-blocked-light border border-blocked/20" />
          Blocked
        </div>
      </div>
    </div>
  );
}
