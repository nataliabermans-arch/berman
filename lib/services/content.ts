/**
 * Service catalog — six clinical specialties + the overview spreads.
 * Source of truth for /services and /services/[slug].
 *
 * Italic-emphasis convention: the `italicWord` of each headline is the noun/verb
 * the sentence is about. Renderer wraps it in <em> with rose-gradient text-clip.
 */

export type ServiceSlug =
  | "menopause-hormones"
  | "sexual-health"
  | "pelvic-urinary"
  | "vaginal-rejuvenation"
  | "aesthetic-regenerative"
  | "body-contouring";

export interface AtAGlance {
  consultation: string;
  followUp: string;
  setting: string;
  insurance: string;
}

export interface SymptomTile {
  ix: string;
  title: string;
  italicWord: string;
  body: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  italicWord: string;
  body: string;
}

export interface TimelineItem {
  when: string;
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SpecialtyContent {
  slug: ServiceSlug;
  /** Display name used in nav, footer, breadcrumbs, and the overview index. */
  name: string;
  /** Order number (01–06) for index + breadcrumb. */
  num: string;
  /** Eyebrow tag, uppercase. e.g., "Sexual Health · 02 of 06" */
  eyebrowTag: string;
  /** Hero copy. Headline split into pre + italicWord; sub is the lede paragraph. */
  hero: {
    headline: string;
    italicWord: string;
    sub: string;
  };
  /** Short local-search support line rendered under the service lede. */
  seoSupport?: { text: string; italicWord: string };
  /** Stat card on hero right. */
  atAGlance: AtAGlance;
  /** Section H2 — "Six clusters of symptoms that <em>most clinicians don't ask about</em>." */
  treatsHeading: { text: string; italicWord: string };
  /** Section intro paragraph (overview spread + treats heading lede). */
  spreadLede: string;
  /** Treatment chips for the overview-page spread. */
  treatmentChips: string[];
  /** Symptom grid — 6 tiles. */
  symptoms: SymptomTile[];
  /** Process steps — 4. */
  processHeading: { text: string; italicWord: string };
  process: ProcessStep[];
  /** Expect timeline — 5 items. */
  expectHeading: { text: string; italicWord: string };
  expect: TimelineItem[];
  /** FAQ. */
  faqHeading: { text: string; italicWord: string };
  faqs: FaqItem[];
  /** Final CTA copy. */
  finalCta: { headline: string; italicWord: string; sub: string };
  /** Hero image; pulled from /public/images/services/. Used as decorative photo. */
  heroImage: string;
  /** Path to a representative photo for the overview-page spread. */
  spreadImage: string;
  /** SEO metadata. */
  seo: { title: string; description: string };
  /** JSON-LD MedicalProcedure type code. */
  procedureType: "MedicalProcedure" | "MedicalTherapy" | "TherapeuticProcedure";
}

const sharedFaqs = {
  insurance: {
    q: "Do you take insurance?",
    a: "The practice operates out-of-network. We provide superbills you can submit to your insurance for partial reimbursement under your out-of-network benefits. We accept HSA/FSA cards.",
  },
  whoYouSee: {
    q: "Will I see Dr. Berman herself, or a nurse practitioner?",
    a: "Every initial consultation is conducted by Dr. Berman. Follow-ups may be conducted by Dr. Berman or a member of the clinical team based on the visit type, but Dr. Berman remains the supervising physician for every patient on the panel.",
  },
};

export const SERVICES: SpecialtyContent[] = [
  {
    slug: "menopause-hormones",
    name: "Menopause & Hormone Therapy",
    num: "01",
    eyebrowTag: "Menopause & Hormones · 01 of 06",
    hero: {
      headline: "Menopause &\nhormone therapy.",
      italicWord: "hormone therapy",
      sub: "Hot flashes, sleep loss, brain fog, mood, libido, weight changes — all downstream of one diagnosable, treatable system. We test it. We read the labs in the room. We write a real plan.",
    },
    seoSupport: {
      text: "Menopause, perimenopause, HRT and BHRT care in Beverly Hills for greater Los Angeles patients.",
      italicWord: "HRT and BHRT",
    },
    atAGlance: {
      consultation: "60–90 min",
      followUp: "4–6 wks",
      setting: "In-person + telehealth",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six clusters of symptoms most clinicians dismiss as “normal aging.”",
      italicWord: "“normal aging.”",
    },
    spreadLede:
      "Bioidentical hormone replacement, perimenopause workups, and full hormone panels — for women whose primary-care visit ended in “your labs are fine.”",
    treatmentChips: [
      "BHRT",
      "Perimenopause workup",
      "Hormone panel",
      "Hot flashes & night sweats",
      "Sleep & mood",
      "Hair, skin, weight",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Hot flashes & night sweats",
        italicWord: "night sweats",
        body: "Vasomotor symptoms — frequent, disruptive, often months or years before periods change. Treatable with hormonal and non-hormonal protocols.",
      },
      {
        ix: "02",
        title: "Sleep loss",
        italicWord: "Sleep",
        body: "3 a.m. wake-ups, fragmented sleep, daytime fatigue. Often the first perimenopause symptom — and the one most ignored.",
      },
      {
        ix: "03",
        title: "Mood & anxiety shifts",
        italicWord: "Mood",
        body: "New-onset anxiety, low mood, irritability, panic in your forties or fifties. Hormonal — not “just stress.”",
      },
      {
        ix: "04",
        title: "Brain fog",
        italicWord: "Brain fog",
        body: "Word-finding trouble, concentration loss, executive function changes. Estradiol-mediated and reversible in most cases.",
      },
      {
        ix: "05",
        title: "Libido & arousal",
        italicWord: "Libido",
        body: "Reduced desire and arousal that started with perimenopause, postpartum, or after stopping contraception. Testosterone and estradiol both matter.",
      },
      {
        ix: "06",
        title: "Skin, hair, weight",
        italicWord: "weight",
        body: "Thinning hair, dry skin, abdominal weight gain, body composition changes — measurable changes with measurable causes.",
      },
    ],
    processHeading: {
      text: "A real diagnostic process, not a sales funnel.",
      italicWord: "diagnostic process,",
    },
    process: [
      {
        num: "01",
        title: "Intake & history",
        italicWord: "Intake",
        body: "60–90 min first appointment with Dr. Berman. Detailed reproductive, surgical, medication, and symptom history.",
      },
      {
        num: "02",
        title: "Diagnostics",
        italicWord: "Diagnostics",
        body: "Comprehensive hormone panel — estradiol, progesterone, testosterone (total + free), DHEA, thyroid, cortisol, vitamin D. Symptom-mapped, not boilerplate.",
      },
      {
        num: "03",
        title: "Treatment plan",
        italicWord: "Treatment plan",
        body: "Bioidentical estradiol, progesterone, testosterone where indicated. Delivery method matched to your physiology — patch, gel, pellet, or oral. Non-hormonal options if needed.",
      },
      {
        num: "04",
        title: "Follow-up",
        italicWord: "Follow-up",
        body: "Re-evaluation at 4–6 weeks, then quarterly. Plans adjust based on labs, symptom response, and patient preference.",
      },
    ],
    expectHeading: {
      text: "The first ninety days, in honest detail.",
      italicWord: "first ninety days,",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake",
        body: "Detailed health intake (~30 min) submitted online before the first visit so the appointment isn’t spent paperwork-ing.",
      },
      {
        when: "Week 1",
        title: "Initial consultation",
        body: "60–90 min in-person or telehealth. Full history, hormone panel ordered, treatment plan drafted on the spot.",
      },
      {
        when: "Week 2–3",
        title: "Lab review",
        body: "Brief virtual review once labs are back. First prescriptions written and dosing protocol started.",
      },
      {
        when: "Week 6",
        title: "First follow-up",
        body: "Symptom review. Lab recheck where applicable. Adjustments to dosing, modality, or delivery method.",
      },
      {
        when: "Week 12",
        title: "Plan optimization",
        body: "By this point most patients have a clear sense of what’s working. Focus shifts to maintenance and long-term plan.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Do you offer HRT or BHRT for women in Los Angeles?",
        a: "Yes. The Beverly Hills office sees women from across greater Los Angeles for HRT, BHRT, bioidentical hormone replacement, perimenopause treatment, and hormone-panel review when clinically appropriate.",
      },
      {
        q: "What is included in a perimenopause workup?",
        a: "The workup starts with a detailed symptom and medical history, then may include estradiol, progesterone, testosterone, DHEA, thyroid markers, cortisol, vitamin D, and related labs so the plan is mapped to the patient instead of a generic age range.",
      },
      {
        q: "Is bioidentical hormone therapy safe?",
        a: "Bioidentical estradiol and progesterone, prescribed appropriately and monitored, have a strong safety profile for most women. The Women’s Health Initiative findings have been substantially re-evaluated and the modern indication-based approach is well-supported. We discuss your specific risk profile in the first visit.",
      },
      {
        q: "Will hormones cause weight gain?",
        a: "No — the opposite is more often true. Untreated estradiol decline is associated with abdominal weight gain and body composition changes. Properly dosed BHRT is generally weight-neutral or weight-favorable.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "How long until I feel different?",
        a: "Sleep and vasomotor symptoms often improve within 2–4 weeks. Mood and energy at 4–8 weeks. Skin, libido, and body composition shift over 3–6 months. Dosing adjustments are normal at every check-in.",
      },
    ],
    finalCta: {
      headline: "Most of what your body is doing has a name. And a treatment.",
      italicWord: "name.",
      sub: "The first appointment is the diagnostic conversation. No commitment to a plan, no pressure on the day.",
    },
    heroImage: "/images/services/menopause-perimenopause.jpg",
    spreadImage: "/images/services/menopause-perimenopause.jpg",
    seo: {
      title: "Menopause & Hormone Therapy Beverly Hills | HRT & BHRT",
      description:
        "Perimenopause treatment, HRT, BHRT, bioidentical hormone replacement, and hormone panels with Dr. Jennifer Berman in Beverly Hills for greater Los Angeles patients.",
    },
    procedureType: "MedicalTherapy",
  },
  {
    slug: "sexual-health",
    name: "Sexual Health & Intimacy",
    num: "02",
    eyebrowTag: "Sexual Health · 02 of 06",
    hero: {
      headline: "Female sexual\ndysfunction.",
      italicWord: "dysfunction.",
      sub: "Low desire. Painful sex. Difficulty with arousal or orgasm. These are medical symptoms with measurable physiological causes — and they are treatable.",
    },
    seoSupport: {
      text: "Treatment for painful sex, low libido, vaginismus and dyspareunia in Beverly Hills.",
      italicWord: "painful sex",
    },
    atAGlance: {
      consultation: "60–90 min",
      followUp: "4–6 wks",
      setting: "In-person + telehealth",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six clusters of symptoms that most clinicians don’t ask about.",
      italicWord: "most clinicians don’t ask about.",
    },
    spreadLede:
      "Female sexual dysfunction is a medical diagnosis with measurable causes. We do the workup most practices skip — hormonal, vascular, neurological — and write a treatment plan from it.",
    treatmentChips: [
      "Low libido (HSDD)",
      "Painful intercourse",
      "Arousal & orgasmic disorders",
      "Vulvodynia",
      "Vaginismus",
      "PSAD",
      "PRP/PRF",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Low desire",
        italicWord: "desire",
        body: "Hypoactive sexual desire disorder (HSDD). Reduced libido after pregnancy, perimenopause, antidepressants, or hormonal contraception.",
      },
      {
        ix: "02",
        title: "Arousal difficulty",
        italicWord: "Arousal",
        body: "Reduced genital sensitivity, lubrication issues, vascular insufficiency. Diagnostic workup includes hormonal panel and physical exam.",
      },
      {
        ix: "03",
        title: "Painful intercourse",
        italicWord: "intercourse",
        body: "Dyspareunia, vaginismus, vulvodynia. Causes range from atrophy to pelvic floor dysfunction to nerve hypersensitivity.",
      },
      {
        ix: "04",
        title: "Orgasmic disorder",
        italicWord: "Orgasmic",
        body: "Difficulty reaching orgasm, delayed orgasm, anorgasmia. Often hormonal, neurological, or pharmacologically induced.",
      },
      {
        ix: "05",
        title: "Postpartum changes",
        italicWord: "changes",
        body: "Persistent symptoms 6+ months after delivery — laxity, sensation changes, scar tissue, hormonally driven libido shifts.",
      },
      {
        ix: "06",
        title: "Post-treatment recovery",
        italicWord: "recovery",
        body: "Sexual dysfunction following cancer treatment, hysterectomy, or chronic medication use. Restoration plan tailored to history.",
      },
    ],
    processHeading: {
      text: "A real diagnostic process, not a sales funnel.",
      italicWord: "diagnostic process,",
    },
    process: [
      {
        num: "01",
        title: "Intake & history",
        italicWord: "Intake",
        body: "A 60–90 minute first appointment with Dr. Berman. Detailed medical, hormonal, surgical, sexual, and pharmacological history.",
      },
      {
        num: "02",
        title: "Diagnostics",
        italicWord: "Diagnostics",
        body: "Comprehensive hormone panel. Pelvic exam where indicated. Vascular and neurological assessment. Medication review.",
      },
      {
        num: "03",
        title: "Treatment plan",
        italicWord: "Treatment plan",
        body: "A written plan covering pharmacological, regenerative, device, hormonal, and behavioral options — with rationale for each.",
      },
      {
        num: "04",
        title: "Follow-up",
        italicWord: "Follow-up",
        body: "Re-evaluation at 4–6 weeks, then quarterly. Plans adjust based on labs, symptom response, and patient preference.",
      },
    ],
    expectHeading: {
      text: "The first ninety days, in honest detail.",
      italicWord: "first ninety days,",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake forms",
        body: "Detailed health intake (~30 min) submitted online before the first appointment so the visit isn’t spent paperwork-ing.",
      },
      {
        when: "Week 1",
        title: "Initial consultation",
        body: "60–90 min in-person or telehealth. History, exam where indicated, lab orders. Treatment plan drafted on the spot.",
      },
      {
        when: "Week 2–3",
        title: "Lab results review",
        body: "Brief virtual review once labs are back. Plan refined. First prescriptions or in-office procedures scheduled.",
      },
      {
        when: "Week 6",
        title: "First follow-up",
        body: "Symptom review. Lab recheck where applicable. Adjustments to dosing, modality, or protocol.",
      },
      {
        when: "Week 12",
        title: "Plan optimization",
        body: "By this point most patients have a clear sense of what’s working. Focus shifts to maintenance and long-term plan.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Do you treat pain during sex, vaginismus, vulvodynia, and dyspareunia?",
        a: "Yes. Dr. Berman evaluates pain during sex, painful intercourse, vaginismus, vulvodynia, dyspareunia, vaginal dryness, and related pelvic or hormonal drivers as medical symptoms with treatable causes.",
      },
      {
        q: "Can low libido in women be hormonal?",
        a: "Often, yes. Low libido can be related to perimenopause, postpartum changes, medications, hormone shifts, pain, arousal difficulty, stress physiology, or several factors at once. The point of the workup is to find the pattern before recommending treatment.",
      },
      {
        q: "Is female sexual dysfunction really a medical diagnosis?",
        a: "Yes. The DSM-5 and ICD-10 both list multiple FSD diagnoses (HSDD, female orgasmic disorder, genito-pelvic pain disorder, etc). The challenge is that most clinicians aren’t trained to evaluate them — not that they aren’t real.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "Can this be done over telehealth?",
        a: "Initial consultations and most follow-ups can be done virtually. Procedures (Emsella, MonaLisa Touch, O-Shot, exams requiring physical evaluation) require an in-person visit.",
      },
      {
        q: "How long until I see results?",
        a: "Depends on modality. Hormonal protocols usually show measurable change in 4–8 weeks. Peptides like PT-141 are dose-of-event. Energy device protocols (Emsella, MonaLisa Touch) typically show change after the third session, with full effect at three months.",
      },
    ],
    finalCta: {
      headline: "Most of what your body is doing has a name. And a treatment.",
      italicWord: "name.",
      sub: "The first appointment is the diagnostic conversation. No commitment to a plan, no pressure on the day.",
    },
    heroImage: "/images/services/labiaplasty.jpg",
    spreadImage: "/images/services/labiaplasty.jpg",
    seo: {
      title: "Female Sexual Health Doctor Beverly Hills | Dr. Jennifer Berman",
      description:
        "Medical care for low libido, pain during sex, vaginismus, dyspareunia, vulvodynia, arousal difficulty, and orgasm concerns with Dr. Jennifer Berman.",
    },
    procedureType: "MedicalTherapy",
  },
  {
    slug: "pelvic-urinary",
    name: "Pelvic Floor & Urinary Health",
    num: "03",
    eyebrowTag: "Pelvic & Urinary · 03 of 06",
    hero: {
      headline: "Pelvic floor &\nurinary health.",
      italicWord: "urinary health.",
      sub: "Leaks. Urgency. Pelvic pressure or pain. Prolapse symptoms. These are not the price of childbirth or aging — they are diagnosable conditions with treatments most patients never get offered.",
    },
    seoSupport: {
      text: "Overactive bladder treatment, stress incontinence care, urinary urgency, pelvic pain, and Emsella support in Beverly Hills for greater Los Angeles patients.",
      italicWord: "Overactive bladder treatment",
    },
    atAGlance: {
      consultation: "60–90 min",
      followUp: "4–6 wks",
      setting: "In-person + telehealth",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six clusters of pelvic-floor symptoms that get dismissed as “normal.”",
      italicWord: "“normal.”",
    },
    spreadLede:
      "Incontinence, urgency, prolapse, pelvic pain — diagnosed properly and treated with Emsella, pelvic floor therapy, hormonal optimization, and surgical referral when indicated.",
    treatmentChips: [
      "Stress & urge incontinence",
      "Urgency / frequency",
      "Prolapse",
      "Pelvic pain",
      "Emsella",
      "Pelvic floor therapy",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Stress incontinence",
        italicWord: "Stress",
        body: "Leaks with cough, sneeze, run, or jump. Postpartum, post-menopause, or age-related. Often resolved with Emsella + targeted therapy.",
      },
      {
        ix: "02",
        title: "Urge incontinence",
        italicWord: "Urge",
        body: "Sudden, hard-to-defer urge with leakage. Overactive bladder. Treatable with combined behavioral, pharmacological, and device protocols.",
      },
      {
        ix: "03",
        title: "Frequency & urgency",
        italicWord: "urgency",
        body: "Going more than 8× a day, waking 2+ times a night, urgency without leakage. Often hormonal, sometimes neurological.",
      },
      {
        ix: "04",
        title: "Pelvic prolapse",
        italicWord: "prolapse",
        body: "Pressure, bulge, dragging sensation. Cystocele, rectocele, uterine prolapse. Diagnosed by exam; treated medically or surgically based on grade.",
      },
      {
        ix: "05",
        title: "Pelvic pain",
        italicWord: "pain",
        body: "Chronic pelvic pain, painful intercourse, pelvic floor hypertonicity. Multidisciplinary workup — gynecology, urology, neurology, PT.",
      },
      {
        ix: "06",
        title: "Recurrent UTIs",
        italicWord: "UTIs",
        body: "Three or more documented infections in twelve months. Hormonal evaluation, vaginal estradiol, prophylactic protocols, behavioral changes.",
      },
    ],
    processHeading: {
      text: "A real diagnostic process, not a sales funnel.",
      italicWord: "diagnostic process,",
    },
    process: [
      {
        num: "01",
        title: "Intake & history",
        italicWord: "Intake",
        body: "Detailed obstetric, surgical, and urological history. Symptom diary and bladder diary review.",
      },
      {
        num: "02",
        title: "Diagnostics",
        italicWord: "Diagnostics",
        body: "Pelvic exam, prolapse staging, post-void residual, urinalysis, hormone panel. Imaging or urodynamics when indicated.",
      },
      {
        num: "03",
        title: "Treatment plan",
        italicWord: "Treatment plan",
        body: "Emsella sessions, pelvic floor PT referral, vaginal estradiol, surgical referral, or pessary fitting — chosen based on diagnosis, not catalog.",
      },
      {
        num: "04",
        title: "Follow-up",
        italicWord: "Follow-up",
        body: "Re-evaluation at 4–6 weeks, then quarterly. Symptom score retake, regimen tuning, escalation only when warranted.",
      },
    ],
    expectHeading: {
      text: "The first ninety days, in honest detail.",
      italicWord: "first ninety days,",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake",
        body: "Health intake + bladder diary submitted online before the first appointment.",
      },
      {
        when: "Week 1",
        title: "Initial consultation",
        body: "60–90 min in-person. Pelvic exam, prolapse staging, treatment plan drafted on the spot.",
      },
      {
        when: "Week 2–4",
        title: "Treatment start",
        body: "First Emsella sessions begin (typical course is 6 sessions, twice weekly), or hormonal/medication protocol initiated.",
      },
      {
        when: "Week 6",
        title: "First follow-up",
        body: "Symptom score retake. Therapy adjustments. Pelvic floor PT progress review.",
      },
      {
        when: "Week 12",
        title: "Plan optimization",
        body: "Most patients see meaningful symptom reduction by this point. Focus shifts to maintenance protocol and long-term plan.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Do you treat overactive bladder and urinary urgency?",
        a: "Yes. The pelvic and urinary health evaluation covers overactive bladder, urinary urgency, frequency, stress incontinence, urge incontinence, recurrent UTIs, pelvic pain, and prolapse symptoms.",
      },
      {
        q: "Do I need a urogynecologist, female urologist, or pelvic floor treatment?",
        a: "Many Los Angeles patients search those terms when they have bladder leakage, urgency, prolapse symptoms, or pelvic pain. Dr. Berman is a urologist and women's wellness physician; she evaluates the medical picture and coordinates pelvic floor therapy, Emsella, medication, hormones, or surgical referral when needed.",
      },
      {
        q: "What is Emsella and does it actually work?",
        a: "Emsella is a high-intensity focused electromagnetic (HIFEM) device that contracts the pelvic floor muscles thousands of times per session — the equivalent of an intensive Kegel workout, while you stay clothed and seated. Published trials show meaningful improvement in stress and urge incontinence in about 75% of women across a 6-session course.",
      },
      {
        q: "Will I need surgery?",
        a: "Most pelvic-floor patients do not. Surgery is reserved for advanced prolapse or refractory cases. We refer to highly vetted surgical urogynecologists when surgery is clearly indicated — and only then.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "How long until I see results?",
        a: "Emsella patients often notice change after the third session, with full effect at 3 months. Pelvic floor PT is generally 8–12 weeks. Hormonal protocols 4–8 weeks.",
      },
    ],
    finalCta: {
      headline: "Most of what your body is doing has a name. And a treatment.",
      italicWord: "name.",
      sub: "The first appointment is the diagnostic conversation. No commitment to a plan, no pressure on the day.",
    },
    heroImage: "/images/services/menopause-perimenopause.jpg",
    spreadImage: "/images/services/menopause-perimenopause.jpg",
    seo: {
      title: "Pelvic & Urinary Health Beverly Hills | Emsella & Incontinence",
      description:
        "Treatment for stress incontinence, overactive bladder, urgency, pelvic pain, prolapse symptoms, and Emsella care with Dr. Jennifer Berman in Beverly Hills.",
    },
    procedureType: "MedicalProcedure",
  },
  {
    slug: "vaginal-rejuvenation",
    name: "Vaginal Rejuvenation",
    num: "04",
    eyebrowTag: "Vaginal Rejuvenation · 04 of 06",
    hero: {
      headline: "Vaginal\nrejuvenation.",
      italicWord: "rejuvenation.",
      sub: "Atrophy. Dryness. Postpartum laxity. Discomfort during intimacy. Energy-based, regenerative, and hormonal options — used in combination, matched to physiology, monitored over time.",
    },
    seoSupport: {
      text: "Vaginal rejuvenation and MonaLisa Touch in Beverly Hills for greater Los Angeles patients.",
      italicWord: "MonaLisa Touch",
    },
    atAGlance: {
      consultation: "60–90 min",
      followUp: "4–6 wks",
      setting: "In-person",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six conditions where regenerative medicine actually moves the needle.",
      italicWord: "actually moves the needle.",
    },
    spreadLede:
      "MonaLisa Touch CO2 laser, PRP/PRF, exosomes, peptides, and topical hormonal therapy — combined into protocols that treat the underlying tissue, not just the symptom.",
    treatmentChips: [
      "MonaLisa Touch",
      "CO2 laser",
      "PRP / PRF",
      "Exosomes & peptides",
      "Atrophy",
      "Vaginal dryness",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Vaginal atrophy",
        italicWord: "atrophy",
        body: "Genitourinary syndrome of menopause (GSM). Thinning, dryness, burning, painful intercourse. Treatable with combined hormonal and energy device protocols.",
      },
      {
        ix: "02",
        title: "Vaginal dryness",
        italicWord: "dryness",
        body: "Postpartum, perimenopause, post-cancer treatment, or contraception-related. Topical estradiol, DHEA, MonaLisa Touch, and PRP options.",
      },
      {
        ix: "03",
        title: "Postpartum laxity",
        italicWord: "laxity",
        body: "Tissue stretching, sensation changes, structural shifts after vaginal delivery. CO2 laser and PRP can restore tone and sensitivity.",
      },
      {
        ix: "04",
        title: "Painful intercourse",
        italicWord: "intercourse",
        body: "Tissue-driven dyspareunia from atrophy, scarring, or atrophic vaginitis. MonaLisa Touch + topical hormonal therapy is first-line in most cases.",
      },
      {
        ix: "05",
        title: "Recurrent infections",
        italicWord: "infections",
        body: "Chronic UTIs, BV, yeast — often downstream of GSM. Treating the underlying tissue prevents the recurrence cycle.",
      },
      {
        ix: "06",
        title: "Sensation & responsiveness",
        italicWord: "responsiveness",
        body: "Reduced genital sensation, arousal difficulty, post-treatment changes. PRP and exosome protocols target the underlying neurovascular tissue.",
      },
    ],
    processHeading: {
      text: "A real diagnostic process, not a sales funnel.",
      italicWord: "diagnostic process,",
    },
    process: [
      {
        num: "01",
        title: "Intake & history",
        italicWord: "Intake",
        body: "Detailed reproductive, hormonal, surgical, and sexual history. Discussion of priorities and outcome targets.",
      },
      {
        num: "02",
        title: "Examination",
        italicWord: "Examination",
        body: "Pelvic exam, tissue assessment, hormonal evaluation. Vaginal pH and mucosal scoring where appropriate.",
      },
      {
        num: "03",
        title: "Treatment plan",
        italicWord: "Treatment plan",
        body: "MonaLisa Touch course (typical 3 sessions, 4–6 weeks apart), PRP/PRF, exosomes, topical hormonal optimization — combined as warranted.",
      },
      {
        num: "04",
        title: "Maintenance",
        italicWord: "Maintenance",
        body: "Annual MonaLisa Touch maintenance, ongoing topical hormonal therapy, periodic PRP boost. Long-term tissue health is the goal.",
      },
    ],
    expectHeading: {
      text: "The first ninety days, in honest detail.",
      italicWord: "first ninety days,",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake",
        body: "Detailed health intake + symptom severity scoring submitted online before the first appointment.",
      },
      {
        when: "Week 1",
        title: "Initial consultation",
        body: "60–90 min in-person. Pelvic exam, treatment plan, scheduling for first MonaLisa Touch session.",
      },
      {
        when: "Week 2–6",
        title: "Treatment course",
        body: "MonaLisa Touch: 3 sessions, 4–6 weeks apart. Brief, in-office, topical anesthetic. Most patients return to normal activity same day.",
      },
      {
        when: "Week 8",
        title: "Mid-course check",
        body: "Symptom score retake. Tissue assessment. Topical regimen adjusted as needed.",
      },
      {
        when: "Week 12",
        title: "Outcome review",
        body: "Full symptom reassessment. Most patients report substantial improvement in dryness, comfort, and sensation. Maintenance plan written.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Is MonaLisa Touch the same as vaginal rejuvenation?",
        a: "MonaLisa Touch is one vaginal rejuvenation option. Depending on the exam and symptoms, the plan may also include topical hormonal therapy, PRP/PRF, exosomes, peptides, or other regenerative protocols.",
      },
      {
        q: "Can vaginal rejuvenation help dryness and painful intercourse?",
        a: "It can for the right patient. Vaginal dryness, atrophy, GSM, and painful intercourse may improve when the underlying tissue, hormones, and inflammation are treated together rather than handled as separate complaints.",
      },
      {
        q: "Is MonaLisa Touch painful?",
        a: "No. The procedure uses topical anesthetic; most patients describe it as a brief, mild internal vibration. The session itself is under 10 minutes. There is no recovery time — patients typically return to normal activity that day.",
      },
      {
        q: "Is it safe after breast or gynecologic cancer?",
        a: "MonaLisa Touch CO2 laser is a non-hormonal option and is well-suited to patients who cannot use systemic estradiol. We work closely with your oncology team to confirm appropriateness and coordinate care.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "How long do results last?",
        a: "Results from a 3-session MonaLisa Touch course typically hold for 12–18 months, with annual maintenance. PRP and exosome benefits typically last 9–12 months. Combined with topical hormonal therapy, the outcome is durable.",
      },
    ],
    finalCta: {
      headline: "Most of what your body is doing has a name. And a treatment.",
      italicWord: "name.",
      sub: "The first appointment is the diagnostic conversation. No commitment to a plan, no pressure on the day.",
    },
    heroImage: "/images/services/labiaplasty.jpg",
    spreadImage: "/images/services/labiaplasty.jpg",
    seo: {
      title: "Vaginal Rejuvenation Beverly Hills | MonaLisa Touch",
      description:
        "MonaLisa Touch, CO2 laser, PRP/PRF, and regenerative vaginal rejuvenation protocols for dryness, atrophy, painful intercourse, and tissue health in Beverly Hills.",
    },
    procedureType: "MedicalProcedure",
  },
  {
    slug: "aesthetic-regenerative",
    name: "Aesthetic & Regenerative Medicine",
    num: "05",
    eyebrowTag: "Aesthetic & Regenerative · 05 of 06",
    hero: {
      headline: "Aesthetic &\nregenerative medicine.",
      italicWord: "regenerative medicine.",
      sub: "Botox. Filler. PRP and PRF. Skin tightening. Regenerative protocols. Practiced as medicine — restrained, indication-led, and tuned to look like you on a better day, not someone else.",
    },
    atAGlance: {
      consultation: "45–60 min",
      followUp: "8–12 wks",
      setting: "In-person",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six concerns we treat with measured intervention.",
      italicWord: "measured intervention.",
    },
    spreadLede:
      "Botox and dermal filler done with restraint. PRP/PRF, exosomes, and skin tightening for genuinely regenerative results. The plan is what most patients want — to look like themselves, rested.",
    treatmentChips: [
      "Botox",
      "Dermal filler",
      "PRP / PRF",
      "Skin tightening",
      "Microneedling",
      "Regenerative protocols",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Forehead & glabella lines",
        italicWord: "lines",
        body: "Dynamic wrinkles from facial expression. Botox or Dysport, conservatively dosed to preserve natural movement.",
      },
      {
        ix: "02",
        title: "Volume loss",
        italicWord: "Volume",
        body: "Midface, temple, and tear trough volume loss with age. Hyaluronic acid filler placed structurally — not in the lips, in the support architecture.",
      },
      {
        ix: "03",
        title: "Skin laxity",
        italicWord: "laxity",
        body: "Mild-to-moderate facial and neck skin laxity. Forma RF skin tightening, microneedling with PRP, regenerative protocols.",
      },
      {
        ix: "04",
        title: "Texture & tone",
        italicWord: "Texture",
        body: "Sun damage, post-inflammatory pigmentation, dull skin, large pores. Microneedling with PRP, peels, topical regimen.",
      },
      {
        ix: "05",
        title: "Hair thinning",
        italicWord: "Hair thinning",
        body: "Female-pattern hair thinning, diffuse loss, postpartum or hormonal. PRP/PRF scalp protocols, hormonal evaluation, peptides.",
      },
      {
        ix: "06",
        title: "Recovery & repair",
        italicWord: "Recovery",
        body: "Post-procedure recovery, post-injury repair, regenerative tissue support. Exosomes, peptides, PRP-assisted recovery.",
      },
    ],
    processHeading: {
      text: "A consultation, not a sales pitch.",
      italicWord: "consultation,",
    },
    process: [
      {
        num: "01",
        title: "Consultation",
        italicWord: "Consultation",
        body: "45–60 min consultation. We talk about what bothers you, what you want, and what we recommend. No pressure, no upsell.",
      },
      {
        num: "02",
        title: "Plan",
        italicWord: "Plan",
        body: "A written plan with rationale for each suggested treatment, sequence, and expected outcome. Cost transparency up front.",
      },
      {
        num: "03",
        title: "Treatment",
        italicWord: "Treatment",
        body: "Treatment performed by Dr. Berman or a vetted, supervised injector on the team. Conservative, measured, photographed.",
      },
      {
        num: "04",
        title: "Follow-up",
        italicWord: "Follow-up",
        body: "Re-evaluation at 2–4 weeks for any injection-based treatment. Long-term plan reviewed quarterly. Adjustments as you change.",
      },
    ],
    expectHeading: {
      text: "What the first appointments look like.",
      italicWord: "first appointments",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake",
        body: "Health intake submitted online. Photo upload optional.",
      },
      {
        when: "Week 1",
        title: "Consultation",
        body: "45–60 min in-person consultation. Plan written same day. First treatment scheduled if you want to proceed.",
      },
      {
        when: "Week 2–3",
        title: "First treatment",
        body: "Initial Botox / filler / PRP performed. Aftercare instructions, photo documentation, recovery expectations.",
      },
      {
        when: "Week 4",
        title: "Two-week check",
        body: "Touch-up evaluation for any injection-based treatment. Photo retake. Adjustment to dosing if indicated.",
      },
      {
        when: "Month 3",
        title: "Plan review",
        body: "Quarterly review of long-term plan. Maintenance schedule confirmed. Next-step recommendations.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Will I look “done”?",
        a: "Not in this practice. The aesthetic philosophy is restraint — we dose Botox below maximum so expression is preserved, place filler structurally rather than in the lips, and refuse to overfill. The goal is that nobody can tell, but they notice you look rested.",
      },
      {
        q: "How is the regenerative side different from a med spa?",
        a: "We use PRP, PRF, exosomes, and peptides as part of a full medical plan — coordinated with hormonal, nutritional, and surgical considerations. The protocols are evidence-based and the plan is written by a physician, not a technician.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "How long do results last?",
        a: "Botox: 3–4 months. Filler: 9–18 months depending on type and area. PRP: 9–12 months. Forma RF: typically 12–18 months with maintenance. We build a maintenance schedule into your plan.",
      },
    ],
    finalCta: {
      headline: "Look like yourself, rested. Not someone else.",
      italicWord: "rested.",
      sub: "The first appointment is a real consultation. No commitment, no pressure on the day.",
    },
    heroImage: "/images/services/anti-aging-regenerative.jpg",
    spreadImage: "/images/services/anti-aging-regenerative.jpg",
    seo: {
      title: "Aesthetic & Regenerative Medicine — Dr. Jennifer Berman",
      description:
        "Botox, dermal filler, PRP/PRF, microneedling, skin tightening, and regenerative protocols — practiced with restraint and tuned to look like you on a better day.",
    },
    procedureType: "MedicalProcedure",
  },
  {
    slug: "body-contouring",
    name: "Body Contouring & Weight Loss",
    num: "06",
    eyebrowTag: "Body Contouring · 06 of 06",
    hero: {
      headline: "Body contouring &\nweight loss.",
      italicWord: "weight loss.",
      sub: "Emsculpt NEO, Forma, BeautiFill, Evolve, Cellutone, Contoura, and a medically supervised weight-loss program — used together, the way they were meant to be.",
    },
    seoSupport: {
      text: "Body contouring Beverly Hills patients can pair Emsculpt NEO, body sculpting, cellulite treatment, and physician-led medical weight loss.",
      italicWord: "Emsculpt NEO",
    },
    atAGlance: {
      consultation: "60 min",
      followUp: "4–6 wks",
      setting: "In-person",
      insurance: "Out-of-network",
    },
    treatsHeading: {
      text: "Six body concerns we address with combined protocols.",
      italicWord: "combined protocols.",
    },
    spreadLede:
      "Non-invasive contouring devices, BeautiFill laser-assisted lipo, and a physician-led weight-loss program — combined into a plan, not sold a la carte.",
    treatmentChips: [
      "Emsculpt NEO",
      "Forma",
      "BeautiFill",
      "Evolve",
      "Cellutone",
      "Contoura",
      "Medical weight loss",
    ],
    symptoms: [
      {
        ix: "01",
        title: "Stubborn fat",
        italicWord: "Stubborn fat",
        body: "Diet- and exercise-resistant pockets. Abdomen, flanks, thighs, arms. Emsculpt NEO + targeted device protocols, BeautiFill where indicated.",
      },
      {
        ix: "02",
        title: "Muscle definition",
        italicWord: "definition",
        body: "Muscle mass and tone loss with age, postpartum, or post-surgery. Emsculpt NEO induces both fat reduction and measurable muscle gain.",
      },
      {
        ix: "03",
        title: "Skin laxity",
        italicWord: "Skin laxity",
        body: "Body skin laxity post-weight-loss or post-pregnancy. Forma and Evolve for non-invasive tightening; surgical referral when indicated.",
      },
      {
        ix: "04",
        title: "Cellulite",
        italicWord: "Cellulite",
        body: "Dimpling and texture irregularity. Cellutone, RF, and combined protocols. Reasonable expectations are a part of the plan.",
      },
      {
        ix: "05",
        title: "Weight loss",
        italicWord: "Weight loss",
        body: "Medically supervised weight loss with hormonal optimization, metabolic workup, and pharmacological support where appropriate.",
      },
      {
        ix: "06",
        title: "Post-procedure recovery",
        italicWord: "Recovery",
        body: "Recovery support after BeautiFill, surgical procedures, or body contouring. Lymphatic, regenerative, and tissue-support protocols.",
      },
    ],
    processHeading: {
      text: "A consultation, then a real plan.",
      italicWord: "real plan.",
    },
    process: [
      {
        num: "01",
        title: "Consultation",
        italicWord: "Consultation",
        body: "60-min consultation. Body assessment, goals discussion, baseline measurements, photos.",
      },
      {
        num: "02",
        title: "Workup",
        italicWord: "Workup",
        body: "Where weight loss is in scope: hormonal panel, metabolic markers, body composition. Where contouring only: targeted plan and device selection.",
      },
      {
        num: "03",
        title: "Treatment course",
        italicWord: "Treatment course",
        body: "Combined device protocol (Emsculpt NEO is typically 4 sessions, twice weekly). BeautiFill performed in one session. Weight-loss program ongoing.",
      },
      {
        num: "04",
        title: "Maintenance",
        italicWord: "Maintenance",
        body: "Maintenance Emsculpt sessions every 3–6 months. Annual review. Weight-loss patients followed long-term.",
      },
    ],
    expectHeading: {
      text: "What the first ninety days look like.",
      italicWord: "ninety days",
    },
    expect: [
      {
        when: "Week 0",
        title: "Booking & intake",
        body: "Health intake + goals submitted online. Photo upload optional.",
      },
      {
        when: "Week 1",
        title: "Consultation",
        body: "60-min in-person consultation. Body composition, baseline photos, measurements. Plan written same day.",
      },
      {
        when: "Week 2–4",
        title: "Treatment start",
        body: "Emsculpt NEO course begins (4 sessions, twice weekly). Weight-loss medications initiated if indicated.",
      },
      {
        when: "Week 6",
        title: "First check",
        body: "Body composition retake. Photos. Plan adjustments. Forma or other adjunct protocols added as warranted.",
      },
      {
        when: "Week 12",
        title: "Outcome review",
        body: "Full body composition, photo, and goals review. Maintenance schedule confirmed.",
      },
    ],
    faqHeading: {
      text: "Questions most patients ask.",
      italicWord: "most patients ask.",
    },
    faqs: [
      {
        q: "Is Emsculpt NEO body contouring or weight loss?",
        a: "Emsculpt NEO is body contouring: it is designed to build muscle and reduce fat in treated areas. Weight-loss care is a separate physician-led medical program that may include metabolic and hormonal evaluation when appropriate.",
      },
      {
        q: "How is physician-led medical weight loss different from a med spa program?",
        a: "The plan starts with medical history, body composition, metabolic context, hormones where relevant, and follow-up. The goal is durable health and body-composition change, not a one-size-fits-all package.",
      },
      {
        q: "Does Emsculpt NEO actually build muscle?",
        a: "Yes — published trials show measurable muscle gain (about 25%) and fat reduction (about 30%) over a 4-session course. It’s the only device cleared for both fat and muscle. The patient stays clothed and seated; the session is 30 minutes.",
      },
      {
        q: "Is BeautiFill the same as liposuction?",
        a: "BeautiFill is a laser-assisted lipo technique. It uses laser energy to liquefy fat before extraction, which often means smoother contour and faster recovery than traditional lipo. It is a surgical procedure, performed in-office under local anesthesia, with a 1–2 week recovery.",
      },
      sharedFaqs.insurance,
      sharedFaqs.whoYouSee,
      {
        q: "Will the weight stay off?",
        a: "Long-term outcome correlates more with the supporting plan — hormonal, metabolic, behavioral — than with any single intervention. The medical weight-loss program is built for durability, not a number on a scale.",
      },
    ],
    finalCta: {
      headline: "Treat the body you have, not the catalog.",
      italicWord: "the body you have,",
      sub: "The first appointment is a real consultation. No commitment to a plan, no pressure on the day.",
    },
    heroImage: "/images/services/body-sculpting.jpg",
    spreadImage: "/images/services/body-sculpting.jpg",
    seo: {
      title: "Body Contouring Beverly Hills & Medical Weight Loss",
      description:
        "Emsculpt NEO, body contouring, body sculpting, cellulite treatment, and physician-led medical weight loss in Beverly Hills with Dr. Jennifer Berman.",
    },
    procedureType: "MedicalProcedure",
  },
];

