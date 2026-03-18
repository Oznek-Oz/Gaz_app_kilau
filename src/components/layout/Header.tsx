"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Bell, Flame, LogOut, Settings, Package, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG } from "@/lib/config";
import { useRouter } from "next/navigation";

export function Header() {
  const { totalItems, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-900">{APP_CONFIG.company.name}</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <Link href="/produits" className="hover:text-red-600 transition-colors">Produits</Link>
            <Link href="/commande" className="hover:text-red-600 transition-colors">Commander</Link>
            <Link href="/suivi" className="hover:text-red-600 transition-colors">Suivi</Link>
            <Link href="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Panier */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Utilisateur */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">Points fidélité</p>
                      <p className="font-bold text-blue-900">{user.loyaltyPoints} pts</p>
                    </div>
                    <Link href="/compte" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Mon compte
                    </Link>
                    <Link href="/compte/commandes" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" /> Mes commandes
                    </Link>
                    <Link href="/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Bell className="w-4 h-4" /> Notifications
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-900 font-medium hover:bg-blue-50">
                        <Settings className="w-4 h-4" /> Administration
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="hidden md:flex items-center gap-2 bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}

            {/* Menu burger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              <Link href="/produits" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Produits</Link>
              <Link href="/commande" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Commander</Link>
              <Link href="/suivi" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Suivi de commande</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Contact</Link>
              {user ? (
                <>
                  <Link href="/compte" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Mon compte</Link>
                  <Link href="/compte/commandes" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Mes commandes</Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-blue-900 hover:bg-blue-50">Administration</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Déconnexion</button>
                </>
              ) : (
                <Link href="/connexion" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-900 text-white text-center mt-1">Connexion / Inscription</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
