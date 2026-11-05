import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { SPORTS } from "@/lib/millass/model";

const PROFILES = [
  {
    title: "Athlete",
    copy: "A practice, a season, or a project that needs a serious room rather than an audience.",
  },
  {
    title: "Traveller",
    copy: "Someone moving for a route, a coast, or a few weeks. Not a tourist looking for a package.",
  },
  {
    title: "Provider",
    copy: "Coaches, guides, and hosts who already do the work and can say where.",
  },
  {
    title: "Creator",
    copy: "Photographers, editors, and people who make the record without turning it into content.",
  },
  {
    title: "Supporter",
    copy: "People who can help an athlete or a project, and who do not need to be the story.",
  },
  {
    title: "Club",
    copy: "An organisation with a place, a roster, or a standard worth keeping.",
  },
  {
    title: "Founder member",
    copy: "Early people who will shape how the club behaves before it is a habit.",
  },
  {
    title: "Other",
    copy: "A precise reason that does not fit a label. The desk can still read it.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Apply with your story",
    copy: "Profile, sport, what you are looking for, and what you can offer. Write it plain.",
  },
  {
    n: "02",
    title: "The desk reads every application",
    copy: "A person reads. There is no matching engine and no public feed of new names.",
  },
  {
    n: "03",
    title: "Founding members are invited",
    copy: "If there is a place, the desk writes. Silence is not a ranking.",
  },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const ticker = [...SPORTS, ...SPORTS];
  return (
    <Shell>
      <section className="wrap py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="kicker">Private beta</p>
            <h1 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">A private club for people in movement.</h1>
            <p className="mt-6 max-w-xl text-lg text-mist">
              Two rooms, kept apart. Club is a curated intake for sport, travel, and support. Network is a directory and a private brief desk for studios and creatives. Neither is a feed, and neither takes payment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/club" className="btn btn-primary">
                Enter Club
              </Link>
              <Link to="/network" className="btn btn-ghost">
                Enter Network
              </Link>
            </div>
          </div>
          <figure>
            <img
              src="/coastal-cyclist.jpg"
              width={1200}
              height={1600}
              alt="A cyclist alone on a wet coastal road above a grey Atlantic sea"
              className="frame-img aspect-portrait w-full object-cover"
            />
            <figcaption className="mt-3 text-sm text-mist">Coast road. People already in motion.</figcaption>
          </figure>
        </div>
      </section>

      <div className="overflow-hidden border-y border-bone/10">
        <div className="ticker-track flex w-max gap-10 py-4">
          {ticker.map((sport, index) => (
            <span key={`${sport}-${index}`} className="kicker whitespace-nowrap">
              {sport}
            </span>
          ))}
        </div>
      </div>

      <section className="wrap py-20">
        <p className="kicker">The room</p>
        <h2 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">Not a network. A club.</h2>
        <p className="mt-5 max-w-2xl text-lg text-mist">
          Millass is not a feed or a dating product. Club membership is read by a person. Network publishes only what the desk approves. The point is trust, not a checkout.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {PROFILES.map((profile, index) => (
            <article key={profile.title} className="card p-6">
              <p className="kicker">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="display mt-4 text-2xl">{profile.title}</h3>
              <p className="mt-3 text-mist">{profile.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <figure>
        <img
          src="/ridgeline-runner.jpg"
          width={1792}
          height={1008}
          alt="A trail runner small on a high limestone ridgeline at first light"
          className="frame-img aspect-cinema max-h-[40rem] w-full rounded-none object-cover"
          decoding="async"
        />
        <figcaption className="wrap mt-3 text-sm text-mist">High ridgeline. The work is the point.</figcaption>
      </figure>

      <section className="wrap py-20">
        <p className="kicker">This version</p>
        <h2 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">An intake, not the full club.</h2>
        <ol className="mt-10 grid gap-3 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="card p-6">
              <p className="display text-3xl text-sage">{step.n}</p>
              <h3 className="display mt-6 text-2xl">{step.title}</h3>
              <p className="mt-3 text-mist">{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap pb-8">
        <div className="card px-6 py-12 sm:px-12">
          <p className="kicker">The list is short on purpose</p>
          <h2 className="display mt-4 max-w-2xl text-4xl">Apply with the life you already have.</h2>
          <p className="mt-4 max-w-xl text-mist">The desk reads every application. If there is a place for you in this beta, we will write.</p>
          <Link to="/apply" className="btn btn-primary mt-8">
            Apply to join the Millass private beta
          </Link>
        </div>
      </section>
    </Shell>
  );
}
