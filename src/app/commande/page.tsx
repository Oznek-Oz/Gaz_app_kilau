"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Truck, Store, Phone, CreditCard, MapPin, Star, ArrowRight, Trash2, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { APP_CONFIG, formatCurrency, calculateDeliveryFee } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [pickupPointId, setPickupPointId] = useState("main");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [deliveryQuarter, setDeliveryQuarter] = useState(user?.quarter || "");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mtn" | "orange">("cash");
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = deliveryType === "home" ? calculateDeliveryFee("home") : 0;
  const loyaltyRewardSets = Math.floor((user?.loyaltyPoints || 0) / APP_CONFIG.loyalty.rewardThreshold);
  const discountAmount = useLoyaltyPoints && loyaltyRewardSets > 0
    ? Math.min(loyaltyRewardSets * APP_CONFIG.loyalty.rewardAmount, totalPrice)
    : 0;
  const total = totalPrice + deliveryFee - discountAmount;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center fade-in">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
        <p className="text-gray-500 mb-6">Vous devez être connecté pour passer une commande.</p>
        <Link href="/connexion">
          <Button variant="primary" size="lg">Se connecter</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center fade-in">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Panier vide</h2>
        <p className="text-gray-500 mb-6">Ajoutez des produits avant de passer commande.</p>
        <Link href="/produits">
          <Button variant="primary" size="lg">Voir les produits</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (deliveryType === "home" && !deliveryAddress) {
      setError("Veuillez indiquer votre adresse de livraison.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryType,
          pickupPointId: deliveryType === "pickup" ? pickupPointId : null,
          deliveryAddress: deliveryType === "home" ? deliveryAddress : null,
          deliveryQuarter: deliveryType === "home" ? deliveryQuarter : null,
          paymentMethod,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          useLoyaltyPoints: useLoyaltyPoints && loyaltyRewardSets > 0,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        router.push(`/suivi?numero=${data.order.orderNumber}`);
      } else {
        setError(data.error || "Erreur lors de la commande");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Passer la commande</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-5">
          {/* Livraison */}
          <Card>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" /> Mode de livraison
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType("home")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === "home" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <Truck className={`w-5 h-5 mb-2 ${deliveryType === "home" ? "text-red-600" : "text-gray-400"}`} />
                <p className="font-semibold text-sm">Domicile</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(deliveryFee === 0 ? APP_CONFIG.delivery.baseFee + APP_CONFIG.delivery.homeDeliveryFee : deliveryFee)}</p>
              </button>
              <button
                onClick={() => setDeliveryType("pickup")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === "pickup" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <Store className={`w-5 h-5 mb-2 ${deliveryType === "pickup" ? "text-red-600" : "text-gray-400"}`} />
                <p className="font-semibold text-sm">En boutique</p>
                <p className="text-xs text-gray-500 mt-0.5">Gratuit</p>
              </button>
            </div>

            {deliveryType === "home" ? (
              <div className="mt-4 space-y-3">
                <Input
                  label="Adresse complète"
                  placeholder="Rue, quartier, bâtiment..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Quartier"
                  placeholder="Ex: Domayo, Kakataré, Djarengol..."
                  value={deliveryQuarter}
                  onChange={(e) => setDeliveryQuarter(e.target.value)}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Choisir un point de retrait :</p>
                {APP_CONFIG.pickupPoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => setPickupPointId(point.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${pickupPointId === point.id ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <p className="font-semibold text-sm">{point.name}</p>
                    <p className="text-xs text-gray-500">{point.address} · {point.hours}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Paiement */}
          <Card>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-600" /> Mode de paiement
            </h2>
            <div className="space-y-2">
              {APP_CONFIG.payment.methods.filter((m) => m.enabled).map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as "cash" | "mtn" | "orange")}
                  className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${paymentMethod === method.id ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <Phone className={`w-5 h-5 ${paymentMethod === method.id ? "text-red-600" : "text-gray-400"}`} />
                  <div>
                    <p className="font-semibold text-sm">{method.label}</p>
                    {"number" in method && method.number && (
                      <p className="text-xs text-gray-500">N° : {method.number}</p>
                    )}
                  </div>
                  {paymentMethod === method.id && (
                    <span className="ml-auto w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Fidélité */}
          {user.loyaltyPoints >= APP_CONFIG.loyalty.rewardThreshold && (
            <Card>
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Points fidélité
              </h2>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div>
                  <p className="font-semibold text-gray-900">Vous avez {user.loyaltyPoints} points</p>
                  <p className="text-sm text-gray-600">
                    Utiliser {loyaltyRewardSets * APP_CONFIG.loyalty.rewardThreshold} points pour une réduction de {formatCurrency(loyaltyRewardSets * APP_CONFIG.loyalty.rewardAmount)}
                  </p>
                </div>
                <button
                  onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                  className={`w-12 h-6 rounded-full transition-colors ${useLoyaltyPoints ? "bg-yellow-500" : "bg-gray-300"}`}
                >
                  <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${useLoyaltyPoints ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <h2 className="font-bold text-gray-900 mb-3">Notes (facultatif)</h2>
            <textarea
              placeholder="Instructions spéciales pour la livraison, précisions sur l'adresse..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </Card>
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <h2 className="font-bold text-gray-900 mb-4">Récapitulatif</h2>
              <ul className="space-y-2 mb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex-1 truncate">
                      {item.name}
                      <span className="text-gray-400"> ×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 ml-2">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Gratuit"}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction fidélité</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-red-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-4"
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Confirmer la commande
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Un agent vous contactera pour confirmer votre commande.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
