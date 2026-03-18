"use client";

import { useState, useEffect } from "react";
import { Package, Search, Filter, RefreshCw, User, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency, APP_CONFIG } from "@/lib/config";
import { getStatusColor, getStatusLabel, timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  deliveryType: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "preparing", label: "En préparation" },
  { value: "out_for_delivery", label: "En livraison" },
  { value: "ready_for_pickup", label: "Prêtes retrait" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function AdminCommandesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "admin" && user.role !== "delivery"))) router.push("/connexion");
  }, [user, isLoading, router]);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchOrders();
    }
  }, [user]);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    fetchOrders();
    setUpdatingId(null);
    setSelectedOrder(null);
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber.includes(search) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paymentLabels: Record<string, string> = { cash: "Cash", mtn: "MTN", orange: "Orange" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
        <Button variant="ghost" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input placeholder="Rechercher n° commande ou client..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune commande trouvée</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-blue-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{order.orderNumber}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} className="text-xs">
                      {order.paymentStatus === "paid" ? "Payé" : "Non payé"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{order.customerName}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{order.customerPhone}</span>
                    <span>{order.deliveryType === "home" ? "🏠 Domicile" : "🏪 Retrait"}</span>
                    <span>{paymentLabels[order.paymentMethod]}</span>
                    <span className="text-gray-400">{timeAgo(order.createdAt)}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-900 shrink-0">{formatCurrency(order.total)}</span>
              </div>

              {/* Actions (expand) */}
              {selectedOrder?.id === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Changer le statut :</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(APP_CONFIG.orderStatuses).map((status) => (
                      <button
                        key={status}
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, status); }}
                        disabled={order.status === status || updatingId === order.id}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 ${order.status === status ? "bg-gray-200 text-gray-600" : "bg-white border border-gray-300 hover:border-red-400 hover:text-red-600"}`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                  {NEXT_STATUS[order.status] && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3"
                      isLoading={updatingId === order.id}
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, NEXT_STATUS[order.status]); }}
                    >
                      Passer à : {getStatusLabel(NEXT_STATUS[order.status])}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
