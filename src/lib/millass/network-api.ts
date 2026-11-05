import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";

/** Distributed contract for this sandbox. Not a shared database and not SSO. */
export const CONTRACT_VERSION = "2026-11-03.r1";

const PROFILE_STATUSES = ["draft", "submitted", "approved", "published", "suspended"] as const;
type ProfileStatus = (typeof PROFILE_STATUSES)[number];

export type PublicStudio = {
  id: string;
  kind: "creator" | "studio";
  name: string;
  city: string;
  territory: string;
  craft: string;
  style: string;
  bio: string;
  portfolio: string[];
};

export type DeskProfile = PublicStudio & {
  email: string;
  status: ProfileStatus;
};

export type InterestLead = {
  id: string;
  name: string;
  email: string;
  note: string;
  source: string;
  createdAt: string;
};

export type ActorCard = {
  id: string;
  name: string;
  kind: "creator" | "studio";
  craft: string;
};

export type BriefCard = {
  id: string;
  title: string;
  summary: string;
  craft: string;
  status: "open" | "closed";
  role: "owner" | "guest";
};

export type Workspace = {
  actor: ActorCard;
  briefs: BriefCard[];
  focus: {
    brief: BriefCard;
    proposals: { id: string; authorName: string; body: string; own: boolean }[];
    messages: { id: string; authorName: string; body: string; mine: boolean }[];
    inviteOptions: { id: string; name: string }[];
  } | null;
};

const hits = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < 60_000);
  if (recent.length >= 8) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}

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

type ProfileRow = {
  id: string;
  kind: string;
  name: string;
  city: string;
  territory: string;
  craft: string;
  style: string;
  bio: string;
  email: string;
  portfolio: unknown;
  status: string;
};

function toPublic(row: ProfileRow): PublicStudio {
  return {
    id: row.id,
    kind: row.kind === "studio" ? "studio" : "creator",
    name: row.name,
    city: row.city,
    territory: row.territory,
    craft: row.craft,
    style: row.style,
    bio: row.bio,
    portfolio: asArray(row.portfolio),
  };
}

function toDesk(row: ProfileRow): DeskProfile {
  const status = PROFILE_STATUSES.includes(row.status as ProfileStatus)
    ? (row.status as ProfileStatus)
    : "submitted";
  return { ...toPublic(row), email: row.email, status };
}

const PUBLIC_SQL = `
  select id, kind, name, city, territory, craft, style, bio, email, portfolio, status
  from network_profiles
`;

