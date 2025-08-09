import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppRedirect() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("qwl_session")?.value === "1";
  redirect(isAuthed ? "/dashboard" : "/login");
}