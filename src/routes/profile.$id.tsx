import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ProfileView } from "@/components/profile-view";
import { getPublicProfile } from "@/lib/millass/api";

export const Route = createFileRoute("/profile/$id")({
  loader: ({ params }) => getPublicProfile({ data: { id: params.id } }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.fullName} · Millass Club` : "Profile · Millass Club" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = Route.useLoaderData();
  return (
    <Shell>
      <div className="wrap py-16 sm:py-20">
        {profile ? (
          <ProfileView profile={profile} />
        ) : (
          <div>
            <p className="kicker">Profile</p>
            <h1 className="display mt-4 text-4xl">This preview is not on the desk.</h1>
            <Link to="/" className="btn btn-ghost mt-8">
              Back to Millass
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
