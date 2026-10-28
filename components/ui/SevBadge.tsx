const SEV: Record<1 | 2 | 3, { label: string; word: string; color: string; emoji: string }> = {
  1: { label: "SEV-1", word: "critical", color: "var(--crit-bright)", emoji: "🚨" },
  2: { label: "SEV-2", word: "major", color: "var(--warn)", emoji: "🟡" },
  3: { label: "SEV-3", word: "minor", color: "var(--info)", emoji: "🔵" },
};

export default function SevBadge({
  severity,
  showWord = true,
}: {
  severity: 1 | 2 | 3;
  showWord?: boolean;
}) {
  const s = SEV[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}33` }}
    >
      <span aria-hidden style={{ fontSize: "0.95em", lineHeight: 1 }}>
        {s.emoji}
      </span>
      {s.label}
      {showWord ? <span className="hidden text-faint sm:inline">· {s.word}</span> : null}
    </span>
  );
}
