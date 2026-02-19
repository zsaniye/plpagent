"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import {
  saveChatHistory,
  getChatHistory,
  clearChatHistory,
} from "@/lib/storage";
import ChatMessageComponent, { TypingIndicator } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onPathSaved?: () => void;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome! I'm your **Personalized Learning Path Agent**.\n\nI'll help you discover your learning needs, assess your current skills, and generate a fully structured, personalized learning path using free, high-quality resources.\n\nTo get started, **what would you like to learn?** Tell me about the skill or topic you're interested in developing.",
};

function makeId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function ChatInterface({ onPathSaved }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize from storage or with welcome message
  useEffect(() => {
    if (initialized) return;
    const savedHistory = getChatHistory();

    if (savedHistory.length > 0) {
      const restored: Message[] = savedHistory.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(restored);
    } else {
      setMessages([WELCOME_MESSAGE]);
      saveChatHistory([
        {
          id: WELCOME_MESSAGE.id,
          role: WELCOME_MESSAGE.role,
          content: WELCOME_MESSAGE.content,
          timestamp: Date.now(),
        },
      ]);
    }
    setInitialized(true);
  }, [initialized]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      const userMessage: Message = {
        id: makeId(),
        role: "user",
        content: text.trim(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      // Build the API message history (exclude welcome message from API calls)
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const assistantId = makeId();

      try {
        abortRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || `API error: ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        // Add empty assistant message that we'll stream into
        const assistantMessage: Message = {
          id: assistantId,
          role: "assistant",
          content: "",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent } : m
            )
          );
        }

        // Save final state to localStorage
        const finalMessages = [
          ...updatedMessages,
          { id: assistantId, role: "assistant" as const, content: fullContent },
        ];
        saveChatHistory(
          finalMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: Date.now(),
          }))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Failed to get response";
        setError(message);

        // Remove the empty assistant message if streaming failed before any content
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [messages, isStreaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewConversation = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    clearChatHistory();
    saveChatHistory([
      {
        id: WELCOME_MESSAGE.id,
        role: WELCOME_MESSAGE.role,
        content: WELCOME_MESSAGE.content,
        timestamp: Date.now(),
      },
    ]);
    onPathSaved?.();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-gray-700">
            Learning Assistant
          </span>
          <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
            Powered by Claude
          </span>
        </div>
        <button
          onClick={handleNewConversation}
          className="btn-ghost flex items-center gap-1.5 text-xs"
          title="Start new conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container scrollbar-thin">
        {messages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            message={{
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: Date.now(),
            }}
          />
        ))}

        {isStreaming &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="input-field text-sm"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-primary flex items-center gap-1.5 px-4 py-3 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
