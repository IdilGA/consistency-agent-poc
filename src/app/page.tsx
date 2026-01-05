"use client";

import { useState } from "react";

type LayoutSpec = {
  format: string;
  layout: string[];
  safe_area: string;
  typography: string;
};

type ApiResponse =
  | { ok: false; error: string }
  | {
      ok: true;
      image_prompt: string;
      applied_rules: string[];
      violations: string[];
      score: number;
      layout_spec: LayoutSpec;
    };

export default function Home() {
  const [briefing, setBriefing] = useState("");
  const [brandRules, setBrandRules] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);

  async function onGenerate() {
    setLoading(true);
    setData(null);

    const res = await fetch("/api/consistency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefing, brandRules, task }),
    });

    const json = (await res.json()) as ApiResponse;
    setData(json);
    setLoading(false);
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Consistency Agent (PoC)</h1>
          <p className="text-zinc-600">
            Briefing → Prompt → Consistency check (score + violations). (Nog zonder AI)
          </p>
        </header>

        <div className="grid gap-4 rounded-xl bg-white p-4 shadow">
          <label className="space-y-2">
            <div className="font-medium">Briefing</div>
            <textarea
              className="h-24 w-full rounded-lg border p-3"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              placeholder="Wat is het doel, doelgroep, context?"
            />
          </label>

          <label className="space-y-2">
            <div className="font-medium">Brand & Style Rules</div>
            <textarea
              className="h-28 w-full rounded-lg border p-3"
              value={brandRules}
              onChange={(e) => setBrandRules(e.target.value)}
              placeholder="Bijv:\nTone: helder, professioneel\nDo not use: neon, glitch\nKeywords: clean, minimal, premium"
            />
          </label>

          <label className="space-y-2">
            <div className="font-medium">Task</div>
            <input
              className="w-full rounded-lg border p-3"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Bijv: Maak een image prompt voor een hero banner"
            />
          </label>

          <button
            onClick={onGenerate}
            disabled={loading}
            className="rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {data && !data.ok && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {data.error}
          </div>
        )}

        {data && data.ok && (
          <div className="space-y-4 rounded-xl bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Result</div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm">
                Score: <span className="font-semibold">{data.score}</span>/100
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Image prompt</div>
              <pre className="whitespace-pre-wrap rounded-lg border bg-zinc-50 p-3 text-sm">
                {data.image_prompt}
              </pre>
              <button
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => copy(data.image_prompt)}
              >
                Copy prompt
              </button>
            </div>

<div className="space-y-2">
  <div className="font-medium">Layout / Template spec</div>
  <pre className="whitespace-pre-wrap rounded-lg border bg-zinc-50 p-3 text-sm">
    {JSON.stringify(data.layout_spec, null, 2)}
  </pre>
  <button
    className="rounded-lg border px-3 py-2 text-sm"
    onClick={() =>
      copy(JSON.stringify(data.layout_spec, null, 2))
    }
  >
    Copy layout spec
  </button>
</div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-medium">Applied rules</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {data.applied_rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-medium">Violations / warnings</div>
                {data.violations.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">None ✅</p>
                ) : (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                    {data.violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
