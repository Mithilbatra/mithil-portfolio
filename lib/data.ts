/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENT — single source of truth for the whole site.
 *  Edit anything here; the UI updates automatically.
 *
 *  ⚠️  TODO before deploying: replace the placeholder URLs marked
 *      `// TODO` with your real profile / repo / demo links.
 * ─────────────────────────────────────────────────────────────
 */

export const PROFILE = {
  name: "Mithil Batra",
  handle: "mithil_batra",
  role: "Software Engineer",
  focus: ["AI / ML", "Backend & Systems", "Full-Stack"],
  location: "NIT Delhi",
  status: "Available — SWE / New Grad 2026",
  tagline: "I build systems — then I figure out why they break, and make them better.",
  blurb:
    "CSE undergrad at NIT Delhi and SWE intern at HSBC. I like the unglamorous parts of engineering: making services talk to each other, keeping ML honest, and turning a broken thing into a reliable one.",

  // Contact — verified from resume
  email: "mithil.batra05@gmail.com",
  phone: "+91 8810397089",

  // Profiles — TODO: confirm these handles are correct
  github: "https://github.com/mithilbatra", // TODO: confirm GitHub handle
  linkedin: "https://www.linkedin.com/in/mithilbatra", // TODO: confirm LinkedIn URL
  leetcode: "https://leetcode.com/u/mithilbatra", // TODO: confirm LeetCode handle

  resumePath: "/resume.pdf",
};

export type CaseStatus = "SHIPPED" | "LIVE" | "ACTIVE" | "ARCHIVED";

export interface CaseFile {
  id: string; // e.g. "001"
  slug: string;
  title: string;
  subtitle: string;
  status: CaseStatus;
  year: string;
  stack: string[];
  problem: string;
  approach: string;
  architecture: string[];
  hardPart: string;
  learned: string;
  note?: string; // optional flavour line
  links: { source?: string; live?: string };
}

export const CASE_FILES: CaseFile[] = [
  {
    id: "001",
    slug: "pit-wall",
    title: "Pit Wall",
    subtitle: "F1 Podium Prediction & Analytics Dashboard",
    status: "LIVE",
    year: "2025",
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
      source: "https://github.com/mithilbatra/pit-wall", // TODO: real repo URL
      live: "https://pit-wall.example.com", // TODO: real deployed URL
    },
  },
  {
    id: "002",
    slug: "resolvr",
    title: "Resolvr",
    subtitle: "Incident Management & Real-Time Alerting",
    status: "SHIPPED",
    year: "2025",
    stack: ["Next.js", "Tailwind CSS", "PostgreSQL", "Node.js", "REST APIs"],
    note: "The console you're reading is styled like an incident dashboard. Resolvr is the real one.",
    problem:
      "When a service breaks, teams bleed time to scattered signals — no single place to track the issue, page the right person, and actually drive it to resolution.",
    approach:
      "Put issue tracking and real-time alerting in one full-stack app, modelled around how incidents actually move: open → acknowledge → escalate → resolve.",
    architecture: [
      "Kanban incident board with manual and webhook / API-based creation",
      "On-call scheduling and configurable escalation policies",
      "Automated multi-channel notification system",
      "Incident timeline + runbook integration for structured resolution",
    ],
    hardPart:
      "Escalation logic — deciding who gets paged, when, and how it climbs if no one acknowledges, all without spamming the whole team on every alert.",
    learned:
      "Incident response is a state machine. Model the states explicitly and the UI, the alerts, and the escalation rules all fall out of it cleanly.",
    links: {
      source: "https://github.com/mithilbatra/resolvr", // TODO: real repo URL
    },
  },
  {
    id: "003",
    slug: "ai-mock-interview",
    title: "AI Mock Interviewer",
    subtitle: "Automated, Role-Based Interview Practice",
    status: "SHIPPED",
    year: "2024",
    stack: ["Next.js", "Tailwind CSS", "PostgreSQL", "Google Gemini API"],
    problem:
      "Interview prep is mostly static question banks — no questions tailored to your role, and no feedback until a mentor has time for you.",
    approach:
      "Simulate a real interview: generate role-based questions with an LLM, evaluate the answers, and hand back specific, instant feedback — no mentor required.",
    architecture: [
      "Role-based question selection drives prompt construction",
      "Google Gemini generates questions and grades responses",
      "PostgreSQL persists sessions, answers, and feedback history",
      "Next.js front end for the interview flow",
    ],
    hardPart:
      "Getting the model to produce consistent, useful evaluation instead of vague praise — structuring prompts and schemas so feedback is specific and actionable.",
    learned:
      "A model is only as good as the structure around it. Constrain generation and grading with clear schemas and role context and the quality jumps.",
    links: {
      source: "https://github.com/mithilbatra/ai-mock-interview", // TODO: real repo URL
    },
  },
];

export interface Deployment {
  org: string;
  role: string;
  period: string;
  location?: string;
  summary: string;
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

export const NAV = [
  { id: "log", label: "Log" },
  { id: "deployments", label: "Deployments" },
  { id: "systems", label: "Systems" },
  { id: "telemetry", label: "Telemetry" },
  { id: "contact", label: "Contact" },
];
