"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import BookingFlow from "@/components/booking/BookingFlow";

// Modal chrome only. The booking flow itself lives in BookingFlow, shared with
// the /contact and /appointment-request pages so all three cannot drift apart
// again.
//
// This component is mounted only while open (see LeadCapture.tsx). It used to
// render always and early-return null, which meant booking state survived a
// close and could be resubmitted.

type LeadCaptureModalProps = {
  displayPhone: string;
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
};

export default function LeadCaptureModal({
  displayPhone,
  isOpen,
  onClose,
  phoneNumber,
}: LeadCaptureModalProps) {
  const [busy, setBusy] = useState(false);

  // Closing mid-request would orphan the fetch and lose its outcome.
  const requestClose = () => {
    if (busy) return;
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, busy]);

  if (!isOpen) return null;

  return (
    <div
      className="lead-modal-shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      <button
        type="button"
        className="lead-modal-backdrop"
        aria-label="Close request form"
        onClick={requestClose}
      />
      <div className="lead-modal-panel">
        <button
          type="button"
          className="lead-modal-close"
          aria-label="Close request form"
          onClick={requestClose}
        >
          <X aria-hidden="true" size={18} />
        </button>

        <BookingFlow
          variant="modal"
          displayPhone={displayPhone}
          phoneNumber={phoneNumber}
          onDone={onClose}
          onBusyChange={setBusy}
          source="website_lead_modal"
          titleId="lead-modal-title"
        />
      </div>
    </div>
  );
}
