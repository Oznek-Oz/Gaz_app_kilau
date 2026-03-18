import Link from "next/link";
import { Flame, Phone, Mail, MapPin, Clock } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span>{APP_CONFIG.company.name}</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">{APP_CONFIG.company.description}</p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-blue-300">Navigation</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/produits" className="hover:text-white transition-colors">Nos produits</Link></li>
              <li><Link href="/commande" className="hover:text-white transition-colors">Commander</Link></li>
              <li><Link href="/suivi" className="hover:text-white transition-colors">Suivi de commande</Link></li>
              <li><Link href="/connexion" className="hover:text-white transition-colors">Mon compte</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-blue-300">Contact</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span>{APP_CONFIG.company.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>{APP_CONFIG.company.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{APP_CONFIG.company.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{APP_CONFIG.company.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Paiements */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-blue-300">Paiements acceptés</h4>
            <div className="space-y-2">
              {APP_CONFIG.payment.methods.filter((m) => m.enabled).map((method) => (
                <div key={method.id} className="flex items-center gap-2 text-sm text-blue-200">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  {method.label}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-800 rounded-xl">
              <p className="text-xs text-blue-300">Livraison à domicile</p>
              <p className="text-sm font-semibold text-white">{APP_CONFIG.delivery.estimatedTime.delivery}</p>
              <p className="text-xs text-blue-300 mt-1">Retrait en boutique</p>
              <p className="text-sm font-semibold text-white">{APP_CONFIG.delivery.estimatedTime.pickup}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-10 pt-6 text-center text-xs text-blue-400">
          © {new Date().getFullYear()} {APP_CONFIG.company.name} — {APP_CONFIG.company.city}, {APP_CONFIG.company.country}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
