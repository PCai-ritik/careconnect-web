import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { DEFAULT_BRANDING, getBrandingStyle, type HospitalBranding } from "@/lib/theme";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const brandingCookie = cookieStore.get("careconnect_branding");
  
  let branding: HospitalBranding = DEFAULT_BRANDING;
  if (brandingCookie?.value) {
    try {
      branding = JSON.parse(decodeURIComponent(brandingCookie.value));
    } catch {}
  }

  const style = getBrandingStyle(branding);

  let fontUrl = null;
  const headingFont = branding.white_label_config?.heading_font;
  const bodyFont = branding.white_label_config?.body_font;
  if (headingFont || bodyFont) {
      const families = [];
      if (headingFont) families.push(`family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
      if (bodyFont && bodyFont !== headingFont) families.push(`family=${bodyFont.replace(/ /g, '+')}:wght@400;500;600;700;800`);
      if (families.length > 0) {
          fontUrl = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
      }
      
      if (headingFont) (style as any)['--font-heading-custom'] = `"${headingFont}", sans-serif`;
      if (bodyFont) (style as any)['--font-body-custom'] = `"${bodyFont}", sans-serif`;
  }

  return (
    <html lang="en" className={`${spline.variable} h-full antialiased`} style={style} suppressHydrationWarning>
      <head>
        {fontUrl && <link rel="stylesheet" href={fontUrl} id="dynamic-tenant-font-ssr" />}
      </head>
      <body className="h-full ">{children}</body>
    </html>
  );
}
