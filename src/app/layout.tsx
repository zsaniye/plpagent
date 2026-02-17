import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLP Agent - Personalized Learning Paths for Marketers",
  description:
    "AI-powered personalized learning path generator for marketing professionals. Discover your learning needs, assess your skills, and get a curated learning path.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
