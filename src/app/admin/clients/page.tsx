"use client";

import { useState, useEffect } from "react";
import { User, Search, Star, Shield, ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminClientsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/connexion");
  }, [user, isLoading, router]);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) { void fetchUsers(); }
  }, [user]);

  const toggleActive = async (id: number, current: boolean) => {
    setUpdating(id);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchUsers();
    setUpdating(null);
  };

  const changeRole = async (id: number, role: string) => {
    setUpdating(id);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    fetchUsers();
    setUpdating(null);
  };

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
  );

  const roleColors: Record<string, "success" | "info" | "purple" | "default"> = {
    customer: "default",
    admin: "danger" as "success",
    delivery: "info",
  };

  const roleLabels: Record<string, string> = {
    customer: "Client",
    admin: "Admin",
    delivery: "Livreur",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des clients</h1>
        <Badge variant="info">{users.filter(u => u.role === "customer").length} clients</Badge>
      </div>

      <div className="mb-4">
        <Input placeholder="Rechercher par nom, email, téléphone..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({length: 5}).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card key={u.id} className={`flex items-center gap-4 ${!u.isActive ? "opacity-60" : ""}`}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 font-bold text-blue-900">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <Badge variant={u.role === "admin" ? "danger" as "success" : u.role === "delivery" ? "info" : "default"}>
                    {roleLabels[u.role]}
                  </Badge>
                  {!u.isActive && <Badge variant="danger">Désactivé</Badge>}
                </div>
                <p className="text-sm text-gray-500">{u.email} · {u.phone}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium shrink-0">
                <Star className="w-3.5 h-3.5" /> {u.loyaltyPoints} pts
              </div>
              <div className="flex gap-1 shrink-0">
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  disabled={updating === u.id}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="customer">Client</option>
                  <option value="delivery">Livreur</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  disabled={updating === u.id}
                  className={`p-2 rounded-lg ${u.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                  title={u.isActive ? "Désactiver" : "Activer"}
                >
                  {u.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
