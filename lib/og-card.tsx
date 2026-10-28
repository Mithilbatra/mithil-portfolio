import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared 1200×630 link-preview card (home + every incident page). Satori needs
 *  inline styles and display:flex on any element with more than one child. */
export function ogCard(o: { kicker: string; title: string; subtitle: string; tag: string; color: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#07090d",
          color: "#e7ebf2",
          border: `3px solid ${o.color}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26 }}>
          <div style={{ display: "flex", color: "#9aa6b6" }}>
            <span style={{ color: "#5de9a0" }}>{">"}</span>&nbsp;mithil_batra.log
          </div>
          <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, border: `2px solid ${o.color}`, color: o.color, fontSize: 22, letterSpacing: 3 }}>
            {o.tag}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#78849a" }}>{o.kicker}</div>
          <div style={{ fontSize: 96, fontWeight: 700, marginTop: 12, lineHeight: 1 }}>{o.title}</div>
          <div style={{ fontSize: 34, color: "#9aa6b6", marginTop: 22, maxWidth: 1000 }}>{o.subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "#78849a" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#46d48a", marginRight: 14 }} />
          {o.footer}
        </div>
      </div>
    ),
    ogSize
  );
}
