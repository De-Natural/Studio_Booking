import { z } from "zod";

export const bookingSchema = z.object({
  clientName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  clientEmail: z
    .string()
    .email("Please enter a valid email address"),
  clientPhone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(20, "Phone number must be under 20 characters")
    .regex(/^[+\d\s()-]+$/, "Please enter a valid phone number"),
  sessionType: z.enum([
    "AUDIO",
    "PODCAST",
    "PHOTOGRAPHY",
    "VIDEO",
    "OTHER",
  ]),
  bookingDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date >= new Date(new Date().toDateString());
  }, "Please select a valid future date"),
  timeSlotId: z
    .string()
    .min(1, "Please select a time slot"),
  notes: z
    .string()
    .max(500, "Notes must be under 500 characters")
    .optional()
    .or(z.literal("")),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const blockedDateSchema = z.object({
  date: z.string().refine((val) => !isNaN(new Date(val).getTime()), "Invalid date"),
  reason: z.string().max(200).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  studioName: z.string().min(1, "Studio name is required").max(100),
  studioDescription: z.string().max(500).optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  termsConditions: z.string().max(5000).optional().or(z.literal("")),
});
