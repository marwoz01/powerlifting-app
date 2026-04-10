'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { useStorage } from '@/lib/hooks/use-storage';
import { buildCoachSystemPrompt } from '@/lib/ai-prompts';
import type { UserSettings, GeneratedProgram, WorkoutLog } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachPage() {
  const storage = useStorage();
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storage.isReady) return;
    async function load() {
      // Check if user has any API keys (server-side check)
      const res = await fetch('/api/keys');
      const data = await res.json();
      setHasKeys(data.hasAnthropic || data.hasOpenRouter || data.hasGemini);

      const [s, p, l] = await Promise.all([
        storage.getUserSettings(),
        storage.getProgram(),
        storage.getWorkoutLogs(),
      ]);
      setSettings(s);
      setProgram(p);
      setLogs(
        l.filter((x) => x.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }
    load();
  }, [storage.isReady]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !hasKeys || !settings) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const systemPrompt = buildCoachSystemPrompt(settings, program, logs);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd połączenia');
        return;
      }

      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch {
      setError('Nie udało się połączyć z API');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (hasKeys === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  if (!hasKeys) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Bot className="size-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Coach AI</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Aby korzystać z coacha AI, dodaj klucz API (OpenRouter lub Gemini) w ustawieniach.
        </p>
        <Link href="/settings">
          <Button>
            <Settings className="size-4 mr-2" />
            Przejdź do ustawień
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="size-5" />
          <h1 className="font-bold">Coach AI</h1>
          <Badge variant="secondary" className="text-[10px]">Llama 3.3 70B</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Twój asystent treningowy — pyta o program, technikę, ciężary
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Zapytaj o cokolwiek — program, technikę, ciężary, regenerację.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Jak poprawić lockout na ławie?',
                'Czy moje ciężary na ten tydzień są ok?',
                'Co robić gdy RPE jest za wysokie?',
                'Jakie akcesoria na słabe adduktory?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 size-7 rounded-full bg-primary flex items-center justify-center">
                <Bot className="size-4 text-primary-foreground" />
              </div>
            )}
            <Card
              className={`max-w-[80%] ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <CardContent className="py-2.5 px-3.5">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
            {msg.role === 'user' && (
              <div className="shrink-0 size-7 rounded-full bg-muted flex items-center justify-center">
                <User className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 size-7 rounded-full bg-primary flex items-center justify-center">
              <Bot className="size-4 text-primary-foreground" />
            </div>
            <Card>
              <CardContent className="py-2.5 px-3.5">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive px-2">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <div className="border-t border-border p-4 pb-20 md:pb-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napisz do coacha..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0 size-11"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
