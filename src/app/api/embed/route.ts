/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getEmbedding } from "@/lib/embed";

// Force Node runtime (Edge ≠ WASM-SIMD yet)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (typeof text !== "string") {
      return NextResponse.json(
        { error: "`text` must be a string" },
        { status: 400 }
      );
    }

    const embedding = await getEmbedding(text.trim());

    return NextResponse.json({ embedding });
  } catch (err) {
    console.error("Embed error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
