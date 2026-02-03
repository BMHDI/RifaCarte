"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/app/googleAnalytics";
import {supabase} from "@/lib/db";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { name: string; id: string }[];
  created_at?: string;
};

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages from Supabase on mount
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data as Message[]);
    };

    fetchMessages();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Save message in Supabase
  const saveMessage = async (message: Message) => {
    const { error } = await supabase.from("chat_messages").insert([
      {
        role: message.role,
        content: message.content,
        sources: message.sources || null,
      },
    ]);

    if (error) console.error("Error saving message:", error);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };

    trackEvent("chat_message_sent", {
      category: "interaction",
      label: input.slice(0, 50),
    });

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Save user message
    await saveMessage(userMessage);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      trackEvent("chat_response_received", { category: "interaction" });

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        content: "Désolé, une erreur est survenue.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] rounded-xl bg-white overflow-hidden">
      {/* Messages */}
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
                  ? "bg-primary text-white rounded-tr-none"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>

              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
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

      {/* Input */}
      <div className="flex w-full p-4">
        <Input
          className="rounded-r-none flex-1"
          placeholder="Chercher un organisme..."
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          className="rounded-l-none flex gap-1"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
        </Button>
      </div>

      <p className="text-[10px] text-center text-gray-400 mt-2">
        L`IA peut faire des erreurs. Vérifiez les informations auprès des organismes.
      </p>
    </div>
  );
}