async function seedNetwork(sql: Sql): Promise<void> {
  const profiles: ProfileRow[] = [
    {
      id: "atelier-norte",
      kind: "studio",
      name: "Atelier Norte",
      city: "Bilbao",
      territory: "Basque Country",
      craft: "Direction",
      style: "Documentary",
      bio: "A small studio for films that stay with the people in them. We do not take brand crews.",
      email: "desk@atelier-norte.example",
      portfolio: ["https://example.com/atelier-norte"],
      status: "published",
    },
    {
      id: "coast-room",
      kind: "studio",
      name: "Coast Room",
      city: "Lisbon",
      territory: "Lisbon",
      craft: "Photography",
      style: "Coastal",
      bio: "Stills of harbours, boats, and the hour before the swell. Commissioned, not a feed.",
      email: "hello@coast-room.example",
      portfolio: ["https://example.com/coast-room"],
      status: "published",
    },
    {
      id: "maia-errasti",
      kind: "creator",
      name: "Maia Errasti",
      city: "San Sebastián",
      territory: "Basque Country",
      craft: "Editing",
      style: "Documentary",
      bio: "Editor of short observational films. I cut for pace and weather, not for a logo.",
      email: "maia.errasti@example.com",
      portfolio: ["https://example.com/maia"],
      status: "published",
    },
    {
      id: "jon-pereyra",
      kind: "creator",
      name: "Jon Pereyra",
      city: "Biarritz",
      territory: "Biarritz",
      craft: "Photography",
      style: "Coastal",
      bio: "Photographer on the Basque and Landes coast. Available for stills, not for a content week.",
      email: "jon.pereyra@example.com",
      portfolio: ["https://example.com/jon"],
      status: "published",
    },
    {
      id: "leire-sanz",
      kind: "creator",
      name: "Leire Sanz",
      city: "Vitoria",
      territory: "Basque Country",
      craft: "Design",
      style: "Editorial",
      bio: "Designer of printed matter for clubs and small races. Submitted, not yet public.",
      email: "leire.sanz@example.com",
      portfolio: [],
      status: "submitted",
    },
    {
      id: "hugo-pellicer",
      kind: "creator",
      name: "Hugo Pellicer",
      city: "Barcelona",
      territory: "Barcelona",
      craft: "Motion",
      style: "Commercial",
      bio: "Suspended after a portfolio that used someone else's footage.",
      email: "hugo.pellicer@example.com",
      portfolio: [],
      status: "suspended",
    },
  ];

  for (const profile of profiles) {
    await sql`
      insert into network_profiles (
        id, kind, name, city, territory, craft, style, bio, email, portfolio, status
      ) values (
        ${profile.id},
        ${profile.kind},
        ${profile.name},
        ${profile.city},
        ${profile.territory},
        ${profile.craft},
        ${profile.style},
        ${profile.bio},
        ${profile.email},
        ${JSON.stringify(profile.portfolio)}::jsonb,
        ${profile.status}
      )
      on conflict (id) do nothing
    `;
  }

  await sql`
    insert into network_briefs (id, org_id, title, summary, craft, status)
    values (
      'winter-film',
      'atelier-norte',
      'A short winter film for a trail club',
      'Eight to twelve minutes. People already training. No sponsor reads. Private until the club says otherwise.',
      'Editing',
      'open'
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into network_briefs (id, org_id, title, summary, craft, status)
    values (
      'harbour-stills',
      'coast-room',
      'Harbour stills before a departure',
      'One morning in Lisbon. This brief is not shared with Atelier Norte.',
      'Photography',
      'open'
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into network_invites (brief_id, profile_id) values ('winter-film', 'maia-errasti')
    on conflict do nothing
  `;
  await sql`
    insert into network_invites (brief_id, profile_id) values ('winter-film', 'jon-pereyra')
    on conflict do nothing
  `;
  await sql`
    insert into network_invites (brief_id, profile_id) values ('harbour-stills', 'jon-pereyra')
    on conflict do nothing
  `;
  await sql`
    insert into network_proposals (id, brief_id, profile_id, body)
    values (
      'proposal-maia-winter',
      'winter-film',
      'maia-errasti',
      'I can cut this in three weeks if the rushes are already organised. I will not add a title card for a brand.'
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into network_messages (id, brief_id, author_id, body)
    values (
      'msg-atelier-1',
      'winter-film',
      'atelier-norte',
      'Maia, the club has agreed the film stays off public channels until they say so.'
    )
    on conflict (id) do nothing
  `;
}

let seedPromise: Promise<void> | null = null;

async function ready(): Promise<Sql> {
  const sql = await getSql();
  seedPromise ??= seedNetwork(sql).catch((err) => {
    seedPromise = null;
    throw err;
  });
  await seedPromise;
  return sql;
}

async function profileById(sql: Sql, id: string): Promise<ProfileRow | null> {
  const rows = await sql.query<ProfileRow>(`${PUBLIC_SQL} where id = $1`, [id]);
  return rows[0] ?? null;
}

async function canSeeBrief(sql: Sql, actorId: string, briefId: string): Promise<boolean> {
  const rows = await sql.query<{ ok: number }>(
    `
      select 1 as ok
      from network_briefs b
      where b.id = $1
        and (
          b.org_id = $2
          or exists (
            select 1 from network_invites i
            where i.brief_id = b.id and i.profile_id = $2
          )
        )
    `,
    [briefId, actorId],
  );
  return Boolean(rows[0]);
}

export const listDirectory = createServerFn({ method: "GET" }).handler(async (): Promise<PublicStudio[]> => {
  const sql = await ready();
  const rows = await sql.query<ProfileRow>(
    `${PUBLIC_SQL} where status = 'published' order by name asc`,
  );
  return rows.map(toPublic);
});

export const getStudio = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data }): Promise<PublicStudio | null> => {
    const sql = await ready();
    const rows = await sql.query<ProfileRow>(
      `${PUBLIC_SQL} where id = $1 and status = 'published'`,
      [data.id],
    );
    return rows[0] ? toPublic(rows[0]) : null;
  });

const joinValidator = z.object({
  kind: z.enum(["creator", "studio"]),
  name: z.string().min(2).max(120),
  city: z.string().min(1).max(80),
  territory: z.string().min(1).max(80),
  craft: z.string().min(1).max(40),
  style: z.string().min(1).max(40),
  bio: z.string().min(10).max(800),
  email: z.string().email().max(200),
  portfolio: z.string().max(300),
  consent: z.literal(true),
});

