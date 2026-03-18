"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Flame, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_CONFIG } from "@/lib/config";

export default function ConnexionPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = await login(form.email, form.password);
        if (result.success) {
          router.push("/");
        } else {
          setError(result.error || "Erreur de connexion");
        }
      } else {
        const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        if (result.success) {
          router.push("/");
        } else {
          setError(result.error || "Erreur d'inscription");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            {APP_CONFIG.company.name}
          </Link>
          <p className="text-blue-200 mt-2 text-sm">{APP_CONFIG.company.tagline}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "register" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Input
                label="Nom complet"
                type="text"
                placeholder="Ex: Amadou Mahamat"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Adresse email"
              type="email"
              placeholder="exemple@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {mode === "register" && (
              <Input
                label="Numéro de téléphone"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            )}

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "register" ? "Au moins 6 caractères" : "Votre mot de passe"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Compte admin par défaut : admin@gazcom.cm / Admin@GazCom2024
            </p>
          )}
        </div>

        <p className="text-center text-blue-300 text-sm mt-6">
          <Link href="/" className="hover:text-white">← Retour à l&apos;accueil</Link>
        </p>
      </div>
    </div>
  );
}
