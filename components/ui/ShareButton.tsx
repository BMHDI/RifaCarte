"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Facebook, MessageSquare, Copy, Phone } from "lucide-react";

export function ShareButton({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/${id}`);
  }, [id]);

  const text = `Découvrez ${name} sur notre annuaire :`;

  const handleCopy = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers !");
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
        <ExternalLink className="h-4 w-4 mr-1" /> Partager
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-72 space-y-4">
            <h3 className="text-lg font-semibold text-center">Partager</h3>

            <div className="flex justify-around">
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank")}
                title="Partager sur WhatsApp"
              >
                <Phone className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")}
                title="Partager sur Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(`sms:?body=${encodeURIComponent(text + " " + url)}`, "_self")}
                title="Partager par SMS"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button variant="outline" onClick={handleCopy} title="Copier le lien">
                <Copy className="h-5 w-5" />
              </Button>
            </div>

            <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
