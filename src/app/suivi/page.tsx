"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Package, CheckCircle, Clock, Truck, Store, XCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/config";
import { getStatusColor, getStatusLabel, timeAgo } from "@/lib/utils";

interface OrderData {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    deliveryType: string;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress?: string;
    deliveryQuarter?: string;
    notes?: string;
    createdAt: string;
  };
  items: { id: number; productName: string; productPrice: number; quantity: number; subtotal: number }[];
  history: { id: number; status: string; note?: string; createdAt: string }[];
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <CheckCircle className="w-5 h-5" />,
  preparing: <Package className="w-5 h-5" />,
  out_for_delivery: <Truck className="w-5 h-5" />,
  ready_for_pickup: <Store className="w-5 h-5" />,
  delivered: <CheckCircle className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

const paymentLabels: Record<string, string> = {
  cash: "Cash à la livraison",
  mtn: "MTN Mobile Money",
  orange: "Orange Money",
};

function SuiviContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("numero") || "");
  const [data, setData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setIsLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/orders?orderNumber=${num.trim()}`);
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 401) {
        setError("Vous devez être connecté pour accéder à cette commande.");
      } else {
        setError("Commande introuvable. Vérifiez le numéro.");
      }
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const num = searchParams.get("numero");
    if (num) fetchOrder(num);
  }, [searchParams]);

  // Auto-refresh toutes les 30s si commande en cours
  useEffect(() => {
    if (!data) return;
    const activeStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup"];
    if (!activeStatuses.includes(data.order.status)) return;
    const interval = setInterval(() => fetchOrder(data.order.orderNumber), 30000);
    return () => clearInterval(interval);
  }, [data]);

  const statusSteps = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
  const currentStepIndex = data ? statusSteps.indexOf(data.order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Suivi de commande</h1>
      <p className="text-gray-500 text-sm mb-6">Entrez votre numéro de commande pour suivre sa progression en temps réel.</p>

      <div className="flex gap-3 mb-8">
        <Input
          placeholder="Ex: GC-2024-1234"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchOrder(orderNumber)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Button variant="primary" onClick={() => fetchOrder(orderNumber)} isLoading={isLoading}>
          Rechercher
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {data && (
        <div className="space-y-5">
          {/* Status principal */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Numéro de commande</p>
                <h2 className="text-xl font-bold text-gray-900">{data.order.orderNumber}</h2>
                <p className="text-xs text-gray-400 mt-1">Passée {timeAgo(data.order.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(data.order.status)}`}>
                  {statusIcons[data.order.status]}
                  {getStatusLabel(data.order.status)}
                </span>
                <button
                  onClick={() => fetchOrder(data.order.orderNumber)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-3 h-3" /> Actualiser
                </button>
              </div>
            </div>

            {/* Barre de progression */}
            {data.order.status !== "cancelled" && data.order.deliveryType !== "pickup" && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStepIndex ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        {i < currentStepIndex ? "✓" : i + 1}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`h-0.5 w-full mt-3 -mb-5 ${i < currentStepIndex ? "bg-red-600" : "bg-gray-200"}`} style={{ marginTop: "-18px", zIndex: -1 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Détails livraison & paiement */}
          <Card>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Type de livraison</p>
                <p className="font-medium">{data.order.deliveryType === "home" ? "Livraison à domicile" : "Retrait en boutique"}</p>
                {data.order.deliveryAddress && <p className="text-gray-500 text-xs mt-0.5">{data.order.deliveryAddress}</p>}
                {data.order.deliveryQuarter && <p className="text-gray-500 text-xs">{data.order.deliveryQuarter}</p>}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Paiement</p>
                <p className="font-medium">{paymentLabels[data.order.paymentMethod]}</p>
                <Badge variant={data.order.paymentStatus === "paid" ? "success" : "warning"} className="mt-1">
                  {data.order.paymentStatus === "paid" ? "Payé" : data.order.paymentStatus === "failed" ? "Échoué" : "En attente"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Articles */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Articles commandés</h3>
            <ul className="space-y-2">
              {data.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatCurrency(data.order.subtotal)}</span>
              </div>
              {data.order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span>{formatCurrency(data.order.deliveryFee)}</span>
                </div>
              )}
              {data.order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{formatCurrency(data.order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-red-600">{formatCurrency(data.order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Historique */}
          {data.history.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-3">Historique</h3>
              <div className="space-y-3">
                {[...data.history].reverse().map((h) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getStatusLabel(h.status)}</p>
                      {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                      <p className="text-xs text-gray-400">{timeAgo(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="text-center">
            <Link href="/produits">
              <Button variant="outline" size="sm">Commander à nouveau</Button>
            </Link>
          </div>
        </div>
      )}

      {!data && !isLoading && !error && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Entrez un numéro de commande pour commencer</p>
        </div>
      )}
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense>
      <SuiviContent />
    </Suspense>
  );
}
