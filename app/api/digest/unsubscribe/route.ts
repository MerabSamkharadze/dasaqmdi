import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
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
