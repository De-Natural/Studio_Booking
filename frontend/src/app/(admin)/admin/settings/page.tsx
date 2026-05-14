"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Plus, Trash2, Loader2, Music, Clock } from "lucide-react";
import { authHeaders, isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface SessionType {
  id: string;
  label: string;
  icon: string;
  price: number;
}

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

interface StudioSettings {
  studioName: string;
  contactEmail: string;
  sessionTypes: SessionType[];
  timeSlots: TimeSlot[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [router]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/admin", {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  };

  const addSessionType = () => {
    if (!settings) return;
    const newSession: SessionType = {
      id: `SESS_${Date.now()}`,
      label: "New Session Type",
      icon: "✨",
      price: 0,
    };
    setSettings({
      ...settings,
      sessionTypes: [...settings.sessionTypes, newSession],
    });
  };

  const removeSessionType = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      sessionTypes: settings.sessionTypes.filter(s => s.id !== id),
    });
  };

  const updateSessionType = (id: string, field: keyof SessionType, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      sessionTypes: settings.sessionTypes.map(s => 
        s.id === id ? { ...s, [field]: field === 'price' ? Number(value) : value } : s
      ),
    });
  };

  const addTimeSlot = () => {
    if (!settings) return;
    const newSlot: TimeSlot = {
      id: `TS_${Date.now()}`,
      label: "New Time Slot (00:00 - 00:00)",
      startTime: "09:00",
      endTime: "13:00",
    };
    setSettings({
      ...settings,
      timeSlots: [...settings.timeSlots, newSlot],
    });
  };

  const removeTimeSlot = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      timeSlots: settings.timeSlots.filter(s => s.id !== id),
    });
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      timeSlots: settings.timeSlots.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">Settings</h1>
          <p className="text-muted mt-1">Manage your studio information and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium animate-slide-up ${
          message.type === 'success' ? 'bg-available/10 text-available' : 'bg-booked/10 text-booked'
        }`}>
          {message.text}
        </div>
      )}

      {/* Studio Information */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-primary">Studio Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Studio Name</label>
            <input
              type="text"
              value={settings.studioName}
              onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Session Types */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Available Session Types</h2>
          </div>
          <button
            onClick={addSessionType}
            className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Type
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {settings.sessionTypes.map((type) => (
            <div key={type.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-border bg-surface-alt hover:border-accent/30 transition-all">
              <input
                type="text"
                value={type.icon}
                onChange={(e) => updateSessionType(type.id, 'icon', e.target.value)}
                className="w-10 text-center bg-white border border-border rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <input
                type="text"
                value={type.label}
                onChange={(e) => updateSessionType(type.id, 'label', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-muted">₦</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={type.price || 0}
                  onChange={(e) => updateSessionType(type.id, 'price', e.target.value)}
                  placeholder="Price"
                  className="w-28 px-3 py-1.5 rounded-lg border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                />
              </div>
              <button
                onClick={() => removeSessionType(type.id)}
                className="text-booked opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Time Slots</h2>
          </div>
          <button
            onClick={addTimeSlot}
            className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        <div className="space-y-4">
          {settings.timeSlots.map((slot) => (
            <div key={slot.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border border-border bg-surface-alt hover:border-accent/30 transition-all">
              <div className="flex-1 w-full">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Slot Name / Display</label>
                <input
                  type="text"
                  value={slot.label}
                  onChange={(e) => updateTimeSlot(slot.id, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Start Time</label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-muted mb-1">End Time</label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <button
                onClick={() => removeTimeSlot(slot.id)}
                className="self-end sm:self-center text-booked opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-1"
              >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
