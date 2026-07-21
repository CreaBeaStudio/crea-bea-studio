import { NextRequest, NextResponse } from "next/server";
import { sendPendingReminders } from "@/lib/fulfillOrder";

// ── CRON: triggered daily by Vercel Cron (see vercel.json's "crons"
// entry). Vercel calls scheduled routes with an "Authorization: Bearer
// <CRON_SECRET>" header automatically, as long as CRON_SECRET is set as
// an env var -- this route just needs to check that header matches, the
// same shared-secret pattern as the admin resend-links endpoint. Set
// CRON_SECRET in Vercel (any random string) before this goes live;
// without it, this endpoint returns 500 rather than silently accepting
// unauthenticated requests.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendPendingReminders();
    console.log("send-reminders result:", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("send-reminders error:", e.message);
    return NextResponse.json({ error: e.message || "Reminder run failed" }, { status: 500 });
  }
}
