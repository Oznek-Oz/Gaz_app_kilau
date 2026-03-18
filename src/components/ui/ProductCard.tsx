"use client";

import Link from "next/link";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "./Badge";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    description?: string | null;
    stock: number;
    unit: string;
    weight?: number | null;
    imageUrl?: string | null;
    isFeatured: boolean;
    category?: { name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, toggleCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toggleCart();
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/produits/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
          <span className="text-6xl">🔥</span>
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Populaire
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">Rupture de stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-blue-600 font-medium mb-1">{product.category.name}</p>
          )}
          <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
          {product.weight && (
            <div className="flex items-center gap-1 mt-1">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{product.weight} kg</span>
            </div>
          )}
          {product.description && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(product.price)}</p>
              <p className="text-xs text-gray-400">par {product.unit}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>

          {/* Stock indicator */}
          {!isOutOfStock && product.stock <= 10 && (
            <Badge variant="warning" className="mt-2 text-xs">
              Plus que {product.stock} en stock
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
