import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Collapse common LLM glitch: nested or doubled ** wrappers so Markdown renders cleanly. */
function normalizeAssistantMarkdown(text: string): string {
  let s = text;
  // `****value****` from concatenating `**` + `**value**`
  s = s.replace(/\*\*\*\*([^*]+?)\*\*\*\*/g, "**$1**");
  // `** **value** **` style double wrap
  s = s.replace(/\*\*\s*\*\*([^*]+?)\*\*\s*\*\*/g, "**$1**");
  // `**\*\*value\*\***` when model escapes inner stars
  s = s.replace(/\*\*\\*\*\\*([^*]+?)\\*\*\\*\*\*\*/g, "**$1**");
  return s;
}

function AssistantMessageBody({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="my-2 list-disc pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 list-decimal pl-4">{children}</ol>,
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary-600 underline hover:text-primary-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-gray-200/80 px-1 py-0.5 font-mono text-[0.85em]">
            {children}
          </code>
        ),
      }}
    >
      {normalizeAssistantMarkdown(content)}
    </ReactMarkdown>
  );
}

export default function Assistant() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm MedBot, your medicine assistant. I can help you understand your medications, explain side effects, and add or update dose schedules when you ask (same rules as the Medicines page). What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const history = messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assistant/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: trimmed,
            history: history.slice(-10), // send last 10 messages as context
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to reach assistant");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = JSON.parse(line.replace("data: ", ""));
          if (data.invalidateMedicines) {
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
          }
          if (data.text) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + data.text,
              };
              return updated;
            });
          }
          if (data.done) break;
        }
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-emerald-100/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 ring-1 ring-primary-200/50">
          <Bot className="h-5 w-5 text-primary-700" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">MedBot</p>
          <p className="text-xs text-gray-400">AI medicine assistant · Not a substitute for medical advice</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 ring-1 ring-primary-200/40">
                <Bot className="h-4 w-4 text-primary-700" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-tr-sm bg-primary-600 text-white shadow-sm"
                  : "rounded-tl-sm border border-emerald-100/80 bg-white/90 text-gray-800 shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.content ? (
                  <AssistantMessageBody content={msg.content} />
                ) : (
                  <span className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                )
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 px-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-emerald-100/80 pt-4">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your medicines or say e.g. add Metformin at 8 AM and 8 PM…"
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-xl border border-emerald-200/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            aria-label="Send message"
            title="Send message"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Always consult a doctor or pharmacist for medical decisions.
        </p>
      </div>
    </div>
  );
}