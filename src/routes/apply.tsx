import { createFileRoute } from "@tanstack/react-router";
import { ApplyForm } from "@/components/apply-form";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Apply · Millass Club" }] }),
  component: ApplyPage,
});

function ApplyPage() {
  return (
    <Shell>
      <div className="wrap py-14 sm:py-20">
        <p className="kicker">Private beta</p>
        <h1 className="display mt-4 max-w-3xl text-4xl sm:text-5xl">Apply to join</h1>
        <p className="mt-4 max-w-xl text-mist">
          The form keeps a draft on this device until you send it. Required fields are checked before the desk receives anything.
        </p>
        <div className="mt-10 max-w-3xl">
          <ApplyForm />
        </div>
      </div>
    </Shell>
  );
}
