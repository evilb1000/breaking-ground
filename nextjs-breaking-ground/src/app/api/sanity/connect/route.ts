import { client } from "@/sanity/client";
import { NextResponse } from "next/server";

/**
 * GET /api/sanity/connect
 * Verifies connection to Sanity (projectId y9xwdi89, dataset production).
 * Returns { ok, projectId, dataset, documentCount? } or error details.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const projectId = "y9xwdi89";
  const dataset = "production";

  try {
    // Minimal GROQ: count documents to verify we can read
    const count = await client.fetch<number>(
      "count(*)",
      {},
      { next: { revalidate: 0 } }
    );

    return NextResponse.json({
      ok: true,
      projectId,
      dataset,
      documentCount: count,
      message: "Connected to Sanity successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error ? error.cause : undefined;

    return NextResponse.json(
      {
        ok: false,
        projectId,
        dataset,
        error: message,
        cause: cause != null ? String(cause) : undefined,
      },
      { status: 502 }
    );
  }
}
