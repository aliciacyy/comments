import { cookies } from "next/headers";
import LinkGenerator from "@/components/link-generator";
import HomeLogin from "@/components/home-login";
import LogoutButton from "@/components/logout-button";
import { authIsConfigured, HOME_SESSION_COOKIE, isValidHomeSession } from "@/lib/home-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const authenticated = isValidHomeSession(cookieStore.get(HOME_SESSION_COOKIE)?.value);

  if (!authenticated) return <HomeLogin configured={authIsConfigured()} />;

  return (
    <main className="home-shell">
      <div className="home-actions"><LogoutButton /></div>
      <section className="hero">
        <p className="eyebrow">A tiny comment layer for your writing</p>
        <h1>Give every post its own conversation.</h1>
        <p className="lede">
          Paste a published article URL. We’ll make a standalone comment page you can link from anywhere.
        </p>
        <LinkGenerator />
      </section>
      <p className="privacy-note">No account needed. Every generated link is tied to its original article.</p>
    </main>
  );
}
