import { useState } from "react";
import { submitInterest } from "@/lib/millass/network-api";
import { TextField } from "@/components/fields";

export function InterestCapture({ realm }: { realm: "club" | "network" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (name.trim().length < 2) return setError("Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Add a valid email.");
    if (!consent) return setError(realm === "club" ? "Agree to the Club list only." : "Agree to the Network list only.");
    setPending(true);
    setError(null);
    try {
      await submitInterest({
        data: {
          realm,
          name,
          email,
          note,
          source: realm === "club" ? "club-landing" : "network-landing",
          consent: true,
        },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through.");
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card p-5 sm:p-8">
        <p className="kicker">{realm === "club" ? "Club list" : "Network list"}</p>
        <h2 className="display mt-3 text-3xl">You are on this list only.</h2>
        <p className="mt-3 text-mist">
          {realm === "club"
            ? "This is not a Network opt-in, and it is not a booking."
            : "This is not a Club opt-in, and it does not publish a profile."}
        </p>
      </div>
    );
  }

  return (
    <form
      className="card p-5 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="kicker">{realm === "club" ? "Club list" : "Network list"}</p>
      <h2 className="display mt-3 text-3xl">
        {realm === "club" ? "Hear about Club, nothing else." : "Hear about Network, nothing else."}
      </h2>
      <TextField label="Name" value={name} onChange={setName} autoComplete="name" />
      <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <TextField label="Note" value={note} onChange={setNote} />
      <label className="mt-5 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-sage"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            setError(null);
          }}
        />
        <span>
          {realm === "club"
            ? "I agree to be contacted about Millass Club only. This is not consent for Network or for marketing beyond that."
            : "I agree to be contacted about Millass Network only. This is not consent for Club or for marketing beyond that."}
        </span>
      </label>
      {error ? <p className="mt-4 text-sm text-sage">{error}</p> : null}
      <button type="submit" className="btn btn-primary mt-6" disabled={pending}>
        {pending ? "Saving" : "Join this list"}
      </button>
    </form>
  );
}
