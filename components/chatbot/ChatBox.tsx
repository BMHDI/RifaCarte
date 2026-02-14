'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Send, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/app/googleAnalytics';
import { supabase } from '@/lib/db';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageSquareMoreIcon } from '../ui/message-square-more';
import { BotMessageSquareIcon } from '../ui/bot-message-square';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isForm?: boolean;
  sources?: { name: string; id: string }[];
  created_at?: string;
};

export function ChatBox() {
  const welcomeMessage: Message = {
    role: 'assistant',
    content:
      'Bonjour ! Je suis votre assistant pour chercher des services francophones en Alberta. Comment puis-je vous aider ?',
    created_at: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formSent, setFormSent] = useState(false); // État pour confirmation d'envoi
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialisation de la session (Conservation de votre logique)
  useEffect(() => {
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('chat_session_id', id);
    }
    setSessionId(id);
  }, []);

  // 2. Chargement de l'historique Supabase (Conservation de votre logique)
  useEffect(() => {
    if (!sessionId) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const saveMessage = async (message: Message) => {
    if (!sessionId) return;
    const { error } = await supabase.from('chat_messages').insert([
      {
        role: message.role,
        content: message.content,
        session_id: sessionId,
      },
    ]);
    if (error) console.error('Error saving message:', error);
  };

  const startNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', newId);
    setSessionId(newId);
    setMessages([welcomeMessage]);
    setInput('');
    setFormSent(false);
  };

  // 3. Envoi du message au Backend RAG
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentInput = input;

    trackEvent('chat_message_sent', { category: 'interaction', label: currentInput.slice(0, 50) });

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    await saveMessage(userMessage);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], conversationId: sessionId }),
      });

      const data = await res.json();

      if (data.type === 'form' && data.formContext?.suggestedMessage) {
        setFormData((prev) => ({
          ...prev,
          message: data.formContext.suggestedMessage,
        }));
      }
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text,
        isForm: data.type === 'form', // Détection du mode formulaire
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantMessage);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erreur de connexion.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Gestion de la soumission du formulaire final
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    status: '',
    phone: '',
    email: '',
    address: '',
    message: '',
  });

  // 2. Mettez à jour handleFormSubmit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormSent(true);
        trackEvent('form_submitted', { category: 'conversion' });
      } else {
        alert("Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white overflow-hidden">
      {/* Header Reset */}
      {messages.length > 1 && (
        <div className="p-2 flex shadow-lg justify-end bg-gray-50 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            className="text-xm text-primary cursor-pointer flex gap-2"
          >
            Nouvelle discussion <RotateCcw className="size-6" />
          </Button>
        </div>
      )}

      {/* Zone des messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? ' border bg-primary shadow-lg text-primary-foreground rounded-tr-none'
                  : 'bg-gray-100 shadow-xl border border-gray-300 text-gray-800 rounded-tl-none '
              }`}
            >
              <div className="text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>

              {/* Rendu du Formulaire UI */}
              {msg.isForm && !formSent && (
                <form
                  onSubmit={handleFormSubmit}
                  className="mt-4 p-4 border rounded-xl bg-gray-50 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      required
                      placeholder="Prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="bg-white h-9 text-xs"
                    />
                    <Input
                      required
                      placeholder="Nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-white h-9 text-xs"
                    />
                  </div>
                  <Input
                    required
                    type="email"
                    placeholder="Votre Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white h-9 text-xs"
                  />
                  <Input
                    required
                    placeholder="Statut"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="bg-white h-9 text-xs"
                  />
                  <Input
                    required
                    placeholder="Adresse"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-white h-9 text-xs"
                  />
                  <Input
                    required
                    placeholder="Numéro de tеlеphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white h-9 text-xs"
                  />
                  <textarea
                    required
                    placeholder="Détaillez votre besoin..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2 bg-white border rounded-md text-xs min-h-[80px]"
                  />
                  <Button type="submit" disabled={isLoading} className="cursor-pointer w-full text-xs font-bold">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </Button>
                </form>
              )}

              {msg.isForm && formSent && (
                <div className="mt-4 p-4 border border-green-100 bg-green-50 rounded-xl flex items-center gap-3 text-green-700 text-xs">
                  <CheckCircle2 className="h-5 w-5" />
                  Votre demande a été envoyée avec succès à notre équipe.
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && !formSent && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm italic text-xs text-gray-400">
              Assistant IA entrain d'analyser votre demande et ecrire une reponse{' '}
              <BotMessageSquareIcon className="animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="p-4 bg-white ">
        <div className="flex w-full">
          <Input
            className="rounded-r-none flex-1"
            placeholder="Posez une question ou demandez un rappel..."
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-24 rounded-l-none flex gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[12px] text-center text-gray-400 mt-2">
          L'IA peut faire des erreurs. Vérifiez les informations auprès des organismes.
        </p>
      </div>
    </div>
  );
}
