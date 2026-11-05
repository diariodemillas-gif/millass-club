import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import {
  BUDGETS,
  DESTINATIONS,
  EXPERIENCES,
  LEVELS,
  LOOKING_FOR,
  OFFERING,
  PRICING,
  PROFILE_TYPES,
  SPORTS,
  STATUSES,
  SUPPORT_NEEDS,
  TRAVEL_COMPANY,
  TRIP_LENGTHS,
  applicationError,
  onlyAllowed,
  pointsTotal,
  type ApplicationInput,
  type DeskMetrics,
  type DeskUpdate,
  type Member,
  type PublicProfile,
  type Status,
} from "@/lib/millass/model";
import { SEED, type SeedRecord } from "@/lib/millass/seed";

const textList = z.array(z.string().max(80)).max(20);

const applicationValidator = z.object({
  source: z.enum(["apply", "experience"]),
  fullName: z.string().max(120),
  email: z.string().max(200),
  phone: z.string().max(40),
  city: z.string().max(80),
  country: z.string().max(80),
  languages: z.string().max(200),
  bio: z.string().max(800),
  instagram: z.string().max(160),
  website: z.string().max(300),
  profileTypes: textList,
  sports: textList,
  sportLevel: z.string().max(40),
  lookingFor: textList,
  offering: textList,
  destinations: textList,
  tripLength: z.string().max(40),
  budget: z.string().max(40),
  travelCompany: z.string().max(40),
  experiences: textList,
  experienceNote: z.string().max(600),
  sportGoal: z.string().max(300),
  supportNeeds: textList,
  projectDescription: z.string().max(1200),
  offerDetail: z.string().max(800),
  operatesWhere: z.string().max(200),
  pricingModel: z.string().max(40),
  portfolioUrl: z.string().max(300),
  contactConsent: z.boolean(),
  publicPreview: z.boolean(),
});

const updateValidator = z.object({
  id: z.string().min(1).max(80),
  status: z.string().max(40),
  internalNotes: z.string().max(4000),
  tags: z.array(z.string().max(32)).max(12),
  pointsSport: z.number().int().min(0).max(20),
  pointsTravel: z.number().int().min(0).max(20),
  pointsKnowledge: z.number().int().min(0).max(20),
  pointsCommunity: z.number().int().min(0).max(20),
  pointsCreative: z.number().int().min(0).max(20),
  coachVerified: z.boolean(),
});

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string");
    } catch {
      return [];
    }
  }
  return [];
}

function asNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function oneOf(value: string, allowed: readonly string[]): string | null {
  const trimmed = value.trim();
  return allowed.includes(trimmed) ? trimmed : null;
}

function cleanLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type Stored = ApplicationInput & {
  id: string;
  status: Status;
  internalNotes: string;
  tags: string[];
  pointsSport: number;
  pointsTravel: number;
  pointsKnowledge: number;
  pointsCommunity: number;
  pointsCreative: number;
  daysAgo: number;
};

function normalizeInput(input: ApplicationInput, id: string): Stored {
  const athlete = input.profileTypes.includes("Athlete");
  const offers =
    input.profileTypes.includes("Provider") ||
    input.profileTypes.includes("Creator / Media provider");
  const experiences = onlyAllowed(input.experiences, EXPERIENCES);
  const experienceNote = input.experienceNote.trim();
  const experienceInterest = experiences.length > 0 || experienceNote.length > 0;
  const bio =
    input.bio.trim() ||
    experienceNote ||
    (input.source === "experience" ? "Registered interest in future Millass experiences." : "");

  return {
    ...input,
    id,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    languages: input.languages.trim(),
    bio,
    instagram: input.instagram.trim(),
    website: input.website.trim(),
    profileTypes: onlyAllowed(input.profileTypes, PROFILE_TYPES),
    sports: onlyAllowed(input.sports, SPORTS),
    sportLevel: oneOf(input.sportLevel, LEVELS) ?? "",
    lookingFor: onlyAllowed(input.lookingFor, LOOKING_FOR),
    offering: onlyAllowed(input.offering, OFFERING),
    destinations: onlyAllowed(input.destinations, DESTINATIONS),
    tripLength: oneOf(input.tripLength, TRIP_LENGTHS) ?? "",
    budget: oneOf(input.budget, BUDGETS) ?? "",
    travelCompany: oneOf(input.travelCompany, TRAVEL_COMPANY) ?? "",
    experiences,
    experienceNote,
    sportGoal: athlete ? input.sportGoal.trim() : "",
    supportNeeds: athlete ? onlyAllowed(input.supportNeeds, SUPPORT_NEEDS) : [],
    projectDescription: athlete ? input.projectDescription.trim() : "",
    offerDetail: offers || input.offerDetail.trim() ? input.offerDetail.trim() : "",
    operatesWhere: input.operatesWhere.trim(),
    pricingModel: oneOf(input.pricingModel, PRICING) ?? "",
    portfolioUrl: input.portfolioUrl.trim(),
    contactConsent: input.contactConsent,
    publicPreview: input.publicPreview,
    status: "New",
    internalNotes: "",
    tags: input.source === "experience" ? ["experience-interest"] : [],
    pointsSport: 0,
    pointsTravel: 0,
    pointsKnowledge: 0,
    pointsCommunity: 0,
    pointsCreative: 0,
    daysAgo: 0,
  };
}

