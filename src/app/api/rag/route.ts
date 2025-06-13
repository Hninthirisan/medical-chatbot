// src/app/api/rag/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/embed";

// ─────────────────────────────────────────────────────────────
// Runtime: keep this on the Node.js runtime (the Edge runtime
//          doesn't yet support WASM SIMD used by @xenova/transformers)
export const runtime = "nodejs";
// ─────────────────────────────────────────────────────────────

// ── Supabase client ──────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ── Helper: call DeepSeek-v3 via LLMAPI ─────────────────────
async function askLLM(prompt: string): Promise<string> {
  const res = await fetch("https://api.llmapi.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LLMAPI_KEY}`,
      accept: "*/*",
    },
    body: JSON.stringify({
      model: "deepseek-v3",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful, trustworthy medical assistant. Guide the user with safe and clear answers.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content?.trim() ??
    data?.error ??
    "Sorry, the LLM could not generate a response.";

  return content;
}

// ── Main RAG endpoint ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    // 1. Input validation
    if (typeof question !== "string" || question.trim().length < 6) {
      return NextResponse.json({
        results: [],
        answer:
          "โปรดระบุคำถามทางการแพทย์หรือสุขภาพที่ชัดเจนเพื่อให้ฉันสามารถช่วยเหลือคุณได้ค่ะ\n(Please enter a clear medical or health-related question so I can assist you.)",
      });
    }

    // 2. Embed the user question (no HTTP call — shared code)
    const queryEmbedding = await getEmbedding(question.trim());

    // 3. Supabase vector search (top-3 matches, threshold 0.5)
    const { data, error } = await supabase.rpc("match_forum_qa", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        {
          results: [],
          answer: "Error: database vector search failed.",
          supabaseError: error.message,
        },
        { status: 500 }
      );
    }

    // 4. Build context for the prompt
    const context =
      data && data.length
        ? data
            .map(
              (r: any, i: number) =>
                `Q${i + 1}: ${r.patient_question}\nA${i + 1}: ${r.doctor_response}`
            )
            .join("\n\n")
        : "";

    // 5. If nothing relevant found, exit early
    if (!context) {
      return NextResponse.json({
        results: [],
        answer:
          "ขออภัย ฉันไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล กรุณาระบุคำถามทางการแพทย์หรือสุขภาพเพิ่มเติมค่ะ\n(Sorry, I could not find related info in the database. Please provide a more detailed medical or health-related question.)",
      });
    }

    // 6. Compose RAG prompt
    const prompt = `
Here are similar medical Q&A from a trusted forum:
${context}

User's question: ${question}

Based on the context and your knowledge, provide a clear, safe, and helpful answer. If context is insufficient, explain what more information is needed.
`.trim();

    // 7. Query the LLM
    let llmAnswer = "Sorry, the medical assistant cannot answer at the moment.";
    try {
      llmAnswer = await askLLM(prompt);
    } catch (e) {
      console.error("LLM API error:", e);
    }

    // 8. Return results + answer
    return NextResponse.json({
      results: data,
      answer: llmAnswer,
    });
  } catch (err: any) {
    console.error("API /rag error:", err);
    return NextResponse.json(
      {
        results: [],
        answer: "An internal error occurred. Please try again later.",
        error: err.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
