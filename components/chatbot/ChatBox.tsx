"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "ai"; text: string };

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "👋 Salut ! Je suis votre assistant virtuel. Posez-moi vos questions sur les organismes francophones en Alberta 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };

    // 1️⃣ Update local UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 2️⃣ Send to backend with mapped history
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          history: [
            ...messages.map((m) => ({
              role: m.role === "ai" ? "model" : "user",
              text: m.text,
            })),
          ],
        }),
      });

      const data = await res.json();

      // 3️⃣ Add AI response to local messages
      const aiMessage: Message = { role: "ai", text: data.text };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Erreur lors de la réponse de l'IA." },
      ]);
    } finally {
      setLoading(false);
    }
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
        {loading && (
          <div className="p-2 rounded-md bg-gray-200 self-start max-w-3/4">
            💬 L'IA réfléchit...
          </div>
        )}
      </div>

      <div className="flex w-full p-4 gap-2">
        <Input
          className="flex-1 rounded-r-none"
          placeholder="Écrivez votre message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <Button variant="default" onClick={sendMessage} disabled={loading}>
          Envoyer
        </Button>
      </div>
    </div>
  );
}
