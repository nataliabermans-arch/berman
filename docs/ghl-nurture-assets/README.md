# Berman A2P + GHL Conditional Nurture Deliverables

Prepared for local testing and HighLevel buildout on May 29, 2026. This is implementation guidance, not legal advice. Keep SMS steps paused until the A2P campaign is approved and the contact has opted in to SMS.

## Source Alignment

Current HighLevel guidance checked before build:

- A2P campaign registration guide: https://help.gohighlevel.com/support/solutions/articles/155000004539-a2p-campaign-registration-step-by-step-guide-and-faqs
- A2P privacy/terms guidelines: https://help.gohighlevel.com/en/support/solutions/articles/155000001426-terms-and-conditions-guidelines-for-a2p
- A2P approval best practices: https://help.gohighlevel.com/support/solutions/articles/48001229784-a2p-10dlc-campaign-approval-best-practices
- 2026 opt-in guidance: https://help.gohighlevel.com/support/solutions/articles/155000007237-how-to-get-your-phone-number-a2p-approved-in-2026

## A2P Submission Checklist

- Confirm the registered brand/DBA in GHL matches the website checkbox: Berman Women's Wellness Center.
- Use opt-in form URL: https://bermansexualhealth.com/contact/
- Confirm SMS checkbox is visible, optional, unchecked by default, and separate from the required form acknowledgment.
- Confirm checkbox language includes brand name, customer care purpose, frequency up to 10/month, message/data rates, HELP, STOP, no purchase/treatment condition, Privacy Policy link, and Terms link.
- Confirm Privacy Policy includes SMS opt-in and mobile information non-sharing language.
- Confirm Terms page includes SMS Terms with program description, frequency, fees, HELP, STOP, rejoin, carrier disclaimer, and Privacy Policy link.
- Use Customer Care / appointment coordination as the campaign use case.
- Use sample SMS messages that do not ask for detailed medical information.
- Do not enable SMS workflow actions until A2P campaign approval is confirmed.

## GHL Custom Fields

Created/confirmed in the Berman GHL sub-account by API on May 29, 2026:

- `berman_website_lead_ticket_id`
- `berman_website_lead_source`
- `berman_website_lead_submitted_at`
- `berman_website_lead_reasons`
- `berman_website_lead_reason_values`
- `berman_website_lead_issue_summary`
- `berman_website_preferred_contact`
- `berman_website_visit_type`
- `berman_website_preferred_window`
- `berman_website_requested_date`
- `berman_website_requested_time_window`
- `berman_website_form_acknowledgment`
- `berman_website_sms_consent`
- `berman_website_sms_consent_text`
- `berman_website_source_url`
- `berman_website_user_agent`

## Workflow Build Checklist

Workflow name: `Berman Website Lead Nurture - Appointment Request`

- Enrollment trigger: tag added `berman-website-lead`, contact created/updated from website form, or opportunity created in Marketing Pipeline > New Leads.
- Exclusions: DND, unsubscribed, booked/scheduled stage, closed opportunity, `berman-brief-subscriber` only.
- On enroll: add tag `nurture-active`; create/confirm opportunity in Marketing Pipeline > New Leads.
- Internal task immediately: `Call new website appointment request`, due same business day or next business morning outside office hours. Include phone, email, reasons, requested date/time, visit type, SMS consent status, source URL, and ticket ID.
- Branch by `berman_website_lead_reason_values`. If multiple reasons, use priority: Sexual Health, Menopause & Hormones, Pelvic & Urinary, Vaginal Rejuvenation, Aesthetic & Regenerative, Body Contouring, Supplements, Not sure/multiple.
- Immediate email: send branch `00-immediate.html`.
- Immediate SMS: only when tag `sms-consent-yes` exists, custom field `berman_website_sms_consent` is Yes, DND is false, and A2P is approved.
- Wait 2 business hours, then create internal second-touch task if not contacted/booked.
- Day 1 email: send branch `01-day-1.html` if not booked/DND/unsubscribed.
- Day 3 email: send branch `03-day-3.html` if not booked/DND/unsubscribed.
- Day 5 SMS: only when SMS consent exists and A2P is approved.
- Day 7 email: send branch `07-day-7.html` if not booked/DND/unsubscribed.
- Day 14 pause email: send branch `14-day-14.html`, remove `nurture-active`, add `nurture-paused` or `nurture-completed`.

