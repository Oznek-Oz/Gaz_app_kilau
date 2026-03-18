import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_CONFIG.company.name} - Commandez votre gaz en ligne à Maroua`,
  description: APP_CONFIG.company.description,
  keywords: "gaz, butane, propane, Maroua, Cameroun, livraison, commande en ligne",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
