import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Truck, Store, Shield, Star, Flame, Phone, Clock, MapPin } from "lucide-react";
import { db, ensureSeeded } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { APP_CONFIG, formatCurrency } from "@/lib/config";
import { ProductCard } from "@/components/ui/ProductCard";
import { Card } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  if (!db) return [];
  try {
    await ensureSeeded();
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stock: products.stock,
        unit: products.unit,
        weight: products.weight,
        imageUrl: products.imageUrl,
        isFeatured: products.isFeatured,
        category: { id: categories.id, name: categories.name, slug: categories.slug },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true), eq(categories.isActive, true)))
      .limit(6);
    const seen = new Set<number>();
    return result.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  if (!db) return [];
  try {
    await ensureSeeded();
    return await db.select().from(categories).where(eq(categories.isActive, true));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, allCategories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="fade-in">
      {/* ====== HERO ====== */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              Livraison rapide à Maroua
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Votre gaz livré
              <span className="text-red-400"> à domicile</span>
              <br />à Maroua
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Commandez vos bouteilles de gaz et accessoires en ligne.
              Livraison rapide ou retrait en boutique. Paiement cash, MTN ou Orange Money.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/produits"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg"
              >
                Commander maintenant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/suivi"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
              >
                Suivre une commande
              </Link>
            </div>

            {/* Stats rapides */}
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="text-sm text-blue-200">Livraison en <strong className="text-white">45-90 min</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm text-blue-200"><strong className="text-white">Toute la ville</strong> de Maroua</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span className="text-sm text-blue-200">{APP_CONFIG.company.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== AVANTAGES ====== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Livraison à domicile</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(APP_CONFIG.delivery.baseFee + APP_CONFIG.delivery.homeDeliveryFee)} · {APP_CONFIG.delivery.estimatedTime.delivery}
              </p>
            </div>
          </Card>
          <Card className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Retrait en boutique</h3>
              <p className="text-sm text-gray-500 mt-1">Gratuit · {APP_CONFIG.delivery.estimatedTime.pickup}</p>
            </div>
          </Card>
          <Card className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Programme fidélité</h3>
              <p className="text-sm text-gray-500 mt-1">{APP_CONFIG.loyalty.pointsPerThousand} pt/1000 FCFA · {formatCurrency(APP_CONFIG.loyalty.rewardAmount)} de réduction</p>
            </div>
          </Card>
        </div>
      </section>

      {/* ====== CATÉGORIES ====== */}
      {allCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Nos catégories</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/produits"
              className="flex items-center gap-2 bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
            >
              Tout voir
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/produits?categorie=${cat.slug}`}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-red-300 hover:text-red-600 transition-colors shadow-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ====== PRODUITS PHARES ====== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produits populaires</h2>
            <p className="text-gray-500 text-sm mt-1">Les plus commandés par nos clients</p>
          </div>
          <Link href="/produits" className="text-red-600 text-sm font-semibold hover:text-red-700 flex items-center gap-1">
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Produits en cours de chargement...</p>
            <p className="text-sm text-gray-400 mt-1">Les produits apparaîtront après le premier démarrage.</p>
          </div>
        )}
      </section>

      {/* ====== SÉCURITÉ ====== */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-red-200 shrink-0" />
              <div>
                <h3 className="font-bold text-xl">Qualité et sécurité garanties</h3>
                <p className="text-red-100 mt-1">Tous nos produits sont conformes aux normes de sécurité en vigueur.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="shrink-0 bg-white text-red-600 font-semibold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ====== POINTS DE VENTE ====== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos points de vente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APP_CONFIG.pickupPoints.map((point) => (
            <Card key={point.id} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{point.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{point.address}</p>
                <p className="text-sm text-gray-500">{point.phone}</p>
                <p className="text-xs text-green-600 font-medium mt-1">{point.hours}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
