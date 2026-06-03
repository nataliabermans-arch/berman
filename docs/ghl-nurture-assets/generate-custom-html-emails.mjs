import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("./email-templates/", import.meta.url);

const branches = [
  {
    slug: "menopause-hormones",
    label: "Menopause & Hormones",
    accent: "Hormone clarity, comfort, and next steps",
    immediateSubject: "We received your menopause and hormones request",
    focus:
      "You reached out about menopause, hormone changes, or symptoms that may be affecting how you feel day to day.",
    consult:
      "The office can help determine whether an in-office visit or a consultation-style first conversation is the right next step.",
    details: [
      "changes in sleep, mood, energy, or temperature regulation",
      "questions about hormone evaluation and treatment options",
      "how to prepare for a thoughtful consultation",
    ],
    reassurance:
      "You do not need to have everything figured out before calling. A clear starting point is enough.",
  },
  {
    slug: "sexual-health",
    label: "Sexual Health",
    accent: "Private, respectful care for intimate concerns",
    immediateSubject: "We received your sexual health request",
    focus:
      "You reached out about sexual health, intimacy, desire, comfort, or changes that deserve private and thoughtful care.",
    consult:
      "The office will help confirm the most appropriate appointment type and timing for a confidential consultation.",
    details: [
      "changes in desire, arousal, sensation, or comfort",
      "questions that may feel difficult to bring up elsewhere",
      "a discreet path toward the right kind of evaluation",
    ],
    reassurance:
      "These conversations are familiar to the practice. You can be direct, brief, or simply say you want to discuss sexual health.",
  },
  {
    slug: "pelvic-urinary",
    label: "Pelvic & Urinary",
    accent: "Support for bladder, pelvic, and comfort concerns",
    immediateSubject: "We received your pelvic and urinary request",
    focus:
      "You reached out about pelvic comfort, urinary symptoms, leakage, urgency, or related changes.",
    consult:
      "The office can help route the request to the right visit type and confirm availability by phone.",
    details: [
      "urinary urgency, leakage, or frequency",
      "pelvic discomfort or changes after childbirth, menopause, or life transitions",
      "what to share before the first appointment request is confirmed",
    ],
    reassurance:
      "A short description of what has changed is enough to begin. The office can help organize the rest.",
  },
  {
    slug: "vaginal-rejuvenation",
    label: "Vaginal Rejuvenation",
    accent: "A consultation-first path for vaginal wellness",
    immediateSubject: "We received your vaginal rejuvenation request",
    focus:
      "You reached out about vaginal wellness, comfort, dryness, laxity, or rejuvenation options.",
    consult:
      "The office will confirm whether a consultation is the best first step before any treatment discussion moves forward.",
    details: [
      "comfort, dryness, sensation, or confidence concerns",
      "questions about available in-office options",
      "how Dr. Berman's team approaches fit, expectations, and timing",
    ],
    reassurance:
      "The first step is simply a conversation about what you are noticing and what you would like to improve.",
  },
  {
    slug: "aesthetic-regenerative",
    label: "Aesthetic & Regenerative",
    accent: "A refined consultation for appearance and restoration goals",
    immediateSubject: "We received your aesthetic and regenerative request",
    focus:
      "You reached out about aesthetic, regenerative, skin, hair, or wellness-supportive options.",
    consult:
      "The office can help confirm the right consultation type based on the area you want to discuss.",
    details: [
      "the concern or area you want evaluated",
      "past treatments, if any, and what you liked or did not like",
      "a realistic conversation about fit, timing, and next steps",
    ],
    reassurance:
      "A good consultation starts with your goals, not a preset treatment plan.",
  },
  {
    slug: "body-contouring",
    label: "Body Contouring",
    accent: "A consultative look at shape, fit, and goals",
    immediateSubject: "We received your body contouring request",
    focus:
      "You reached out about body contouring, stubborn areas, or changes you would like evaluated.",
    consult:
      "The office will help confirm a consultation window so the right options can be discussed thoughtfully.",
    details: [
      "which area or areas you want to focus on",
      "what you have already tried and what has not matched your goals",
      "whether the request is best handled as a consult before any treatment planning",
    ],
    reassurance:
      "The goal of the first conversation is clarity: what is appropriate, what is not, and what timing may make sense.",
  },
  {
    slug: "berman-supplements",
    label: "Supplements",
    accent: "Guidance before choosing a wellness-supportive plan",
    immediateSubject: "We received your supplement request",
    focus:
      "You reached out about supplements, wellness support, or the Berman approach to guided product selection.",
    consult:
      "The office can help confirm whether a brief consultation or staff follow-up is the right next step.",
    details: [
      "what you are hoping to support",
      "current supplements, prescriptions, or sensitivities you may want the office to know",
      "how to choose a guided plan without guessing",
    ],
    reassurance:
      "The team can help you avoid piecing together a plan without context.",
  },
  {
    slug: "not-sure-multiple",
    label: "Not Sure / Multiple Reasons",
    accent: "A thoughtful first step when more than one concern is involved",
    immediateSubject: "We received your appointment request",
    focus:
      "You reached out with more than one concern, or you are not yet sure which service area fits best.",
    consult:
      "The office can help sort the request and confirm the most appropriate appointment type.",
    details: [
      "which concern feels most important right now",
      "whether symptoms, goals, or timing are driving the request",
      "what kind of first conversation would be most useful",
    ],
    reassurance:
      "You do not need to diagnose yourself before calling. The office can help route the request.",
  },
];

