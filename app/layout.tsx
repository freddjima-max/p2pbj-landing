import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P2P.BJ — Le LeBonCoin du Bénin",
  description:
    "Achetez, vendez et louez entre particuliers au Bénin, sans intermédiaire et en toute sécurité. Paiement Mobile Money intégré.",
  keywords: "annonces Bénin, vente particulier, achat Bénin, P2P Bénin, marché digital Bénin",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "P2P.BJ — Le LeBonCoin du Bénin",
    description:
      "La place de marché digitale où les Béninois achètent, vendent et louent entre particuliers.",
    url: "https://p2pmarketplace.net",
    siteName: "P2P.BJ",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "P2P.BJ" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
