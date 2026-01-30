"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// On définit un type plus proche des standards (role 'user' ou 'assistant')
type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIConversationGemini() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Salut ! Je suis votre assistant virtuel. Posez-moi vos questions sur les organismes francophones en Alberta 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Réf pour le scroll automatique
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    // 1. Mise à jour locale immédiate
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Envoi de TOUT l'historique à l'API
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }), // On envoie l'array complet
      });

      const data = await res.json();

      // 3. Ajouter la réponse de l'IA à l'historique
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
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
    <div className="flex flex-col h-[80vh] border rounded-lg bg-white shadow-sm">
      {/* Zone des messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white border text-gray-800 rounded-tl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 animate-pulse p-3 rounded-2xl rounded-tl-none text-xs text-gray-500">
              L'IA réfléchit...
            </div>
          </div>
        )}
      </div>

      {/* Zone d'input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            className="flex-1 focus-visible:ring-blue-500"
            placeholder="Posez votre question..."
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </div>
  );
}