export const submitNetworkProfile = createServerFn({ method: "POST" })
  .validator(joinValidator)
  .handler(async ({ data }) => {
    if (limited(`join:${data.email.toLowerCase()}`)) {
      throw new Error("Too many tries. Wait a minute.");
    }
    const sql = await ready();
    const id = crypto.randomUUID();
    const portfolio = data.portfolio.trim()
      ? [/^https?:\/\//i.test(data.portfolio.trim()) ? data.portfolio.trim() : `https://${data.portfolio.trim()}`]
      : [];
    await sql`
      insert into network_profiles (
        id, kind, name, city, territory, craft, style, bio, email, portfolio, status
      ) values (
        ${id},
        ${data.kind},
        ${data.name.trim()},
        ${data.city.trim()},
        ${data.territory.trim()},
        ${data.craft.trim()},
        ${data.style.trim()},
        ${data.bio.trim()},
        ${data.email.trim().toLowerCase()},
        ${JSON.stringify(portfolio)}::jsonb,
        'submitted'
      )
    `;
    return { id };
  });

export const listNetworkDesk = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const rows = await sql.query<ProfileRow>(`${PUBLIC_SQL} order by created_at desc`);
  const leads = await sql.query<{
    id: string;
    name: string;
    email: string;
    note: string;
    source: string;
    created_at: string;
  }>(
    `
      select id, name, email, note, source,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
      from interest_leads
      where realm = 'network'
      order by created_at desc
    `,
  );
  return {
    profiles: rows.map(toDesk),
    leads: leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      note: lead.note,
      source: lead.source,
      createdAt: lead.created_at,
    })),
  };
});

export const setNetworkStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(80),
      status: z.enum(PROFILE_STATUSES),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<{ id: string }>`
      update network_profiles
      set status = ${data.status}
      where id = ${data.id}
      returning id
    `;
    if (!rows[0]) throw new Error("That profile is not on the network desk.");
    return { ok: true as const };
  });

export const listActors = createServerFn({ method: "GET" }).handler(async (): Promise<ActorCard[]> => {
  const sql = await ready();
  const rows = await sql.query<ProfileRow>(
    `${PUBLIC_SQL} where status <> 'suspended' order by kind desc, name asc`,
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind === "studio" ? "studio" : "creator",
    craft: row.craft,
  }));
});

export const getWorkspace = createServerFn({ method: "GET" })
  .validator(
    z.object({
      actorId: z.string().min(1).max(80),
      briefId: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Workspace> => {
    const sql = await ready();
    const actorRow = await profileById(sql, data.actorId);
    if (!actorRow || actorRow.status === "suspended") {
      throw new Error("That rehearsal identity is not available.");
    }
    const actor: ActorCard = {
      id: actorRow.id,
      name: actorRow.name,
      kind: actorRow.kind === "studio" ? "studio" : "creator",
      craft: actorRow.craft,
    };
    const briefRows = await sql.query<{
      id: string;
      title: string;
      summary: string;
      craft: string;
      status: string;
      org_id: string;
    }>(
      `
        select b.id, b.title, b.summary, b.craft, b.status, b.org_id
        from network_briefs b
        where b.org_id = $1
           or exists (
             select 1 from network_invites i
             where i.brief_id = b.id and i.profile_id = $1
           )
        order by b.created_at desc
      `,
      [actor.id],
    );
    const briefs: BriefCard[] = briefRows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      craft: row.craft,
      status: row.status === "closed" ? "closed" : "open",
      role: row.org_id === actor.id ? "owner" : "guest",
    }));
    const briefId = data.briefId && briefs.some((brief) => brief.id === data.briefId) ? data.briefId : briefs[0]?.id;
    if (!briefId) return { actor, briefs, focus: null };
    const allowed = await canSeeBrief(sql, actor.id, briefId);
    if (!allowed) throw new Error("Not on this brief.");
    const brief = briefs.find((item) => item.id === briefId)!;
    const proposals = await sql.query<{ id: string; body: string; name: string; profile_id: string }>(
      `
        select p.id, p.body, p.profile_id, n.name
        from network_proposals p
        join network_profiles n on n.id = p.profile_id
        where p.brief_id = $1
          and ($2 = $3 or p.profile_id = $2)
      `,
      [briefId, actor.id, brief.role === "owner" ? actor.id : "__guest__"],
    );
    const messages = await sql.query<{ id: string; body: string; author_id: string; name: string }>(
      `
        select m.id, m.body, m.author_id, n.name
        from network_messages m
        join network_profiles n on n.id = m.author_id
        where m.brief_id = $1
        order by m.created_at asc
      `,
      [briefId],
    );
    const inviteOptions =
      brief.role === "owner"
        ? (
            await sql.query<{ id: string; name: string }>(
              `
                select id, name from network_profiles
                where status = 'published' and kind = 'creator' and id <> $1
                order by name
              `,
              [actor.id],
            )
          ).map((row) => ({ id: row.id, name: row.name }))
        : [];
    return {
      actor,
      briefs,
      focus: {
        brief,
        proposals: proposals.map((row) => ({
          id: row.id,
          authorName: row.name,
          body: row.body,
          own: row.profile_id === actor.id,
        })),
        messages: messages.map((row) => ({
          id: row.id,
          authorName: row.name,
          body: row.body,
          mine: row.author_id === actor.id,
        })),
        inviteOptions,
      },
    };
  });

