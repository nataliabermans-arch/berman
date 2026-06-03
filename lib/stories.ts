export type StoryCategory =
  | "Hormones"
  | "Sexual Health"
  | "Pelvic & Urinary"
  | "Vaginal Rejuvenation"
  | "Aesthetic"
  | "Body Contouring";

export interface PatientStory {
  slug: string;
  patient: { name: string; age: number; location: string };
  category: StoryCategory;
  italicWord: string;
  headline: string;
  excerpt: string;
  body: string;
  outcome: string;
  portraitImage?: string;
  treatedFor: string[];
  featured?: boolean;
}

export const STORIES: PatientStory[] = [
  {
    slug: "sarah-47-encino",
    patient: { name: "Sarah", age: 47, location: "Encino" },
    category: "Hormones",
    italicWord: "head",
    headline: "Five years told it was in her *head.*",
    excerpt:
      "Three internists, an endocrinologist, and a sleep clinic — none of them ran the panel that finally explained eight months of broken sleep and a body she did not recognize.",
    body: "I am 47, two kids, run a small business, used to sleep through anything. Then around 45 my sleep collapsed. I would fall asleep at ten and be wide awake at two, every single night. I gained fifteen pounds in nine months without changing a thing. My periods went strange — closer together, heavier, then skipping. My internist told me to try magnesium. My endocrinologist said my thyroid was 'fine.' A sleep specialist offered Ambien. Nobody once tested progesterone or free testosterone. Nobody mapped a cycle. After about five years of this — five years of being told this was anxiety, or just my forties, or that I should consider an SSRI — I asked a friend who works in women's health. She gave me Dr. Berman's name. The first appointment was an hour and twenty minutes. I had never had a doctor's appointment that long in my life. We went through every symptom in order. She ordered a full panel — not just the standard CBC, but progesterone, estradiol, free and total testosterone, DHEA, cortisol, full thyroid including reverse T3. Two weeks later we sat down with the results. Estradiol was tanking, progesterone was effectively zero in the second half of my cycle, testosterone was below the floor for women my age. We started bioidentical progesterone first, then added a low-dose estradiol patch. Eight weeks in I slept seven hours straight for the first time in two years. The body recomposition took longer — about six months — but my brain came back almost immediately. The thing I still can't get over is how cheap and basic the test was. Nobody had ever bothered to run it.",
    outcome:
      "Full hormone panel, bioidentical progesterone + low-dose estradiol patch. Eight weeks to restored sleep; six months to body composition.",
    portraitImage: "/images/stories/sarah-portrait.webp",
    treatedFor: ["Hormonal imbalance", "Sleep collapse", "Perimenopause"],
    featured: true,
  },
  {
    slug: "margot-52-pacific-palisades",
    patient: { name: "Margot", age: 52, location: "Pacific Palisades" },
    category: "Hormones",
    italicWord: "fog",
    headline: "The fog lifted before the *paperwork* did.",
    excerpt:
      "A litigation partner who could not finish a brief. Perimenopause had been quietly eroding her ability to do the work she had built a thirty-year career on.",
    body: "I am a litigation partner. For thirty years my entire job has been holding twelve threads at once and remembering exactly what was said in a deposition six months ago. Around 50 something started to slip. I would walk into a conference room and lose the name of opposing counsel — someone I had been across the table from for a decade. I would re-read the same paragraph of a brief four times. I told my husband I thought I was getting early dementia. I went to a neurologist. The MRI was clean. He said come back in a year. I started writing post-it notes for things I had never had to write down. The hot flashes I could deal with — they were almost a relief because at least they had a name. The cognitive piece was terrifying. A friend in my book club mentioned Dr. Berman. The first thing she did was a real history — not a checkbox form, an actual conversation about when each symptom started, how it felt, what it interfered with. She put me on a low-dose transdermal estradiol with cyclical progesterone, and we added a small dose of testosterone after the first follow-up. The brain fog began to lift in about three weeks — not all at once, more like a window slowly clearing. By the second month I was finishing briefs again without re-reading. I am not telling anyone hormone therapy is a magic bullet. I am telling you what happened to me. I got my working memory back.",
    outcome:
      "Low-dose transdermal estradiol, cyclical progesterone, low-dose testosterone. Cognitive symptoms eased within three weeks.",
    portraitImage: "/images/stories/margot-portrait.webp",
    treatedFor: ["Perimenopause", "Brain fog", "Cognitive symptoms"],
  },
  {
    slug: "aisha-39-culver-city",
    patient: { name: "Aisha", age: 39, location: "Culver City" },
    category: "Pelvic & Urinary",
    italicWord: "real",
    headline: "First doctor in seven years to call the pain *real.*",
    excerpt:
      "Chronic pelvic pain that had been blamed on stress, on her marriage, on her imagination. The diagnostic exam took forty minutes.",
    body: "I had pelvic pain — a dull, dragging ache with sharp episodes — for seven years before anyone took it seriously. I saw four OB-GYNs. The first one told me it was probably stress and to do more yoga. The second one prescribed birth control. The third one suggested I see a pelvic floor PT, which was actually the first useful thing anyone had told me, but the underlying cause was never identified. The fourth one, after a normal ultrasound, suggested it might be psychosomatic and asked about my marriage. I am a nurse. I know what gaslighting looks like in a medical setting because I've watched it happen to other women in the units I've worked. Knowing it doesn't make it easier to be on the receiving end. I came to Dr. Berman because I had read an interview where she talked about how often female pelvic pain is undiagnosed. The intake exam was the most thorough physical exam I have ever had. She mapped trigger points externally and internally, ran a vascular assessment, ordered targeted imaging. The diagnosis was a combination of pelvic floor dysfunction, hypertonic muscle pattern, and a small amount of pelvic congestion. The protocol was layered — pelvic floor PT with a specific therapist she works with, a short course of muscle relaxant, vaginal valium suppositories at night for a stretch, plus targeted nerve work. It took about four months to get the pain to a manageable baseline and another six to get it to mostly gone. The validation alone was therapy. Being told the pain was real, with a measurable cause, by a doctor who could explain the mechanism — I cried in my car after the first appointment.",
    outcome:
      "Trigger-point mapping, pelvic floor PT, targeted muscle relaxants and nerve work. Pain reduced to baseline in four months.",
    portraitImage: "/images/stories/aisha-portrait.webp",
    treatedFor: ["Chronic pelvic pain", "Pelvic floor dysfunction"],
  },
  {
    slug: "linda-61-brentwood",
    patient: { name: "Linda", age: 61, location: "Brentwood" },
    category: "Sexual Health",
    italicWord: "after",
    headline: "Cancer was the easy part. *After* was harder.",
    excerpt:
      "Two years out from breast cancer treatment, the pain made intimacy impossible. Her oncologist said it was a normal trade-off. She did not accept that.",
    body: "I had ER-positive breast cancer at 58. I did the chemo, did the radiation, did the surgery, did the follow-up. I am cancer-free, going on three years. Nobody warned me about what comes after — or if they did, it was buried in a paragraph at the bottom of a discharge sheet. The aromatase inhibitor I was on dropped my estrogen to almost zero. Within a year I had vaginal atrophy so severe that intercourse was not possible and even walking some days felt raw. My oncologist's exact words were that this was a 'normal trade-off' and that I should consider whether intimacy was really worth the risk. I love my husband. We have been married thirty-six years. I was not willing to accept that this part of our life was over because of a side effect nobody told me to expect. Dr. Berman's office was the first place I called where the receptionist did not pause when I described what was happening. The consult took ninety minutes. We talked through the oncology context first — what was safe given my history, what was off the table. The protocol she designed was non-systemic: a course of CO2 fractional laser treatments to rebuild the vaginal wall, hyaluronic acid moisturizers, and a very low-dose local estrogen that her oncology coordinator cleared with my oncology team. Within six weeks I was comfortable enough to have a conversation about being intimate again. We are not 25 anymore — but we are us again. I tell every woman I meet who is going through breast cancer treatment to make this part of the conversation up front.",
    outcome:
      "CO2 fractional laser series, non-systemic local treatments, oncology-team-cleared protocol. Comfort restored within six weeks.",
    portraitImage: "/images/stories/linda-portrait.webp",
    treatedFor: ["Vaginal atrophy", "Post-cancer sexual health", "GSM"],
  },
  {
    slug: "kim-44-santa-monica",
    patient: { name: "Kim", age: 44, location: "Santa Monica" },
    category: "Sexual Health",
    italicWord: "missing",
    headline: "She thought it was the marriage. It was *missing* testosterone.",
    excerpt:
      "Libido that vanished sometime in her early forties. Two therapists, one couples retreat, and zero hormone panels later, she walked into Berman's office.",
    body: "I had assumed something was wrong with my marriage. My husband and I went to couples therapy for almost a year, then a weekend intensive. We were communicating better than ever and I still had zero interest in sex. It was not a fight. It was an absence. Where there had been desire there was just nothing. I had a low background mood that was hard to describe — not depression exactly, more like the saturation had been turned down on everything. My PCP ran a basic panel, told me my labs were 'normal,' and offered an SSRI. I knew an SSRI would make the libido issue worse, not better. A friend recommended Dr. Berman. The full panel told a different story. My free testosterone was below assay floor — meaning the lab couldn't even measure it, it was so low. DHEA was bottom-quartile. My estrogen was actually fine. Dr. Berman explained that female testosterone is so under-studied that most general practitioners don't even think to test it, and when it comes back low they often assume it doesn't matter. We started a low compounded testosterone cream, applied daily, with periodic re-testing. The mood lifted first — about three weeks in. Libido took longer, closer to two months, and it didn't come back as some dramatic rush, more like the system slowly turning back on. The first time I felt actual desire again I almost cried. I had been telling myself for two years that part of me was just gone. It wasn't gone. It was unfunded.",
    outcome:
      "Compounded testosterone cream, monitored re-dosing. Mood lifted in three weeks; libido returned at two months.",
    portraitImage: "/images/stories/kim-portrait.webp",
    treatedFor: ["Low libido", "Mood", "Low testosterone"],
  },
  {
    slug: "rachel-49-studio-city",
    patient: { name: "Rachel", age: 49, location: "Studio City" },
    category: "Body Contouring",
    italicWord: "same",
    headline: "Same diet. *Same* workouts. Different body.",
    excerpt:
      "Menopause arrived and her body composition reorganized itself overnight. She did not want a quick fix — she wanted an explanation.",
    body: "I have been a serious endurance cyclist for twenty years. I know my body, I know what I eat, I know how my training cycles affect my weight. At 47 something changed. Same training load, same nutrition — and twelve pounds appeared, mostly in my midsection, that had never been there before. My resting heart rate went up. My sleep got worse. I tried what every woman in my situation tries first: cutting more calories. It made me weaker without making me lighter. I went to my GP, who said this was just menopause and to accept it. I was not interested in accepting it without first understanding what was actually happening physiologically. Dr. Berman ran a full hormone panel, a metabolic panel, and a body composition scan. The picture that came back was specific: estrogen had dropped, cortisol pattern was inverted (high at night), and my visceral fat percentage had jumped while lean mass had dropped. The plan was layered — bioidentical hormone replacement to restore the estrogen and progesterone, a peptide protocol to support lean mass, attention to sleep architecture, and a nutrition adjustment that emphasized protein much more than my old endurance-athlete approach had. I lost the visceral fat over about five months. More importantly, the explanation made sense. I am not fighting my body anymore — I am working with the system as it actually is now, not as it was at 35.",
    outcome:
      "Hormone panel + body composition scan, BHRT, peptide-supported lean mass protocol, nutrition restructure. Visceral fat normalized in five months.",
    treatedFor: ["Menopause", "Body composition", "Metabolic shift"],
  },
  {
    slug: "elena-54-encino",
    patient: { name: "Elena", age: 54, location: "Encino" },
    category: "Vaginal Rejuvenation",
    italicWord: "small",
    headline: "A *small* procedure that changed how she sat down.",
    excerpt:
      "Three years post-menopause, the daily friction of vaginal atrophy had quietly narrowed her life. The fix was outpatient.",
    body: "I did not realize how much I had been working around the discomfort until it was gone. Vaginal atrophy is a phrase that sounds technical and minor. The reality is that I could not sit comfortably through a long meeting. I dreaded long flights. Underwear chafed in a way that had nothing to do with what I was wearing. Intimacy had become something I avoided because it would set off a week of irritation afterward. I had tried over-the-counter moisturizers and a couple of prescription estrogen creams that helped a little but never solved it. My OB-GYN suggested I just keep using the cream indefinitely. Dr. Berman walked me through what was actually happening at the tissue level — the loss of collagen, vascularization, and elasticity that comes with the drop in estrogen. The recommendation was a series of three MonaLisa Touch laser treatments spaced about a month apart. Each session itself takes maybe five minutes. There is no anesthesia, no real downtime. By the second treatment I noticed the daily friction was gone. By the third, intimacy was comfortable again for the first time in years. We added a maintenance treatment once a year and a low-dose local estrogen cream as backup. The thing I want to tell other women in their fifties is that this is not vanity, it is quality of life. Sitting through a meeting without thinking about it is quality of life.",
    outcome:
      "MonaLisa Touch series of three, low-dose local estrogen maintenance. Daily comfort restored after second treatment.",
    treatedFor: ["Vaginal atrophy", "GSM", "MonaLisa Touch"],
  },
  {
    slug: "patricia-58-westwood",
    patient: { name: "Patricia", age: 58, location: "Westwood" },
    category: "Pelvic & Urinary",
    italicWord: "without",
    headline: "Twenty minutes a week. *Without* surgery.",
    excerpt:
      "Stress incontinence after two pregnancies and twenty-five years of running. She had been told her only options were surgery or pads forever.",
    body: "I have been a runner since college. After my second daughter was born I started having stress incontinence — leakage when I sneezed, leakage on long runs, eventually leakage just standing up too quickly. It got worse through perimenopause. By 56 I was wearing pads daily, which I had quietly accepted as the new normal. My uro-gynecologist offered me a sling procedure. I did not want surgery if there was a less invasive option, particularly because I had read mixed things about the long-term outcomes of mesh procedures. I asked her if there was anything else. She said there was 'electrical stimulation stuff' but she didn't really do that and wasn't sure how well it worked. Dr. Berman's office had Emsella, which is a chair that uses focused electromagnetic energy to do something like 11,000 pelvic floor contractions in a 28-minute session. I did six sessions over three weeks. By the end of the second week I noticed the leakage on runs was gone. By the end of the protocol the daily pad was unnecessary. I do a maintenance session once a quarter. I have not had a leakage episode in over a year. The reason I tell other women about this is that nobody had even mentioned it to me as an option. I don't think most general OB-GYNs are aware of how good the data has gotten on focused electromagnetic stimulation for pelvic floor.",
    outcome:
      "Emsella protocol of six sessions, quarterly maintenance. No leakage episodes for over a year.",
    treatedFor: ["Stress incontinence", "Pelvic floor weakness", "Emsella"],
  },
  {
    slug: "danielle-46-bel-air",
    patient: { name: "Danielle", age: 46, location: "Bel Air" },
    category: "Aesthetic",
    italicWord: "tired",
    headline:
      "She did not want to look younger. She wanted to stop looking *tired.*",
    excerpt:
      "A regenerative protocol from a doctor who would not over-promise. The first thing she said was no to half of what Danielle had asked about.",
    body: "I am a television writer. The schedule is brutal — eighteen-hour days for months at a time. I had reached a point where I looked permanently exhausted, even on weeks off. Hollow under the eyes, slack along the jawline, skin that no longer bounced back. I went to two cosmetic dermatologists before Dr. Berman. Both immediately suggested filler — a lot of filler. I left both consultations feeling vaguely unsettled. I am not opposed to filler in principle but I did not want to walk out looking like a different person, and I did not want to start a treadmill of touch-ups that I would be on for the next twenty years. Dr. Berman's first move was to talk me out of about half of what I had asked about. She explained that a lot of what I was reading as facial tiredness was actually skin-quality decline — collagen and vascularization issues, not volume loss. The protocol she recommended was a regenerative one: PRP microneedling, a peptide-supported skincare routine, an IPL series for the diffuse redness, and conservative use of biostimulators rather than filler. Results were slow, which she had told me to expect — about three months in I started getting comments at work that I looked rested. Six months in I looked like myself, just a more functional version. The thing I valued most was that she was willing to tell me no. The under-eye filler I had asked for she vetoed because I had hollowing pattern that would have looked worse with filler. That kind of restraint is rare.",
    outcome:
      "PRP microneedling, peptide skincare, IPL series, conservative biostimulator. Results visible at three months, refined at six.",
    treatedFor: ["Skin quality", "Regenerative aesthetics", "PRP"],
  },
];
