"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { trackEvent } from "@/app/googleAnalytics";
import { supabase } from "@/lib/db";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  // 2. loading the history
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
      
      // if there is a message replace woth welocoming 
      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();
  }, [sessionId]);

  // Auto Scroll down
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newId);
    setSessionId(newId);
    setMessages([welcomeMessage]); // reset the message to welocoming
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
        <div onClick={startNewChat} className="flex justify-end items-center   flex gap-2 items-center text-primary hover:text-black transition-colors ">
            Nouvelle discussion <Button 
            variant="ghost" 
            size="sm" 
            onClick={startNewChat}
            
          >
            <RotateCcw className="h-5 w-5" />
         
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
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
     ul: ({ children }) => (
  <ul className="list-disc list-inside ml-4 space-y-0.5">
    {children}
  </ul>
),
ol: ({ children }) => (
  <ol className="list-decimal list-inside ml-4 space-y-0.5">
    {children}
  </ol>
),
li: ({ children }) => <li className="leading-tight">{children}</li>,
strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
h2: ({ children }) => (
  <h2 className="text-lg font-semibold text-primary leading-tight mt-2 mb-1">
    {children}
  </h2>
),
h3: ({ children }) => (
  <h3 className="font-semibold text-primary leading-tight mt-1 mb-1">
    {children}
  </h3>
),
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>
{/* 
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
              )} */}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              
              <span className="text-xs  flex gap-4 ">
               <Sparkles className=" animate-spin "  />  Recherche dans le répertoire
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      {messages.length == 1 &&
      <p className="text-xs text-center text-primary pb-2  mt-3">
          L'IA peut faire des erreurs. Vérifiez les informations auprès des organismes.
        </p>}
    
        <div className="flex w-full px-4  ">
          <Input
            className="rounded-r-none flex-1"
            placeholder="Chercher un organisme..."
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
         
          <Button 
            className="rounded-l-none flex gap-1 w-24"
            onClick={sendMessage}
            disabled={isLoading }
          > 
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
    <Send className="h-4 w-4 mr-1" /> {/* optional margin */}
    Envoyer
  </>}
          </Button>
        </div>
        
    </div>
  );
}