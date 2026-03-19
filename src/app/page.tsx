import { getServerUser } from "@/lib/supabase-server";
import { LandingPage } from "@/components/landing-page";
import { HomeLoggedIn } from "@/components/home-logged-in";

export default async function HomePage() {
  let user = null;
  try {
    user = await getServerUser();
  } catch {
    // Server-side auth unavailable (e.g., missing env vars in dev)
  }

  if (user) {
    // Pull display name from profile if available
    // We pass just the email initial as a fallback — full name is fetched client-side
    const userName = user.email?.split("@")[0] ?? null;
    return <HomeLoggedIn userName={userName} />;
  }

  return <LandingPage />;
}
