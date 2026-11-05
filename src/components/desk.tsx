import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { updateMember } from "@/lib/millass/api";
import {
  DESTINATIONS,
  POINT_FIELDS,
  PROFILE_TYPES,
  SPORTS,
  STATUSES,
  athleteSeekingSupport,
  isProviderOrCreator,
  locationOf,
  pointsTotal,
  wantsSupport,
  type DeskMetrics,
  type Member,
  type Status,
} from "@/lib/millass/model";
import { Pills } from "@/components/fields";
import { RankChart } from "@/components/charts";
import type { InterestLead } from "@/lib/millass/network-api";

export type DeskView = "overview" | "members" | "athletes" | "providers" | "experiences";

const VIEWS: { id: DeskView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "athletes", label: "Athletes" },
  { id: "providers", label: "Providers" },
  { id: "experiences", label: "Experiences" },
];

function when(iso: string): string {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "d MMM yyyy");
}

function csvEscape(value: unknown): string {
  const text = Array.isArray(value) ? value.join("; ") : value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}`;
  return text;
}

function exportCsv(members: Member[]) {
  const headers = [
    "id",
    "full_name",
    "email",
    "phone",
    "city",
    "country",
    "languages",
    "bio",
    "instagram",
    "website",
    "profile_types",
    "sports",
    "sport_level",
    "looking_for",
    "offering",
    "destinations",
    "trip_length",
    "budget",
    "travel_company",
    "experience_interest",
    "experiences",
    "experience_note",
    "sport_goal",
    "support_needs",
    "project_description",
    "offer_detail",
    "operates_where",
    "pricing_model",
    "portfolio_url",
    "contact_consent",
    "public_preview",
    "coach_verified",
    "status",
    "internal_notes",
    "tags",
    "points_sport",
    "points_travel",
    "points_knowledge",
    "points_community",
    "points_creative",
    "points_total",
    "created_at",
  ];
  const lines = [headers.join(",")];
  for (const member of members) {
    const row: Record<string, unknown> = {
      id: member.id,
      full_name: member.fullName,
      email: member.email,
      phone: member.phone,
      city: member.city,
      country: member.country,
      languages: member.languages,
      bio: member.bio,
      instagram: member.instagram,
      website: member.website,
      profile_types: member.profileTypes,
      sports: member.sports,
      sport_level: member.sportLevel,
      looking_for: member.lookingFor,
      offering: member.offering,
      destinations: member.destinations,
      trip_length: member.tripLength,
      budget: member.budget,
      travel_company: member.travelCompany,
      experience_interest: member.experienceInterest,
      experiences: member.experiences,
      experience_note: member.experienceNote,
      sport_goal: member.sportGoal,
      support_needs: member.supportNeeds,
      project_description: member.projectDescription,
      offer_detail: member.offerDetail,
      operates_where: member.operatesWhere,
      pricing_model: member.pricingModel,
      portfolio_url: member.portfolioUrl,
      contact_consent: member.contactConsent,
      public_preview: member.publicPreview,
      coach_verified: member.coachVerified,
      status: member.status,
      internal_notes: member.internalNotes,
      tags: member.tags,
      points_sport: member.pointsSport,
      points_travel: member.pointsTravel,
      points_knowledge: member.pointsKnowledge,
      points_community: member.pointsCommunity,
      points_creative: member.pointsCreative,
      points_total: pointsTotal(member),
      created_at: member.createdAt,
    };
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "millass-members.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="kicker">{label}</p>
      <p className="display mt-3 text-4xl tabular-nums">{value}</p>
    </div>
  );
}

export function DeskApp({
  members,
  metrics,
  view,
  memberId,
  leads,
}: {
  members: Member[];
  metrics: DeskMetrics;
  view: DeskView;
  memberId?: string;
  leads: InterestLead[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [sport, setSport] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");
  const [supportOnly, setSupportOnly] = useState(false);
  const [allAthletes, setAllAthletes] = useState(false);

  const open = members.find((member) => member.id === memberId) ?? null;

  function setView(next: DeskView, nextMember?: string) {
    void navigate({
      to: "/desk",
      search: nextMember ? { view: next, member: nextMember } : { view: next },
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (q) {
        const hay = `${member.fullName} ${member.email} ${member.city} ${member.country} ${member.bio}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (type && !member.profileTypes.includes(type)) return false;
      if (sport && !member.sports.includes(sport)) return false;
      if (destination && !member.destinations.includes(destination)) return false;
      if (status && member.status !== status) return false;
      if (supportOnly && !wantsSupport(member)) return false;
      return true;
    });
  }, [members, query, type, sport, destination, status, supportOnly]);

  const athletes = members.filter((member) =>
    allAthletes ? member.profileTypes.includes("Athlete") : athleteSeekingSupport(member),
  );
  const providers = members.filter(isProviderOrCreator);
  const experiences = members.filter((member) => member.experienceInterest);

  return (
    <div className="wrap py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="kicker">Internal · no login in this version</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Club desk</h1>
          <p className="mt-3 max-w-xl text-mist">
            Read applications, set a status, and keep a manual trust note. Payments, live tracking, member conversation, and matching are not part of this desk.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => exportCsv(members)}>
          Export all
        </button>
      </div>

      <nav className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === view ? "chip chip-on" : "chip"}
            onClick={() => setView(item.id, memberId)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {view === "overview" ? (
        <section className="mt-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Metric label="Applications" value={metrics.total} />
            <Metric label="Athletes" value={metrics.athletes} />
            <Metric label="Providers" value={metrics.providers} />
            <Metric label="Creators" value={metrics.creators} />
            <Metric label="Supporters" value={metrics.supporters} />
            <Metric label="Experience interest" value={metrics.experienceInterest} />
            <Metric label="Club list" value={leads.length} />
          </div>
          <div className="card mt-4 p-5">
            <h2 className="kicker">Club interest only</h2>
            <p className="mt-2 text-sm text-mist">This list is not the Network list. A name here did not opt in to creative work.</p>
            {leads.length === 0 ? (
              <p className="mt-4 text-bone">No one is on the Club list yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-bone/10">
                {leads.map((lead) => (
                  <li key={lead.id} className="py-3 text-sm">
                    <span className="text-bone">{lead.name}</span>
                    <span className="mt-1 block text-mist">{lead.email}</span>
                    {lead.note ? <span className="mt-1 block">{lead.note}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="kicker">Sports</h2>
              <div className="mt-4">
                <RankChart rows={metrics.sports} />
              </div>
            </div>
            <div className="card p-5">
              <h2 className="kicker">Destinations</h2>
              <div className="mt-4">
                <RankChart rows={metrics.destinations} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {view === "members" ? (
        <section className="mt-8">
          <div className="flex flex-col gap-3">
            <input
              className="field"
              value={query}
              placeholder="Search name, city, or email"
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search members"
            />
            <div className="flex flex-wrap gap-2">
              <FilterSelect label="Profile" value={type} onChange={setType} options={PROFILE_TYPES} />
              <FilterSelect label="Sport" value={sport} onChange={setSport} options={SPORTS} />
              <FilterSelect label="Destination" value={destination} onChange={setDestination} options={DESTINATIONS} />
              <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
              <button type="button" className={supportOnly ? "chip chip-on" : "chip"} onClick={() => setSupportOnly((value) => !value)}>
                Looking for support
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-mist">{filtered.length} shown</p>
          <MemberTable members={filtered} onOpen={(id) => setView("members", id)} />
        </section>
      ) : null}

      {view === "athletes" ? (
        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display text-3xl">Athletes and projects</h2>
              <p className="mt-2 max-w-xl text-sm text-mist">
                {allAthletes
                  ? "Every athlete profile on the desk."
                  : "Athletes asking for support: a project, or a direct request for help."}
              </p>
            </div>
            <button type="button" className={allAthletes ? "chip chip-on" : "chip"} onClick={() => setAllAthletes((value) => !value)}>
              {allAthletes ? "Only those seeking support" : "Show every athlete"}
            </button>
          </div>
          <div className="mt-6 grid gap-3">
            {athletes.length === 0 ? <p className="text-mist">No one in this reading.</p> : null}
            {athletes.map((member) => (
              <article key={member.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display text-2xl">{member.fullName}</h3>
                  <p className="text-sm text-mist">
                    {member.status} · <span className="tabular-nums text-bone">{pointsTotal(member)}</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-mist">
                  {locationOf(member)}
                  {member.sports.length ? ` · ${member.sports.join(", ")}` : ""}
                </p>
                {member.sportGoal ? <p className="mt-4">{member.sportGoal}</p> : null}
                {member.projectDescription ? <p className="mt-3 text-mist">{member.projectDescription}</p> : null}
                {member.supportNeeds.length ? (
                  <div className="mt-4">
                    <Pills items={member.supportNeeds} />
                  </div>
                ) : null}
                <button type="button" className="btn btn-ghost mt-5" onClick={() => setView("athletes", member.id)}>
                  Open
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {view === "providers" ? (
        <section className="mt-8">
          <h2 className="display text-3xl">Providers and creators</h2>
          <p className="mt-2 max-w-xl text-sm text-mist">A directory of people offering a practice. Not a marketplace, and nothing here can be booked.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {providers.map((member) => (
              <article key={member.id} className="card p-5">
                <p className="kicker">{member.profileTypes.join(" · ")}</p>
                <h3 className="display mt-3 text-2xl">{member.fullName}</h3>
                <p className="mt-1 text-sm text-mist">{locationOf(member)}</p>
                {member.offerDetail ? <p className="mt-4">{member.offerDetail}</p> : null}
                <dl className="mt-4 space-y-2 text-sm">
                  {member.operatesWhere ? (
                    <div>
                      <dt className="kicker">Where</dt>
                      <dd className="mt-1">{member.operatesWhere}</dd>
                    </div>
                  ) : null}
                  {member.pricingModel ? (
                    <div>
                      <dt className="kicker">Pricing</dt>
                      <dd className="mt-1">{member.pricingModel}</dd>
                    </div>
                  ) : null}
                </dl>
                {member.offering.length ? (
                  <div className="mt-4">
                    <Pills items={member.offering} />
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setView("providers", member.id)}>
                    Open
                  </button>
                  {member.portfolioUrl ? (
                    <a className="btn btn-ghost" href={member.portfolioUrl}>
                      Work
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {view === "experiences" ? (
        <section className="mt-8">
          <h2 className="display text-3xl">Experience interest</h2>
          <p className="mt-2 max-w-xl text-sm text-mist">
            People who asked to be considered for a summer camp, a trip, or a gathering. No dates, no payment, no places held.
          </p>
          <div className="mt-6 grid gap-3">
            {experiences.length === 0 ? <p className="text-mist">No interest recorded.</p> : null}
            {experiences.map((member) => (
              <article key={member.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="display text-2xl">{member.fullName}</h3>
                  <p className="text-sm text-mist">{member.status}</p>
                </div>
                <p className="mt-1 text-sm text-mist">{locationOf(member)}</p>
                <div className="mt-4">
                  <Pills items={member.experiences.length ? member.experiences : ["Interest noted"]} />
                </div>
                {member.destinations.length ? <p className="mt-3 text-sm text-mist">{member.destinations.join(" · ")}</p> : null}
                {member.experienceNote ? <p className="mt-3">{member.experienceNote}</p> : null}
                <p className="mt-3 text-sm text-mist">
                  {[member.tripLength, member.budget, member.travelCompany].filter(Boolean).join(" · ")}
                </p>
                <button type="button" className="btn btn-ghost mt-5" onClick={() => setView("experiences", member.id)}>
                  Open
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <MemberDrawer member={open} onClose={() => setView(view)} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <span className="sr-only">{label}</span>
      <select className="field" value={value} aria-label={label} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberTable({ members, onOpen }: { members: Member[]; onOpen: (id: string) => void }) {
  if (!members.length) return <p className="mt-6 text-mist">No one matches this reading.</p>;
  return (
    <>
      <ul className="mt-4 grid gap-3 md:hidden">
        {members.map((member) => (
          <li key={member.id}>
            <button type="button" className="card w-full p-4 text-left" onClick={() => onOpen(member.id)}>
              <span className="display block text-xl">{member.fullName}</span>
              <span className="mt-1 block text-sm text-mist">{locationOf(member)}</span>
              <span className="mt-3 flex items-center justify-between text-sm">
                <span>{member.status}</span>
                <span className="tabular-nums">{pointsTotal(member)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="card mt-4 hidden overflow-x-auto md:block">
        <table className="desk-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Types</th>
              <th>Sport</th>
              <th>Location</th>
              <th>Status</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="cursor-pointer" onClick={() => onOpen(member.id)}>
                <td>
                  <span className="text-bone">{member.fullName}</span>
                  <span className="mt-1 block text-sm text-mist">{when(member.createdAt)}</span>
                </td>
                <td className="max-w-48 text-sm text-mist">{member.profileTypes.join(", ") || "—"}</td>
                <td className="max-w-48 text-sm text-mist">{member.sports.join(", ") || "—"}</td>
                <td className="text-sm">{locationOf(member) || "—"}</td>
                <td className={member.status === "Accepted" ? "text-sage" : "text-bone"}>{member.status}</td>
                <td className="tabular-nums">{pointsTotal(member)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MemberDrawer({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("New");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [points, setPoints] = useState({
    pointsSport: 0,
    pointsTravel: 0,
    pointsKnowledge: 0,
    pointsCommunity: 0,
    pointsCreative: 0,
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [coachVerified, setCoachVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!member) return;
    setStatus(member.status);
    setNotes(member.internalNotes);
    setTags(member.tags);
    setPoints({
      pointsSport: member.pointsSport,
      pointsTravel: member.pointsTravel,
      pointsKnowledge: member.pointsKnowledge,
      pointsCommunity: member.pointsCommunity,
      pointsCreative: member.pointsCreative,
    });
    setCoachVerified(member.coachVerified);
    setMessage(null);
    setTag("");
  }, [member?.id]);

  useEffect(() => {
    if (!member) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [member, onClose]);

  async function save() {
    if (!member) return;
    setPending(true);
    setMessage(null);
    try {
      await updateMember({
        data: {
          id: member.id,
          status,
          internalNotes: notes,
          tags,
          ...points,
          coachVerified,
        },
      });
      setMessage("Saved");
      await router.invalidate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "The desk could not save that.");
    } finally {
      setPending(false);
    }
  }

  const total =
    points.pointsSport +
    points.pointsTravel +
    points.pointsKnowledge +
    points.pointsCommunity +
    points.pointsCreative;

  return (
    <div className={member ? "fixed inset-0 z-40" : "pointer-events-none fixed inset-0 z-40"} aria-hidden={!member}>
      <button
        type="button"
        className={member ? "absolute inset-0 bg-ink/70" : "absolute inset-0 bg-ink/0"}
        aria-label="Close member"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={member ? member.fullName : "Member"}
        className={
          member
            ? "absolute top-0 right-0 flex h-full w-full max-w-lg translate-x-0 flex-col overflow-y-auto bg-panel shadow-[0_0_0_1px_rgba(242,239,230,0.08)] transition-transform duration-200"
            : "absolute top-0 right-0 flex h-full w-full max-w-lg translate-x-full flex-col overflow-y-auto bg-panel transition-transform duration-200"
        }
      >
        {member ? (
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">{when(member.createdAt)}</p>
                <h2 className="display mt-2 text-3xl">{member.fullName}</h2>
                <p className="mt-1 text-sm text-mist">{locationOf(member)}</p>
              </div>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="kicker">Email</dt>
                <dd className="mt-1">{member.email}</dd>
              </div>
              {member.phone ? (
                <div>
                  <dt className="kicker">Phone</dt>
                  <dd className="mt-1">{member.phone}</dd>
                </div>
              ) : null}
              <div>
                <dt className="kicker">Languages</dt>
                <dd className="mt-1">{member.languages || "—"}</dd>
              </div>
            </dl>
            <p className="mt-4">{member.bio}</p>
            <div className="mt-4">
              <Pills items={[...member.profileTypes, ...member.sports]} />
            </div>
            {member.publicPreview ? (
              <Link to="/profile/$id" params={{ id: member.id }} className="mt-4 inline-block text-sm text-sage underline decoration-sage/40 underline-offset-4">
                Public preview
              </Link>
            ) : (
              <p className="mt-4 text-sm text-mist">Not marked for a public listing.</p>
            )}

            <div className="mt-8">
              <p className="kicker">Status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button key={item} type="button" className={status === item ? "chip chip-on" : "chip"} onClick={() => setStatus(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-sage"
                checked={coachVerified}
                onChange={(event) => setCoachVerified(event.target.checked)}
              />
              <span>
                <span className="text-bone">Verified coach</span>
                <span className="mt-1 block text-mist">Only this desk can grant it. Saying “coach” on an application does not.</span>
              </span>
            </label>

            <label className="mt-8 block">
              <span className="kicker">Internal notes</span>
              <textarea className="field mt-2" value={notes} maxLength={4000} onChange={(event) => setNotes(event.target.value)} />
            </label>

            <div className="mt-8">
              <p className="kicker">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((item) => (
                  <button key={item} type="button" className="chip chip-on" onClick={() => setTags(tags.filter((tagItem) => tagItem !== item))}>
                    {item} ×
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="field"
                  value={tag}
                  placeholder="Add a tag"
                  aria-label="Add a tag"
                  onChange={(event) => setTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    const next = tag.trim();
                    if (!next || tags.includes(next)) return;
                    setTags([...tags, next]);
                    setTag("");
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    const next = tag.trim();
                    if (!next || tags.includes(next)) return;
                    setTags([...tags, next]);
                    setTag("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-8">
              <p className="kicker">Millass points</p>
              <p className="mt-2 text-sm text-mist">
                A manual trust note. Total <span className="tabular-nums text-bone">{total}</span>. Not a level.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {POINT_FIELDS.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm text-mist">{field.label}</span>
                    <input
                      className="field mt-1 tabular-nums"
                      type="number"
                      min={0}
                      max={20}
                      value={points[field.key]}
                      onChange={(event) => {
                        const next = Math.max(0, Math.min(20, Math.round(Number(event.target.value) || 0)));
                        setPoints((current) => ({ ...current, [field.key]: next }));
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {member.supportNeeds.length ? (
              <div className="mt-8">
                <p className="kicker">Support asked</p>
                <div className="mt-3">
                  <Pills items={member.supportNeeds} />
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex items-center gap-4">
              <button type="button" className="btn btn-primary" disabled={pending} onClick={() => void save()}>
                {pending ? "Saving" : "Save"}
              </button>
              {message ? <p className="text-sm text-sage">{message}</p> : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
