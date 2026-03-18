"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Users, TrendingUp, Clock, CheckCircle, Truck, AlertTriangle, BarChart3, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/config";
import { getStatusColor, getStatusLabel, timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Stats {
  totalOrders: number;
  todayOrders: number;
  revenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveringOrders: number;
  totalClients: number;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<{orderNumber:string;status:string;total:number;customerName:string;createdAt:string}[]>([]);
  const [lowStock, setLowStock] = useState<{name:string;stock:number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/connexion");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setRecentOrders(d.recentOrders || []);
        setLowStock(d.lowStockProducts || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Administration GazCom — Maroua</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/commandes" className="flex items-center gap-2 bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800">
            <Package className="w-4 h-4" /> Commandes
          </Link>
          <Link href="/admin/produits" className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700">
            <Settings className="w-4 h-4" /> Produits
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-900" />
              </div>
              <Badge variant="info" className="text-xs">{stats.todayOrders} auj.</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Commandes totales</p>
          </Card>

          <Card>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(stats.revenue))}</p>
            <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
          </Card>

          <Card>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders + stats.confirmedOrders}</p>
            <p className="text-sm text-gray-500">À traiter</p>
          </Card>

          <Card>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            <p className="text-sm text-gray-500">Clients</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dernières commandes */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Dernières commandes</h2>
              <Link href="/admin/commandes" className="text-sm text-red-600 font-medium hover:text-red-700">Tout voir →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Aucune commande pour l&apos;instant</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link key={order.orderNumber} href="/admin/commandes">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-blue-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900">{order.orderNumber}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{order.customerName} · {timeAgo(order.createdAt)}</p>
                      </div>
                      <span className="font-bold text-sm text-gray-900 shrink-0">{formatCurrency(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* En cours */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">En cours</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-yellow-600"><Clock className="w-4 h-4" /> En attente</span>
                <Badge variant="warning">{stats?.pendingOrders || 0}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-blue-600"><CheckCircle className="w-4 h-4" /> Confirmées</span>
                <Badge variant="info">{stats?.confirmedOrders || 0}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-purple-600"><Truck className="w-4 h-4" /> En livraison</span>
                <Badge variant="purple">{stats?.deliveringOrders || 0}</Badge>
              </div>
            </div>
          </Card>

          {/* Stocks faibles */}
          {lowStock.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Stocks bas
              </h3>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{p.name}</span>
                    <Badge variant={p.stock === 0 ? "danger" : "warning"}>{p.stock}</Badge>
                  </div>
                ))}
              </div>
              <Link href="/admin/produits" className="block text-xs text-red-600 font-medium mt-3 hover:text-red-700">
                Gérer les produits →
              </Link>
            </Card>
          )}

          {/* Liens rapides */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Navigation admin</h3>
            <nav className="space-y-1">
              <Link href="/admin/commandes" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                <Package className="w-4 h-4" /> Commandes
              </Link>
              <Link href="/admin/produits" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                <BarChart3 className="w-4 h-4" /> Produits
              </Link>
              <Link href="/admin/clients" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                <Users className="w-4 h-4" /> Clients
              </Link>
            </nav>
          </Card>
        </div>
      </div>
    </div>
  );
}
