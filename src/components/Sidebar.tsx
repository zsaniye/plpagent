"use client";

import {
  Home,
  BookOpenCheck,
  GraduationCap,
  Library,
  Users,
  Sparkles,
  Award,
  BarChart3,
  FolderOpen,
  Puzzle,
} from "lucide-react";

type TabId = "home" | "self-learning" | "my-learning" | "browse" | "social" | "skills" | "badges" | "leaderboard" | "content-hub" | "extensions";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const menuItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "self-learning", label: "Self Learning", icon: BookOpenCheck },
  { id: "my-learning", label: "My Learning", icon: GraduationCap },
  { id: "browse", label: "Catalog", icon: Library },
  { id: "social", label: "Social Learning", icon: Users },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "badges", label: "Badges", icon: Award },
  { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
  { id: "content-hub", label: "Content Hub", icon: FolderOpen },
  { id: "extensions", label: "Test Extension", icon: Puzzle },
];

export type { TabId };

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 overflow-y-auto shrink-0">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-16 py-2.5 rounded-lg text-[10px] font-medium transition-colors gap-1 ${
              isActive
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
            title={item.label}
          >
            <Icon className="h-5 w-5" />
            <span className="leading-tight text-center">{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
