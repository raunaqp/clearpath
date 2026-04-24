import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClearPath — Regulatory clarity for Indian digital health",
  description:
    "CDSCO changed what counts as a medical device in Oct 2025. ClearPath tells Indian healthtech founders in 5 minutes whether their product needs CDSCO approval, what class it is, and the fastest path to compliance. Free readiness card.",
  openGraph: {
    title: "CDSCO changed the rules. ClearPath tells you where you stand.",
    description:
      "A readiness card in 5 minutes. Risk, class, readiness score, timeline. Free.",
    url: "https://clearpath.in",
    siteName: "ClearPath",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#F7F6F2] text-[#0E1411]">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
