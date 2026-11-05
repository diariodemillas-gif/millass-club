import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { listDirectory } from "@/lib/millass/network-api";

export const Route = createFileRoute("/network/directory")({
  loader: () => listDirectory(),
  head: () => ({ meta: [{ title: "Directory · Millass Network" }] }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const studios = Route.useLoaderData();
  const [craft, setCraft] = useState("");
  const [style, setStyle] = useState("");
  const [territory, setTerritory] = useState("");
  const crafts = [...new Set(studios.map((item) => item.craft))].sort();
  const styles = [...new Set(studios.map((item) => item.style))].sort();
  const territories = [...new Set(studios.map((item) => item.territory))].sort();
  const shown = useMemo(
    () =>
      studios.filter((item) => {
        if (craft && item.craft !== craft) return false;
        if (style && item.style !== style) return false;
        if (territory && item.territory !== territory) return false;
        return true;
      }),
    [studios, craft, style, territory],
  );

  return (
    <Shell>
      <div className="wrap py-14">
        <p className="kicker">Directory</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Published work only.</h1>
        <p className="mt-4 max-w-xl text-mist">Emails, drafts, and suspended profiles are not on this page.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Filter label="Craft" value={craft} options={crafts} onChange={setCraft} />
          <Filter label="Style" value={style} options={styles} onChange={setStyle} />
          <Filter label="Territory" value={territory} options={territories} onChange={setTerritory} />
        </div>
        {shown.length === 0 ? (
          <p className="mt-10 text-bone">No one matches this reading.</p>
        ) : (
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {shown.map((studio) => (
              <li key={studio.id}>
                <Link to="/network/studio/$id" params={{ id: studio.id }} className="card block p-5">
                  <p className="kicker">
                    {studio.kind === "studio" ? "Studio" : "Independent"} · {studio.craft}
                  </p>
                  <h2 className="display mt-3 text-3xl">{studio.name}</h2>
                  <p className="mt-2 text-sm text-mist">
                    {studio.city} · {studio.territory} · {studio.style}
                  </p>
                  <p className="mt-4 text-bone">{studio.bio}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-40 flex-1 text-sm">
      <span className="kicker">{label}</span>
      <select className="field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
