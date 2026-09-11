import type { CaseStatus } from "@/lib/data";

const MAP: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  LIVE: { label: "LIVE", color: "var(--info)", bg: "rgba(86,199,240,0.12)" },
  SHIPPED: { label: "SHIPPED", color: "var(--ok)", bg: "rgba(70,212,138,0.12)" },
  ACTIVE: { label: "ACTIVE", color: "var(--warn)", bg: "rgba(245,177,76,0.12)" },
  ARCHIVED: { label: "ARCHIVED", color: "var(--text-faint)", bg: "rgba(95,107,123,0.12)" },
};

export default function StatusChip({ status }: { status: CaseStatus }) {
  const s = MAP[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
