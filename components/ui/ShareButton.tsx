"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Facebook, MessageSquare, Copy, Phone } from "lucide-react";

export function ShareButton({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const url = `${window.location.origin}/${id}`;
  const text = `Découvrez ${name} sur notre annuaire :`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Lien copié dans le presse-papiers !");
  };

  return (
    <>
      {/* Bouton principal pour ouvrir le modal */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <ExternalLink className="h-4 w-4 mr-1" /> Partager
      </Button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-72 space-y-4">
            <h3 className="text-lg font-semibold text-center">Partager</h3>

            <div className="flex justify-around">
              {/* WhatsApp */}
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank")}
                title="Partager sur WhatsApp"
              >
                <Phone className="h-5 w-5" />
              </Button>

              {/* Facebook */}
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")}
                title="Partager sur Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>

              {/* SMS */}
              <Button
                variant="outline"
                onClick={() => window.open(`sms:?body=${encodeURIComponent(text + " " + url)}`, "_self")}
                title="Partager par SMS"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              {/* Copier */}
              <Button
                variant="outline"
                onClick={handleCopy}
                title="Copier le lien"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>

            {/* Bouton fermer */}
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
