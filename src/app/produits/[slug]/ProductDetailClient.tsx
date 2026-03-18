"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Plus, Minus, Package, Star, Shield, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/config";
import { Button } from "@/components/ui/Button";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  unit: string;
  weight?: number | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
}

export function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, toggleCart } = useCart();

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, quantity, imageUrl: product.imageUrl });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      toggleCart();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <Link href="/produits" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour aux produits
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center h-72 md:h-auto min-h-64">
            <div className="text-center">
              <span className="text-8xl block mb-4">🔥</span>
              {product.isFeatured && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-6 md:p-8">
            <p className="text-sm font-medium text-blue-600 mb-2">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {product.weight && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <Package className="w-4 h-4" />
                <span>Poids : {product.weight} kg</span>
              </div>
            )}

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>
            )}

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-red-600">{formatCurrency(product.price)}</span>
                <span className="text-gray-400 text-sm">/ {product.unit}</span>
              </div>

              {product.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium mb-4">
                  {product.stock <= 10 ? `⚠ Plus que ${product.stock} en stock` : "✓ En stock"}
                </p>
              ) : (
                <p className="text-sm text-red-500 font-medium mb-4">Rupture de stock</p>
              )}

              {product.stock > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Quantité :</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-center min-w-12">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-5">
                    Total : <span className="font-bold text-gray-900">{formatCurrency(product.price * quantity)}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    isLoading={added}
                  >
                    {added ? "Ajouté !" : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>

                  <Link href="/commande">
                    <Button variant="secondary" size="lg" fullWidth className="mt-2">
                      Commander directement
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Garanties */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                Produit certifié
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck className="w-4 h-4 text-blue-500" />
                Livraison rapide
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star className="w-4 h-4 text-yellow-500" />
                Points fidélité
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Package className="w-4 h-4 text-purple-500" />
                Qualité garantie
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
