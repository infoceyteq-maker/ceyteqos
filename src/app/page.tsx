import { redirect } from "next/navigation";

/** The system is staff-only — the front door is the sign-in page. */
export default function Home() {
  redirect("/login");
}
