import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { InterestForm } from "@/components/interest-form";

const KINDS = [
  {
    title: "Summer camp",
    copy: "A longer stay with training at the centre. Not a resort package. Dates are not open.",
  },
  {
    title: "Club trip",
    copy: "A route with a small group and a clear purpose. Not a tour. Nothing can be reserved.",
  },
  {
    title: "Gathering",
    copy: "A short meeting of members in a place. Not a conference, and not a ticket.",
  },
];

export const Route = createFileRoute("/experiences")({
  head: () => ({ meta: [{ title: "Experiences · Millass Club" }] }),
  component: Experiences,
});

function Experiences() {
  return (
    <Shell>
      <div className="wrap py-16 sm:py-20">
        <p className="kicker">Later, and only with a reason</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl">Future experiences</h1>
        <p className="mt-6 max-w-2xl text-lg text-mist">
          Summer camps, club trips, and gatherings will exist. They do not exist as bookings yet. There is no calendar, no deposit, and no payment.
        </p>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {KINDS.map((kind) => (
            <article key={kind.title} className="card p-6">
              <p className="kicker">Interest only</p>
              <h2 className="display mt-4 text-2xl">{kind.title}</h2>
              <p className="mt-3 text-mist">{kind.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          <div>
            <img
              src="/ridgeline-runner.jpg"
              width={1792}
              height={1008}
              alt="Limestone ridgeline in first light, a runner far along the crest"
              className="frame-img aspect-cinema w-full object-cover"
            />
            <p className="mt-6 max-w-md text-mist">
              Interest is stored with your application, beside your name. If you have already applied, you can also mark experiences there.
            </p>
          </div>
          <InterestForm />
        </div>
      </div>
    </Shell>
  );
}
