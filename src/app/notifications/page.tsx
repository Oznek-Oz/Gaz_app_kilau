"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Package, Star, Info, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedOrderId?: number;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  order: <Package className="w-4 h-4" />,
  loyalty: <Star className="w-4 h-4" />,
  promo: <Tag className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  order: "bg-blue-100 text-blue-700",
  loyalty: "bg-yellow-100 text-yellow-700",
  promo: "bg-green-100 text-green-700",
  system: "bg-gray-100 text-gray-700",
};

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/connexion");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .finally(() => setLoading(false));
  }, [user]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading || loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Tout lire
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Aucune notification</p>
          <p className="text-gray-400 text-sm mt-1">Vous serez notifié ici lors des mises à jour de commandes</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={`p-4 rounded-2xl border transition-colors cursor-pointer ${!notif.isRead ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100 hover:bg-gray-50"}`}
            >
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeColors[notif.type] || typeColors.system}`}>
                  {typeIcons[notif.type] || typeIcons.system}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.isRead ? "text-blue-900" : "text-gray-900"}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