const steps = [
  {
    file: "00-immediate.html",
    dayLabel: "Immediate",
    subject: (branch) => branch.immediateSubject,
    preheader:
      "A member of the office will review your appointment request and call to confirm availability.",
    kicker: "Request received",
    title: "We received your request.",
    body: (branch) => [
      "Hello,",
      `Thank you for reaching out to Berman Women's Wellness Center. ${branch.focus}`,
      "This is an appointment request, not a confirmed appointment. If you asked for a specific date or time window, the office will call to confirm what is available.",
      `${branch.consult} If you would like faster help, call the office directly at (310) 772-0072.`,
    ],
    note:
      "You can also reply with the date and time window you prefer, or confirm the appointment request window you already sent.",
  },
  {
    file: "01-day-1.html",
    dayLabel: "Day 1",
    subject: (branch) => `A thoughtful next step for ${branch.label.toLowerCase()}`,
    preheader:
      "Call the office or reply with your preferred appointment window so the team can help confirm availability.",
    kicker: "Next step",
    title: (branch) => branch.accent,
    body: (branch) => [
      "Hello,",
      `We wanted to follow up on your ${branch.label.toLowerCase()} appointment request.`,
      branch.reassurance,
      `To move this forward, call (310) 772-0072, or reply with a preferred appointment date and office-hours window. ${branch.consult}`,
    ],
    note:
      "The office confirms appointment requests by phone before anything is placed on the calendar.",
  },
  {
    file: "03-day-3.html",
    dayLabel: "Day 3",
    subject: (branch) => `Questions to bring up about ${branch.label.toLowerCase()}`,
    preheader:
      "A few simple details can help the office route your request and prepare for the right consultation.",
    kicker: "Helpful details",
    title: "A few things worth sharing",
    body: (branch) => [
      "Hello,",
      `When the office follows up about ${branch.label.toLowerCase()}, it can help to mention:`,
      listHtml(branch.details),
      "A brief answer is enough. The team will help decide what belongs in the first consultation and what can wait.",
      "Call (310) 772-0072, or reply with a preferred appointment date and office-hours window.",
    ],
    note:
      "Please avoid sending detailed medical information by email. The office can collect sensitive details through the appropriate intake process.",
  },
  {
    file: "07-day-7.html",
    dayLabel: "Day 7",
    subject: (branch) => `Still interested in ${branch.label.toLowerCase()} support?`,
    preheader:
      "The office can still help confirm an appointment request if this remains a priority.",
    kicker: "Checking in",
    title: "Still want help with this?",
    body: (branch) => [
      "Hello,",
      `Just checking in on your ${branch.label.toLowerCase()} request. If this is still something you want support with, the office can help confirm the next available appointment request by phone.`,
      `${branch.consult} Nothing is scheduled until the office confirms availability with you.`,
      "Call (310) 772-0072, or reply with a date and office-hours window that would work well.",
    ],
    note:
      "If now is not the right time, you can simply wait until you are ready to call.",
  },
  {
    file: "14-day-14.html",
    dayLabel: "Day 14",
    subject: (branch) => `We will pause your ${branch.label.toLowerCase()} follow-up`,
    preheader:
      "The office is still available if you would like to reopen the appointment request later.",
    kicker: "Pausing follow-up",
    title: "We will pause here for now.",
    body: (branch) => [
      "Hello,",
      `We have not heard back about your ${branch.label.toLowerCase()} appointment request, so we will pause this follow-up sequence for now.`,
      `If ${branch.label.toLowerCase()} is still on your mind, you are welcome to call the office at (310) 772-0072. The team can help revisit the request and confirm what appointment availability looks like.`,
      "No appointment has been scheduled from this message. The office will always call to confirm availability before a visit is placed on the calendar.",
    ],
    note:
      "You can reply later with a preferred appointment date and office-hours window if you want the office to reopen the request.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listHtml(items) {
  const rows = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;color:#4a1c26;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.5;">${escapeHtml(item)}</li>`,
    )
    .join("");
  return `<ul style="margin:0 0 18px 22px;padding:0;">${rows}</ul>`;
}

