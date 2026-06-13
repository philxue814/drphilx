import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Dr Phil X | Custom AI Automation & Consulting",
  description:
    "Dr Phil X builds custom AI automation that solves specific business bottlenecks. Workflow automation, AI-driven marketing, operations intelligence, and coaching.",
  keywords: [
    "Dr Phil X",
    "AI automation",
    "custom AI solutions",
    "business consulting",
    "AI coaching",
  ],
  openGraph: {
    title: "Dr Phil X | Custom AI Automation",
    description:
      "I find your bottlenecks. I build the AI that removes them.",
    url: "https://drphilx.com",
    siteName: "Dr Phil X",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] font-sans text-[#fafafa]">
        {children}
      </body>
    </html>
  );
}