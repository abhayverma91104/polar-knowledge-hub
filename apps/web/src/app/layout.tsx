import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "PolarSetu | NCPOR - National Centre for Polar and Ocean Research",
  description: "PolarSetu - India's sovereign polar science knowledge, education, research discovery and outreach platform. Explore expeditions, scientific discoveries, datasets, publications and telemetry from Antarctica, Arctic, Southern Ocean and Himalayas.",
  keywords: "PolarSetu, NCPOR, polar research, Antarctica, Arctic, Himadri, Maitri, Bharati, Himansh, Indian expedition, climate change, glaciology, oceanography",
  authors: [{ name: "National Centre for Polar and Ocean Research, MoES, Govt. of India" }],
  icons: {
    icon: [
      { url: '/polarsetu-logo.png?v=polarsetu', type: 'image/png' },
      { url: '/favicon.ico?v=polarsetu', sizes: 'any' },
    ],
    apple: '/polarsetu-logo.png?v=polarsetu',
  },
  openGraph: {
    title: "PolarSetu | NCPOR - Government of India",
    description: "PolarSetu - India's sovereign polar knowledge platform. Discover. Understand. Explore the Poles.",
    type: "website",
    images: [{ url: '/polarsetu-logo.png', width: 512, height: 512, alt: 'PolarSetu Logo' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/polarsetu-logo.png?v=polarsetu" />
        <link rel="icon" href="/favicon.ico?v=polarsetu" sizes="any" />
        <link rel="apple-touch-icon" href="/polarsetu-logo.png?v=polarsetu" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-surface text-on-surface">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
