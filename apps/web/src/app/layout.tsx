import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Polar Knowledge Hub | NCPOR",
  description: "India's integrated polar science knowledge, education, research discovery and outreach platform. Explore expeditions, scientific discoveries, datasets, publications and stories from the Arctic and Antarctic.",
  keywords: "NCPOR, polar research, Antarctica, Arctic, Indian expedition, climate change, glaciology, oceanography",
  authors: [{ name: "National Centre for Polar and Ocean Research" }],
  openGraph: {
    title: "Polar Knowledge Hub | NCPOR",
    description: "India's polar science knowledge platform - Discover. Understand. Explore the Poles.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
