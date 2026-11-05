import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { DeskApp, type DeskView } from "@/components/desk";
import { getDesk } from "@/lib/millass/api";
import { listInterest } from "@/lib/millass/network-api";

const VIEWS = ["overview", "members", "athletes", "providers", "experiences"] as const;

export const Route = createFileRoute("/desk")({
  validateSearch: (search: Record<string, unknown>) => {
    const parsed: { view?: DeskView; member?: string } = {};
    if (VIEWS.includes(search.view as DeskView)) parsed.view = search.view as DeskView;
    if (typeof search.member === "string" && search.member) parsed.member = search.member;
    return parsed;
  },
  loader: async () => {
    const desk = await getDesk();
    const leads = await listInterest({ data: { realm: "club" } });
    return { ...desk, leads };
  },
  head: () => ({ meta: [{ title: "Club desk · Millass Club" }] }),
  component: DeskPage,
});

function DeskPage() {
  const { members, metrics, leads } = Route.useLoaderData();
  const search = Route.useSearch();
  const view = search.view ?? "overview";
  return (
    <Shell>
      <DeskApp members={members} metrics={metrics} view={view} memberId={search.member} leads={leads} />
    </Shell>
  );
}
