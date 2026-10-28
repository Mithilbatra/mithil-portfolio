/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT — single source of truth for the whole site.
 *  Edit anything here; the UI updates automatically.
 * ─────────────────────────────────────────────────────────────
 */

export const PROFILE = {
  name: "Mithil Batra",
  handle: "mithil_batra",
  role: "Software Engineer",
  focus: ["AI / ML", "Backend & Systems", "Full-Stack"],
  location: "NIT Delhi",
  status: "Available — SWE / New Grad 2027",
  tagline: "I build systems — then I figure out why they break, and make them better.",
  blurb:
    "CSE undergrad at NIT Delhi and SWE intern at HSBC. I like the unglamorous parts of engineering: making services talk to each other, keeping ML honest, and turning a broken thing into a reliable one.",

  // Contact — verified from resume
  email: "mithil.batra05@gmail.com",
  phone: "+91 8810397089",

  // Profiles
  github: "https://github.com/mithilbatra",
  linkedin: "https://www.linkedin.com/in/mithilbatra",
  leetcode: "https://leetcode.com/u/mithilbatra",

  resumePath: "/resume.pdf",
};

/* ── Log levels — the severity language used across the whole site ── */
export type Level = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRIT";

export const LEVELS: Record<
  Level,
  { label: string; emoji: string; color: string; desc: string }
> = {
  DEBUG: { label: "DEBUG", emoji: "🔵", color: "var(--info)", desc: "trace / detail" },
  INFO: { label: "INFO", emoji: "🟢", color: "var(--ok)", desc: "healthy signal" },
  WARN: { label: "WARN", emoji: "🟡", color: "var(--warn)", desc: "needs attention" },
  ERROR: { label: "ERROR", emoji: "🔴", color: "var(--crit)", desc: "something broke" },
  CRIT: { label: "CRIT", emoji: "🚨", color: "var(--crit-bright)", desc: "top priority" },
};

export type CaseStatus = "SHIPPED" | "LIVE" | "ACTIVE" | "ARCHIVED";

export interface CaseFile {
  id: string; // e.g. "001"
  slug: string;
  title: string;
  subtitle: string;
  status: CaseStatus;
  severity: 1 | 2 | 3; // SEV-1 = most critical
  category: string; // incident class, e.g. "data integrity"
  symptom: string; // one-line, log-style, shown while collapsed
  year: string;
  stack: string[];
  problem: string;
  approach: string;
  architecture: string[];
  hardPart: string;
  learned: string;
  note?: string; // optional flavour line
  evidence?: { src: string; caption: string }; // screenshot in public/evidence/
  role?: string; // what I personally did
  result?: string; // one-line headline, shown on the collapsed card
  evaluation?: {
    metric: string; // what the number means
    method: string; // how it was measured
    baseline: string;
    rows: { season: string; races: number; model: number; baseline: number }[]; // % values
    verdict: string;
    source: string; // model version + where the numbers come from
  };
  limitations?: string;
  credit?: string; // upstream / shared-codebase acknowledgement
  demoNote?: string; // how to reach the live demo, and its caveats
  links: { source?: string; live?: string };
}

