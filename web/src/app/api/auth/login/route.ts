import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  // Dev mode: ANY credentials work
  if (!email || !password) {
    return NextResponse.json({ error: "Enter any email and password to continue" }, { status: 400 });
  }
  
  // Set session cookie
  const res = NextResponse.json({ ok: true, needsProfile: true });
  res.cookies.set("qwl_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  
  // Also store the email for profile creation
  res.cookies.set("qwl_email", email, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  
  return res;
}