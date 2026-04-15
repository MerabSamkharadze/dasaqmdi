import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/config";
import { verifyUnsubscribe } from "@/lib/email/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  const token = searchParams.get("token");

  if (!userId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!verifyUnsubscribe(userId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Use service role to update regardless of auth state
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("profiles")
    .update({ email_digest: false })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }

  return NextResponse.redirect(`${siteConfig.url}?unsubscribed=true`);
}
