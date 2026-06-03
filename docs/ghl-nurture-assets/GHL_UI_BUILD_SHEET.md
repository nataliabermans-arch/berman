# GHL UI Build Sheet

Use this as the working build sheet inside HighLevel. Custom fields, tags, and the 40 custom HTML email templates were created in the Berman sub-account by API on May 29, 2026. Public workflow docs only expose workflow read/enrollment style endpoints, so the workflow itself should be assembled in the GHL UI from this sheet.

## 1. Confirm A2P Campaign Inputs

- Opt-in URL: `https://bermansexualhealth.com/contact/`
- Brand shown in opt-in language: `Berman Women's Wellness Center`
- Use case: customer care / appointment request coordination
- SMS status before approval: keep all SMS actions disabled or behind an `A2P approved` manual gate
- Required legal URLs:
  - `https://bermansexualhealth.com/privacy/`
  - `https://bermansexualhealth.com/terms/`

## 2. Create/Confirm Custom Fields

Use `ghl-custom-fields.csv` as the field list. The workflow branch logic depends most on:

- `berman_website_lead_reason_values`
- `berman_website_sms_consent`
- `berman_website_requested_date`
- `berman_website_requested_time_window`
- `berman_website_visit_type`

## 3. Required Tags

- `berman-website-lead`
- `sms-consent-yes`
- `sms-consent-no`
- `nurture-active`
- `nurture-paused`
- `nurture-completed`
- `booked-consult`

## 4. Workflow

Workflow name: `Berman Website Lead Nurture - Appointment Request`

Enrollment trigger:

- Tag added: `berman-website-lead`
- Or opportunity created in `Marketing Pipeline > New Leads`

Immediate actions:

- Add tag `nurture-active`
- Create task: `Call new website appointment request`
- Task due: same business day, or next business morning outside office hours
- Task notes: include name, phone, email, selected reasons, requested date/time, visit type, SMS consent, source URL, and ticket ID

Exit checks before every message:

- Opportunity is booked/scheduled/closed
- Contact DND is true
- Contact unsubscribed
- Contact replied STOP or asked to stop
- `nurture-active` removed

## 5. Branch Priority

If multiple reasons are selected, use this priority:

1. Sexual Health
2. Menopause & Hormones
3. Pelvic & Urinary
4. Vaginal Rejuvenation
5. Aesthetic & Regenerative
6. Body Contouring
7. Supplements
8. Not sure / multiple reasons

Branch by `berman_website_lead_reason_values` containing:

- `sexual-health`
- `menopause-hormones`
- `pelvic-urinary`
- `vaginal-rejuvenation`
- `aesthetic-regenerative`
- `body-contouring`
- `berman-supplements`
- `not-sure`

## 6. Message Sequence

For each branch:

- Immediate email: `00-immediate.html`
- Immediate SMS: only if A2P approved, `sms-consent-yes`, `berman_website_sms_consent = Yes`, and DND is false
- Wait 2 business hours
- Internal second-touch task if not contacted/booked
- Day 1 email: `01-day-1.html`
- Day 3 email: `03-day-3.html`
- Day 5 SMS: only if A2P approved, SMS consent exists, and DND is false
- Day 7 email: `07-day-7.html`
- Day 14 pause email: `14-day-14.html`
- Remove `nurture-active`
- Add `nurture-completed` or `nurture-paused`

## 7. SMS Copy

Immediate SMS:

`Berman Women's Wellness Center received your appointment request. Our team will call to confirm. Call (310) 772-0072. Reply HELP for help, STOP to opt out.`

Day 5 SMS:

`Checking in from Berman Women's Wellness Center about your appointment request. Call (310) 772-0072 or reply with a good time. Reply STOP to opt out.`

Staff reply after a requested time:

`Thank you. Our office will review that appointment window and call to confirm availability. Reply STOP to opt out.`

## 8. Email Template Map

Template names in GHL:

`Berman Nurture | [Branch] | [Step]`

- Menopause & Hormones: `email-templates/menopause-hormones/`
- Sexual Health: `email-templates/sexual-health/`
- Pelvic & Urinary: `email-templates/pelvic-urinary/`
- Vaginal Rejuvenation: `email-templates/vaginal-rejuvenation/`
- Aesthetic & Regenerative: `email-templates/aesthetic-regenerative/`
- Body Contouring: `email-templates/body-contouring/`
- Supplements: `email-templates/berman-supplements/`
- Not Sure / Multiple: `email-templates/not-sure-multiple/`

Each folder has:

- `00-immediate.html`
- `01-day-1.html`
- `03-day-3.html`
- `07-day-7.html`
- `14-day-14.html`

## 9. First Tests

- Submit website form without SMS consent; confirm contact/opportunity and no SMS path
- Submit website form with SMS consent; confirm exact consent text, source URL, timestamp, user agent, and SMS tag
- Confirm selected reasons and appointment request fields reach the contact record/task
- Confirm each branch receives the correct immediate email
- Confirm booked/scheduled, DND, unsubscribe, and STOP exit paths stop future steps
