"use client";

import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType, SuggestedAction } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestedAction?: (value: string) => void;
  isLatest?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function ChatMessageComponent({
  message,
  onSuggestedAction,
  isLatest,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const actions = message.metadata?.suggestedActions;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}>
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        </div>

        {actions && isLatest && onSuggestedAction && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action: SuggestedAction, i: number) => (
              <button
                key={i}
                onClick={() => onSuggestedAction(action.value)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
        <Bot className="h-4 w-4" />
      </div>
      <div className="chat-bubble-assistant">
        <div className="flex gap-1.5 py-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
}
