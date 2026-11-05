import type { PublicProfile } from "@/lib/millass/model";
import { Pills } from "@/components/fields";

function linkLabel(href: string): string {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ProfileView({ profile }: { profile: PublicProfile }) {
  const links = [
    profile.instagram ? { href: profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram.replace(/^@/, "")}`, label: profile.instagram } : null,
    profile.website ? { href: profile.website, label: linkLabel(profile.website) } : null,
    profile.portfolioUrl ? { href: profile.portfolioUrl, label: linkLabel(profile.portfolioUrl) } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <article>
      <p className="kicker">{profile.profileTypes.length ? profile.profileTypes.join(" · ") : "Experience interest"}</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">{profile.fullName}</h1>
      <p className="mt-3 text-mist">
        {[profile.city, profile.country].filter(Boolean).join(", ")}
      </p>
      {profile.pointsTotal > 0 ? (
        <p className="mt-6 text-sm text-mist">
          <span className="tabular-nums text-bone">{profile.pointsTotal}</span>
          <span> Millass points</span>
          <span className="mt-1 block">A manual note from the desk. Not a rank.</span>
        </p>
      ) : null}
      {!profile.publicPreview ? (
        <p className="mt-6 max-w-xl text-sm text-mist">
          This preview is not marked for a public listing. The link still opens the same limited page.
        </p>
      ) : null}
      {profile.bio ? <p className="mt-8 max-w-2xl text-lg leading-relaxed">{profile.bio}</p> : null}
      {profile.sports.length ? (
        <section className="mt-10">
          <h2 className="kicker">Sport</h2>
          <div className="mt-3">
            <Pills items={profile.sportLevel ? [...profile.sports, profile.sportLevel] : profile.sports} />
          </div>
          {profile.sportGoal ? <p className="mt-4 max-w-2xl text-bone">{profile.sportGoal}</p> : null}
          {profile.offering.includes("Coaching") || profile.sportLevel === "Coach / Instructor" ? (
            <p className="mt-4 max-w-2xl text-sm text-mist">
              {profile.coachVerified
                ? "Verified by the Club desk. This is not a title someone can give themselves."
                : "Coaching here is self-declared. The desk has not verified it."}
            </p>
          ) : null}
        </section>
      ) : null}
      {profile.lookingFor.length ? (
        <section className="mt-10">
          <h2 className="kicker">Looking for</h2>
          <div className="mt-3">
            <Pills items={profile.lookingFor} />
          </div>
        </section>
      ) : null}
      {profile.offering.length || profile.offerDetail ? (
        <section className="mt-10">
          <h2 className="kicker">Offering</h2>
          {profile.offering.length ? (
            <div className="mt-3">
              <Pills items={profile.offering} />
            </div>
          ) : null}
          {profile.offerDetail ? <p className="mt-4 max-w-2xl">{profile.offerDetail}</p> : null}
          {profile.operatesWhere ? <p className="mt-2 text-sm text-mist">Works in {profile.operatesWhere}.</p> : null}
        </section>
      ) : null}
      {profile.projectDescription ? (
        <section className="mt-10">
          <h2 className="kicker">Project</h2>
          <p className="mt-3 max-w-2xl">{profile.projectDescription}</p>
        </section>
      ) : null}
      {profile.destinations.length ? (
        <section className="mt-10">
          <h2 className="kicker">Places</h2>
          <div className="mt-3">
            <Pills items={profile.destinations} />
          </div>
        </section>
      ) : null}
      {links.length ? (
        <ul className="mt-10 flex flex-col gap-2 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sage underline decoration-sage/40 underline-offset-4" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
