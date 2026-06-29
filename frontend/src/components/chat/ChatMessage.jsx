import { BookOpen } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isStreaming = message.streaming;
  const citations = message.citations ?? [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent text-white'
            : 'border border-border bg-surface-elevated text-text'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-accent animate-blink" />
          )}
        </p>

        {!isStreaming && !isUser && citations.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <BookOpen className="h-3.5 w-3.5" />
              Sources
            </div>
            <ul className="space-y-1">
              {citations.map((c, i) => (
                <li key={`${c.documentId}-${c.chunkIndex}-${i}`} className="text-xs text-text-muted">
                  <span className="font-medium text-text">{c.filename}</span>
                  {' · chunk '}
                  {c.chunkIndex}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isStreaming && !isUser && message.groundedInDocuments === false && (
          <p className="mt-2 text-xs italic text-text-muted">
            Response not grounded in uploaded documents.
          </p>
        )}
      </div>
    </div>
  );
}
