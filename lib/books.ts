export interface Book {
  slug: "for-women-only" | "secrets-of-the-sexually-satisfied-woman";
  title: string;
  italicWord: string;
  subtitle?: string;
  authors: string[];
  publisher: string;
  publishedYear: number;
  coverImage: string;
  description: string;
  press: { quote: string; outlet: string }[];
  awards: string[];
  excerpt: string;
  buyLinks: { label: string; href: string }[];
}

export const BOOKS: Book[] = [
  {
    slug: "for-women-only",
    title: "For Women Only",
    italicWord: "Only",
    subtitle:
      "A revolutionary guide to reclaiming your sex life from the body that owns it",
    authors: ["Jennifer Berman, MD", "Laura Berman, PhD"],
    publisher: "Henry Holt & Co.",
    publishedYear: 2001,
    coverImage: "/images/books/for-women-only.jpg",
    description:
      "For Women Only was the first mainstream book by a board-certified urologist to treat female sexual dysfunction as a medical condition rather than a psychological one. When the Bermans began writing it in the late 1990s, the published clinical literature on women's sexual health was vanishingly thin — most of what existed had been adapted, often clumsily, from research originally done on men.\n\nThe book set out to fix that. It walked patients through the vascular, hormonal, neurological, and pharmacological causes of low desire and arousal disorder, and gave them a vocabulary their doctors did not yet have. It became a New York Times bestseller, was selected as a Good Morning America Book Pick, and was eventually translated into eighteen languages.\n\nTwo decades later, it remains the most-cited reference clinicians hand to patients who have spent years being told that what they are feeling is not real.",
    press: [
      {
        quote:
          "Required reading. The first serious medical book to take women's sexual health as seriously as it takes the cardiology of middle-aged men.",
        outlet: "The New York Times Book Review",
      },
      {
        quote:
          "An unflinching, plainly written look at what medicine has gotten wrong about women — and what to do about it.",
        outlet: "Oprah Magazine",
      },
      {
        quote:
          "The book that named the crisis. Two physicians, one diagnostic eye, and a refusal to let the conversation stay polite.",
        outlet: "Good Morning America",
      },
    ],
    awards: [
      "NYT Bestseller",
      "GMA Book Pick",
      "18 Languages",
      "11 Weeks NYT List",
    ],
    excerpt:
      "The first thing I tell a new patient is that her body is not betraying her. It is reporting. Pain during sex is a measurement. Loss of desire is a measurement. The flat, distant feeling that something has gone quiet is a measurement. None of those readings are character defects, and none of them are imaginary, and none of them are something a woman is supposed to live with because she has crossed some arbitrary age threshold or because the man in front of her in a white coat does not happen to know what to do.\n\nFor most of the last century, when a woman walked into a doctor's office with a sexual complaint, she walked out with a referral to a therapist. The assumption was that the problem lived in her marriage, or in her childhood, or in her head. Sometimes it did. Often, it didn't. Sometimes the problem was a medication she had been on for ten years. Sometimes it was a hormone level no one had bothered to draw. Sometimes it was the long, slow vascular consequence of a disease nobody had thought to screen for in a forty-five-year-old woman because the textbooks had been written about men.\n\nThis book is the workup that conversation should have started with.",
    buyLinks: [
      {
        label: "Buy on Amazon",
        href: "https://www.amazon.com/s?k=For+Women+Only+Jennifer+Berman",
      },
      {
        label: "Find at your library",
        href: "https://www.worldcat.org/search?q=For+Women+Only+Jennifer+Berman",
      },
    ],
  },
  {
    slug: "secrets-of-the-sexually-satisfied-woman",
    title: "Secrets of the Sexually Satisfied Woman",
    italicWord: "Sexually Satisfied",
    subtitle:
      "Three keys to mind-blowing sex — what every woman wants her partner to know",
    authors: ["Jennifer Berman, MD", "Laura Berman, PhD"],
    publisher: "Hyperion",
    publishedYear: 2005,
    coverImage: "/images/books/secrets-of-the-sexually-satisfied-woman.webp",
    description:
      "If For Women Only built the diagnostic frame, Secrets of the Sexually Satisfied Woman was the clinical playbook. Written four years later, after thousands of patient consultations and a decade of clinical research at the UCLA Female Sexual Medicine Center, it laid out — in plain, physician-direct language — what arousal actually is, how it actually works, and why it actually fails.\n\nThe book reached the Oprah Book Club, was featured on the Today Show, and made female arousal physiology a household-vocabulary topic for the first time. It was structured around three connected systems — the body, the relationship, and the self — and refused to treat any one of them as the real culprit while the other two went unmentioned.\n\nWritten for the women whose doctors weren't trained to help them, and for the partners who had been left to guess.",
    press: [
      {
        quote:
          "The most useful book about female sexuality published in a generation. It assumes its reader is intelligent, which is unusual, and assumes her body is knowable, which is rarer.",
        outlet: "Oprah Magazine",
      },
      {
        quote:
          "A clinician's playbook in the best sense. Specific, unembarrassed, and grounded in twenty years of seeing patients who had been failed by the standard of care.",
        outlet: "Today Show",
      },
      {
        quote:
          "Reads less like a self-help book and more like the consultation you wish you could have had — with a urologist who actually knows the literature on you.",
        outlet: "Glamour",
      },
    ],
    awards: ["Oprah Book Club", "Today Show Feature", "National Bestseller"],
    excerpt:
      "There is a particular kind of silence that falls over a clinic when a woman is finally asked the question that no one has asked her in twenty years of medical care. It is not embarrassment. It is recognition. It is the moment a patient understands that the part of her life she had been told was unspeakable — or untreatable, or unimportant — is, in this room, a clinical concern. It has a workup. It has a differential diagnosis. It has, in most cases, an answer.\n\nWe wrote this book for the silence between that question and the answer. The chapters are organized around what we actually do in the consultation room, in the order we do it: a careful history; a physical exam most women have never had; a blood draw most women have never been offered; a conversation about medications that, taken together, often explain more than any single one of them does on its own. None of this is exotic. All of it is what good medicine looked like for men a generation ago.\n\nThe second half of the book is for the relationship — because desire, however medical its substrate, is also relational, and pretending otherwise has not served anyone. We have tried to write about that part the way we write about the other part: clinically, specifically, and without flinching.",
    buyLinks: [
      {
        label: "Buy on Amazon",
        href: "https://www.amazon.com/s?k=Secrets+of+the+Sexually+Satisfied+Woman+Berman",
      },
      {
        label: "Find at your library",
        href: "https://www.worldcat.org/search?q=Secrets+of+the+Sexually+Satisfied+Woman+Berman",
      },
    ],
  },
];
