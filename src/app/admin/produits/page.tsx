"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Package, Search, X, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/config";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  weight?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const EMPTY_FORM = { name: "", price: 0, stock: 0, unit: "bouteille", weight: 0, description: "", categoryId: 0, isFeatured: false };

export default function AdminProduitsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/connexion");
  }, [user, isLoading, router]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts(prodData.products || []);
      const cats: Category[] = [];
      const seen = new Set();
      for (const p of catData.products || []) {
        if (!seen.has(p.category.id)) {
          seen.add(p.category.id);
          cats.push(p.category);
        }
      }
      setCategories(cats);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, price: p.price, stock: p.stock, unit: p.unit, weight: p.weight || 0, description: "", categoryId: p.categoryId, isFeatured: p.isFeatured });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editId) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Désactiver ce produit ?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
          <Plus className="w-4 h-4" /> Nouveau produit
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="mb-6 border-2 border-red-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editId ? "Modifier le produit" : "Nouveau produit"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nom du produit" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: Number(e.target.value)}))} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value={0}>-- Choisir une catégorie --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Prix (FCFA)" type="number" value={form.price} onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))} />
            <Input label="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: Number(e.target.value)}))} />
            <Input label="Unité" value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} hint="Ex: bouteille, unité, kg" />
            <Input label="Poids (kg)" type="number" value={form.weight} onChange={e => setForm(f => ({...f, weight: Number(e.target.value)}))} hint="Laisser 0 si non applicable" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-red-600" />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">Produit populaire (affiché en page d&apos;accueil)</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="primary" onClick={handleSubmit} isLoading={saving}>
              <Save className="w-4 h-4" /> {editId ? "Sauvegarder" : "Créer le produit"}
            </Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</Button>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <Input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className={`flex items-center gap-4 ${!p.isActive ? "opacity-50" : ""}`}>
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                  {p.isFeatured && <Badge variant="warning" className="text-xs">Populaire</Badge>}
                  {!p.isActive && <Badge variant="danger" className="text-xs">Désactivé</Badge>}
                </div>
                <p className="text-sm text-gray-500">{p.categoryName} · {formatCurrency(p.price)} / {p.unit}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-yellow-600" : "text-green-600"}`}>
                  {p.stock} en stock
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
