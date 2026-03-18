"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/config";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  deliveryType: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export default function MesCommandesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/connexion");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders")
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const paymentLabels: Record<string, string> = {
    cash: "Cash", mtn: "MTN Money", orange: "Orange Money"
  };

  if (isLoading || loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/compte" className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
      </div>

      <div className="mb-5">
        <Input
          placeholder="Rechercher par numéro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Aucune commande</p>
          <p className="text-gray-400 text-sm mt-1">Vos commandes apparaîtront ici</p>
          <Link href="/produits" className="inline-flex mt-4 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors">
            Commander maintenant
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link key={order.id} href={`/suivi?numero=${order.orderNumber}`}>
              <Card hover className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-blue-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}
                    {order.deliveryType === "home" ? "Livraison" : "Retrait"}
                    {" · "}
                    {paymentLabels[order.paymentMethod]}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