function paragraphHtml(text) {
  if (text.startsWith("<ul")) return text;
  return `<p style="margin:0 0 18px;color:#4a1c26;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.58;">${escapeHtml(text)}</p>`;
}

function template(branch, step) {
  const subject = step.subject(branch);
  const title = typeof step.title === "function" ? step.title(branch) : step.title;
  const paragraphs = step.body(branch).map(paragraphHtml).join("\n                  ");
  const preheader = step.preheader;

  return `<!-- Subject: ${escapeHtml(subject)} -->
<!-- Preheader: ${escapeHtml(preheader)} -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fff5f1;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fff5f1;margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;background:#ffffff;border:1px solid #f0d8d9;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#4a1c26;padding:18px 28px;color:#fff5f1;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;">
                Berman Women's Wellness Center
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 6px;">
                <div style="margin:0 0 18px;color:#a85b64;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;">${escapeHtml(step.kicker)} · ${escapeHtml(branch.label)} · ${escapeHtml(step.dayLabel)}</div>
                <h1 style="margin:0 0 18px;color:#4a1c26;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.08;font-weight:400;">${escapeHtml(title)}</h1>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;background:#fff8f6;border:1px solid #f0d8d9;border-radius:8px;">
                  <tr>
                    <td style="padding:14px 16px;color:#8a3a44;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;">
                      ${escapeHtml(branch.accent)}
                    </td>
                  </tr>
                </table>
                ${paragraphs}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 16px;">
                  <tr>
                    <td style="border-radius:999px;background:#4a1c26;">
                      <a href="tel:+13107720072" style="display:inline-block;padding:15px 24px;color:#fff5f1;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;">Call (310) 772-0072</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 22px;color:#8a3a44;font-family:Arial,sans-serif;font-size:14px;line-height:1.55;">${escapeHtml(step.note)}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#fff8f6;border-top:1px solid #f0d8d9;padding:20px 28px;color:#76515a;font-family:Arial,sans-serif;font-size:12px;line-height:1.55;">
                Please do not reply with detailed medical information. Email and website messages are for scheduling and general coordination only. If this is a medical emergency, call 911 or go to the nearest emergency room.<br><br>
                Berman Women's Wellness Center · 415 N. Crescent Drive, Suite 355 · Beverly Hills, CA 90210 · (310) 772-0072<br><br>
                To stop receiving these emails, use this unsubscribe link: {{unsubscribe}}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

for (const branch of branches) {
  const dir = new URL(`${branch.slug}/`, root);
  await mkdir(dir, { recursive: true });
  for (const step of steps) {
    await writeFile(path.join(dir.pathname, step.file), template(branch, step), "utf8");
  }
}

console.log(`Generated ${branches.length * steps.length} custom HTML email templates.`);
