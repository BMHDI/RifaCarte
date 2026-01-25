"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AIConversationMock() {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "👋 Salut ! Je suis votre assistant virtuel. Posez-moi vos questions sur les organismes francophones en Alberta 😊",
    },
  ]);
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
      <div className="flex flex-col h-[80vh] border rounded-md  bg-gray-50">
        {/* Messages display */}
        <div className="flex-1 max-w-full overflow-y-auto mb-2 p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-md  ${
                msg.role === "user"
                  ? "bg-blue-100 self-end mr-auto ml-auto"
                  : "bg-gray-200 self-start max-w-3/4"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input area margin bottom 4 to match the search input */}
        <div className="flex w-full p-4 ">
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
      {/* <div className="mx-6 flex flex-col flex-wrap items-start gap-2 ">
        <p className="text-md text-gray-900 m-2">
          Ce chatbot est utilisé pour illustrer la fonctionnalité de recherche.
          Les résultats peuvent varier en fonction de la recherche effectuée.
        </p>
      </div> */}
    </>
  );
}
