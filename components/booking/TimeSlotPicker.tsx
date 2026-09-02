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
  /**
   * Stop polling and stop reacting to the selection disappearing.
   *
   * Set while a booking is in flight: the server consumes the slot partway
   * through the request, so a poll landing in that window would report the
   * patient's own successful booking as someone else taking their time.
   */
  frozen?: boolean;
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function TimeSlotPicker({
  value,
  onChange,
  refreshToken = 0,
  onSelectedSlotGone,
  frozen = false,
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
  const frozenRef = useRef(frozen);
  valueRef.current = value;
  goneRef.current = onSelectedSlotGone;
  frozenRef.current = frozen;

  // The patient picks in their own timezone; the server books in it too.
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
    [],
  );

  // resolvedOptions() hands back the zone's oldest canonical name, so a patient
  // in Kyiv is told "Europe/Kiev" and one in Kolkata "Asia/Calcutta". Show the
  // spoken name instead. "longGeneric" ("Pacific Time"), not "long", which would
  // print whichever season the page was opened in — wrong for a slot on the far
  // side of a daylight-saving change.
  const timezoneLabel = useMemo(() => {
    try {
      const part = new Intl.DateTimeFormat(undefined, { timeZoneName: "longGeneric" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName");
      if (part?.value) return part.value;
    } catch {
      // Intl without longGeneric support — fall through.
    }
    return timezone.replace(/_/g, " ");
  }, [timezone]);

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
      if (
        !frozenRef.current &&
        selected &&
        !data.slots.some((s) => s.startTime === selected)
      ) {
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
      if (frozenRef.current) return;
      if (document.visibilityState === "visible") void load(true);
    }, POLL_MS);

    const onVisible = () => {
      if (frozenRef.current) return;
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
          No times are open right now. Call{" "}
          <a href="tel:+13107720072">(310)&nbsp;772-0072</a> and we&apos;ll find one
          for you.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-slots">
      {days.length > 1 && (
        <p className="booking-days-hint">
          {days.length} days available through {days[days.length - 1].label}.
        </p>
      )}
      {/* A vertical list, not a sideways strip: the rest of the site scrolls
          down, and a horizontal row put 12 of these 14 days off-screen on a
          phone behind a scrollbar that auto-hides on touch. Each day opens its
          own times in place, so nothing is ever off the edge of the screen. */}
      <div className="booking-days">
        {days.map((day) => {
          const open = day.key === activeDay;
          const panelId = `booking-times-${day.key}`;
          return (
            <div className="booking-day-block" key={day.key}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className={`booking-day${open ? " is-active" : ""}`}
                onClick={() => setActiveDay(day.key)}
              >
                <span>{day.label}</span>
                <small>
                  {day.slots.length} {day.slots.length === 1 ? "time" : "times"}
                </small>
                <span className="booking-day-caret" aria-hidden="true" />
              </button>

              {open && (
                <div
                  className="booking-times"
                  id={panelId}
                  role="radiogroup"
                  aria-label={`Available times on ${day.label}`}
                >
                  {day.slots.map((slot) => {
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
              )}
            </div>
          );
        })}
      </div>

      <p className="booking-tz">
        Times shown in your timezone ({timezoneLabel}). Your consult is 15
        minutes by phone.
      </p>
    </div>
  );
}
