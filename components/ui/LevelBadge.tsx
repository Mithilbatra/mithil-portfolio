import { LEVELS, type Level } from "@/lib/data";

export default function LevelBadge({
  level,
  emoji = true,
  className = "",
}: {
  level: Level;
  emoji?: boolean;
  className?: string;
}) {
  const l = LEVELS[level];
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${className}`}
      style={{ color: l.color }}
    >
      {emoji ? (
        <span aria-hidden style={{ fontSize: "0.95em", lineHeight: 1 }}>
          {l.emoji}
        </span>
      ) : null}
      {l.label}
    </span>
  );
}
