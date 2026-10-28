import { ogCard, ogSize } from "@/lib/og-card";
import { PROFILE } from "@/lib/data";

export const alt = `${PROFILE.name} — Engineering Log`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "ENGINEERING LOG",
    title: PROFILE.name,
    subtitle: `${PROFILE.role} · ${PROFILE.focus.join(" · ")}`,
    tag: "ALL SYSTEMS OPERATIONAL",
    color: "#5de9a0",
    footer: "B.Tech CSE · NIT Delhi · SWE intern @ HSBC",
  });
}
