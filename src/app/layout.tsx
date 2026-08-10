import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comments",
  description: "Simple, standalone conversations for every blog post.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Comments home">comments<span>.</span></Link>
        </header>
        {children}
      </body>
    </html>
  );
}
