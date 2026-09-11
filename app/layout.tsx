import type { Metadata, Viewport } from "next";
import { PROFILE } from "@/lib/data";
import "./globals.css";

const title = `${PROFILE.name} — Engineering Log`;
const description =
  "Mithil Batra — Software Engineer. CSE @ NIT Delhi, SWE intern @ HSBC. A portfolio built like an incident console: projects as case files, honest engineering, real systems.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mithilbatra.vercel.app"),
  title,
  description,
  keywords: [
    "Mithil Batra",
    "Software Engineer",
    "NIT Delhi",
    "Backend",
    "AI",
    "Machine Learning",
    "Full Stack",
    "Portfolio",
  ],
  authors: [{ name: PROFILE.name }],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: `${PROFILE.name} — Engineering Log`,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