const briefWrite = z.object({
  actorId: z.string().min(1).max(80),
  title: z.string().min(3).max(140),
  summary: z.string().min(10).max(800),
  craft: z.string().min(1).max(40),
});

export const createBrief = createServerFn({ method: "POST" })
  .validator(briefWrite)
  .handler(async ({ data }) => {
    const sql = await ready();
    const actor = await profileById(sql, data.actorId);
    if (!actor || actor.kind !== "studio" || actor.status === "suspended") {
      throw new Error("Only a studio can open a brief.");
    }
    const id = crypto.randomUUID();
    await sql`
      insert into network_briefs (id, org_id, title, summary, craft, status)
      values (${id}, ${actor.id}, ${data.title.trim()}, ${data.summary.trim()}, ${data.craft.trim()}, 'open')
    `;
    return { id };
  });

export const inviteToBrief = createServerFn({ method: "POST" })
  .validator(
    z.object({
      actorId: z.string().min(1).max(80),
      briefId: z.string().min(1).max(80),
      profileId: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const owned = await sql.query<{ id: string }>(
      `select id from network_briefs where id = $1 and org_id = $2`,
      [data.briefId, data.actorId],
    );
    if (!owned[0]) throw new Error("Not on this brief.");
    const guest = await profileById(sql, data.profileId);
    if (!guest || guest.status !== "published" || guest.kind !== "creator") {
      throw new Error("Only a published creator can be invited.");
    }
    await sql`
      insert into network_invites (brief_id, profile_id)
      values (${data.briefId}, ${data.profileId})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const submitProposal = createServerFn({ method: "POST" })
  .validator(
    z.object({
      actorId: z.string().min(1).max(80),
      briefId: z.string().min(1).max(80),
      body: z.string().min(10).max(1200),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const invited = await sql.query<{ id: string }>(
      `
        select b.id from network_briefs b
        join network_invites i on i.brief_id = b.id
        where b.id = $1 and b.status = 'open' and i.profile_id = $2
      `,
      [data.briefId, data.actorId],
    );
    if (!invited[0]) throw new Error("Not on this brief.");
    const id = crypto.randomUUID();
    await sql`
      insert into network_proposals (id, brief_id, profile_id, body)
      values (${id}, ${data.briefId}, ${data.actorId}, ${data.body.trim()})
      on conflict (brief_id, profile_id) do update set body = excluded.body
    `;
    return { ok: true as const };
  });

export const postBriefMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      actorId: z.string().min(1).max(80),
      briefId: z.string().min(1).max(80),
      body: z.string().min(1).max(1000),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!(await canSeeBrief(sql, data.actorId, data.briefId))) {
      throw new Error("Not on this brief.");
    }
    const id = crypto.randomUUID();
    await sql`
      insert into network_messages (id, brief_id, author_id, body)
      values (${id}, ${data.briefId}, ${data.actorId}, ${data.body.trim()})
    `;
    return { ok: true as const };
  });

export const submitInterest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      realm: z.enum(["club", "network"]),
      name: z.string().min(2).max(120),
      email: z.string().email().max(200),
      note: z.string().max(400),
      source: z.string().min(1).max(80),
      consent: z.literal(true),
    }),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (limited(`lead:${data.realm}:${email}`)) throw new Error("Too many tries. Wait a minute.");
    const sql = await ready();
    const id = crypto.randomUUID();
    await sql`
      insert into interest_leads (id, realm, name, email, note, source)
      values (${id}, ${data.realm}, ${data.name.trim()}, ${email}, ${data.note.trim()}, ${data.source.trim()})
    `;
    return { id };
  });

export const listInterest = createServerFn({ method: "GET" })
  .validator(z.object({ realm: z.enum(["club", "network"]) }))
  .handler(async ({ data }): Promise<InterestLead[]> => {
    const sql = await ready();
    const rows = await sql.query<{
      id: string;
      name: string;
      email: string;
      note: string;
      source: string;
      created_at: string;
    }>(
      `
        select id, name, email, note, source,
          to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
        from interest_leads
        where realm = $1
        order by created_at desc
      `,
      [data.realm],
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      note: row.note,
      source: row.source,
      createdAt: row.created_at,
    }));
  });
