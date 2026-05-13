import {
  Bell,
  CheckCircle2,
  Clock3,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";

const metricCards = [
  {
    title: "Completed",
    value: "1,284",
    trend: "+12%",
    tone: "positive",
    icon: CheckCircle2,
  },
  {
    title: "Updated",
    value: "852",
    trend: "Stable",
    tone: "muted",
    icon: Clock3,
  },
  {
    title: "Created",
    value: "421",
    trend: "+5%",
    tone: "positive",
    icon: PlusCircle,
  },
  {
    title: "Due Soon",
    value: "18",
    trend: "Critical",
    tone: "danger",
    icon: Bell,
  },
] as const;

const activities = [
  {
    user: "Sarah Jenkins",
    action: "published",
    target: "Q3 Financial Summary",
    time: "24 minutes ago",
    team: "Reports",
    status: "Published",
  },
  {
    user: "Markus Weber",
    action: "updated",
    target: "API Documentation",
    time: "1 hour ago",
    team: "Dev Ops",
    status: "Modified",
  },
  {
    user: "Elena Rodriguez",
    action: "assigned 4 cards to",
    target: "Design Team",
    time: "3 hours ago",
    team: "Product",
    status: "Assigned",
  },
  {
    user: "James Chen",
    action: "deleted",
    target: "Deprecated_v2_Schema",
    time: "5 hours ago",
    team: "Database",
    status: "Removed",
  },
] as const;

const workloads = [
  { name: "Sophia Miller", capacity: 85, state: "High Load" },
  { name: "Daniel Choi", capacity: 42, state: "Optimal" },
  { name: "Lila Thorne", capacity: 95, state: "Overload" },
  { name: "Marcus Reed", capacity: 15, state: "Available" },
] as const;

export default function StatisticPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="sticky top-0 z-20 -mx-8 border-b border-border/70 bg-background/90 px-8 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">Precision Analytics</h1>
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-9 w-64 rounded-md border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none ring-0 transition focus:border-primary"
                  placeholder="Search data..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Bell className="size-4" />
              </button>
              <button className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Settings className="size-4" />
              </button>
              <div className="ml-2 border-l border-border pl-3 text-right">
                <p className="text-sm font-semibold">Alex Sterling</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Admin</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                AS
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <article
              key={card.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-muted p-2 text-primary">
                  <card.icon className="size-4" />
                </div>
                <span className="rounded px-2 py-1 text-xs font-bold text-muted-foreground">
                  {card.trend}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.title}</p>
              <h2 className="mt-1 text-3xl font-black text-foreground">{card.value}</h2>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black">Recent Activity</h2>
              <button className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                View All Logs
              </button>
            </div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={`${activity.user}-${activity.target}`} className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {activity.user
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-primary">{activity.user}</span> {activity.action}{" "}
                      <span className="italic">{activity.target}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {activity.time} in{" "}
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-foreground">
                        {activity.team}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-foreground">
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-black">Priority Breakdown</h2>
              <div className="mx-auto flex w-48 flex-col items-center">
                <div className="relative size-48">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--muted)" strokeWidth="4" />
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="color-mix(in oklch, var(--destructive) 45%, transparent)" strokeDasharray="24 76" strokeDashoffset="0" strokeWidth="4" />
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="color-mix(in oklch, var(--primary) 55%, transparent)" strokeDasharray="42 58" strokeDashoffset="-24" strokeWidth="4" />
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--primary)" strokeDasharray="34 66" strokeDashoffset="-66" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">100%</span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Total cards</span>
                  </div>
                </div>
                <div className="mt-8 grid w-full gap-3">
                  <LegendItem color="bg-destructive" label="Urgent" value="24%" />
                  <LegendItem color="bg-primary" label="High Priority" value="42%" />
                  <LegendItem color="bg-primary/50" label="Normal" value="34%" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Team Workload</h2>
              <p className="text-sm text-muted-foreground">Real-time capacity tracking for active sprints</p>
            </div>
          </div>
          <div className="space-y-5">
            {workloads.map((workload) => (
              <div key={workload.name} className="rounded-lg border border-border/70 bg-muted/25 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-sm font-semibold">{workload.name}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {workload.state}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${workload.capacity}%` }} />
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {workload.capacity}% Capacity
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className={`size-3 rounded-full ${color}`} />
        <span className="font-bold text-muted-foreground">{label}</span>
      </div>
      <span className="font-black">{value}</span>
    </div>
  );
}
