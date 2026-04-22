import {
  Activity,
  BarChart3,
  Flame,
  Gauge,
  LineChart,
  Radio,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

type FloatSpec = {
  Icon: LucideIcon;
  className: string;
  size: number;
  delay: number;
  duration: number;
  rotate?: number;
};

const ICONS: FloatSpec[] = [
  { Icon: Zap, className: "top-[12%] left-[6%]", size: 28, delay: 0, duration: 8, rotate: -8 },
  { Icon: Flame, className: "top-[18%] right-[8%]", size: 34, delay: 1.5, duration: 10, rotate: 12 },
  { Icon: TrendingUp, className: "top-[56%] left-[4%]", size: 32, delay: 3, duration: 11 },
  { Icon: Activity, className: "top-[68%] right-[12%]", size: 26, delay: 2, duration: 9, rotate: -5 },
  { Icon: Gauge, className: "top-[32%] left-[42%]", size: 38, delay: 4, duration: 12, rotate: 6 },
  { Icon: LineChart, className: "bottom-[8%] left-[28%]", size: 30, delay: 1, duration: 9 },
  { Icon: BarChart3, className: "top-[8%] left-[52%]", size: 24, delay: 3.5, duration: 8 },
  { Icon: Radio, className: "bottom-[18%] right-[28%]", size: 22, delay: 2.5, duration: 10, rotate: 4 },
];

export function FloatingEnergyIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {ICONS.map((spec, i) => {
        const Icon = spec.Icon;
        return (
          <span
            key={i}
            className={`absolute ${spec.className}`}
            style={spec.rotate ? { transform: `rotate(${spec.rotate}deg)` } : undefined}
          >
            <span
              className="float-icon block"
              style={{
                position: "static",
                animationDelay: `${spec.delay}s`,
                animationDuration: `${spec.duration}s`,
              }}
            >
              <Icon size={spec.size} strokeWidth={1.5} className="text-primary/50" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
