"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, Star, Bell, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { APP_CONFIG, formatCurrency } from "@/lib/config";

export default function ComptePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", quarter: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<{id:number;title:string;message:string;isRead:boolean;type:string;createdAt:string}[]>([]);
  const [orders, setOrders] = useState<{orderNumber:string;status:string;total:number;createdAt:string}[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/connexion");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, phone: user.phone, address: user.address || "", quarter: user.quarter || "" });
    fetch("/api/notifications").then(r => r.json()).then(d => setNotifications((d.notifications || []).slice(0, 5)));
    fetch("/api/orders").then(r => r.json()).then(d => setOrders((d.orders || []).slice(0, 5)));
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente", confirmed: "Confirmée", preparing: "En préparation",
      out_for_delivery: "En livraison", ready_for_pickup: "Prête", delivered: "Livrée", cancelled: "Annulée"
    };
    return labels[status] || status;
  };

  if (isLoading || !user) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  const rewardSets = Math.floor(user.loyaltyPoints / APP_CONFIG.loyalty.rewardThreshold);
  const progressPercent = (user.loyaltyPoints % APP_CONFIG.loyalty.rewardThreshold) / APP_CONFIG.loyalty.rewardThreshold * 100;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon compte</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Link href="/compte/commandes">
          <Card hover className="text-center">
            <Package className="w-8 h-8 text-blue-900 mx-auto mb-2" />
            <p className="font-bold text-lg text-gray-900">{orders.length}</p>
            <p className="text-sm text-gray-500">Commandes</p>
          </Card>
        </Link>
        <Card className="text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="font-bold text-lg text-gray-900">{user.loyaltyPoints}</p>
          <p className="text-sm text-gray-500">Points fidélité</p>
        </Card>
        <Link href="/notifications">
          <Card hover className="text-center relative">
            <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-bold text-lg text-gray-900">{unreadCount}</p>
            <p className="text-sm text-gray-500">Non lues</p>
            {unreadCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full" />}
          </Card>
        </Link>
      </div>

      {/* Profil */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" /> Mes informations
          </h2>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" /> Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
                <Save className="w-4 h-4" /> Sauvegarder
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nom" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            <Input label="Adresse" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="sm:col-span-2" />
            <Input label="Quartier" value={form.quarter} onChange={e => setForm(f => ({...f, quarter: e.target.value}))} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Nom</p><p className="font-medium mt-0.5">{user.name}</p></div>
            <div><p className="text-gray-500">Email</p><p className="font-medium mt-0.5">{user.email}</p></div>
            <div><p className="text-gray-500">Téléphone</p><p className="font-medium mt-0.5">{user.phone}</p></div>
            <div><p className="text-gray-500">Quartier</p><p className="font-medium mt-0.5">{user.quarter || "—"}</p></div>
            {user.address && <div className="sm:col-span-2"><p className="text-gray-500">Adresse</p><p className="font-medium mt-0.5">{user.address}</p></div>}
          </div>
        )}
      </Card>

      {/* Fidélité */}
      <Card className="mb-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" /> Programme fidélité
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{user.loyaltyPoints} / {APP_CONFIG.loyalty.rewardThreshold} points</span>
          {rewardSets > 0 && <Badge variant="success">{rewardSets} réduction{rewardSets > 1 ? "s" : ""} disponible{rewardSets > 1 ? "s" : ""}</Badge>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
          <div className="bg-yellow-500 h-2.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-gray-500">
          {rewardSets > 0
            ? `Vous pouvez bénéficier de ${formatCurrency(rewardSets * APP_CONFIG.loyalty.rewardAmount)} de réduction sur votre prochaine commande !`
            : `Encore ${APP_CONFIG.loyalty.rewardThreshold - user.loyaltyPoints} points pour obtenir ${formatCurrency(APP_CONFIG.loyalty.rewardAmount)} de réduction.`}
        </p>
      </Card>

      {/* Dernières commandes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Dernières commandes</h2>
          <Link href="/compte/commandes" className="text-sm text-red-600 font-medium hover:text-red-700">Tout voir</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucune commande pour l&apos;instant</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <Link key={order.orderNumber} href={`/suivi?numero=${order.orderNumber}`}>
                <li className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(order.total)}</p>
                    <span className="text-xs text-blue-600">{getStatusLabel(order.status)}</span>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
