import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareConnect — Doctor Dashboard",
  description: "CareConnect web dashboard for healthcare providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-row">
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Main content area offset by sidebar width */}
        <div className="flex-1 flex flex-col ml-64">
          <Header />
          <main className="flex-1 p-8 bg-doctor-background overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
