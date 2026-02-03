"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw } from "lucide-react";
import { trackEvent } from "@/app/googleAnalytics";
import { supabase } from "@/lib/db";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { name: string; id: string }[];
  created_at?: string;
  timestamp?: string;
  [key: string]: any;
};

export function ChatBox() {
  // Message de bienvenue initial
  const welcomeMessage: Message = {
    role: "assistant",
    content: "Bonjour ! Je suis votre assistant pour chercher des services francophones. Comment puis-je vous aider ?",
    created_at: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialisation de la session
  useEffect(() => {
    let id = localStorage.getItem("chat_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("chat_session_id", id);
    }
    setSessionId(id);
  }, []);

  // 2. Chargement de l'historique depuis Supabase
  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      // Si on a des messages en DB, on remplace le message de bienvenue par l'historique
      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();
  }, [sessionId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newId);
    setSessionId(newId);
    setMessages([welcomeMessage]); // Reset l'affichage avec le message de bienvenue
    setInput("");
  };

  const saveMessage = async (message: Message) => {
    if (!sessionId) return;
    const { error } = await supabase.from("chat_messages").insert([
      {
        role: message.role,
        content: message.content,
        sources: message.sources || null,
        session_id: sessionId,
      },
    ]);
    if (error) console.error("Error saving message:", error);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentInput = input;

    trackEvent("chat_message_sent", {
      category: "interaction",
      label: currentInput.slice(0, 50),
    });

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] rounded-xl bg-white  overflow-hidden">
      
      {/* Header avec bouton Reset (Affiche seulement s'il y a plus que le message de bienvenue) */}
      {messages.length > 1 && (
        <div className="flex justify-end items-center p-2  backdrop-blur-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={startNewChat}
            className="text-[10px] uppercase tracking-wider font-bold flex gap-2 items-center text-primary hover:text-black transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Nouvelle discussion
          </Button>
        </div>
      )}

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
              <span className="text-xs text-gray-500 font-medium italic">
                Recherche dans le répertoire...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <p className="text-[10px] text-center text-gray-400 mt-3">
          L'IA peut faire des erreurs. Vérifiez les informations auprès des organismes.
        </p>
      <div className="p-4 bg-white ">
        <div className="flex w-full ">
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
        
      </div>
    </div>
  );
}