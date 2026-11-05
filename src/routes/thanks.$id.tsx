import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { getPublicProfile } from "@/lib/millass/api";

export const Route = createFileRoute("/thanks/$id")({
  loader: ({ params }) => getPublicProfile({ data: { id: params.id } }),
  head: () => ({ meta: [{ title: "Received · Millass Club" }] }),
  component: ThanksPage,
});

function ThanksPage() {
  const profile = Route.useLoaderData();
  const interestOnly = profile ? profile.profileTypes.length === 0 && profile.experienceInterest : false;

  return (
    <Shell>
      <div className="wrap py-20">
        <p className="kicker">With the desk</p>
        {profile ? (
          <>
            <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl">
              {interestOnly ? "Your interest is noted." : "Your application is with the desk."}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mist">
              {profile.fullName.split(" ")[0]}, the desk reads every one. If there is a place for you in this beta, we will write to the email you gave. Nothing is booked, and nothing is charged.
            </p>
            {profile.experienceInterest && !interestOnly ? (
              <p className="mt-4 max-w-xl text-mist">Interest in future experiences is stored with this application.</p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/profile/$id" params={{ id: profile.id }} className="btn btn-primary">
                View your profile preview
              </Link>
              <Link to="/" className="btn btn-ghost">
                Back to Millass
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="display mt-4 text-4xl">We could not find that application.</h1>
            <Link to="/apply" className="btn btn-primary mt-8">
              Apply
            </Link>
          </>
        )}
      </div>
    </Shell>
  );
}
