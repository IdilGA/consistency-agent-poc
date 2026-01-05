import { NextResponse } from "next/server";

/* -----------------------------
   Types
----------------------------- */

type ConsistencyRequest = {
  briefing: string;
  brandRules: string;
  task: string;
};

type LayoutSpec = {
  format: string;
  layout: string[];
  safe_area: string;
  typography: string;
};

type ConsistencyResponse = {
  ok: true;
  image_prompt: string;
  applied_rules: string[];
  violations: string[];
  score: number; // 0–100
  layout_spec: LayoutSpec;
};

/* -----------------------------
   POST /api/consistency
----------------------------- */

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ConsistencyRequest>;

  const briefing = body.briefing?.trim();
  const brandRules = body.brandRules?.trim();
  const task = body.task?.trim();

  //  Basic input validation
  if (!briefing || !brandRules || !task) {
    return NextResponse.json(
      { ok: false, error: "Missing briefing, brandRules or task." },
      { status: 400 }
    );
  }

  /* -----------------------------
     Consistency logic (PoC – rule-based)
  ----------------------------- */

  // Parse brand rules (max 8 regels)
  const rules = brandRules
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .slice(0, 8);

  const violations: string[] = [];

  if (briefing.length < 20) {
    violations.push("Briefing is erg kort (weinig context).");
  }

  if (brandRules.length < 20) {
    violations.push("Brand rules zijn erg kort (weinig houvast).");
  }

  if (!/tone|toon|stijl|style/i.test(brandRules)) {
    violations.push("Geen duidelijke tone-of-voice / style regel gevonden.");
  }

  // Simpele, uitlegbare score
  let score = 100;
  score -= violations.length * 15;
  score = Math.max(0, Math.min(100, score));

  /* -----------------------------
     Prompt output (nog zonder AI)
  ----------------------------- */

  const image_prompt =
    `You are a brand-consistent visual prompt writer.\n` +
    `Briefing: ${briefing}\n` +
    `Task: ${task}\n` +
    `Brand rules:\n- ${rules.join("\n- ")}\n` +
    `Output: Write ONE detailed image-generation prompt that follows the brand rules strictly.\n` +
    `Avoid anything not allowed by the rules. Keep it consistent and reproducible.`;

  /* -----------------------------
     Layout / Template specification
  ----------------------------- */

  const response: ConsistencyResponse = {
    ok: true,
    image_prompt,
    applied_rules: rules.length ? rules : ["(No explicit rules parsed)"],
    violations,
    score,
    layout_spec: {
      format: "hero_banner",
      layout: ["headline_top_left", "visual_center", "cta_bottom_left"],
      safe_area: "10%",
      typography: "bold headline + short subline",
    },
  };

  return NextResponse.json(response);
}
