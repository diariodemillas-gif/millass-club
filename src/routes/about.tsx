import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const LATER = [
  {
    title: "Payments",
    copy: "No checkout, no fees, no deposits. Registering interest is not a booking.",
  },
  {
    title: "Live tracking",
    copy: "Nobody is followed on a map. This version does not know where you are.",
  },
  {
    title: "Conversation",
    copy: "There is no member chat. The desk writes when there is a reason.",
  },
  {
    title: "Matching",
    copy: "People are not paired by an algorithm. A person reads the application.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Millass Club" }] }),
  component: About,
});

function About() {
  return (
    <Shell>
      <article className="wrap py-16 sm:py-20">
        <p className="kicker">About</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl">Why Millass exists</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="max-w-xl lg:col-span-7">
            <p className="text-lg">
              People who train, travel, coach, host, film, or fund this life keep meeting in fragments: a race, a season, a group that goes quiet. The useful ones are hard to find again, and the public networks are built for attention, not for trust.
            </p>
            <p className="mt-5 text-lg text-mist">
              Millass is a way to gather them with a desk in the middle. Sport, travel, human connection, knowledge, collaboration, athlete support, and time spent well. Membership is not a signup.
            </p>
          </div>
          <figure className="lg:col-span-5">
            <img
              src="/coastal-cyclist.jpg"
              width={1200}
              height={1600}
              alt="A cyclist on a coastal road in flat northern light"
              className="frame-img aspect-portrait w-full object-cover"
            />
          </figure>
        </div>

        <section className="mt-20 max-w-3xl">
          <h2 className="display text-3xl">Who it is for</h2>
          <p className="mt-4 text-lg text-mist">
            Athletes with a real practice. Travellers who move for a route or a season. Coaches, guides, and hosts. Creators who make the record. Supporters who can help without asking to be the story. Clubs with a place and a standard. Founder members who will shape the early room. And people who do not fit a label but have a precise reason to be here.
          </p>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="display text-3xl">What this version does</h2>
          <p className="mt-4 text-lg text-mist">
            This private beta collects and organises early members. You can apply, register interest in future experiences, and the desk can read, tag, and note a manual trust score. That is the whole product for now.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="kicker">Not in this version</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {LATER.map((item) => (
              <li key={item.title} className="card p-6">
                <h3 className="display text-2xl">{item.title}</h3>
                <p className="mt-3 text-mist">{item.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <Link to="/apply" className="btn btn-primary mt-12">
          Apply to join the Millass private beta
        </Link>
      </article>
    </Shell>
  );
}
