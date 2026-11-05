import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const LINKS = [
  { to: "/club", label: "Club" },
  { to: "/network", label: "Network" },
  { to: "/about", label: "About" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-bone">
      <header className="sticky top-0 z-30 border-b border-bone/10 bg-ink/90 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
            <span className="display text-xl">Millass</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-mist"
                activeProps={{ className: "text-sm text-bone" }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/desk" className="text-sm text-mist" activeProps={{ className: "text-sm text-bone" }}>
              Club desk
            </Link>
            <Link to="/apply" className="btn btn-primary">
              Join Club
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/apply" className="btn btn-primary">
              Join Club
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-bone"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="wrap flex flex-col gap-1 pb-4 md:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex min-h-11 items-center text-base text-bone"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/desk" className="flex min-h-11 items-center text-base text-bone" onClick={() => setOpen(false)}>
              Club desk
            </Link>
          </nav>
        ) : null}
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-bone/10">
        <div className="wrap flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="display text-2xl">Millass</p>
            <p className="mt-2 max-w-md text-sm text-mist">
              Two rooms. Club is for people in movement. Network is for studios and creatives. They do not share a list or a checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/club" className="text-mist">
              Club
            </Link>
            <Link to="/network" className="text-mist">
              Network
            </Link>
            <Link to="/about" className="text-mist">
              About
            </Link>
            <Link to="/desk" className="text-mist">
              Club desk
            </Link>
            <Link to="/network/desk" className="text-mist">
              Network desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