export const SERVICE_BY_SLUG: Record<ServiceSlug, SpecialtyContent> =
  SERVICES.reduce(
    (acc, s) => {
      acc[s.slug] = s;
      return acc;
    },
    {} as Record<ServiceSlug, SpecialtyContent>,
  );

export const SERVICE_SLUGS: ServiceSlug[] = SERVICES.map((s) => s.slug);

/** Overview-page intro/lede content. */
export const OVERVIEW_HERO = {
  eyebrow: "Beverly Hills women's wellness treatments",
  headline: "Care designed for the way women’s bodies actually work.",
  italicWord: "women’s bodies",
  sub: "Menopause and hormone therapy, female sexual medicine, pelvic and urinary health, vaginal rejuvenation, aesthetic regenerative care, and body contouring — one physician-led plan for Beverly Hills and greater Los Angeles patients.",
};

export const OVERVIEW_INTRO = {
  eyebrow: "One practice",
  headline: "Women's wellness treatments in Beverly Hills, built around one physician-led plan.",
  italicWord: "physician-led plan.",
  sub: "The clinical surface area most clinics split into half a dozen referrals — menopause, hormones, sexual health, pelvic medicine, regenerative care, and body composition — done in one practice, by one physician, with one plan that crosses specialties.",
};

export const OVERVIEW_APPROACH = {
  eyebrow: "How we work",
  headline:
    "A real workup, a written plan, a doctor who reads the labs in the room.",
  italicWord: "in the room.",
  steps: [
    {
      num: "01",
      title: "Intake",
      italicWord: "Intake",
      body: "A 60–90 minute first appointment. Detailed history, symptom mapping, priorities.",
    },
    {
      num: "02",
      title: "Workup",
      italicWord: "Workup",
      body: "Hormone panel, exam where indicated, imaging or device assessment as warranted. The diagnostic depth most practices skip.",
    },
    {
      num: "03",
      title: "Conversation",
      italicWord: "Conversation",
      body: "We read the labs together in the room. You leave understanding what’s happening — not waiting on a portal message.",
    },
    {
      num: "04",
      title: "Plan",
      italicWord: "Plan",
      body: "A written plan covering pharmacological, regenerative, device, hormonal, and behavioral options — with rationale for each.",
    },
  ],
};

export const OVERVIEW_QUOTE = {
  body: "If your doctor doesn’t have an answer, that doesn’t mean there isn’t one. It means you need a different doctor.",
  attribution: "— Dr. Berman, on The Oprah Show",
  accentPhrases: ["an answer", "different doctor"],
};
