import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { submitApplication } from "@/lib/millass/api";
import {
  BUDGETS,
  DESTINATIONS,
  EXPERIENCES,
  LEVELS,
  LOOKING_FOR,
  OFFERING,
  PRICING,
  PROFILE_TYPES,
  SPORTS,
  SUPPORT_NEEDS,
  TRAVEL_COMPANY,
  TRIP_LENGTHS,
  blankApplication,
  type ApplicationInput,
} from "@/lib/millass/model";
import { Chip, ChipSet, ConsentRow, TextField, toggleIn } from "@/components/fields";

const DRAFT_KEY = "millass-apply-draft";

type StepId = "profile" | "identity" | "sport" | "intent" | "movement" | "detail" | "consent";

const STEP_META: { id: StepId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "identity", label: "Identity" },
  { id: "sport", label: "Sport" },
  { id: "intent", label: "Intent" },
  { id: "movement", label: "Movement" },
  { id: "detail", label: "Detail" },
  { id: "consent", label: "Consent" },
];

function needsDetail(draft: ApplicationInput): boolean {
  return (
    draft.profileTypes.includes("Athlete") ||
    draft.profileTypes.includes("Provider") ||
    draft.profileTypes.includes("Creator / Media provider")
  );
}

function validateStep(draft: ApplicationInput, step: StepId): string | null {
  if (step === "profile" && draft.profileTypes.length === 0) return "Choose at least one profile.";
  if (step === "identity") {
    if (draft.fullName.trim().length < 2) return "Add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return "Add a valid email.";
    if (!draft.city.trim()) return "Add your city.";
    if (!draft.country.trim()) return "Add your country.";
    if (!draft.languages.trim()) return "Add the languages you use.";
    if (draft.bio.trim().length < 12) return "Write a short bio.";
  }
  if (step === "sport") {
    if (draft.sports.length === 0) return "Choose at least one sport.";
    if (!draft.sportLevel) return "Choose a level.";
  }
  if (step === "intent") {
    if (draft.lookingFor.length === 0) return "Choose at least one thing you are looking for.";
    const offers =
      draft.profileTypes.includes("Provider") ||
      draft.profileTypes.includes("Creator / Media provider");
    if (offers && draft.offering.length === 0) return "Providers and creators should mark what they offer.";
  }
  if (step === "detail") {
    if (draft.profileTypes.includes("Athlete")) {
      if (!draft.sportGoal.trim()) return "Add the sport goal.";
      if (draft.supportNeeds.length === 0) return "Mark the support you need.";
      if (draft.projectDescription.trim().length < 10) return "Describe the project in a few sentences.";
    }
    if (
      draft.profileTypes.includes("Provider") ||
      draft.profileTypes.includes("Creator / Media provider")
    ) {
      if (draft.offerDetail.trim().length < 10) return "Describe what you offer.";
      if (!draft.operatesWhere.trim()) return "Say where you operate.";
      if (!draft.pricingModel) return "Choose a pricing model.";
      if (!draft.portfolioUrl.trim()) return "Add a portfolio or work link.";
    }
  }
  if (step === "consent" && !draft.contactConsent) {
    return "Agree to be contacted about the private beta.";
  }
  return null;
}

function isDraft(value: unknown): value is ApplicationInput {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ApplicationInput>;
  return typeof record.fullName === "string" && Array.isArray(record.profileTypes);
}

