"use client";

import BookingFlow from "@/components/booking/BookingFlow";

// This page used to collect a name, email and phone, hardcode every other
// field, and post a lead that nobody could route — it never asked why the
// patient was coming. It now runs the same booking flow as the modal, which
// means it also gains the reason step Calendly requires.

const PHONE_NUMBER = "+13107720072";
const DISPLAY_PHONE = "(310) 772-0072";

export default function AppointmentRequestForm() {
  return (
    <main className="booking-page">
      <a href="/" aria-label="JRB Medical Wellness — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/jb-logo.webp"
          alt="Jennifer Berman MD"
          width={213}
          height={96}
          className="booking-page-logo"
        />
      </a>

      <div className="booking-page-panel">
        <BookingFlow
          variant="page"
          displayPhone={DISPLAY_PHONE}
          phoneNumber={PHONE_NUMBER}
          source="website_appointment_request_form"
          titleId="appointment-request-title"
        />
      </div>

      <p className="booking-page-footnote">
        Prefer to talk to someone? Call{" "}
        <a href={`tel:${PHONE_NUMBER}`}>{DISPLAY_PHONE}</a>.
      </p>
    </main>
  );
}
