/**
 * ============================================================
 * FICHIER DE CONFIGURATION CENTRALE - GazCom
 * ============================================================
 * Modifiez ce fichier pour personnaliser toute l'application.
 * Aucune connaissance technique n'est requise.
 * ============================================================
 */

export const APP_CONFIG = {
  // --- INFORMATIONS DE L'ENTREPRISE ---
  company: {
    name: "GazCom",
    tagline: "Votre gaz livré rapidement à Maroua",
    description: "Commandez votre gaz en ligne et recevez-le à domicile ou retirez-le en point de vente.",
    city: "Maroua",
    country: "Cameroun",
    phone: "+237 6XX XXX XXX",       // Remplacez par votre numéro
    email: "contact@gazcom.cm",      // Remplacez par votre email
    address: "Maroua, Cameroun",
    workingHours: "Lun - Sam : 7h00 - 20h00",
  },

  // --- DEVISE ---
  currency: {
    code: "FCFA",
    symbol: "FCFA",
    locale: "fr-CM",
  },

  // --- COULEURS DE LA MARQUE ---
  // Ces couleurs sont utilisées via Tailwind CSS (voir globals.css)
  brand: {
    primary: "#DC2626",      // Rouge principal
    secondary: "#1E3A8A",    // Bleu foncé
    accent: "#FFFFFF",       // Blanc
    background: "#F9FAFB",   // Gris très clair
  },

  // --- LIVRAISON ---
  delivery: {
    baseFee: 1000,            // Frais de base en FCFA
    homeDeliveryFee: 300,     // Supplément livraison à domicile en FCFA
    freeDeliveryThreshold: 0, // Mettre un montant pour livraison gratuite à partir de X FCFA (0 = désactivé)
    estimatedTime: {
      pickup: "30 min",
      delivery: "45 - 90 min",
    },
  },

  // --- PROGRAMME DE FIDÉLITÉ ---
  loyalty: {
    enabled: true,
    pointsPerThousand: 1,         // Points gagnés par tranche de 1000 FCFA
    rewardThreshold: 50,           // Nombre de points pour obtenir une réduction
    rewardAmount: 500,             // Montant de la réduction en FCFA
    pointsLabel: "points GazCom",
  },

  // --- PAIEMENTS ---
  payment: {
    methods: [
      { id: "cash", label: "Paiement à la livraison (Cash)", icon: "banknotes", enabled: true },
      { id: "mtn", label: "MTN Mobile Money", icon: "smartphone", enabled: true, number: "6XX XXX XXX" },
      { id: "orange", label: "Orange Money", icon: "smartphone", enabled: true, number: "6XX XXX XXX" },
    ],
  },

  // --- POINTS DE VENTE / RETRAIT ---
  pickupPoints: [
    {
      id: "main",
      name: "Dépôt Principal GazCom",
      address: "Quartier Domayo, Maroua",
      phone: "+237 6XX XXX XXX",
      hours: "Lun - Sam : 7h00 - 20h00",
    },
    {
      id: "second",
      name: "Point de vente Centre-ville",
      address: "Marché Central, Maroua",
      phone: "+237 6XX XXX XXX",
      hours: "Lun - Sam : 8h00 - 19h00",
    },
  ],

  // --- STATUTS DES COMMANDES ---
  orderStatuses: {
    pending: { label: "En attente", color: "yellow", description: "Commande reçue, en attente de confirmation" },
    confirmed: { label: "Confirmée", color: "blue", description: "Commande confirmée par nos équipes" },
    preparing: { label: "En préparation", color: "orange", description: "Votre commande est en cours de préparation" },
    out_for_delivery: { label: "En livraison", color: "purple", description: "Votre livreur est en route" },
    ready_for_pickup: { label: "Prête au retrait", color: "teal", description: "Votre commande est prête, venez la récupérer" },
    delivered: { label: "Livrée", color: "green", description: "Commande livrée avec succès" },
    cancelled: { label: "Annulée", color: "red", description: "Commande annulée" },
  },

  // --- RÔLES UTILISATEURS ---
  roles: {
    customer: "customer",
    admin: "admin",
    delivery: "delivery",
  },
} as const;

// Types utilitaires
export type PaymentMethod = typeof APP_CONFIG.payment.methods[number]["id"];
export type OrderStatus = keyof typeof APP_CONFIG.orderStatuses;

// Formateur de devise
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} ${APP_CONFIG.currency.symbol}`;
}

// Calcul des frais de livraison
export function calculateDeliveryFee(type: "home" | "pickup"): number {
  if (type === "pickup") return 0;
  return APP_CONFIG.delivery.baseFee + APP_CONFIG.delivery.homeDeliveryFee;
}

// Calcul des points de fidélité
export function calculateLoyaltyPoints(amount: number): number {
  return Math.floor(amount / 1000) * APP_CONFIG.loyalty.pointsPerThousand;
}
