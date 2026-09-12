import type { ReactNode } from "react";
import { type Level } from "@/lib/data";
import LevelBadge from "./LevelBadge";

/**
 * One row of a log viewer: [gutter] [time] LEVEL [source] message
 * Everything except `level` + `children` is optional, so the same row works
 * for a streaming console line or a plain architecture bullet.
 */
export default function LogLine({
  n,
  time,
  level,
  source,
  children,
  emoji = true,
  className = "",
}: {
  n?: number;
  time?: string;
  level: Level;
  source?: string;
  children: ReactNode;
  emoji?: boolean;
  className?: string;
}) {
  return (
    <div className={`logrow lvl-${level} font-mono text-[12.5px] leading-[1.85] ${className}`} data-level={level}>
      {n != null ? <span className="gutter">{String(n).padStart(2, "0")}</span> : null}
      {time ? <span className="flex-none tabular-nums text-faint">{time}</span> : null}
      <span className="flex-none pt-[1px]">
        <LevelBadge level={level} emoji={emoji} />
      </span>
      {source ? (
        <span className="flex-none truncate text-faint" style={{ minWidth: "88px", maxWidth: "120px" }}>
          {source}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 break-words text-dim">{children}</span>
    </div>
  );
}
