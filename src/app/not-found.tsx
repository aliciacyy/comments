import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>That comment link isn’t valid.</h1>
      <Link href="/">Generate a new link →</Link>
    </main>
  );
}