export const CASE_FILES: CaseFile[] = [
  {
    id: "001",
    slug: "pit-wall",
    title: "Pit Wall",
    subtitle: "F1 Podium Prediction & Analytics Dashboard",
    status: "LIVE",
    severity: 2,
    category: "data integrity · ml",
    symptom: "podium predictions looked great — because the model was cheating on time",
    evidence: {
      src: "/evidence/pit-wall.jpg",
      caption: "live dashboard · now tracking the 2026 season",
    },
    role: "Solo — designed the feature pipeline, trained and evaluated the models, built the dashboard and deployed it with Docker on a cloud VM.",
    result: "Walk-forward backtests: 75.0% top-3 hit-rate in 2025 — level with the pick-the-top-3-qualifiers baseline, not above it",
    evaluation: {
      metric: "Top-3 hit-rate — the average share of each race's real podium that appears in the model's three picks.",
      method: "Walk-forward: before every race the model is retrained on earlier races only, then scored on that race.",
      baseline: "pick the three fastest qualifiers",
      rows: [
        { season: "2024", races: 20, model: 61.7, baseline: 63.3 },
        { season: "2025", races: 24, model: 75.0, baseline: 75.0 },
        { season: "2026 (to R17)", races: 17, model: 56.9, baseline: 60.8 },
      ],
      verdict: "It matches the baseline in 2025 and trails it by 1.6–3.9 points in 2024 and 2026 — it doesn't beat the qualifying grid yet.",
      source:
        "Random-forest model · walk-forward run of 22 Oct 2026 on the deployed app (/api/backtest). The repo README's ~74% (2025) and ~63% (2024) come from an earlier run on 8 Aug 2026 (73.6% and 61.7%). A 6-race holdout isn't reported: the training script picks its 'best model' on those same races.",
    },
    demoNote:
      "The live app is served over plain HTTP from a small VM, so browsers that enforce HTTPS-only may block it. The screenshot and race data above are relayed over HTTPS.",
    year: "2026",
    stack: ["Python", "Flask", "scikit-learn", "Pandas", "FastF1", "Docker", "REST APIs"],
    problem:
      "From the outside a Formula 1 race looks like chaos. Can live timing and telemetry actually predict who finishes on the podium — without quietly fooling yourself with data leakage?",
    approach:
      "Pull live timing and telemetry through FastF1, engineer features from it, then train and compare tree-based models — judged by an honest top-3 hit-rate rather than a flattering accuracy score.",
    architecture: [
      "FastF1 ingestion pulls live timing + telemetry per session",
      "Leakage-safe feature pipeline: strictly time-ordered splits + walk-forward season backtesting",
      "Random Forest vs. gradient-boosting models, compared on top-3 hit-rate",
      "Flask REST API + dashboard, containerized with Docker on a public cloud VM",
      "Automated race-data fetching and model retraining",
    ],
    hardPart:
      "Data leakage. Naive random splits let information from the future bleed into training and inflate the score. The fix was strict time-ordering and walk-forward backtesting across seasons — so every prediction is made only from the past.",
    learned:
      "An honest metric beats an impressive one. Top-3 hit-rate under walk-forward validation tells the truth; a shuffled split just tells you what you want to hear.",
    links: {
      source: "https://github.com/Mithilbatra/F1_ML_project",
      live: "http://mithil-f1-pitwall.duckdns.org",
    },
  },
  {
    id: "002",
    slug: "resolvr",
    title: "Resolvr",
    subtitle: "Mobile Issue Tracker & Incident Escalation",
    status: "SHIPPED",
    severity: 1,
    category: "availability · on-call",
    symptom: "a service breaks and the signal is scattered — nobody owns the page",
    result: "Raise → escalate → acknowledge → resolve — try the workflow in a browser replica below, no Expo Go needed",
    credit: "Shared codebase — the same project is also published by Omprakash Tiwari at github.com/omprakash-tiwari/Resolvr (Feb 2026).",
    year: "2026",
    stack: ["React Native", "Expo", "Node.js", "Express", "MongoDB", "Socket.IO", "Firebase (FCM)"],
    note: "The console you're reading is styled like an incident dashboard. Resolvr is the real one.",
    problem:
      "When a service breaks, teams bleed time to scattered signals — no single place to track the issue, page the right person, and actually drive it to resolution.",
    approach:
      "A React Native (Expo) mobile app on an Express + MongoDB API, modelled around how incidents actually move: active → escalated → acknowledged → resolved.",
    architecture: [
      "Expo (React Native) client — issues, incidents, projects and notifications",
      "Express REST API, with Socket.IO pushing live incident updates to every client",
      "MongoDB (Mongoose) stores each incident's escalation chain, current level and next-escalation time",
      "Raising an incident starts an escalation timer; unacknowledged incidents climb the chain",
      "Firebase Cloud Messaging push notifications reach the on-call engineer's phone",
    ],
    hardPart:
      "Escalation logic — deciding who gets paged, when, and how it climbs if no one acknowledges, all without spamming the whole team on every alert.",
    learned:
      "Incident response is a state machine. Model the states explicitly and the UI, the alerts, and the escalation rules all fall out of it cleanly.",
    links: {
      source: "https://github.com/Mithilbatra/Resolvr---An-Issue-Tracker-Incident-Escalation-System",
    },
  },
  {
    id: "003",
    slug: "ai-mock-interview",
    title: "AI Mock Interviewer",
    subtitle: "Automated, Role-Based Interview Practice",
    status: "LIVE",
    severity: 3,
    category: "feedback quality",
    symptom: "interview practice gave feedback too vague to actually act on",
    result: "Every spoken answer comes back as structured JSON — a rating plus 3–5 lines of specific feedback",
    limitations:
      "Ratings come from a single Gemini call without a fixed rubric, so the same answer can score differently between runs. Next step: a rubric in the prompt and averaging across several calls.",
    credit:
      "Originally created by Omprakash Tiwari — github.com/omprakash-tiwari/automated_ai_interviewer (Jul 2025). This is my copy of that codebase.",
    demoNote:
      "The landing page is public; starting an interview needs a free sign-in (Google or email, via Clerk). There's no guest mode yet — the architecture steps above walk through the full flow.",
    year: "2025",
    stack: ["Next.js", "Tailwind CSS", "PostgreSQL", "Drizzle ORM", "Google Gemini API", "Clerk"],
    problem:
      "Interview prep is mostly static question banks — no questions tailored to your role, and no feedback until a mentor has time for you.",
    approach:
      "Simulate a real interview: generate role-based questions with an LLM, evaluate the answers, and hand back specific, instant feedback — no mentor required.",
    architecture: [
      "Clerk sign-in → pick a role, tech stack and experience level",
      "Gemini generates role-specific interview questions as JSON",
      "Answers are spoken — captured with speech-to-text while the webcam runs",
      "Gemini rates each answer and returns 3–5 lines of feedback as JSON",
      "PostgreSQL (Drizzle ORM) stores interviews, answers and feedback history",
    ],
    hardPart:
      "Getting the model to produce consistent, useful evaluation instead of vague praise — structuring prompts and schemas so feedback is specific and actionable.",
    learned:
      "A model is only as good as the structure around it. Constrain generation and grading with clear schemas and role context and the quality jumps.",
    evidence: {
      src: "/evidence/ai-mock-interview.jpg",
      caption: "live app · role-based interviews with instant feedback",
    },
    links: {
      source: "https://github.com/Mithilbatra/automated_ai_interviewer",
      live: "https://automated-ai-interviewer-nbog.vercel.app",
    },
  },
];

