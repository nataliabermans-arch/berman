"use client";

import { Loader2, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Slot = { startTime: string };

type LoadState = "idle" | "loading" | "ready" | "error";

// Availability is re-fetched on this interval, and whenever the tab regains
// focus, so a slot taken by someone else — here or directly in Calendly —
// disappears without the patient having to do anything.
const POLL_MS = 25_000;

export type TimeSlotPickerProps = {
  value: string;
  onChange: (startTime: string) => void;
  /** Bumping this refetches — used when a slot is taken mid-submit. */
  refreshToken?: number;
  /** Fired when the currently selected slot is no longer available. */
  onSelectedSlotGone?: () => void;
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function TimeSlotPicker({
  value,
  onChange,
  refreshToken = 0,
  onSelectedSlotGone,
}: TimeSlotPickerProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeDay, setActiveDay] = useState<string>("");
  // True when the server reported a configuration problem rather than a
  // transient failure — "Try again" is useless in that case.
  const [configError, setConfigError] = useState(false);
  // Kept in refs so the polling effect never needs to be torn down and
  // rebuilt when the selection changes.
  const valueRef = useRef(value);
  const goneRef = useRef(onSelectedSlotGone);
  valueRef.current = value;
  goneRef.current = onSelectedSlotGone;

  // The patient picks in their own timezone; the server books in it too.
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
    [],
  );

  const load = useCallback(async (background = false) => {
    // A background refresh must not blank the list the patient is reading.
    if (!background) setState("loading");
    try {
      const res = await fetch("/api/booking/availability/", {
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        slots?: Slot[];
        error?: string;
      } | null;
      if (!res.ok || !data?.ok || !Array.isArray(data.slots)) {
        // 503 means the server knows it is misconfigured — retrying will never
        // help, so say something different from a transient network blip.
        setConfigError(res.status === 503);
        throw new Error(data?.error || "unavailable");
      }
      setConfigError(false);
      setSlots(data.slots);
      setState("ready");

      // If someone else took the slot this patient had selected, drop it and
      // tell them — rather than letting them submit into a guaranteed failure.
      const selected = valueRef.current;
      if (selected && !data.slots.some((s) => s.startTime === selected)) {
        goneRef.current?.();
      }
    } catch {
      // A failed background poll leaves the existing list in place; only a
      // foreground load surfaces the error state.
      if (!background) setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  // Live updates: poll on an interval, and refresh immediately whenever the
  // tab becomes visible again (a backgrounded tab's timers are throttled, so
  // returning to it can otherwise show minutes-old availability).
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  // Group into local days, preserving the server's ordering.
  const days = useMemo(() => {
    const map = new Map<string, { label: string; date: Date; slots: Slot[] }>();
    for (const slot of slots) {
      const d = new Date(slot.startTime);
      if (Number.isNaN(d.getTime())) continue;
      const key = dayKey(d);
      if (!map.has(key)) {
        map.set(key, {
          label: d.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          date: d,
          slots: [],
        });
      }
      map.get(key)!.slots.push(slot);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [slots]);

  // Default to the first day that has availability, and follow the selection
  // if one is already made.
  const syncedSelection = useRef("");

  useEffect(() => {
    if (!days.length) return;

    // Jump to the selection's day only when the selection actually CHANGES.
    // `days` gets a fresh identity on every poll, so re-running this effect
    // unconditionally would drag the patient back to the selected day every
    // 25 seconds and make browsing another day impossible.
    if (value && value !== syncedSelection.current) {
      syncedSelection.current = value;
      const key = dayKey(new Date(value));
      if (days.some((day) => day.key === key)) {
        setActiveDay(key);
        return;
      }
    }
    if (!value) syncedSelection.current = "";

    // Otherwise keep whichever day they are looking at, falling back to the
    // first day only if theirs no longer has any availability.
    setActiveDay((current) =>
      current && days.some((d) => d.key === current) ? current : days[0].key,
    );
  }, [days, value]);

  const shown = days.find((d) => d.key === activeDay);

  if (state === "loading" || state === "idle") {
    return (
      <div className="booking-slots" aria-busy="true">
        <p className="booking-slots-status">
          <Loader2 aria-hidden="true" size={15} /> Loading available times&hellip;
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="booking-slots">
        <p className="booking-slots-status">
          {configError
            ? "Online booking is temporarily unavailable. Please call (310) 772-0072 and we'll book it for you."
            : "We couldn't load available times."}
        </p>
        {configError ? null : (
          <button
            type="button"
            className="booking-retry"
            onClick={() => void load()}
          >
            <RotateCw aria-hidden="true" size={14} /> Try again
          </button>
        )}
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="booking-slots">
        <p className="booking-slots-status">
          No times are open in the next two weeks. Please call us and we&apos;ll
          find one for you.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-slots">
      <div className="booking-days" role="tablist" aria-label="Choose a day">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            role="tab"
            aria-selected={day.key === activeDay}
            className={`booking-day${day.key === activeDay ? " is-active" : ""}`}
            onClick={() => setActiveDay(day.key)}
          >
            <span>{day.label}</span>
            <small>
              {day.slots.length} {day.slots.length === 1 ? "time" : "times"}
            </small>
          </button>
        ))}
      </div>

      <div
        className="booking-times"
        role="radiogroup"
        aria-label={`Available times on ${shown?.label ?? ""}`}
      >
        {shown?.slots.map((slot) => {
          const selected = slot.startTime === value;
          return (
            <button
              key={slot.startTime}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`booking-time${selected ? " is-selected" : ""}`}
              onClick={() => onChange(slot.startTime)}
            >
              {new Date(slot.startTime).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </button>
          );
        })}
      </div>

      <p className="booking-tz">
        Times shown in your timezone ({timezone.replace(/_/g, " ")}). Your consult
        is 15 minutes by phone.
      </p>
    </div>
  );
}
