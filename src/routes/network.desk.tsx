import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { listNetworkDesk, setNetworkStatus } from "@/lib/millass/network-api";

const STATUSES = ["submitted", "approved", "published", "suspended", "draft"] as const;

export const Route = createFileRoute("/network/desk")({
  loader: () => listNetworkDesk(),
  head: () => ({ meta: [{ title: "Network desk · Millass" }] }),
  component: NetworkDeskPage,
});

function NetworkDeskPage() {
  const { profiles, leads } = Route.useLoaderData();
  const router = useRouter();

  return (
    <Shell>
      <div className="wrap py-14">
        <p className="kicker">Network desk · rehearsal</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Publish is a human act.</h1>
        <p className="mt-4 max-w-2xl text-mist">
          This desk does not see Club applications. A profile becomes public only when someone here sets it to published. Base44 admin access is not available, so this is not a production grant.
        </p>
        <ul className="mt-10 flex flex-col gap-4">
          {profiles.map((profile) => (
            <li key={profile.id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="kicker">{profile.status} · {profile.kind}</p>
                  <h2 className="display mt-2 text-2xl">{profile.name}</h2>
                  <p className="mt-1 text-sm text-mist">
                    {profile.craft} · {profile.city} · {profile.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={profile.status === status ? "chip chip-on" : "chip"}
                      onClick={() => {
                        void setNetworkStatus({ data: { id: profile.id, status } }).then(() => router.invalidate());
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <section className="mt-12">
          <h2 className="kicker">Network list only</h2>
          {leads.length === 0 ? (
            <p className="mt-4">No one is on the Network list yet.</p>
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
        </section>
      </div>
    </Shell>
  );
}
