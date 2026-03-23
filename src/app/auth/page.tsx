import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";

export default async function AuthPage() {
  const session = await auth();
  if (session) redirect("/");
  return <AuthForm />;
}
