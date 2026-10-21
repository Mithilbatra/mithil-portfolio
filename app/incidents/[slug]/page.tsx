import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_FILES } from "@/lib/data";
import SeverityProvider from "@/components/severity/SeverityProvider";
import StatusBar from "@/components/StatusBar";
import CaseFile from "@/components/CaseFile";
import Footer from "@/components/Footer";

type Props = { params: { slug: string } };
const find = (slug: string) => CASE_FILES.find((c) => c.slug === slug);

export const dynamicParams = false;
export const generateStaticParams = () => CASE_FILES.map((c) => ({ slug: c.slug }));

export function generateMetadata({ params }: Props): Metadata {
  const c = find(params.slug);
  if (!c) return {};
  const title = `INC-${c.id} · ${c.title} — Mithil Batra`;
  const description = `SEV-${c.severity} · ${c.subtitle}. ${c.symptom}`;
  return { title, description, openGraph: { title, description, type: "article" } };
}

export default function IncidentPage({ params }: Props) {
  const c = find(params.slug);
  if (!c) notFound();
  return (
    <SeverityProvider>
      <StatusBar />
      <main className="shell pb-24 pt-28">
        <a href="/#log" className="font-mono text-[12px] text-faint transition-colors hover:text-accent">
          ← cd ../engineering-log
        </a>
        <h1 className="mb-6 mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          case study · INC-{c.id} · {c.title}
        </h1>
        <CaseFile item={c} defaultOpen />
      </main>
      <Footer />
    </SeverityProvider>
  );
}