Exit conditions at every step:

- Opportunity moves to Booked/Scheduled/Closed.
- Contact DND is true.
- Contact unsubscribed.
- Contact replies STOP or asks to stop.
- Staff manually removes `nurture-active`.

## Email Templates

Created in the Berman GHL sub-account by API on May 29, 2026 as custom HTML templates with names formatted:

`Berman Nurture | [Branch] | [Step]`

- Menopause & Hormones: `email-templates/menopause-hormones/`
- Sexual Health: `email-templates/sexual-health/`
- Pelvic & Urinary: `email-templates/pelvic-urinary/`
- Vaginal Rejuvenation: `email-templates/vaginal-rejuvenation/`
- Aesthetic & Regenerative: `email-templates/aesthetic-regenerative/`
- Body Contouring: `email-templates/body-contouring/`
- Supplements: `email-templates/berman-supplements/`
- Not Sure / Multiple Reasons: `email-templates/not-sure-multiple/`

Each branch folder includes:

- `00-immediate.html`
- `01-day-1.html`
- `03-day-3.html`
- `07-day-7.html`
- `14-day-14.html`

## SMS Samples

Use SMS only after A2P approval and only for contacts with `sms-consent-yes`. Keep SMS appointment-oriented and avoid specialty details in text messages.

Immediate SMS:

`Berman Women's Wellness Center received your appointment request. Our team will call to confirm. Call (310) 772-0072. Reply HELP for help, STOP to opt out.`

Day 5 SMS:

`Checking in from Berman Women's Wellness Center about your appointment request. Call (310) 772-0072 or reply with a good time. Reply STOP to opt out.`

Optional staff reply after user shares a time:

`Thank you. Our office will review that appointment window and call to confirm availability. Reply STOP to opt out.`

## Testing Checklist

- Submit contact page test without SMS consent; confirm success, GHL contact, opportunity, `sms-consent-no`, no SMS.
- Submit contact page test with SMS consent; confirm exact consent text, source URL, timestamp, user agent, `sms-consent-yes`.
- Submit global modal test without SMS consent; confirm success and no SMS path.
- Confirm required form acknowledgment blocks submission when unchecked.
- Confirm appointment date and time window appear in GHL fields and staff notification.
- Confirm each reason branch receives the correct immediate email.
- Confirm multiple reasons use the documented priority order.
- Confirm DND, unsubscribe, booked/scheduled, and manual removal exit paths stop future messages.
- Confirm Day 5 SMS does not send unless SMS consent exists and A2P approval is active.
- Confirm no email or SMS asks for detailed medical information.
- Run `npm run typecheck`, `npm run build`, and `npm run verify:ghl -- --live-url https://bermansexualhealth.com` before deployment approval.

## Handoff Notes

- Staff should treat every form as an appointment request, not a confirmed booking. The office confirms availability by phone.
- Primary CTA across the nurture is to call (310) 772-0072. Secondary CTA is to reply with a preferred appointment time or confirm the requested date window.
- SMS steps should stay disabled until A2P is approved. After approval, SMS steps must remain gated by `sms-consent-yes` and DND/unsubscribe checks.
- To pause a contact manually, remove `nurture-active` and add `nurture-paused`.
- To complete a contact, move the opportunity to Booked/Scheduled or add `booked-consult`.
- Preserve screenshots/exports of workflow trigger, branches, exit conditions, SMS gates, test contact timeline, and test opportunity for contract closeout evidence.
