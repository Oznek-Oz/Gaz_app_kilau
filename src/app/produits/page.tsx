"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";

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

interface Category {
  id: number;
  name: string;
  slug: string;
}

function ProduitsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categorie") || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les catégories
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const cats: Category[] = [];
        const seen = new Set();
        for (const p of data.products || []) {
          if (!seen.has(p.category.id)) {
            seen.add(p.category.id);
            cats.push(p.category);
          }
        }
        setCategories(cats);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    let cancelled = false;

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setIsLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nos produits</h1>
        <p className="text-gray-500 mt-1">Gaz butane, propane et accessoires — Maroua</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500 shrink-0">Catégorie :</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Toutes</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory("")} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Catégorie active */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Filtré par :</span>
          <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
            {categories.find((c) => c.slug === selectedCategory)?.name}
            <button onClick={() => setSelectedCategory("")}><X className="w-3.5 h-3.5" /></button>
          </span>
        </div>
      )}

      {/* Produits */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Aucun produit trouvé</p>
          <p className="text-gray-400 text-sm mt-1">Essayez avec d&apos;autres critères de recherche</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProduitsPage() {
  return (
    <Suspense>
      <ProduitsContent />
    </Suspense>
  );
}