function fromSeed(seed: SeedRecord): Stored {
  const normalized = normalizeInput(seed, seed.id);
  return {
    ...normalized,
    status: seed.status,
    internalNotes: seed.internalNotes,
    tags: seed.tags,
    pointsSport: seed.pointsSport,
    pointsTravel: seed.pointsTravel,
    pointsKnowledge: seed.pointsKnowledge,
    pointsCommunity: seed.pointsCommunity,
    pointsCreative: seed.pointsCreative,
    daysAgo: seed.daysAgo,
  };
}

async function insertRecord(sql: Sql, record: Stored): Promise<void> {
  const experienceInterest =
    record.experiences.length > 0 || record.experienceNote.trim().length > 0;
  await sql`
    insert into applications (
      id, full_name, email, phone, city, country, languages, bio, instagram, website,
      profile_types, sports, sport_level, looking_for, offering, destinations,
      trip_length, budget, travel_company, experience_interest, experiences, experience_note,
      sport_goal, support_needs, project_description, offer_detail, operates_where,
      pricing_model, portfolio_url, contact_consent, public_preview, status, internal_notes,
      tags, points_sport, points_travel, points_knowledge, points_community, points_creative,
      created_at, updated_at
    ) values (
      ${record.id},
      ${record.fullName},
      ${record.email},
      ${record.phone || null},
      ${record.city},
      ${record.country},
      ${record.languages},
      ${record.bio},
      ${record.instagram || null},
      ${cleanLink(record.website)},
      ${JSON.stringify(record.profileTypes)}::jsonb,
      ${JSON.stringify(record.sports)}::jsonb,
      ${record.sportLevel || null},
      ${JSON.stringify(record.lookingFor)}::jsonb,
      ${JSON.stringify(record.offering)}::jsonb,
      ${JSON.stringify(record.destinations)}::jsonb,
      ${record.tripLength || null},
      ${record.budget || null},
      ${record.travelCompany || null},
      ${experienceInterest},
      ${JSON.stringify(record.experiences)}::jsonb,
      ${record.experienceNote || null},
      ${record.sportGoal || null},
      ${JSON.stringify(record.supportNeeds)}::jsonb,
      ${record.projectDescription || null},
      ${record.offerDetail || null},
      ${record.operatesWhere || null},
      ${record.pricingModel || null},
      ${cleanLink(record.portfolioUrl)},
      ${record.contactConsent},
      ${record.publicPreview},
      ${record.status},
      ${record.internalNotes},
      ${JSON.stringify(record.tags)}::jsonb,
      ${record.pointsSport},
      ${record.pointsTravel},
      ${record.pointsKnowledge},
      ${record.pointsCommunity},
      ${record.pointsCreative},
      now() - (${record.daysAgo}::int * interval '1 day'),
      now() - (${record.daysAgo}::int * interval '1 day')
    )
    on conflict (id) do nothing
  `;
}

let seedPromise: Promise<void> | null = null;

async function ensureSeed(sql: Sql): Promise<void> {
  for (const seed of SEED) {
    await insertRecord(sql, fromSeed(seed));
  }
  await sql`
    update applications
    set coach_verified = true
    where id = 'mara-okonkwo' and coach_verified = false
  `;
}

function ready(sql: Sql): Promise<void> {
  seedPromise ??= ensureSeed(sql).catch((err) => {
    seedPromise = null;
    throw err;
  });
  return seedPromise;
}

function toMember(row: Record<string, unknown>): Member {
  const status = asText(row.status) ?? "New";
  return {
    id: String(row.id ?? ""),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: asText(row.phone),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    languages: String(row.languages ?? ""),
    bio: String(row.bio ?? ""),
    instagram: asText(row.instagram),
    website: asText(row.website),
    profileTypes: asArray(row.profile_types),
    sports: asArray(row.sports),
    sportLevel: asText(row.sport_level),
    lookingFor: asArray(row.looking_for),
    offering: asArray(row.offering),
    destinations: asArray(row.destinations),
    tripLength: asText(row.trip_length),
    budget: asText(row.budget),
    travelCompany: asText(row.travel_company),
    experienceInterest: asBool(row.experience_interest),
    experiences: asArray(row.experiences),
    experienceNote: asText(row.experience_note),
    sportGoal: asText(row.sport_goal),
    supportNeeds: asArray(row.support_needs),
    projectDescription: asText(row.project_description),
    offerDetail: asText(row.offer_detail),
    operatesWhere: asText(row.operates_where),
    pricingModel: asText(row.pricing_model),
    portfolioUrl: asText(row.portfolio_url),
    contactConsent: asBool(row.contact_consent),
    publicPreview: asBool(row.public_preview),
    coachVerified: asBool(row.coach_verified),
    status: (STATUSES as readonly string[]).includes(status) ? (status as Status) : "New",
    internalNotes: String(row.internal_notes ?? ""),
    tags: asArray(row.tags),
    pointsSport: asNumber(row.points_sport),
    pointsTravel: asNumber(row.points_travel),
    pointsKnowledge: asNumber(row.points_knowledge),
    pointsCommunity: asNumber(row.points_community),
    pointsCreative: asNumber(row.points_creative),
    createdAt: String(row.created_at ?? ""),
  };
}

