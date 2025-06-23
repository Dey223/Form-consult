import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/providers/auth-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormConsult - Plateforme de Formation & Consulting B2B",
  description: "Transformez la formation de votre entreprise avec notre plateforme complète de formation et consulting B2B. Gérez les compétences de vos équipes et accédez à des experts.",
  keywords: ["formation", "consulting", "B2B", "entreprise", "développement professionnel"],
  authors: [{ name: "FormConsult" }],
  creator: "FormConsult",
  publisher: "FormConsult",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://formconsult.com",
    siteName: "FormConsult",
    title: "FormConsult - Plateforme de Formation & Consulting B2B",
    description: "Transformez la formation de votre entreprise avec notre plateforme complète de formation et consulting B2B.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
