"use client";

import { BookOpen, GraduationCap, MessageSquare, Library } from "lucide-react";

interface HeaderProps {
  activeTab: "chat" | "browse" | "my-learning";
  onTabChange: (tab: "chat" | "browse" | "my-learning") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: "chat" as const, label: "Learning Assistant", icon: MessageSquare },
    { id: "browse" as const, label: "Content Library", icon: Library },
    { id: "my-learning" as const, label: "My Learning", icon: GraduationCap },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PLP Agent</h1>
              <p className="text-xs text-gray-500">Marketing Learning Paths</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
