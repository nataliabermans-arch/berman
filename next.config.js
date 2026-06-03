const fs = require("node:fs");
const path = require("node:path");
const legacyPageAliases = require("./lib/legacy-page-aliases.json");

/** @type {import('next').NextConfig} */
const legacyRedirects = [
  {
    source: "/a-note-from-dr-jenniferbermanreflectionsandachievements/",
    destination: "/",
    permanent: true,
  },
  {
    source:
      "/addyi-the-pink-pill-for-women-affected-by-hypoactive-sexual-desire-disorder-hsdd/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/aesthetic-treatments/",
    destination: "/services/",
    permanent: true,
  },
  {
    source: "/author/bryan/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/author/drjennb/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/beautifill",
    destination: "/services/body-contouring/",
    permanent: true,
  },
  {
    source: "/beautifill2/",
    destination: "/services/body-contouring/",
    permanent: true,
  },
  {
    source: "/berman-sexual-health/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/bioidentical-hormone-replacement-therapy/",
    destination: "/biote-hormone-therapy/",
    permanent: true,
  },
  {
    source: "/biote-hormone-therapy/",
    destination: "/hormone-therapy/",
    permanent: true,
  },
  {
    source: "/blog/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/body-contouring/",
    destination: "/body-contouring-women-beverly-hills/",
    permanent: true,
  },
  {
    source: "/carboxytherapy-vaginal-rejuvenation-treatment/",
    destination: "/vaginal-rejuvenation-expert/",
    permanent: true,
  },
  {
    source: "/category/anti-aging-treatment/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/arousal/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/beautifull/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/dr-berman-sex-talks/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/dr-jennifer-berman/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/emsculpt/",
    destination: "/emsculpt/",
    permanent: true,
  },
  {
    source: "/category/female-urology/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/guests/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/gynecology/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/health-news/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/hormones/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/lifestyle/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/media-kit/",
    destination: "/media/",
    permanent: true,
  },
  {
    source: "/category/menopausal-health/",
    destination: "/menopause-treatment/",
    permanent: true,
  },
  {
    source: "/category/obstetrics-gynecology/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/poise/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/questions-and-answers/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/sex/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/sexual-health/",
    destination: "/sexual-urinary-tract-health/",
    permanent: true,
  },
  {
    source: "/category/sexual-pain/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/skin-tightening/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/thermiva/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/transcripts/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/vaginal-rejuvenation/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/weight-loss/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/women-health/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/category/womens-health-blog/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source:
      "/customized-hormone-replacement-pellet-therapy-catered-specifically-for-transgender-individuals/",
    destination: "/services/",
    permanent: true,
  },
  {
    source: "/customized-hormone-replacement-pellet-therapy/",
    destination:
      "/customized-hormone-replacement-pellet-therapy-catered-specifically-for-transgender-individuals/",
    permanent: true,
  },
  {
    source: "/dr-bermans-sex-talks/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/dr-jennifer-berman-home-2/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/dr-jennifer-berman-womens-wellness/",
    destination: "/about/",
    permanent: true,
  },
  {
    source: "/emface/",
    destination: "/services/",
    permanent: true,
  },
  {
    source: "/emfemme/",
    destination: "/services/",
    permanent: true,
  },
  {
    source: "/emsculpt-neo/",
    destination: "/body-contouring/",
    permanent: true,
  },
  {
    source: "/emsculpt/",
    destination: "/body-contouring/",
    permanent: true,
  },
  {
    source: "/evolve-body-contouring/",
    destination: "/body-contouring/",
    permanent: true,
  },
  {
    source: "/evolve/",
    destination: "/evolve-body-contouring/",
    permanent: true,
  },
  {
    source: "/experts-guide-anti-ageing-treatment/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/forma-v/",
    destination: "/vaginal-rejuvenation/",
    permanent: true,
  },
  {
    source: "/g-shot/",
    destination: "/sexual-health/",
    permanent: true,
  },
  {
    source: "/hydrafacial-treatment/",
    destination: "/facials/",
    permanent: true,
  },
  {
    source: "/incontinence/",
    destination: "/emsella-treatment-for-incontinence/",
    permanent: true,
  },
  {
    source: "/labiaplasty/",
    destination: "/sexual-health/",
    permanent: true,
  },
  {
    source: "/mbt/",
    destination: "/biotype/",
    permanent: true,
  },
  {
    source: "/media",
    destination: "/blog/",
    permanent: true,
  },
  {
    source: "/media/",
    destination: "/blog/",
    permanent: true,
  },
  {
    source: "/menopause-biotype/",
    destination: "/biotype/",
    permanent: true,
  },
  {
    source: "/menopause-treatment/",
    destination: "/menopause-perimenopause/",
    permanent: true,
  },
  {
    source: "/menopause/",
    destination: "/biotype/",
    permanent: true,
  },
  {
    source: "/o-shot-treatment-for-low-libido-in-females/",
    destination: "/o-shot/",
    permanent: true,
  },
  {
    source: "/o-shot/",
    destination: "/sexual-health/",
    permanent: true,
  },
  {
    source: "/perimenopause-menopause-solutions/",
    destination: "/menopause-perimenopause/",
    permanent: true,
  },
  {
    source: "/sexual-health/",
    destination: "/sexual-urinary-tract-health/",
    permanent: true,
  },
  {
    source: "/testosterone-hormone-replacement-therapy/",
    destination: "/",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-expert",
    destination: "/vaginal-rejuvenation-expert/",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-treatment/",
    destination: "/vaginal-rejuvenation-expert",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation/",
    destination: "/vaginal-rejuvenation-expert/",
    permanent: true,
  },
  {
    source: "/votiva-treatment/",
    destination: "/vaginal-rejuvenation-expert/",
    permanent: true,
  },
  {
    source: "/womens-health-blog/page/2/",
    destination: "/womens-health-blog/",
    permanent: true,
  },
  {
    source: "/facials/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/100-symptoms-of-perimenopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/3d-model-of-the-clitoris-exposes-pleasurable-female-anatomy/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/5-tips-for-achieving-orgasm-through-intercourse/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/66-perimenopause-symptoms-list/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/a-new-front-in-vulvodynia-overlapping-conditions-organizations-share-information/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/a-note-from-dr-jennifer-berman-reflections-and-achievements/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/a-safe-and-effective-cure-for-incontinence/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/access-to-hrt-is-a-civil-right/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/addyi-for-low-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/addyi/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/all-about-breasts/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/alone-at-last-an-excerpt-from-prime/",
    destination: "/#books",
    permanent: true,
  },
  {
    source: "/amberwave-hot-flashes-review/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/androgen-receptor-expression-in-women-and-its-relationship-to-sexual-function/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/announcing-my-partnership-with-plan-b-one-step/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/answers-about-plan-b-1-step/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/anti-aging-treatment/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/anti-aging-treatments-expert-guide/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/antidepressants-and-sexual-side-effects-in-women-insights-with-dr-jennifer-berman/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/aphrodisiac-for-women-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/are-hookups-healthy-an-analysis-by-dr-jennifer-berman/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/average-monthly-cost-bioidentical-hormones/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/aviva-labiaplasty-before-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva-labiaplasty-cost-california/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva-labiaplasty-reviews-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva-plastic-surgery-reviews/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva-procedure-before-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva-scarless-labiaplasty-cost/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/aviva/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/beautifill-laser-assisted-liposuction/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/beautifill/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/becoming-an-influencer-work-panel-featuring-heather-dubrow-dr-berman/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/before-after-o-shot-procedure/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/benefits-bioidentical-hormones-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/benefits-of-meditation-on-your-health-and-sex-life/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/benefits-of-testosterone-for-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/benefits-testosterone-pellets-females/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/berman-tv-show-guests/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/berman-tv-show-transcripts/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/best-cream-for-vaginal-dryness/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/best-doctor-for-oshot/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/best-female-urinary-incontinence-device/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/best-medicine-for-pelvic-pain/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/best-medicine-overactive-bladder-elderly/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/best-natural-estrogen-replacement/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/best-non-invasive-vaginal-rejuvenation/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/best-prescription-medicine-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/best-testosterone-women-weight-loss/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/best-vaginal-dryness-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/best-vaginal-moisturizer/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/beyond-birth-control-new-and-evolving-treatments-for-patients-with-pcos/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/beyond-the-g-spot-where-do-we-go-from-here/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/bio-identical-hormone-expert-beverly-hills/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormone-pellets-vs-creams/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormone-replacement-beverly-hills/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormone-therapy-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormones-cancer-risk/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormones-menopause-symptoms/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormones-pros-cons/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormones-reviews-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-hormones-vs-synthetic/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bioidentical-testosterone-pellets-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/biote-bhrt-restored-hormones-restored-vitality/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/bladder-control-incontinence-guide/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/body-contouring-women-beverly-hills/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/body-image-and-sexual-function-dr-jennifer-bermans-advice/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/body-sculpting-before-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/body-sculpting-fat-melting-cellulite-treatment/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/body-sculpting-for-women-essential-tips-for-women-to-get-toned/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/body-sculpting-non-invasive/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/body-sculpting-post-menopausal-belly/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/book-consultation-perimenopause-treatment/",
    destination: "/#books",
    permanent: true,
  },
  {
    source:
      "/book-excerpt-secrets-of-the-sexually-satisfied-woman-ten-keys-to-unlocking-ultimate-pleasure/",
    destination: "/#books",
    permanent: true,
  },
  {
    source: "/book-g-shot-consultation/",
    destination: "/#books",
    permanent: true,
  },
  {
    source: "/book-morpheus-8-consultation/",
    destination: "/#books",
    permanent: true,
  },
  {
    source: "/breast-cancer-bioidentical-hormone-replacement/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/can-you-talk-to-your-doctor-about-sex/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/causes-of-vaginal-dryness/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/causes-pelvic-pain-women/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/cbd-how-cbd-applies-to-female-sexual-health/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/cbd-tampons-and-how-they-interact-with-our-bodies/",
    destination: "/#supplements",
    permanent: true,
  },
  {
    source: "/cellutone-the-most-powerful-weapon-against-cellulite/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/cellutone/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source:
      "/challenges-faced-by-healthcare-providers-in-the-obstetrical-care-and-management-of-circumcised-women/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/clitoral-hood-reduction/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/cognitive-decline-in-menopausal-women/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/common-causes-of-blood-flow-problems/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/common-causes-of-low-libido-in-men/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/contoura/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/cosmetic-labiaplasty-the-great-ethical-debate/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/cost-of-hormone-pellet-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/could-bioidentical-hormones-be-your-ticket-to-feeling-like-yourself-again/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/create-desire-woman-psychology/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/cybersex-is-it-an-affair-or-harmless-fun/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/do-i-need-hrt-quiz/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/do-you-have-low-sexual-desire-if-so-youre-not-alone/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/does-bcbs-cover-bioidentical-hormone-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/does-body-sculpting-hurt/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/does-cbd-help-sexually/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/does-your-weight-affect-your-sex-life/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/dr-bermans-newest-service-emfemme-360-is-bringing-vaginal-rejuvenation-to-a-new-level/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/dr-bermans-tips-for-adding-pleasure-to-your-sex-life/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/dr-jennifer-berman-discusses-mens-sexual-dysfunction/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/dr-jennifer-berman-discusses-the-use-of-vibrators-to-orgasm-video/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/dr-jennifer-berman-explores-connections/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/dr-jennifer-berman-glp1-weight-loss/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/dr-jennifer-bermans-approach-to-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/drinks-that-increase-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/dropped-bladder-heres-help-for-women-dealing-with-the-problem/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/drugs-that-can-affect-sexual-response/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/dry-before-period-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/dry-itchy-down-there/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/effect-of-hysterectomy-on-female-sexual-function/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/effect-of-sacral-nerve-electrical-stimulation-on-female-sexual-function/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/embracing-your-menopause-journey/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/emotional-well-being-during-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/empowerrf/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/emsculpt-could-be-the-magic-in-your-fitness-routine/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/emsculpt-neo-the-newest-advancement-in-body-sculpting-technology/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/emsculpt-neo-treatment-results/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/emsella-chair-alternative-options/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-benefits-guide/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-beverly-hills/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-cost-breakdown/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-fda-approved/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-for-incontinence/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-near-california/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-reviews-for-prolapse/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-reviews-guide/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-reviews-sexual-health/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-chair-side-effects/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-contraindications-safety/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-for-men/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-treatment-explained/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emsella-treatment-for-incontinence/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/emtone/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/endometriosis-awareness-insights-and-treatments/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/enhancing-romance-through-play-dr-jennifer-bermans-tips/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/estrogen-pellets-side-effects/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/estrogen-side-effects-females/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/everything-you-need-to-know-about-labiaplasty-surgery-recovery-and-expectations/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/everything-you-need-to-know-about-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/experiencing-frequent-pain-after-orgasm-what-remedies-can-i-consider/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/expert-treating-women-testosterone/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/exploring-reasons-for-sexual-compulsions-nothing-to-take-lightly/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/facts-and-myths-about-an-often-unspoken-issue-unconsummated-marriages/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/fda-clears-breast-genetic-activity-cancer-recurrence-test/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/female-arousal-disorder/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-arousal-pills-guide/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-arousal-treatment-los-angeles/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-hormone-tablets-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/female-incontinence-problems-how-do-you-find-the-right-doctor/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/female-low-libido-treatment-beverly-hills/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-low-libido-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-low-libido-treatments/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/female-sexual-dysfunction-definitions-causes-a-potential-treatments/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-sexual-dysfunction/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/female-urinary-incontinence-night/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/female-urology-incontinence/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/feminine-rejuvenation-before-after-cost/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/find-womens-health-specialist/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/first-appointment-related-to-urinary-tract-health-and-or-bladder-leakage/",
    destination: "/#contact",
    permanent: true,
  },
  {
    source: "/fix-dryness-down-there/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/foods-that-boost-libido-instantly/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/forma-v-before-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/four-steps-to-non-hormonal-treatment-of-vaginal-dryness/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/full-body-sculpting-pros-cons/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/g-shot-amplification-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/g-shot-amplification-los-angeles/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/g-shot-benefits-and-risks/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/genistein-hot-flashes/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/genital-herpes-and-its-impact-on-partners/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/ghk-cu-glow-peptide-beverly-hills/",
    destination: "/#supplements",
    permanent: true,
  },
  {
    source: "/healthy-sex-life-with-emsella/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/heaviness-in-pelvic-area/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/hormone-imbalance-treatment-los-angeles/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-pellet-therapy-benefits/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-pellet-therapy-los-angeles/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-pellets-for-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-replacement-therapy-cancer/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-replacement-therapy-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-replacement-therapy-side-effects/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-replacement-therapy-weight-loss/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/hormone-replacement-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-therapy-as-a-treatment-for-brain-shrinkage-in-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-therapy-for-hot-flashes/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-therapy-for-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-therapy-low-libido/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hormone-weight-loss/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/hormones-for-dummies-everything-you-ever-wanted-to-know-but-were-afraid-you-wouldnt-understand/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/hormones-on-the-brain-the-hidden-link-between-your-hormones-focus-and-mental-clarity/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/horrible-perimenopause-symptoms-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-flashes-symptoms-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-flashes-treatment-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-flashes-treatment-los-angeles/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-flashes-treatment-natural-remedies/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-flashes-treatment-over-counter/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/hot-topics-in-sexual-health/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-biote-can-improve-your-life/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/how-can-i-find-a-doctor-to-prescribe-me-fda-approved-treatments-for-fsd/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/how-can-i-get-help-regarding-my-low-sexual-desire/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-do-i-take-care-of-me-in-the-new-economy-a-healthier-you/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/how-does-cancer-affect-womens-sexual-health/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-does-emsella-chair-work/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/how-is-breasfeeding-connected-to-sexual-dysfunction/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-long-body-contouring/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/how-much-does-biote-hormone-pellets-cost/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/how-much-does-g-shot-cost/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-much-does-hrt-cost/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/how-much-does-non-surgical-vaginal-rejuvenation-cost/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-much-does-pt-141-treatment-cost/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-much-is-body-sculpting/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/how-non-invasive-body-sculpting-works/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/how-to-beat-cellulite-the-complete-treatment-guide-2/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/how-to-increase-female-arousal/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/how-to-sit-emsella-chair/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/how-to-stop-female-urine-leakage/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/how-to-talk-to-your-doctor-if-you-are-experiencing-chronic-pelvic-pain/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/how-women-can-deal-with-low-libido-when-on-birth-control/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/hydrafacial-new-best-friend/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/i-experienced-a-rapid-decrease-in-my-sex-drive-any-advice/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/im-just-a-girl-who-cant-say-no-women-consent-and-sex-research/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/incontinence-treatment-options-women/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/increase-female-excitement-naturally/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/increase-female-libido-40/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/increase-female-sensitivity-naturally/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/inmode-forma-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/instant-female-arousal-pills/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/is-aviva-labiaplasty-permanent/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/is-estradiol-bioidentical-or-synthetic/",
    destination: "/#press",
    permanent: true,
  },
  {
    source:
      "/is-it-a-yeast-infection-everything-you-need-to-know-about-yeast-infections-and-vaginitis/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source:
      "/is-it-perimenopause-or-something-else-unraveling-the-mystery-of-midlife-changes/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/is-testosterone-safe-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/lack-of-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/laser-treatment-for-vaginal-dryness/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/leaky-bladder-when-sneezing-women/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/libido-boosting-supplements-females-reviews/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/libido-treatment-women-los-angeles/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/life-from-dr-a-to-z-sex-night-for-parents-with-small-kids-it-can-be-done/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/lifestyle-interventions-for-supporting-brain-health-in-women-withhormone-imbalances/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/lifestyle-strategies-for-managing-menopause-symptoms/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/low-dose-testosterone-for-females/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/low-libido-and-your-relationships/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/low-sex-drive-understanding-and-rekindling-your-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/maintaining-bone-health-during-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/manage-perimenopause-mood-swings/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/managing-menopause-symptoms/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/media-tip-of-the-day/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/media-update/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/media/dr-berman-featured-on-buzzfeed/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/media/dr-berman-visits-conan-as-resident-sex-expert/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/media/dr-jennifer-berman-on-the-doctors-tv-show/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/media/tips-of-the-day/",
    destination: "/#press",
    permanent: true,
  },
  {
    source:
      "/medical-non-medical-therapies-for-female-sexual-dysfunction-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/menopausal-weight-gain-doesnt-have-to-be-your-reality/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/menopause-and-heart-health/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/menopause-and-your-sex-life/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/menopause-expert-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/menopause-myths-vs-facts/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/menopause-perimenopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/menopause-relief-hormone-replacement-therapy-pros-cons/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/modern-concepts-in-breast-reconstruction/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/more-than-just-an-excuse-no-thanks-im-not-in-the-mood/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus-8-before-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus-8-skin-tightening/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/morpheus-8-v/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus8-healing-stages-timeline/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus8-microneedling-cost/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus8-reclaiming-vitality-skin-intimate-wellness/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/morpheus8-recovery-pictures/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/morpheus8-rejuvenate-your-skin-naturally/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/morpheus8-vs-ultherapy-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/natural-treatments-for-vaginal-dryness-and-atrophy/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/natural-ways-to-increase-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/navigating-sexual-health-during-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/navigating-sexual-health-in-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/neuroprotective-benefits-of-estrogen-in-womens-brain-health/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/new-study-shows-how-womens-sex-life-declines-post-menopause/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/non-invasive-body-sculpting-guide/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/non-surgical-vaginal-rejuvenation-guide/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/ob-gyn/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/oriental-medicine-and-sexual-dysfunctions/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/painful-intercourse-a-physical-therapy-approach-to-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/painful-sex-causes-solutions-and-reclaiming-pleasure/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/painful-sex-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/pause-tm-for-a-change-acog-issues-newly-revised-menopause-magazine/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/pelvic-pain-treatment/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/pelvic-trauma-and-your-sex-life-understanding-how-one-affects-the-other/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/peptide-therapy-expert-women/",
    destination: "/#supplements",
    permanent: true,
  },
  {
    source: "/peptides-plus-hrt-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/perimenopause-age-stages-signs-symptoms-treatment/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/perimenopause-and-weight-gainperimenopause-and-weight-gainperimenopause-and-weight-gain/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/perimenopause-weight-loss-beverly-hills/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/poise-impressa-for-stress-urinary-incontinence/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/poise/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/post-menopausal-health-concerns/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/postmarket-drug-safety-information-for-patients-and-providers/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/preparing-for-perimenopause-menopause-symptoms/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/prescription-drug-treatment-for-female-sexual-dysfunction/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/primary-wave-grammy-party/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/privacy-policy/",
    destination: "/privacy/",
    permanent: true,
  },
  {
    source: "/pros-cons-hormone-pellets/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/psychology-of-female-arousal/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/pt-141-for-low-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/pt-141-nose-spray/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/pt-141-peptide-guide/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/q-a-breastfeeding-dysfunction/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source:
      "/research-provides-new-insights-into-decreases-in-sexual-activity-after-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/research-smart-and-endodna-announce-strategic-collaboration-to-advance-precision-wellness-in-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/resources-for-menopausal-women/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source:
      "/revolutionary-beautifill-and-how-it-differs-from-traditional-liposuction-procedures/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/sex-dryness-solutions-for-treating-vaginal-dryness/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/sexual-health-exam/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/sexual-side-effects-potential-treatment-strategies-of-ssri-medications-for-depression/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/sexual-urinary-tract-health/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/signs-of-female-arousal/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/signs-perimenopause-is-ending/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/signs-too-much-bioidentical-progesterone/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/sitemap/",
    destination: "/sitemap.xml",
    permanent: true,
  },
  {
    source: "/skin-tightening/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/sleepless-in-perimenopause-understanding-and-overcoming-nighttime-struggles/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/sling-surgery-is-more-effective-than-burch-for-bladder-control-in-women/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/stem-cells-and-exosomes-a-new-era-of-hair-restoration-for-menopausal-women/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/stress-how-to-deal-with-it-and-actually-beat-it/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/stress-incontinence-treatment-medication/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/stress-urinary-incontinence-during-the-holidays/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/study-finds-womanizer-first-sex-toy-to-effectively-treat-women-with-orgasmic-difficulty/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/study-of-viagra-in-post-menopausal-women/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source:
      "/study-osteoporosis-drug-raloxifene-shown-to-be-as-effective-as-tamoxifen-in-preventing-invasive-breast-cancer/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/study-sheds-new-light-on-intimate-lives-of-older-americans/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/sudden-stabbing-pelvic-pain-treatment/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/superfoods-cleanse/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/symptoms-perimenopause-at-44/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/talking-sex-heather-dubrow/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/terms-of-use/",
    destination: "/terms/",
    permanent: true,
  },
  {
    source: "/testosterone-dosage-women-weekly/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-for-women-dosing/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-for-women-guide/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-for-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-therapy-menopausal-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-therapy-women-cost/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/testosterone-treatment-breast-cancer-la/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/the-benefits-of-bioidentical-hormone-pellet-therapy-ec/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/the-benefits-of-biote-bioidentical-hormone-pellet-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/the-benefits-of-pelvic-floor-physical-therapy-for-women/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/the-best-anti-aging-skin-treatments/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/the-best-way-to-treat-stress-urinary-incontinence/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/the-bhrt-balancing-act-can-bioidentical-hormones-help-with-weight-loss/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source:
      "/the-body-in-transition-understanding-what-happens-during-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/the-emotional-rollercoaster-understanding-and-managing-mood-swings-in-perimenopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/the-importance-of-estrogen-in-womens-brain-health/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/the-menopause-biotype-test-what-it-is-how-it-works-and-why-every-woman-needs-to-know/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/the-perimenopausal-puzzle-unveiling-the-duration-of-this-transitional-phase/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/the-second-sexual-revolution-ny-times-feature/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/the-secret-all-in-one-aphrodisiac-sexual-arousal-enhancer-and-intimacy-enhancer/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/the-spark-and-the-flame-maintaining-a-healthy-relationship-and-libido/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/the-use-of-physical-therapy-in-treatment-for-endometriosis/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/thermiva-by-dr-berman/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/thermiva/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/thriving-in-menopause-and-beyond/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/tighten-loose-skin-without-surgery/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/top-menopause-expert-beverly-hills/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/treatment-for-low-libido-in-females/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/treatment-for-women-testosterone/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/treatments-to-revive-and-restore-hormones-during-perimenopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/twenty-tips-for-keeping-your-romance-hot/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/understanding-female-sexual-dysfunction-a-guide-to-empowerment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/understanding-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/understanding-the-menopause-biotype/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/update-on-the-female-condom/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/urinary-incontinence-treatment/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source:
      "/use-of-testosterone-in-woman-to-enhance-sex-drive-is-questioned-in-jama-article/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/v-tone/",
    destination: "/v-tone-pelvic-floor/",
    permanent: true,
  },
  {
    source: "/v-tightening-laser-treatment-cost/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/v-tone-pelvic-floor/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/vaginal-dryness-and-its-impact-on-everyday-life/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-dryness-causes-moisturizing-treatments/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-dryness-treatment/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-moisturizer-suppositories-guide/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-probiotics-a-natural-approach-to-balancing-your-body/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-expert/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-it-may-not-be-what-you-think/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-laser-cost/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/vaginal-rejuvenation-procedure-guide/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/votiva-treatment-side-effects/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/vtone-before-and-after/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/vyleesi-hsdd-treatment/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/weight-loss-expert-beverly-hills/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/weight-loss-program/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/weight-loss-treatment/",
    destination: "/#aesthetics",
    permanent: true,
  },
  {
    source: "/what-15-minutes-of-votiva-can-do-for-your-sex-life/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/what-are-bioidentical-hormones-made-from/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/what-are-my-options-for-fsd-treatment/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/what-happened-to-my-body-the-symptoms-of-menopause/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/what-impact-does-stress-and-depression-have-on-sexual-functions/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/what-is-an-orgasmic-disorder/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/what-is-bio-identical-hrt-therapy-and-how-can-it-help-you/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/what-is-female-desire/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/what-is-normal-womens-sexual-health/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/which-is-safer-vaginal-delivery-or-c-section/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source:
      "/whos-a-good-fit-for-bioidentical-hormone-replacement-therapy-bhrt-exploring-your-options/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source:
      "/why-are-testosterone-levels-high-but-libido-and-energy-still-low/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/why-i-chose-an-elective-c-section-part-i/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/why-i-chose-an-elective-c-section-part-ii/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/why-utis-occur-after-sex-and-remedies/",
    destination: "/#pelvic",
    permanent: true,
  },
  {
    source: "/why-vaginismus-is-difficult-to-diagnose/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/woman-takes-testosterone-supplements/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/women-testosterone-its-secret-role-in-women/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/womens-health-blog/",
    destination: "/#blog",
    permanent: true,
  },
  {
    source: "/womens-health-initiative-hormone-therapy/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/womens-health-initiative-hrt/",
    destination: "/#menopause",
    permanent: true,
  },
  {
    source: "/womens-low-sex-drive-what-to-do-to-fix-it/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/womens-sexual-health-issues-hit-home/",
    destination: "/#sexual",
    permanent: true,
  },
  {
    source: "/womens-weight-loss-expert-losangeles/",
    destination: "/#aesthetics",
    permanent: true,
  },
];

