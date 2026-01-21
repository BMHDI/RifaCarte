"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AIConversationMock() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    // Simulate AI response after 500ms
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Voici une réponse simulée pour : "${input}"` },
      ]);
    }, 500);

    // Clear input
    setInput("");
  };

  return (
    <>
      <div className="flex flex-col h-[70vh] border rounded-md p-2 bg-gray-50">
        {/* Messages display */}
        <div className="flex-1 overflow-y-auto mb-2 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-md max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-gray-200 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input area margin bottom 4 to match the search input */}
        <div className="flex ">
          <Input
            className="rounded-r-none"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            variant="default"
            className="rounded-l-none"
            onClick={sendMessage}
          >
            Envoyer
          </Button>
        </div>
      </div>
      <div className="  m-6">
        <p className="text-md text-gray-900 m-2">
          Ce chatbot est utilisé pour illustrer la fonctionnalité de recherche.
          Les résultats peuvent varier en fonction de la recherche effectuée.
        </p>
      </div>
    </>
  );
}