export function ApplyForm() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ApplicationInput>(blankApplication);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const steps = useMemo(
    () => STEP_META.filter((step) => step.id !== "detail" || needsDetail(draft)),
    [draft],
  );
  const step = steps[Math.min(index, steps.length - 1)];
  const last = step?.id === "consent";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isDraft(parsed)) {
          setDraft({ ...blankApplication(), ...parsed, source: "apply" });
        }
      }
    } catch {
      /* ignore a broken draft */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, ready]);

  function patch(partial: Partial<ApplicationInput>) {
    setDraft((current) => ({ ...current, ...partial }));
    setError(null);
  }

  function go(nextIndex: number) {
    if (!step) return;
    if (nextIndex > index) {
      const message = validateStep(draft, step.id);
      if (message) {
        setError(message);
        return;
      }
    }
    setError(null);
    setIndex(Math.max(0, Math.min(nextIndex, steps.length - 1)));
  }

  async function submit() {
    if (!step) return;
    const message = validateStep(draft, step.id);
    if (message) {
      setError(message);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await submitApplication({ data: { ...draft, source: "apply" } });
      localStorage.removeItem(DRAFT_KEY);
      await navigate({ to: "/thanks/$id", params: { id: result.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The application did not go through. Try again.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (last) void submit();
        else go(index + 1);
      }}
    >
      <ol className="flex gap-4 overflow-x-auto pb-2">
        {steps.map((item, itemIndex) => (
          <li key={item.id}>
            <button
              type="button"
              className={itemIndex === index ? "kicker text-sage" : "kicker"}
              disabled={itemIndex > index}
              onClick={() => go(itemIndex)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step?.id === "profile" ? (
          <>
            <h2 className="display text-3xl">How should the desk read you?</h2>
            <p className="mt-3 max-w-xl text-mist">Choose every profile that is true. Most people need one. Some need two.</p>
            <ChipSet label="Profile">
              {PROFILE_TYPES.map((type) => (
                <Chip
                  key={type}
                  pressed={draft.profileTypes.includes(type)}
                  onClick={() => patch({ profileTypes: toggleIn(draft.profileTypes, type) })}
                >
                  {type}
                </Chip>
              ))}
            </ChipSet>
          </>
        ) : null}

        {step?.id === "identity" ? (
          <>
            <h2 className="display text-3xl">Identity</h2>
            <p className="mt-3 max-w-xl text-mist">Write as you would to a person. The desk reads this. It is not published in full.</p>
            <TextField label="Full name" value={draft.fullName} onChange={(fullName) => patch({ fullName })} autoComplete="name" />
            <TextField label="Email" type="email" value={draft.email} onChange={(email) => patch({ email })} autoComplete="email" />
            <TextField label="Phone" type="tel" optional value={draft.phone} onChange={(phone) => patch({ phone })} autoComplete="tel" />
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
              <TextField label="City" value={draft.city} onChange={(city) => patch({ city })} autoComplete="address-level2" />
              <TextField label="Country" value={draft.country} onChange={(country) => patch({ country })} autoComplete="country-name" />
            </div>
            <TextField label="Languages" value={draft.languages} onChange={(languages) => patch({ languages })} hint="The languages you can actually use." />
            <TextField label="Short bio" textarea value={draft.bio} onChange={(bio) => patch({ bio })} hint="A few sentences on how you move, and why this club." />
            <TextField label="Instagram" optional value={draft.instagram} onChange={(instagram) => patch({ instagram })} hint="A handle or a link." />
            <TextField label="Website" optional value={draft.website} onChange={(website) => patch({ website })} />
          </>
        ) : null}

        {step?.id === "sport" ? (
          <>
            <h2 className="display text-3xl">Sport</h2>
            <p className="mt-3 max-w-xl text-mist">Mark what you actually do. Level is where you are now, not where you would like to be introduced.</p>
            <ChipSet label="Sports">
              {SPORTS.map((sport) => (
                <Chip key={sport} pressed={draft.sports.includes(sport)} onClick={() => patch({ sports: toggleIn(draft.sports, sport) })}>
                  {sport}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Level">
              {LEVELS.map((level) => (
                <Chip key={level} pressed={draft.sportLevel === level} onClick={() => patch({ sportLevel: draft.sportLevel === level ? "" : level })}>
                  {level}
                </Chip>
              ))}
            </ChipSet>
          </>
        ) : null}

        {step?.id === "intent" ? (
          <>
            <h2 className="display text-3xl">What you want, and what you bring</h2>
            <ChipSet label="Looking for" hint="Choose every reason that is real.">
              {LOOKING_FOR.map((item) => (
                <Chip key={item} pressed={draft.lookingFor.includes(item)} onClick={() => patch({ lookingFor: toggleIn(draft.lookingFor, item) })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Offering" hint="Leave this empty if you are not offering anything yet.">
              {OFFERING.map((item) => (
                <Chip key={item} pressed={draft.offering.includes(item)} onClick={() => patch({ offering: toggleIn(draft.offering, item) })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
          </>
        ) : null}

        {step?.id === "movement" ? (
          <>
            <h2 className="display text-3xl">Movement</h2>
            <p className="mt-3 max-w-xl text-mist">Leave this blank if you are not planning travel. Interest in future experiences is stored with the application. Nothing here is a booking.</p>
            <ChipSet label="Destinations">
              {DESTINATIONS.map((item) => (
                <Chip key={item} pressed={draft.destinations.includes(item)} onClick={() => patch({ destinations: toggleIn(draft.destinations, item) })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Trip length">
              {TRIP_LENGTHS.map((item) => (
                <Chip key={item} pressed={draft.tripLength === item} onClick={() => patch({ tripLength: draft.tripLength === item ? "" : item })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Budget">
              {BUDGETS.map((item) => (
                <Chip key={item} pressed={draft.budget === item} onClick={() => patch({ budget: draft.budget === item ? "" : item })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Travel company">
              {TRAVEL_COMPANY.map((item) => (
                <Chip key={item} pressed={draft.travelCompany === item} onClick={() => patch({ travelCompany: draft.travelCompany === item ? "" : item })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <ChipSet label="Future experiences" hint="Optional. Summer camps, trips, and gatherings are not open for booking.">
              {EXPERIENCES.map((item) => (
                <Chip key={item} pressed={draft.experiences.includes(item)} onClick={() => patch({ experiences: toggleIn(draft.experiences, item) })}>
                  {item}
                </Chip>
              ))}
            </ChipSet>
            <TextField
              label="Experience note"
              optional
              textarea
              value={draft.experienceNote}
              onChange={(experienceNote) => patch({ experienceNote })}
              hint="Anything the desk should know. No payment is taken."
            />
          </>
        ) : null}

        {step?.id === "detail" ? (
          <>
            <h2 className="display text-3xl">A more precise account</h2>
            <p className="mt-3 max-w-xl text-mist">These questions appear because of the profile you chose.</p>
            {draft.profileTypes.includes("Athlete") ? (
              <div className="mt-8">
                <p className="kicker">Athlete / project support</p>
                <TextField label="Sport goal" value={draft.sportGoal} onChange={(sportGoal) => patch({ sportGoal })} />
                <ChipSet label="Support needed">
                  {SUPPORT_NEEDS.map((item) => (
                    <Chip
                      key={item}
                      pressed={draft.supportNeeds.includes(item)}
                      onClick={() => patch({ supportNeeds: toggleIn(draft.supportNeeds, item) })}
                    >
                      {item}
                    </Chip>
                  ))}
                </ChipSet>
                <TextField
                  label="Project"
                  textarea
                  maxLength={1200}
                  value={draft.projectDescription}
                  onChange={(projectDescription) => patch({ projectDescription })}
                  hint="What the support is for. Keep it specific."
                />
              </div>
            ) : null}
            {draft.profileTypes.includes("Provider") || draft.profileTypes.includes("Creator / Media provider") ? (
              <div className="mt-8">
                <p className="kicker">Practice</p>
                <TextField
                  label="What you offer"
                  textarea
                  value={draft.offerDetail}
                  onChange={(offerDetail) => patch({ offerDetail })}
                />
                <TextField label="Where you operate" value={draft.operatesWhere} onChange={(operatesWhere) => patch({ operatesWhere })} />
                <ChipSet label="Pricing model">
                  {PRICING.map((item) => (
                    <Chip
                      key={item}
                      pressed={draft.pricingModel === item}
                      onClick={() => patch({ pricingModel: draft.pricingModel === item ? "" : item })}
                    >
                      {item}
                    </Chip>
                  ))}
                </ChipSet>
                <TextField label="Portfolio or work link" value={draft.portfolioUrl} onChange={(portfolioUrl) => patch({ portfolioUrl })} />
              </div>
            ) : null}
          </>
        ) : null}

        {step?.id === "consent" ? (
          <>
            <h2 className="display text-3xl">Before it goes to the desk</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="kicker">Name</dt>
                <dd className="mt-1">{draft.fullName || "—"}</dd>
              </div>
              <div>
                <dt className="kicker">Profiles</dt>
                <dd className="mt-1">{draft.profileTypes.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="kicker">Sport</dt>
                <dd className="mt-1">
                  {draft.sports.join(", ") || "—"}
                  {draft.sportLevel ? ` · ${draft.sportLevel}` : ""}
                </dd>
              </div>
              <div>
                <dt className="kicker">From</dt>
                <dd className="mt-1">{[draft.city, draft.country].filter(Boolean).join(", ") || "—"}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <ConsentRow
                pressed={draft.contactConsent}
                onClick={() => patch({ contactConsent: !draft.contactConsent })}
                title="Contact me about the private beta"
                detail="Required. The desk may write to the email you gave. Nothing is sent automatically."
              />
              <ConsentRow
                pressed={draft.publicPreview}
                onClick={() => patch({ publicPreview: !draft.publicPreview })}
                title="I may appear in a public profile preview"
                detail="Optional. Email, phone, and desk notes stay off the preview either way."
              />
            </div>
          </>
        ) : null}
      </div>

      {error ? <p className="mt-6 text-sm text-sage">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        {index > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => go(index - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {last ? (pending ? "Sending" : "Submit application") : "Continue"}
        </button>
      </div>
    </form>
  );
}
