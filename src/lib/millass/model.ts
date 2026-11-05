export const PROFILE_TYPES = [
  "Athlete",
  "Traveller / Person in movement",
  "Provider",
  "Creator / Media provider",
  "Supporter / Sponsor",
  "Club / Organisation",
  "Founder Member",
  "Other",
] as const;

export const SPORTS = [
  "Running",
  "Trail running",
  "Cycling",
  "Surf",
  "Ski",
  "Snowboard",
  "Polo",
  "Equestrian / Horse riding",
  "Skate",
  "BMX",
  "Climbing",
  "Fitness",
  "Other",
] as const;

export const LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Competitive",
  "Professional",
  "Coach / Instructor",
] as const;

export const LOOKING_FOR = [
  "Meet people to train with",
  "Join sports experiences",
  "Travel with a community",
  "Find coaches or guides",
  "Offer services",
  "Find creative / media support",
  "Support athletes",
  "Receive support for a project",
  "Join a private community",
  "Collaborate with others",
  "Become a founding member",
] as const;

export const OFFERING = [
  "Coaching",
  "Guiding",
  "Local knowledge",
  "Accommodation",
  "Transport",
  "Equipment rental",
  "Video production",
  "Photography",
  "Editing",
  "Graphic design",
  "Community management",
  "Social media strategy",
  "Mentorship",
  "Contacts",
  "Financial support",
  "Volunteer help",
  "Other",
] as const;

export const DESTINATIONS = [
  "Basque Country",
  "Pyrenees",
  "Alps",
  "Chamonix",
  "Dolomites",
  "Portugal coast",
  "Morocco Atlas",
  "Canary Islands",
  "Patagonia",
  "Costa Rica",
  "Bali",
  "Japan Alps",
  "California",
  "Other",
] as const;

export const TRIP_LENGTHS = [
  "Weekend",
  "4–7 days",
  "1–2 weeks",
  "2–4 weeks",
  "Open",
] as const;

export const BUDGETS = [
  "Under €500",
  "€500–1,500",
  "€1,500–3,000",
  "€3,000+",
  "Flexible",
] as const;

export const TRAVEL_COMPANY = ["Alone", "With friends", "Either"] as const;

export const SUPPORT_NEEDS = [
  "Financial",
  "Equipment",
  "Travel",
  "Accommodation",
  "Media",
  "Training",
  "Local contacts",
  "Other",
] as const;

export const PRICING = [
  "Paid",
  "Free",
  "Collaboration-based",
  "Donation-based",
] as const;

export const EXPERIENCES = ["Summer camp", "Club trip", "Gathering"] as const;

export const STATUSES = [
  "New",
  "Reviewed",
  "Accepted",
  "Waitlisted",
  "Rejected",
  "Contacted",
] as const;

export type Status = (typeof STATUSES)[number];

export const POINT_FIELDS = [
  { key: "pointsSport", label: "Sport" },
  { key: "pointsTravel", label: "Travel" },
  { key: "pointsKnowledge", label: "Knowledge" },
  { key: "pointsCommunity", label: "Community" },
  { key: "pointsCreative", label: "Creative / Media" },
] as const;

export type PointKey = (typeof POINT_FIELDS)[number]["key"];

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string;
  country: string;
  languages: string;
  bio: string;
  instagram: string | null;
  website: string | null;
  profileTypes: string[];
  sports: string[];
  sportLevel: string | null;
  lookingFor: string[];
  offering: string[];
  destinations: string[];
  tripLength: string | null;
  budget: string | null;
  travelCompany: string | null;
  experienceInterest: boolean;
  experiences: string[];
  experienceNote: string | null;
  sportGoal: string | null;
  supportNeeds: string[];
  projectDescription: string | null;
  offerDetail: string | null;
  operatesWhere: string | null;
  pricingModel: string | null;
  portfolioUrl: string | null;
  contactConsent: boolean;
  publicPreview: boolean;
  coachVerified: boolean;
  status: Status;
  internalNotes: string;
  tags: string[];
  pointsSport: number;
  pointsTravel: number;
  pointsKnowledge: number;
  pointsCommunity: number;
  pointsCreative: number;
  createdAt: string;
};

export type PublicProfile = {
  id: string;
  fullName: string;
  city: string;
  country: string;
  bio: string;
  instagram: string | null;
  website: string | null;
  profileTypes: string[];
  sports: string[];
  sportLevel: string | null;
  lookingFor: string[];
  offering: string[];
  destinations: string[];
  sportGoal: string | null;
  projectDescription: string | null;
  offerDetail: string | null;
  operatesWhere: string | null;
  portfolioUrl: string | null;
  publicPreview: boolean;
  experienceInterest: boolean;
  coachVerified: boolean;
  pointsTotal: number;
};

export type DeskMetrics = {
  total: number;
  athletes: number;
  providers: number;
  creators: number;
  supporters: number;
  experienceInterest: number;
  sports: { name: string; count: number }[];
  destinations: { name: string; count: number }[];
};