export interface Deployment {
  org: string;
  role: string;
  period: string;
  location?: string;
  summary: string;
  stages: string[]; // short pipeline-stage names, one per `work` item
  work: string[];
  tags: string[];
}

export const EXPERIENCE: Deployment[] = [
  {
    org: "HSBC",
    role: "Software Engineering Intern",
    period: "Jun 2026 – Jul 2026",
    summary:
      "Worked across internal enterprise services — an AI chatbot, a microservice integration, and a production Spring Boot app.",
    stages: ["tds-chatbot", "vidura-integration", "panorama-fixes"],
    work: [
      "Improved an internal TDS chatbot with better intent recognition, response generation, and workflow automation to handle employee tax queries.",
      "Integrated the Vidura microservice into the GPS portal via service integration, API integration, and environment configuration.",
      "Supported Panorama (Spring Boot + GCP) with bug fixes and code-quality improvements toward production deployment.",
    ],
    tags: ["Spring Boot", "GCP", "Microservices", "NLP", "APIs"],
  },
];

export interface SkillGroup {
  label: string;
  key: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  { label: "Languages", key: "lang", items: ["Java", "Python", "C", "C++", "JavaScript", "TypeScript", "Go"] },
  { label: "Databases", key: "db", items: ["PostgreSQL", "MySQL", "MongoDB", "Cassandra"] },
  { label: "Cloud & Tools", key: "cloud", items: ["Azure", "AWS", "GCP", "Docker", "Git", "GitHub", "Postman", "Arduino"] },
  { label: "Frameworks & Practices", key: "fw", items: ["Spring", "Spring Boot", "Design Patterns", "OOP", "OpenCV"] },
  { label: "UI / UX", key: "ui", items: ["React", "Next.js", "HTML", "CSS", "Tailwind", "Figma"] },
  { label: "Core Areas", key: "core", items: ["AI", "Machine Learning", "NLP", "Deep Learning", "LLMs", "RAG"] },
];

export interface Metric {
  value: string;
  label: string;
  detail?: string;
}