const redirectOnlyMigratedSlugs = new Set();

const launchRedirects = [
  {
    source: "/sexual-urinary-tract-health/",
    destination: "/services/sexual-health/",
    permanent: true,
  },
  {
    source: "/emsella-treatment-for-incontinence/",
    destination: "/services/pelvic-urinary/",
    permanent: true,
  },
  {
    source: "/menopause-perimenopause/",
    destination: "/services/menopause-hormones/",
    permanent: true,
  },
  {
    source: "/body-contouring/",
    destination: "/services/body-contouring/",
    permanent: true,
  },
  {
    source: "/press/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/conan/",
    destination: "/#press",
    permanent: true,
  },
  {
    source: "/about/wellness-center/",
    destination: "/about/",
    permanent: true,
  },
  {
    source: "/bio-identical-hormone-expert/",
    destination: "/bio-identical-hormone-expert-beverly-hills/",
    permanent: true,
  },
  {
    source: "/bio-identical-hormone-therapy/",
    destination: "/bioidentical-hormone-therapy-women/",
    permanent: true,
  },
  {
    source: "/cbd-how-it-applies-to-female-sexual-health/",
    destination: "/cbd-how-cbd-applies-to-female-sexual-health/",
    permanent: true,
  },
  {
    source: "/cbd-oil-and-sexual-health-benefits/",
    destination: "/cbd-how-cbd-applies-to-female-sexual-health/",
    permanent: true,
  },
  {
    source: "/cbd-oil/",
    destination: "/cbd-how-cbd-applies-to-female-sexual-health/",
    permanent: true,
  },
  {
    source: "/low-libido/",
    destination: "/treatment-for-low-libido-in-females/",
    permanent: true,
  },
  {
    source: "/menopause-expert/",
    destination: "/top-menopause-expert-beverly-hills/",
    permanent: true,
  },
  {
    source: "/natural-alternative-hrt/",
    destination: "/services/menopause-hormones/",
    permanent: true,
  },
  {
    source: "/vaginal-dryness/",
    destination: "/vaginal-dryness-treatment/",
    permanent: true,
  },
  {
    source: "/virtual-consultation/",
    destination: "/contact/",
    permanent: true,
  },
];

