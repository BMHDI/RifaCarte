"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AIConversationGemini() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "👋 Salut ! Je suis votre assistant virtuel. Posez-moi vos questions sur les organismes francophones en Alberta 😊",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajouter le message utilisateur
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Erreur lors de la réponse de l'IA." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] border rounded-md bg-gray-50">
      <div className="flex-1 max-w-full overflow-y-auto mb-2 p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.role === "user"
                ? "bg-blue-100 self-end mr-auto ml-auto"
                : "bg-gray-200 self-start max-w-3/4"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex w-full p-4 gap-2">
        <Input
          className="flex-1 rounded-r-none"
          placeholder="Écrivez votre message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="default" onClick={sendMessage}>
          Envoyer
        </Button>
      </div>
    </div>
  );
}
