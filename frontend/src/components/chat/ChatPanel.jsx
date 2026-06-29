import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, ChevronDown } from 'lucide-react';
import { fetchChatHistory, streamChatMessage } from '../../services/chat.service';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import AlertBanner from '../ui/AlertBanner';
import Spinner from '../ui/Spinner';

function mapHistoryMessage(msg) {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    citations: msg.citations ?? [],
    streaming: false,
  };
}

export default function ChatPanel({ workspaceId }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const activeWorkspaceRef = useRef(workspaceId);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    activeWorkspaceRef.current = workspaceId;
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setInput('');
    setError(null);

    let cancelled = false;
    setLoadingHistory(true);

    fetchChatHistory(workspaceId)
      .then((history) => {
        if (cancelled || activeWorkspaceRef.current !== workspaceId) return;
        setMessages(history.map(mapHistoryMessage));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load chat history');
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [workspaceId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || streaming) return;

    setError(null);
    setInput('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      streaming: false,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      content: '',
      citations: [],
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const capturedWorkspaceId = workspaceId;

    try {
      await streamChatMessage(capturedWorkspaceId, question, {
        signal: controller.signal,
        onToken: (token) => {
          if (activeWorkspaceRef.current !== capturedWorkspaceId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          );
        },
        onDone: ({ citations, groundedInDocuments }) => {
          if (activeWorkspaceRef.current !== capturedWorkspaceId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, streaming: false, citations, groundedInDocuments }
                : m,
            ),
          );
          setStreaming(false);
        },
        onError: (message) => {
          if (activeWorkspaceRef.current !== capturedWorkspaceId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: message, streaming: false, citations: [] }
                : m,
            ),
          );
          setStreaming(false);
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (activeWorkspaceRef.current !== capturedWorkspaceId) return;
      setError(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      setStreaming(false);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-accent"
        aria-label="Open AI assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          <h2 className="text-sm font-semibold text-text">AI Assistant</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Collapse chat">
          <X className="h-4 w-4" />
        </Button>
      </header>

      {error && (
        <div className="border-b border-border p-3">
          <AlertBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Loading conversation..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-text-muted">
            <MessageSquare className="mb-3 h-8 w-8" />
            <p>Ask questions about documents in this workspace.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documents..."
            disabled={streaming}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:border-accent disabled:opacity-60"
          />
          <Button type="submit" disabled={streaming || !input.trim()} aria-label="Send message">
            {streaming ? <ChevronDown className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </aside>
  );
}
