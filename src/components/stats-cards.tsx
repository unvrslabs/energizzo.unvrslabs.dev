import { Users, Activity, Calendar, Trophy } from "lucide-react";

type Stats = {
  total: number;
  inPipeline: number;
  demoDone: number;
  won: number;
};

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    { label: "Totale lead", value: stats.total, icon: Users, accent: "from-blue-400/30 to-blue-400/0" },
    { label: "In pipeline", value: stats.inPipeline, icon: Activity, accent: "from-purple-400/30 to-purple-400/0" },
    { label: "Demo effettuate", value: stats.demoDone, icon: Calendar, accent: "from-pink-400/30 to-pink-400/0" },
    { label: "Chiusi vinti", value: stats.won, icon: Trophy, accent: "from-emerald-400/30 to-emerald-400/0" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="liquid-glass-hover rounded-[1.5rem] p-5 relative overflow-hidden group"
        >
          <div
            className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${it.accent} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
            aria-hidden
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {it.label}
              </p>
              <p className="mt-1.5 text-4xl font-black tracking-tight tabular-nums">
                {it.value.toLocaleString("it-IT")}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <it.icon className="h-4 w-4 text-foreground/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