const preservedRouteSources = new Set([
  "/services",
  "/services/",
  "/womens-health-blog",
  "/womens-health-blog/",
]);

const legacyExactPageSources = new Set(
  legacyPageAliases.map((alias) => sourcePath(alias.path)),
);

function sourceSlug(source) {
  return source.replace(/^\/+/, "").replace(/\/+$/, "");
}

function sourcePath(source) {
  const slug = sourceSlug(source);
  return slug ? `/${slug}` : "/";
}

function loadMigratedContentSlugs() {
  const slugs = new Set();
  const manifestPath = path.join(
    process.cwd(),
    "lib",
    "journal",
    "manifest.json",
  );
  try {
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (manifest && Array.isArray(manifest.posts)) {
        for (const post of manifest.posts) {
          if (
            post &&
            typeof post.slug === "string" &&
            post.slug.length > 0 &&
            !redirectOnlyMigratedSlugs.has(post.slug)
          ) {
            slugs.add(post.slug);
          }
        }
      }
    }
  } catch {
    // Keep redirects generation resilient even if the generated manifest is stale.
  }

  const contentDir = path.join(process.cwd(), "content", "journal");
  try {
    if (fs.existsSync(contentDir)) {
      for (const file of fs.readdirSync(contentDir)) {
        if (!file.endsWith(".md")) continue;
        const slug = file.replace(/\.md$/, "");
        if (slug && !redirectOnlyMigratedSlugs.has(slug)) {
          slugs.add(slug);
        }
      }
    }
  } catch {
    // A content directory read failure should not block the build.
  }

  return slugs;
}

