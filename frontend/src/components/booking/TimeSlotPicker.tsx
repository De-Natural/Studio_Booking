"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeSlotData {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlotData[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  loading?: boolean;
}

export default function TimeSlotPicker({
  slots,
  selectedSlotId,
  onSelectSlot,
  loading,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">
          Select a Time Slot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No time slots available for this date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">
        Select a Time Slot
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => !slot.isBooked && onSelectSlot(slot.id)}
              disabled={slot.isBooked}
              className={cn(
                "relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200",
                // Available
                !slot.isBooked &&
                  !isSelected &&
                  "border-border bg-card hover:border-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
                // Selected
                isSelected &&
                  "border-accent bg-accent/5 shadow-md ring-1 ring-accent/20",
                // Booked
                slot.isBooked &&
                  "border-border bg-surface-alt cursor-not-allowed opacity-50"
              )}
            >
              <Clock
                className={cn(
                  "w-5 h-5",
                  isSelected ? "text-accent" : "text-muted"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-accent" : "text-primary"
                )}
              >
                {slot.label}
              </span>
              {slot.isBooked && (
                <span className="text-xs text-booked font-medium">Booked</span>
              )}
              {!slot.isBooked && isSelected && (
                <span className="text-xs text-accent font-medium">Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
