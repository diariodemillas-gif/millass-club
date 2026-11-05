import type { ReactNode } from "react";

export function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={pressed ? "chip chip-on" : "chip"}>
      {children}
    </button>
  );
}

export function ChipSet({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 border-0 p-0">
      <legend className="kicker">{label}</legend>
      {hint ? <p className="mt-2 max-w-xl text-sm text-mist">{hint}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  optional,
  textarea,
  hint,
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
  textarea?: boolean;
  hint?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const limit = maxLength ?? (textarea ? 800 : 200);
  return (
    <label className="mt-5 block" htmlFor={id}>
      <span className="kicker">
        {label}
        {optional ? <span className="ml-2 font-normal tracking-normal normal-case text-mist">Optional</span> : null}
      </span>
      {hint ? <span className="mt-2 block text-sm text-mist">{hint}</span> : null}
      {textarea ? (
        <textarea
          id={id}
          className="field mt-2"
          value={value}
          maxLength={limit}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className="field mt-2"
          type={type}
          value={value}
          autoComplete={autoComplete}
          maxLength={limit}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function ConsentRow({
  pressed,
  onClick,
  title,
  detail,
}: {
  pressed: boolean;
  onClick: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="card mt-3 flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
    >
      <span>
        <span className="block text-bone">{title}</span>
        <span className="mt-1 block text-sm text-mist">{detail}</span>
      </span>
      <span className={pressed ? "chip chip-on shrink-0" : "chip shrink-0"}>{pressed ? "Yes" : "No"}</span>
    </button>
  );
}

export function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function Pills({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-mist">None marked.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="pill">
          {item}
        </span>
      ))}
    </div>
  );
}
