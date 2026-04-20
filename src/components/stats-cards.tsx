import { Users, Activity, Calendar, Trophy } from "lucide-react";

type Stats = {
  total: number;
  inPipeline: number;
  demoDone: number;
  won: number;
};

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    { label: "Totale lead", value: stats.total, icon: Users, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
    { label: "In pipeline", value: stats.inPipeline, icon: Activity, color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-400" },
    { label: "Demo effettuate", value: stats.demoDone, icon: Calendar, color: "from-pink-500/20 to-pink-500/5", iconColor: "text-pink-400" },
    { label: "Chiusi vinti", value: stats.won, icon: Trophy, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className={`glass rounded-lg p-4 bg-gradient-to-br ${it.color} relative overflow-hidden`}
        >
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{it.value.toLocaleString("it-IT")}</p>
            </div>
            <it.icon className={`h-5 w-5 ${it.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
