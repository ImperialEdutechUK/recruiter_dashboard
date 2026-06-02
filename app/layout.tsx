import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Freelance Recruitment Tracker",
  description: "South London College · Aspirex · Global Edulink",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={sans.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
