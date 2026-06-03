export const BERMAN_SMS_PROGRAM_NAME = "Berman Women's Wellness Center";

export const FORM_ACKNOWLEDGMENT_TEXT =
  "I understand this website form is for appointment requests and general coordination only and is not a secure medical record.";

export const SMS_CONSENT_TEXT =
  "I agree to receive customer care text messages from Berman Women's Wellness Center about appointment requests, scheduling, and service updates. Message frequency varies, up to 10 messages/month. Message and data rates may apply. Reply HELP for help and STOP to unsubscribe. Consent is not a condition of purchase or treatment. See our Privacy Policy and Terms of Use.";

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
