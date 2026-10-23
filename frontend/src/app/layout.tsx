import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";

export const metadata: Metadata = {
  title: "CineConnect | The Premier Talent Platform for Film & Media",
  description: "Connecting Talent with Opportunities. Showcase verified credits, explore audition breakdowns, and collaborate with leading film production houses.",
  keywords: ["film jobs", "acting auditions", "cinematographer portfolio", "video editor jobs", "bollywood casting", "cine connect"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
