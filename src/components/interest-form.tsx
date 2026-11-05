import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { submitApplication } from "@/lib/millass/api";
import { DESTINATIONS, EXPERIENCES, blankApplication } from "@/lib/millass/model";
import { Chip, ChipSet, ConsentRow, TextField, toggleIn } from "@/components/fields";

export function InterestForm() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => blankApplication());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function patch(partial: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setError(null);
  }

  async function submit() {
    if (draft.fullName.trim().length < 2) return setError("Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return setError("Add a valid email.");
    if (!draft.city.trim() || !draft.country.trim()) return setError("Add your city and country.");
    if (draft.experiences.length === 0) return setError("Choose at least one experience.");
    if (!draft.contactConsent) return setError("Agree to be contacted about the private beta.");
    setPending(true);
    try {
      const result = await submitApplication({
        data: {
          ...blankApplication(),
          source: "experience",
          fullName: draft.fullName,
          email: draft.email,
          city: draft.city,
          country: draft.country,
          destinations: draft.destinations,
          experiences: draft.experiences,
          experienceNote: draft.experienceNote,
          bio: draft.experienceNote,
          contactConsent: true,
          publicPreview: draft.publicPreview,
        },
      });
      await navigate({ to: "/thanks/$id", params: { id: result.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That interest did not go through. Try again.");
      setPending(false);
    }
  }

  return (
    <form
      className="card p-5 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="kicker">Register interest</p>
      <h2 className="display mt-3 text-3xl">Tell the desk you want to be considered.</h2>
      <TextField label="Full name" value={draft.fullName} onChange={(fullName) => patch({ fullName })} autoComplete="name" />
      <TextField label="Email" type="email" value={draft.email} onChange={(email) => patch({ email })} autoComplete="email" />
      <div className="grid sm:grid-cols-2 sm:gap-4">
        <TextField label="City" value={draft.city} onChange={(city) => patch({ city })} autoComplete="address-level2" />
        <TextField label="Country" value={draft.country} onChange={(country) => patch({ country })} autoComplete="country-name" />
      </div>
      <ChipSet label="Experiences">
        {EXPERIENCES.map((item) => (
          <Chip key={item} pressed={draft.experiences.includes(item)} onClick={() => patch({ experiences: toggleIn(draft.experiences, item) })}>
            {item}
          </Chip>
        ))}
      </ChipSet>
      <ChipSet label="Places" hint="Optional.">
        {DESTINATIONS.map((item) => (
          <Chip key={item} pressed={draft.destinations.includes(item)} onClick={() => patch({ destinations: toggleIn(draft.destinations, item) })}>
            {item}
          </Chip>
        ))}
      </ChipSet>
      <TextField
        label="Note"
        optional
        textarea
        value={draft.experienceNote}
        onChange={(experienceNote) => patch({ experienceNote })}
        hint="Season, group size, or a constraint. Still not a booking."
      />
      <div className="mt-6">
        <ConsentRow
          pressed={draft.contactConsent}
          onClick={() => patch({ contactConsent: !draft.contactConsent })}
          title="Contact me about the private beta"
          detail="Required. Interest is stored with an application record."
        />
        <ConsentRow
          pressed={draft.publicPreview}
          onClick={() => patch({ publicPreview: !draft.publicPreview })}
          title="I may appear in a public profile preview"
          detail="Optional. Your email stays off the preview."
        />
      </div>
      {error ? <p className="mt-6 text-sm text-sage">{error}</p> : null}
      <button type="submit" className="btn btn-primary mt-8" disabled={pending}>
        {pending ? "Sending" : "Register interest"}
      </button>
    </form>
  );
}