export type ApplicationInput = {
  source: "apply" | "experience";
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  languages: string;
  bio: string;
  instagram: string;
  website: string;
  profileTypes: string[];
  sports: string[];
  sportLevel: string;
  lookingFor: string[];
  offering: string[];
  destinations: string[];
  tripLength: string;
  budget: string;
  travelCompany: string;
  experiences: string[];
  experienceNote: string;
  sportGoal: string;
  supportNeeds: string[];
  projectDescription: string;
  offerDetail: string;
  operatesWhere: string;
  pricingModel: string;
  portfolioUrl: string;
  contactConsent: boolean;
  publicPreview: boolean;
};

export type DeskUpdate = {
  id: string;
  status: Status;
  internalNotes: string;
  tags: string[];
  pointsSport: number;
  pointsTravel: number;
  pointsKnowledge: number;
  pointsCommunity: number;
  pointsCreative: number;
  coachVerified: boolean;
};

export function pointsTotal(
  m: Pick<
    Member,
    | "pointsSport"
    | "pointsTravel"
    | "pointsKnowledge"
    | "pointsCommunity"
    | "pointsCreative"
  >,
): number {
  return (
    m.pointsSport +
    m.pointsTravel +
    m.pointsKnowledge +
    m.pointsCommunity +
    m.pointsCreative
  );
}

export function wantsSupport(m: Pick<Member, "lookingFor" | "supportNeeds">): boolean {
  return (
    m.supportNeeds.length > 0 ||
    m.lookingFor.includes("Receive support for a project") ||
    m.lookingFor.includes("Find coaches or guides") ||
    m.lookingFor.includes("Find creative / media support")
  );
}

export function athleteSeekingSupport(m: Pick<Member, "profileTypes" | "lookingFor" | "supportNeeds">): boolean {
  return (
    m.profileTypes.includes("Athlete") &&
    (m.supportNeeds.length > 0 ||
      m.lookingFor.includes("Receive support for a project"))
  );
}

export function isProviderOrCreator(m: Pick<Member, "profileTypes">): boolean {
  return (
    m.profileTypes.includes("Provider") ||
    m.profileTypes.includes("Creator / Media provider")
  );
}

export function locationOf(m: Pick<Member, "city" | "country">): string {
  return [m.city, m.country].filter(Boolean).join(", ");
}

export function onlyAllowed(values: string[], allowed: readonly string[]): string[] {
  const set = new Set(allowed);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (set.has(value) && !seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function applicationError(input: ApplicationInput): string | null {
  if (input.fullName.trim().length < 2) return "Add your name.";
  if (!EMAIL.test(input.email.trim())) return "Add a valid email.";
  if (!input.city.trim()) return "Add your city.";
  if (!input.country.trim()) return "Add your country.";
  if (!input.contactConsent) return "Agree to be contacted about the private beta.";

  if (input.source === "experience") {
    if (onlyAllowed(input.experiences, EXPERIENCES).length === 0) {
      return "Choose at least one experience.";
    }
    return null;
  }

  if (onlyAllowed(input.profileTypes, PROFILE_TYPES).length === 0) {
    return "Choose at least one profile.";
  }
  if (!input.languages.trim()) return "Add the languages you use.";
  if (input.bio.trim().length < 12) return "Write a short bio.";
  if (onlyAllowed(input.sports, SPORTS).length === 0) return "Choose at least one sport.";
  if (!(LEVELS as readonly string[]).includes(input.sportLevel)) return "Choose a level.";
  if (onlyAllowed(input.lookingFor, LOOKING_FOR).length === 0) {
    return "Choose at least one thing you are looking for.";
  }

  const offers =
    input.profileTypes.includes("Provider") ||
    input.profileTypes.includes("Creator / Media provider");
  if (offers && onlyAllowed(input.offering, OFFERING).length === 0) {
    return "Providers and creators should mark what they offer.";
  }
  if (input.profileTypes.includes("Athlete")) {
    if (!input.sportGoal.trim()) return "Add the sport goal.";
    if (onlyAllowed(input.supportNeeds, SUPPORT_NEEDS).length === 0) {
      return "Mark the support you need.";
    }
    if (input.projectDescription.trim().length < 10) {
      return "Describe the project in a few sentences.";
    }
  }
  if (offers) {
    if (input.offerDetail.trim().length < 10) return "Describe what you offer.";
    if (!input.operatesWhere.trim()) return "Say where you operate.";
    if (!(PRICING as readonly string[]).includes(input.pricingModel)) {
      return "Choose a pricing model.";
    }
    if (!input.portfolioUrl.trim()) return "Add a portfolio or work link.";
  }
  return null;
}

export function blankApplication(): ApplicationInput {
  return {
    source: "apply",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    languages: "",
    bio: "",
    instagram: "",
    website: "",
    profileTypes: [],
    sports: [],
    sportLevel: "",
    lookingFor: [],
    offering: [],
    destinations: [],
    tripLength: "",
    budget: "",
    travelCompany: "",
    experiences: [],
    experienceNote: "",
    sportGoal: "",
    supportNeeds: [],
    projectDescription: "",
    offerDetail: "",
    operatesWhere: "",
    pricingModel: "",
    portfolioUrl: "",
    contactConsent: false,
    publicPreview: false,
  };
}