export const TELEMETRY: Metric[] = [
  { value: "8.93", label: "CGPA", detail: "B.Tech CSE · NIT Delhi" },
  { value: "99.467%ile", label: "JEE Mains", detail: "Top 0.5% nationwide" },
  { value: "AIR 5376", label: "JEE Advanced", detail: "Qualified" },
  { value: "800+", label: "Problems Solved", detail: "Across coding platforms" },
];

/** Semester SGPAs — powers the CGPA-trend popup on the hero CGPA stat.
 *  CGPA at each semester is the running average of the SGPAs up to it,
 *  which lands at 8.93 after semester 6. */
export const ACADEMIC = {
  sgpa: [9, 8.85, 9.6, 9.1, 8, 9.05],
};

export interface Achievement {
  title: string;
  detail: string;
  kind: "award" | "leadership" | "competition";
}

export const ACHIEVEMENTS: Achievement[] = [
  { title: "Gold — MST Tournament 2025", detail: "Held at NIT Jaipur", kind: "award" },
  { title: "Semi-Finalist — Flipkart GRiD", detail: "National engineering challenge", kind: "competition" },
  { title: "L'Oréal Sustainability Challenge", detail: "Semi-Finalist", kind: "competition" },
  { title: "Deputy General Secretary — GDSC", detail: "Google Developer Student Clubs, NIT Delhi", kind: "leadership" },
  { title: "Executive — Training & Placement Cell", detail: "NIT Delhi", kind: "leadership" },
];

export interface Certification {
  title: string;
  issuer: string;
  detail: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    title: "Apache Cassandra",
    issuer: "Udemy",
    detail: "Distributed database management, fault tolerance, and horizontal scalability.",
  },
  {
    title: "Azure Services",
    issuer: "Microsoft",
    detail: "Designing and deploying scalable cloud solutions — Functions, Storage, DevOps pipelines.",
  },
  {
    title: "C++ Subject Matter Expert",
    issuer: "Edchart",
    detail: "Advanced C++: STL, memory management, and performance optimization.",
  },
];

export interface School {
  name: string;
  qualification: string;
  period: string;
  score: string;
}

export const EDUCATION: School[] = [
  {
    name: "National Institute of Technology, Delhi",
    qualification: "B.Tech, Computer Science & Engineering",
    period: "2023 – Present",
    score: "CGPA 8.93",
  },
  {
    name: "Stepping Stones Sr. Sec. School, Chandigarh",
    qualification: "CBSE (Class XII)",
    period: "2022 – 2023",
    score: "91.8%",
  },
  {
    name: "Seth Anandram Jaipuria School, Vasundhara",
    qualification: "CBSE (Class X)",
    period: "2020 – 2021",
    score: "94.6%",
  },
];

export const COURSEWORK: string[] = [
  "Software Engineering",
  "Data Mining",
  "Database Management Systems",
  "Quantum Computing",
  "Machine Learning",
  "Artificial Intelligence",
  "Natural Language Processing",
  "Computer Vision",
  "Pattern Recognition",
  "Probability & Statistics",
  "Optimization Techniques",
];

/** Engineering principles, each pulled from a real incident above. */
export const RUNBOOK: { rule: string; body: string; from: string }[] = [
  {
    rule: "Honest metrics beat impressive ones",
    body: "Measure what you'd bet on in production. A walk-forward top-3 hit-rate told the truth where a shuffled split flattered.",
    from: "pit-wall",
  },
  {
    rule: "Model the states explicitly",
    body: "Most systems are state machines in disguise. Name the states and the UI, alerts and edge cases fall out of them.",
    from: "resolvr",
  },
  {
    rule: "Constrain the model, not the user",
    body: "An LLM is only as good as the structure around it. Schemas and context beat clever prompts.",
    from: "ai-mock-interview",
  },
  {
    rule: "Leave it more reliable than you found it",
    body: "Bug fixes and code-quality work aren't glamorous; they're what lets a service ship to production.",
    from: "hsbc",
  },
];

export const NAV = [
  { id: "log", label: "Projects" },
  { id: "deployments", label: "Experience" },
  { id: "status", label: "Status" },
  { id: "systems", label: "Skills" },
  { id: "telemetry", label: "Achievements" },
  { id: "contact", label: "Contact" },
];
