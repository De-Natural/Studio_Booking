"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">Settings</h1>
        <p className="text-muted mt-1">Manage your studio information and preferences.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-primary">Studio Information</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Studio Name</label>
              <p className="text-primary font-medium">LuxeLoft Studio</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Contact Email</label>
              <p className="text-primary font-medium">homeaway.479@gmail.com</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Available Session Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["🎵 Music Recording", "🎙️ Podcast", "📸 Photography", "🎬 Video Shoot", "✨ Other"].map((type) => (
                <div key={type} className="px-3 py-2 rounded-lg bg-surface-alt text-sm text-primary">{type}</div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Time Slots</h3>
            <div className="space-y-2">
              {[
                "Morning (9:00 AM - 1:00 PM)",
                "Afternoon (2:00 PM - 6:00 PM)",
                "Evening (7:00 PM - 11:00 PM)",
              ].map((slot) => (
                <div key={slot} className="px-3 py-2 rounded-lg bg-surface-alt text-sm text-primary">{slot}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
