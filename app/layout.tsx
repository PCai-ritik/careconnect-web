import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";

const spline = Spline_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-spline",
});

export const metadata: Metadata = {
  title: "CareConnect",
  description: "CareConnect — the all-in-one platform for doctors and patients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spline.variable} h-full antialiased`}>
      <body className="h-full font-spline">{children}</body>
    </html>
  );
}
