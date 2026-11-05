import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { getStudio } from "@/lib/millass/network-api";

export const Route = createFileRoute("/network/studio/$id")({
  loader: ({ params }) => getStudio({ data: { id: params.id } }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} · Millass Network` : "Studio · Millass Network" }],
  }),
  component: StudioPage,
});

function StudioPage() {
  const studio = Route.useLoaderData();
  if (!studio) {
    return (
      <Shell>
        <div className="wrap py-24">
          <p className="kicker">Directory</p>
          <h1 className="display mt-4 text-4xl">This profile is not published.</h1>
          <p className="mt-4 max-w-xl text-mist">Drafts, submissions, and suspended work stay off the directory.</p>
          <Link to="/network/directory" className="btn btn-primary mt-8">
            Back to the directory
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <article className="wrap py-16">
        <p className="kicker">
          {studio.kind === "studio" ? "Studio" : "Independent"} · {studio.craft} · {studio.style}
        </p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">{studio.name}</h1>
        <p className="mt-3 text-mist">
          {studio.city}, {studio.territory}
        </p>
        <p className="mt-8 max-w-2xl text-lg">{studio.bio}</p>
        {studio.portfolio.length ? (
          <ul className="mt-8 flex flex-col gap-2 text-sm">
            {studio.portfolio.map((href) => (
              <li key={href}>
                <a href={href} className="text-sage underline decoration-sage/40 underline-offset-4">
                  {href.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-10 max-w-xl text-sm text-mist">Private email and unpublished files are not on this page.</p>
      </article>
    </Shell>
  );
}
