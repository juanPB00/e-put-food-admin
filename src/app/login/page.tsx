import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
import { getSession, home } from "@/lib/auth";

export default async function Login() {
  const s = await getSession();
  if (s) redirect(home[s.role]);
  return (<AuthShell><LoginForm /></AuthShell>);
}
