import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"]
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  title: "S-Cafe Beach Restaurant",
  description: "Şezlongundan sipariş ver / Order from your sunbed",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F3F2F2"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${lora.variable}`}>
      <body className="font-body min-h-screen bg-paper text-ink">
        <LanguageProvider>
          <CartProvider>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
