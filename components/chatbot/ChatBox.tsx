"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Assurez-vous d'avoir ce composant shadcn ou créez un span stylé
import { Loader2 } from "lucide-react"; // Optionnel pour une icône de chargement
import { trackEvent } from "@/app/googleAnalytics";


type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { name: string; id: string }[]; // Ajout des sources
};

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Salut ! Je suis votre assistant virtuel. Posez-moi vos questions sur les organismes francophones en Alberta 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage: Message = { role: "user", content: input };
  
  // Track the user input as a GA event
  trackEvent("chat_message_sent", { 
    category: "interaction", 
    label: input.slice(0, 50) // only first 50 chars to avoid privacy issues
  });

  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInput("");
  setIsLoading(true);

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();

    // Track the assistant response as an event
    trackEvent("chat_response_received", { category: "interaction" });

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.text,
        sources: data.sources,
      },
    ]);
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Désolé, une erreur est survenue." },
    ]);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex flex-col h-[80vh]  rounded-xl bg-white  overflow-hidden">
      {/* Zone des messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              {/* Contenu du message */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Affichage des sources (uniquement pour l'assistant) */}
              {msg.role === "assistant" &&
                msg.sources &&
                msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                      Sources consultées :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, sIdx) => (
                        <Badge
                          key={sIdx}
                          variant="secondary"
                          className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
                        >
                          {src.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-xs text-gray-500 font-medium">
                Recherche dans le répertoire...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Zone d'input */}
      <div className="flex w-full p-4">
        <Input
          className="rounded-r-none flex-1"
          placeholder="Chercher un organisme..."
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
       <Button className="rounded-l-none flex gap-1"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
        </Button>
      </div>
      <p className="text-[10px] text-center text-gray-400 mt-2">
        L`IA peut faire des erreurs. Vérifiez les informations auprès des
        organismes.
      </p>
    </div>
  );
}
