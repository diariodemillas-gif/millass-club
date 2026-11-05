import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { TextField } from "@/components/fields";
import { submitNetworkProfile } from "@/lib/millass/network-api";

const CRAFTS = ["Editing", "Photography", "Design", "Motion", "Direction"];
const STYLES = ["Documentary", "Coastal", "Editorial", "Quiet"];

export const Route = createFileRoute("/network/join")({
  head: () => ({ meta: [{ title: "Offer a practice · Millass Network" }] }),
  component: JoinPage,
});

function JoinPage() {
  const [kind, setKind] = useState<"creator" | "studio">("creator");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [territory, setTerritory] = useState("");
  const [craft, setCraft] = useState(CRAFTS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!consent) return setError("Consent is required, and it does not publish the profile.");
    setPending(true);
    setError(null);
    try {
      await submitNetworkProfile({
        data: { kind, name, city, territory, craft, style, bio, email, portfolio, consent: true },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
      setPending(false);
    }
  }

  return (
    <Shell>
      <div className="wrap py-14">
        <p className="kicker">Network</p>
        <h1 className="display mt-3 max-w-3xl text-4xl sm:text-5xl">Offer a practice. It stays unpublished.</h1>
        {done ? (
          <p className="mt-8 max-w-xl text-lg">
            Submitted. The directory will not show this until the Network desk publishes it. You cannot publish it from this form.
          </p>
        ) : (
          <form
            className="card mt-8 max-w-2xl p-5 sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="flex gap-2">
              <button type="button" className={kind === "creator" ? "chip chip-on" : "chip"} onClick={() => setKind("creator")}>
                Independent
              </button>
              <button type="button" className={kind === "studio" ? "chip chip-on" : "chip"} onClick={() => setKind("studio")}>
                Studio
              </button>
            </div>
            <TextField label="Name" value={name} onChange={setName} />
            <div className="grid sm:grid-cols-2 sm:gap-4">
              <TextField label="City" value={city} onChange={setCity} />
              <TextField label="Territory" value={territory} onChange={setTerritory} />
            </div>
            <label className="mt-4 block text-sm">
              <span className="kicker">Craft</span>
              <select className="field mt-2" value={craft} onChange={(event) => setCraft(event.target.value)}>
                {CRAFTS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm">
              <span className="kicker">Style</span>
              <select className="field mt-2" value={style} onChange={(event) => setStyle(event.target.value)}>
                {STYLES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <TextField label="What you actually do" value={bio} onChange={setBio} textarea />
            <TextField label="Private email" type="email" value={email} onChange={setEmail} />
            <TextField label="One public link" value={portfolio} onChange={setPortfolio} />
            <label className="mt-5 flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 size-4 accent-sage" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>I agree to be read by the Network desk. This is not permission to publish, and not a Club opt-in.</span>
            </label>
            {error ? <p className="mt-4 text-sm text-sage">{error}</p> : null}
            <button type="submit" className="btn btn-primary mt-6" disabled={pending}>
              {pending ? "Sending" : "Submit for review"}
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
}
