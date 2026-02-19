"use client";

import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestedAction?: (value: string) => void;
  isLatest?: boolean;
}

function renderMarkdown(text: string): string {
  let html = text;

  // Headers (###, ##, #)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-3 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline hover:text-primary-800">$1</a>'
  );

  // Standalone URLs (not already in a link tag)
  html = html.replace(
    /(?<!href="|">)(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline hover:text-primary-800">$1</a>'
  );

  // Numbered lists
  html = html.replace(
    /^(\d+)\.\s+(.+)$/gm,
    '<div class="flex gap-2 ml-2 my-0.5"><span class="text-gray-500 flex-shrink-0">$1.</span><span>$2</span></div>'
  );

  // Bullet lists (- or *)
  html = html.replace(
    /^[-*]\s+(.+)$/gm,
    '<div class="flex gap-2 ml-2 my-0.5"><span class="text-gray-400 flex-shrink-0">&bull;</span><span>$1</span></div>'
  );

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-3 border-gray-200" />');

  // Line breaks
  html = html.replace(/\n/g, "<br/>");

  return html;
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
            {actions.map((action, i) => (
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
