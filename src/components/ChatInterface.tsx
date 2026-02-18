"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import {
  ChatMessage as ChatMessageType,
  ConversationState,
  LearningPath,
  SavedLearningPath,
} from "@/lib/types";
import {
  getInitialState,
  getWelcomeMessage,
  processMessage,
} from "@/lib/ai-engine";
import {
  saveChatHistory,
  getChatHistory,
  saveConversationState,
  getConversationState,
  clearChatHistory,
  clearConversationState,
  saveLearningPath,
} from "@/lib/storage";
import ChatMessageComponent, { TypingIndicator } from "./ChatMessage";
import LearningPathDisplay from "./LearningPathDisplay";

interface ChatInterfaceProps {
  onPathSaved?: () => void;
}

export default function ChatInterface({ onPathSaved }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [state, setState] = useState<ConversationState>(getInitialState());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize from storage or with welcome message
  useEffect(() => {
    if (initialized) return;
    const savedHistory = getChatHistory();
    const savedState = getConversationState();

    if (savedHistory.length > 0 && savedState) {
      setMessages(savedHistory);
      setState(savedState);
    } else {
      const welcome = getWelcomeMessage();
      setMessages([welcome]);
      saveChatHistory([welcome]);
    }
    setInitialized(true);
  }, [initialized]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMessage: ChatMessageType = {
        id: Math.random().toString(36).substring(2, 10),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
        stage: state.stage,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsTyping(true);

      // Simulate thinking delay
      setTimeout(() => {
        const result = processMessage(text.trim(), state, updatedMessages);
        const newMessages = [...updatedMessages, result.message];

        setMessages(newMessages);
        setState(result.updatedState);

        // Persist
        saveChatHistory(newMessages);
        saveConversationState(result.updatedState);

        // Check if path was approved and save it
        if (result.updatedState.pathApproved && result.updatedState.learningPath) {
          const lp = result.updatedState.learningPath;
          const savedPath: SavedLearningPath = {
            id: lp.id,
            learningPath: lp,
            chatHistory: newMessages,
            discoveryNotes: `${result.updatedState.motivation || ""} - ${result.updatedState.specificArea || ""}`,
            skillProfile: result.updatedState.skillProfile,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            courseProgress: {},
          };
          saveLearningPath(savedPath);
          onPathSaved?.();
        }

        // Auto-trigger path generation after assessment completes
        if (
          result.updatedState.stage === "path-generation" &&
          !result.updatedState.learningPath &&
          result.updatedState.skillProfile
        ) {
          // Keep typing indicator and auto-generate the path after a brief delay
          setTimeout(() => {
            const pathResult = processMessage(
              "generate my learning path",
              result.updatedState,
              newMessages
            );
            const pathMessages = [...newMessages, pathResult.message];
            setMessages(pathMessages);
            setState(pathResult.updatedState);
            setIsTyping(false);
            saveChatHistory(pathMessages);
            saveConversationState(pathResult.updatedState);
            inputRef.current?.focus();
          }, 1500);
        } else {
          setIsTyping(false);
          inputRef.current?.focus();
        }
      }, 800 + Math.random() * 600);
    },
    [messages, state, onPathSaved]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedAction = (value: string) => {
    sendMessage(value);
  };

  const handleNewConversation = () => {
    const welcome = getWelcomeMessage();
    const newState = getInitialState();
    setMessages([welcome]);
    setState(newState);
    clearChatHistory();
    clearConversationState();
    saveChatHistory([welcome]);
    saveConversationState(newState);
  };

  const stageLabels: Record<string, string> = {
    discovery: "Discovery",
    assessment: "Skills Assessment",
    "path-generation": "Learning Path Generation",
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
            {stageLabels[state.stage] || "Discovery"}
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
        {messages.map((msg, i) => {
          const isLatest = i === messages.length - 1;

          return (
            <div key={msg.id}>
              <ChatMessageComponent
                message={msg}
                onSuggestedAction={handleSuggestedAction}
                isLatest={isLatest && !isTyping}
              />

              {/* Render learning path inline if present */}
              {msg.metadata?.learningPath && msg.role === "assistant" && (
                <div className="mt-3 ml-11">
                  <LearningPathDisplay
                    path={msg.metadata.learningPath}
                    compact
                  />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              state.pathApproved
                ? "Start a new conversation to create another learning path..."
                : "Type your message..."
            }
            className="input-field text-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="btn-primary flex items-center gap-1.5 px-4 py-3 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
