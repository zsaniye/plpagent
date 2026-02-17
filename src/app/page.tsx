"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import ContentBrowser from "@/components/ContentBrowser";
import MyLearning from "@/components/MyLearning";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "browse" | "my-learning">(
    "chat"
  );
  const [myLearningRefresh, setMyLearningRefresh] = useState(0);

  const handlePathSaved = () => {
    setMyLearningRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <div className="h-full max-w-4xl mx-auto p-4">
            <ChatInterface onPathSaved={handlePathSaved} />
          </div>
        )}

        {activeTab === "browse" && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Content Library
                </h2>
                <p className="text-gray-500 mt-1">
                  Browse 100 curated free learning resources for marketing
                  professionals
                </p>
              </div>
              <ContentBrowser />
            </div>
          </div>
        )}

        {activeTab === "my-learning" && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  My Learning
                </h2>
                <p className="text-gray-500 mt-1">
                  Track your saved learning paths and progress
                </p>
              </div>
              <MyLearning refreshKey={myLearningRefresh} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
