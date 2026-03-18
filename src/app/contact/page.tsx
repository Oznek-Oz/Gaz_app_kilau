import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Nous contacter</h1>
        <p className="text-gray-500 mt-2">Notre équipe est disponible pour vous aider à Maroua</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Téléphone</h3>
            <p className="text-gray-600 mt-1">{APP_CONFIG.company.phone}</p>
            <p className="text-sm text-gray-400 mt-1">Appel & WhatsApp</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Email</h3>
            <p className="text-gray-600 mt-1">{APP_CONFIG.company.email}</p>
            <p className="text-sm text-gray-400 mt-1">Réponse sous 24h</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Horaires</h3>
            <p className="text-gray-600 mt-1">{APP_CONFIG.company.workingHours}</p>
            <p className="text-sm text-gray-400 mt-1">Fermé le dimanche</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Adresse</h3>
            <p className="text-gray-600 mt-1">{APP_CONFIG.company.address}</p>
            <p className="text-sm text-gray-400 mt-1">Zone de livraison : toute la ville</p>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Nos points de vente</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {APP_CONFIG.pickupPoints.map((point) => (
          <Card key={point.id}>
            <h3 className="font-bold text-gray-900 mb-1">{point.name}</h3>
            <p className="text-sm text-gray-600">{point.address}</p>
            <p className="text-sm text-gray-600">{point.phone}</p>
            <p className="text-xs text-green-600 font-medium mt-2">{point.hours}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <MessageCircle className="w-10 h-10 text-blue-300 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Besoin d&apos;aide urgente ?</h3>
            <p className="text-blue-200 text-sm mt-1">
              Appelez-nous directement ou envoyez un message WhatsApp au {APP_CONFIG.company.phone}.
              Nous répondons rapidement !
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