function toPublic(member: Member): PublicProfile {
  return {
    id: member.id,
    fullName: member.fullName,
    city: member.city,
    country: member.country,
    bio: member.bio,
    instagram: member.instagram,
    website: member.website,
    profileTypes: member.profileTypes,
    sports: member.sports,
    sportLevel: member.sportLevel,
    lookingFor: member.lookingFor,
    offering: member.offering,
    destinations: member.destinations,
    sportGoal: member.sportGoal,
    projectDescription: member.projectDescription,
    offerDetail: member.offerDetail,
    operatesWhere: member.operatesWhere,
    portfolioUrl: member.portfolioUrl,
    publicPreview: member.publicPreview,
    experienceInterest: member.experienceInterest,
    coachVerified: member.coachVerified,
    pointsTotal: pointsTotal(member),
  };
}

function rank(lists: string[][], limit = 8): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    for (const name of list) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

const MEMBER_SQL = `
  select
    id, full_name, email, phone, city, country, languages, bio, instagram, website,
    profile_types, sports, sport_level, looking_for, offering, destinations,
    trip_length, budget, travel_company, experience_interest, experiences, experience_note,
    sport_goal, support_needs, project_description, offer_detail, operates_where,
    pricing_model, portfolio_url, contact_consent, public_preview, coach_verified, status, internal_notes,
    tags, points_sport, points_travel, points_knowledge, points_community, points_creative,
    to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
  from applications
`;

export const submitApplication = createServerFn({ method: "POST" })
  .validator(applicationValidator)
  .handler(async ({ data }) => {
    const input = data as ApplicationInput;
    const message = applicationError(input);
    if (message) throw new Error(message);
    const sql = await getSql();
    await ready(sql);
    const id = crypto.randomUUID();
    try {
      await insertRecord(sql, normalizeInput(input, id));
    } catch (err) {
      console.error("[millass] submit failed", err);
      throw new Error("The application did not go through. Try again.");
    }
    return { id };
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data }): Promise<PublicProfile | null> => {
    const sql = await getSql();
    await ready(sql);
    const rows = await sql.query<Record<string, unknown>>(
      `${MEMBER_SQL} where id = $1`,
      [data.id],
    );
    const row = rows[0];
    if (!row) return null;
    return toPublic(toMember(row));
  });

export const getDesk = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ members: Member[]; metrics: DeskMetrics }> => {
    const sql = await getSql();
    await ready(sql);
    const rows = await sql.query<Record<string, unknown>>(
      `${MEMBER_SQL} order by created_at desc`,
    );
    const members = rows.map(toMember);
    const metrics: DeskMetrics = {
      total: members.length,
      athletes: members.filter((m) => m.profileTypes.includes("Athlete")).length,
      providers: members.filter((m) => m.profileTypes.includes("Provider")).length,
      creators: members.filter((m) => m.profileTypes.includes("Creator / Media provider")).length,
      supporters: members.filter((m) => m.profileTypes.includes("Supporter / Sponsor")).length,
      experienceInterest: members.filter((m) => m.experienceInterest).length,
      sports: rank(members.map((m) => m.sports)),
      destinations: rank(members.map((m) => m.destinations)),
    };
    return { members, metrics };
  },
);

export const updateMember = createServerFn({ method: "POST" })
  .validator(updateValidator)
  .handler(async ({ data }) => {
    const update = data as DeskUpdate;
    if (!(STATUSES as readonly string[]).includes(update.status)) {
      throw new Error("Choose a status the desk uses.");
    }
    const tags = [...new Set(update.tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
    const sql = await getSql();
    await ready(sql);
    try {
      const rows = await sql<{ id: string }>`
        update applications set
          status = ${update.status},
          internal_notes = ${update.internalNotes.trim()},
          tags = ${JSON.stringify(tags)}::jsonb,
          points_sport = ${update.pointsSport},
          points_travel = ${update.pointsTravel},
          points_knowledge = ${update.pointsKnowledge},
          points_community = ${update.pointsCommunity},
          points_creative = ${update.pointsCreative},
          coach_verified = ${update.coachVerified},
          updated_at = now()
        where id = ${update.id}
        returning id
      `;
      if (!rows[0]) throw new Error("That application is no longer on the desk.");
    } catch (err) {
      if (err instanceof Error && err.message === "That application is no longer on the desk.") {
        throw err;
      }
      console.error("[millass] update failed", err);
      throw new Error("The desk could not save that. Try again.");
    }
    return { ok: true as const };
  });
