import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineConnect | The Premier Talent Platform for Film & Media",
  description: "Connect with film producers, casting directors, and media companies. Showcase your portfolio, apply for auditions, and build your career in cinema.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
