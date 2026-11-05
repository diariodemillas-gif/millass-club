import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { InterestCapture } from "@/components/interest-capture";

export const Route = createFileRoute("/club")({
  head: () => ({ meta: [{ title: "Club · Millass" }] }),
  component: ClubHome,
});

function ClubHome() {
  return (
    <Shell>
      <article className="wrap py-16 sm:py-20">
        <p className="kicker">Club</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl">The sports room.</h1>
        <p className="mt-6 max-w-2xl text-lg text-mist">
          Athletes, coaches, and experiences. This room does not share a list, a login, or a payment with Network. A coach is verified only by the Club desk. Saying it on a form is not enough.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/apply" className="btn btn-primary">
            Apply to Club
          </Link>
          <Link to="/experiences" className="btn btn-ghost">
            Experiences
          </Link>
          <Link to="/desk" className="btn btn-ghost">
            Club desk
          </Link>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <section className="card p-5">
            <h2 className="display text-2xl">People</h2>
            <p className="mt-3 text-sm text-mist">
              Sport levels stay on the person. Location on a public preview is a city, not a pin. Documents are not on the public page.
            </p>
          </section>
          <section className="card p-5">
            <h2 className="display text-2xl">Coaches</h2>
            <p className="mt-3 text-sm text-mist">
              Mara Okonkwo is marked verified because the desk did it. Anyone else who writes “coach” stays unverified until a person says so.
            </p>
          </section>
          <section className="card p-5">
            <h2 className="display text-2xl">Experiences</h2>
            <p className="mt-3 text-sm text-mist">
              Interest is a request, not a booking. No price, no stock, no checkout. Capacity and payment stay behind a later gate.
            </p>
          </section>
        </div>
        <div className="mt-14 max-w-xl">
          <InterestCapture realm="club" />
        </div>
      </article>
    </Shell>
  );
}
