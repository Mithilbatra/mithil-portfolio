import { ogCard, ogSize } from "@/lib/og-card";
import { CASE_FILES } from "@/lib/data";

export const alt = "Incident report — Mithil Batra";
export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => CASE_FILES.map((c) => ({ slug: c.slug }));

const SEV = { 1: ["#ff4757", "SEV-1 · CRITICAL"], 2: ["#f5b14c", "SEV-2 · MAJOR"], 3: ["#56c7f0", "SEV-3 · MINOR"] } as const;

export default function Image({ params }: { params: { slug: string } }) {
  const c = CASE_FILES.find((x) => x.slug === params.slug) ?? CASE_FILES[0];
  const [color, tag] = SEV[c.severity];
  return ogCard({
    kicker: `CASE STUDY · INC-${c.id}`,
    title: c.title,
    subtitle: c.symptom,
    tag,
    color,
    footer: `RESOLVED · ${c.stack.slice(0, 4).join(" · ")}`,
  });
}
