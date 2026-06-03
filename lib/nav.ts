export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const SERVICE_CHILDREN: NavChild[] = [
  {
    label: "Aesthetic & Regenerative Medicine",
    href: "/aesthetic-treatments/",
  },
  {
    label: "Sexual Health & Intimacy",
    href: "/sexual-urinary-tract-health/",
  },
  {
    label: "Pelvic Floor & Urinary Health",
    href: "/emsella-treatment-for-incontinence/",
  },
  {
    label: "Menopause & Hormone Therapy",
    href: "/menopause-perimenopause/",
  },
  {
    label: "Vaginal Rejuvenation",
    href: "/vaginal-rejuvenation-expert/",
  },
  {
    label: "Body Contouring & Weight Loss",
    href: "/body-contouring/",
  },
];

const SUPPLEMENTS_LANDING: NavChild = {
  label: "Berman Supplements",
  href: "/services/supplements/",
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  {
    label: "Services",
    href: "/services/",
    children: [...SERVICE_CHILDREN, SUPPLEMENTS_LANDING],
  },
  { label: "Books", href: "/books/" },
  { label: "Biotype", href: "/biotype/" },
  { label: "Stories", href: "/stories/" },
  { label: "Blog", href: "/womens-health-blog/" },
  { label: "Contact", href: "/contact/" },
];

export const FOOTER_QUICK_LINKS: NavChild[] = [
  { label: "Dr. Berman", href: "/about/" },
  { label: "Biotype", href: "/biotype/" },
  { label: "Books", href: "/books/" },
  { label: "Stories", href: "/stories/" },
  { label: "Blog", href: "/womens-health-blog/" },
  { label: "Contact", href: "/contact/" },
];

export const FOOTER_SERVICES: NavChild[] = [
  ...SERVICE_CHILDREN,
  SUPPLEMENTS_LANDING,
];
