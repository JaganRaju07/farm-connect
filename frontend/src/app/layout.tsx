// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cartcontext";
import { LocationProvider } from "@/context/LocationContext";
import AxiosInterceptorWrapper from "@/components/layout/AxiosInterceptorWrapper";
import Header from "@/components/layout/header";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";

const themeScript = `
  (function() {
    try {
      var localTheme = window.localStorage.getItem('farmconnect-theme');
      var theme = localTheme ? localTheme : 'system';
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Farm Connect — Hyperlocal Agricultural Marketplace",
    template: "%s | Farm Connect",
  },
  description: "Connecting local farmers directly with consumers across Karnataka. Fresh produce harvested at dawn, zero middlemen, and fair pricing.",
  openGraph: {
    title: "Farm Connect — Hyperlocal Agricultural Marketplace",
    description: "From the field to your table. Fresh produce. Real farmers. A shorter journey.",
    siteName: "Farm Connect",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${inter.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-full flex flex-col font-sans transition-colors duration-200 bg-background text-foreground">
          <ThemeProvider>
            <AuthProvider>
          <LocationProvider>
            <ToastProvider>
              <CartProvider>
                <AxiosInterceptorWrapper>
                  <Header />
                  {children}
                </AxiosInterceptorWrapper>
              </CartProvider>
            </ToastProvider>
          </LocationProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
