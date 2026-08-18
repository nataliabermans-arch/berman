export const BERMAN_SMS_PROGRAM_NAME = "JRB Medical Wellness";

export const FORM_ACKNOWLEDGMENT_TEXT =
  "I understand this website form is for appointment requests and general coordination only and is not a secure medical record.";

export const SMS_CONSENT_TEXT =
  "By checking this box, I consent to receive customer care and support SMS messages from JRB Medical Wellness. Reply STOP to opt-out; Reply HELP for support. Message & data rates may apply; Messaging frequency may vary. Visit https://bermansexualhealth.com/privacy/ to see our Privacy Policy and https://bermansexualhealth.com/terms/ for a Terms of Use. Consent is not a condition of purchase or treatment.";

export const REQUESTED_TIME_WINDOWS = [
  { value: "first-available", label: "First available" },
  { value: "morning-9-12", label: "Morning, 9 AM-12 PM" },
  { value: "midday-12-2", label: "Midday, 12 PM-2 PM" },
  { value: "afternoon-2-5", label: "Afternoon, 2 PM-5 PM" },
] as const;

export type RequestedTimeWindow = (typeof REQUESTED_TIME_WINDOWS)[number]["value"];

export function requestedTimeWindowLabel(value?: string | null) {
  if (!value) return null;
  return (
    REQUESTED_TIME_WINDOWS.find((option) => option.value === value)?.label ||
    value
  );
}
