import type { Metadata } from "next";

import AppointmentRequestForm from "./_form-client";

export const metadata: Metadata = {
  title: "Request an Appointment",
  description:
    "Request an appointment with JRB Medical Wellness. Share your name, email, and phone, and our office will reach out to confirm.",
  alternates: { canonical: "/appointment-request/" },
  robots: { index: false, follow: true },
};

export default function AppointmentRequestPage() {
  return <AppointmentRequestForm />;
}