function getLaunchRedirects() {
  const migratedContentSlugs = loadMigratedContentSlugs();
  const launchSources = new Set(launchRedirects.map((rule) => rule.source));
  const toFinalDestination = (rule) => ({
    ...rule,
    source: sourcePath(rule.source),
    destination: rule.destination,
  });

  const redirects = [
    ...launchRedirects.filter(
      (rule) => !legacyExactPageSources.has(sourcePath(rule.source)),
    ),
    ...legacyRedirects.filter((rule) => {
      const normalizedSource = sourcePath(rule.source);
      if (launchSources.has(rule.source)) return false;
      if (preservedRouteSources.has(rule.source)) return false;
      if (legacyExactPageSources.has(normalizedSource)) return false;
      if (normalizedSource.startsWith("/category/")) return false;
      if (normalizedSource.startsWith("/womens-health-blog/page/")) {
        return false;
      }
      return !migratedContentSlugs.has(sourceSlug(rule.source));
    }).map(toFinalDestination),
  ].map(toFinalDestination);

  const seenSources = new Set();
  return redirects.filter((rule) => {
    if (seenSources.has(rule.source)) return false;
    seenSources.add(rule.source);
    return true;
  });
}

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [],
  },
  async redirects() {
    return getLaunchRedirects();
  },
  async headers() {
    return [
      {
        source: "/video/sizzle-mobile-v1.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/video/sizzle-poster-v1.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/video/sizzle-desktop-v1.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/video/welcome-v1.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
