import { getServerUser } from "@/lib/auth";
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
    const userName = user.name ?? null;
    return <HomeLoggedIn userName={userName} />;
  }

  return <LandingPage />;
}
