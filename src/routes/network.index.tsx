import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { InterestCapture } from "@/components/interest-capture";

export const Route = createFileRoute("/network/")({
  head: () => ({ meta: [{ title: "Network · Millass" }] }),
  component: NetworkHome,
});

function NetworkHome() {
  return (
    <Shell>
      <article className="wrap py-16 sm:py-20">
        <p className="kicker">Network</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl">Studios and the people who make the record.</h1>
        <p className="mt-6 max-w-2xl text-lg text-mist">
          A directory of published work, and private briefs between a studio and the people it invites. Drafts, emails, and other people’s proposals stay off the public page. No commission in this room yet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/network/directory" className="btn btn-primary">
            Directory
          </Link>
          <Link to="/network/join" className="btn btn-ghost">
            Offer a practice
          </Link>
          <Link to="/network/briefs" className="btn btn-ghost">
            Briefs
          </Link>
          <Link to="/network/desk" className="btn btn-ghost">
            Network desk
          </Link>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <section className="card p-5">
            <h2 className="display text-2xl">Published only</h2>
            <p className="mt-3 text-sm text-mist">A visitor sees a profile after the desk publishes it. Submitting a form does not put you on the directory.</p>
          </section>
          <section className="card p-5">
            <h2 className="display text-2xl">Private briefs</h2>
            <p className="mt-3 text-sm text-mist">A studio sees its own briefs. A creator sees only the ones they were invited to, and only their own proposal.</p>
          </section>
          <section className="card p-5">
            <h2 className="display text-2xl">Separate from Club</h2>
            <p className="mt-3 text-sm text-mist">Network does not read Club applications, and Club does not read this directory’s private mail.</p>
          </section>
        </div>
        <div className="mt-14 max-w-xl">
          <InterestCapture realm="network" />
        </div>
      </article>
    </Shell>
  );
}
