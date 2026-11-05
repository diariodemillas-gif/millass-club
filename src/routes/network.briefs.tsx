import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { TextField } from "@/components/fields";
import {
  createBrief,
  getWorkspace,
  inviteToBrief,
  listActors,
  postBriefMessage,
  submitProposal,
} from "@/lib/millass/network-api";

export const Route = createFileRoute("/network/briefs")({
  validateSearch: (search: Record<string, unknown>) => {
    const parsed: { actor?: string; brief?: string } = {};
    if (typeof search.actor === "string" && search.actor) parsed.actor = search.actor;
    if (typeof search.brief === "string" && search.brief) parsed.brief = search.brief;
    return parsed;
  },
  loaderDeps: ({ search }) => ({ actor: search.actor ?? "atelier-norte", brief: search.brief }),
  loader: ({ deps }) =>
    Promise.all([
      listActors(),
      getWorkspace({ data: { actorId: deps.actor, briefId: deps.brief } }),
    ]),
  head: () => ({ meta: [{ title: "Briefs · Millass Network" }] }),
  component: BriefsPage,
});

function BriefsPage() {
  const [actors, workspace] = Route.useLoaderData();
  const search = Route.useSearch();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [craft, setCraft] = useState("Editing");
  const [proposal, setProposal] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const focus = workspace.focus;

  async function run(task: () => Promise<unknown>) {
    setPending(true);
    setError(null);
    try {
      await task();
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <div className="wrap py-14">
        <p className="kicker">Briefs</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Private work, named people only.</h1>
        <p className="mt-4 max-w-2xl text-mist">
          These are rehearsal identities in this app, not a shared login with Club. A studio cannot open another studio’s brief. A creator cannot read a proposal that is not theirs.
        </p>
        <label className="mt-8 block max-w-md text-sm">
          <span className="kicker">Act as</span>
          <select
            className="field mt-2"
            value={search.actor ?? "atelier-norte"}
            onChange={(event) => {
              void navigate({ search: { actor: event.target.value } });
            }}
          >
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name} · {actor.kind}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm text-mist">
          Now {workspace.actor.name}. {workspace.briefs.length === 0 ? "No briefs for this identity." : `${workspace.briefs.length} brief${workspace.briefs.length === 1 ? "" : "s"}.`}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <ul className="flex flex-col gap-2">
            {workspace.briefs.map((brief) => (
              <li key={brief.id}>
                <button
                  type="button"
                  className={focus?.brief.id === brief.id ? "chip chip-on w-full" : "chip w-full"}
                  onClick={() => {
                    void navigate({ search: { actor: search.actor ?? "atelier-norte", brief: brief.id } });
                  }}
                >
                  {brief.title}
                </button>
              </li>
            ))}
          </ul>
          {focus ? (
            <section className="card p-5 sm:p-7">
              <p className="kicker">{focus.brief.role === "owner" ? "Your brief" : "Invited"} · {focus.brief.craft}</p>
              <h2 className="display mt-3 text-3xl">{focus.brief.title}</h2>
              <p className="mt-4 text-bone">{focus.brief.summary}</p>
              <h3 className="kicker mt-8">Proposals you can see</h3>
              {focus.proposals.length === 0 ? (
                <p className="mt-3 text-sm text-mist">None yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {focus.proposals.map((item) => (
                    <li key={item.id} className="text-sm">
                      <span className="text-bone">{item.authorName}</span>
                      <span className="mt-1 block">{item.body}</span>
                    </li>
                  ))}
                </ul>
              )}
              {focus.brief.role === "guest" ? (
                <form
                  className="mt-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void run(async () => {
                      await submitProposal({
                        data: { actorId: workspace.actor.id, briefId: focus.brief.id, body: proposal },
                      });
                      setProposal("");
                    });
                  }}
                >
                  <TextField label="Your proposal" value={proposal} onChange={setProposal} textarea />
                  <button type="submit" className="btn btn-primary mt-4" disabled={pending}>
                    Send proposal
                  </button>
                </form>
              ) : null}
              {focus.brief.role === "owner" && focus.inviteOptions.length ? (
                <label className="mt-6 block text-sm">
                  <span className="kicker">Invite a published creator</span>
                  <select
                    className="field mt-2"
                    defaultValue=""
                    onChange={(event) => {
                      const profileId = event.target.value;
                      if (!profileId) return;
                      void run(() =>
                        inviteToBrief({
                          data: { actorId: workspace.actor.id, briefId: focus.brief.id, profileId },
                        }),
                      );
                      event.target.value = "";
                    }}
                  >
                    <option value="">Choose</option>
                    {focus.inviteOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <h3 className="kicker mt-8">Conversation</h3>
              <ul className="mt-3 space-y-3">
                {focus.messages.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className="text-bone">{item.authorName}</span>
                    <span className="mt-1 block">{item.body}</span>
                  </li>
                ))}
              </ul>
              <form
                className="mt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(async () => {
                    await postBriefMessage({
                      data: { actorId: workspace.actor.id, briefId: focus.brief.id, body: message },
                    });
                    setMessage("");
                  });
                }}
              >
                <TextField label="Message" value={message} onChange={setMessage} />
                <button type="submit" className="btn btn-ghost mt-4" disabled={pending}>
                  Send
                </button>
              </form>
            </section>
          ) : (
            <p className="text-mist">Nothing open for this identity.</p>
          )}
        </div>

        {workspace.actor.kind === "studio" ? (
          <form
            className="card mt-8 max-w-2xl p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                const created = await createBrief({
                  data: { actorId: workspace.actor.id, title, summary, craft },
                });
                setTitle("");
                setSummary("");
                await navigate({ search: { actor: workspace.actor.id, brief: created.id } });
              });
            }}
          >
            <p className="kicker">New brief</p>
            <TextField label="Title" value={title} onChange={setTitle} />
            <TextField label="What the work is" value={summary} onChange={setSummary} textarea />
            <TextField label="Craft" value={craft} onChange={setCraft} />
            <button type="submit" className="btn btn-primary mt-4" disabled={pending}>
              Open brief
            </button>
          </form>
        ) : null}
        {error ? <p className="mt-4 text-sm text-sage">{error}</p> : null}
      </div>
    </Shell>
  );
}
