"use client";

import { useState } from "react";
import Sidebar, { type TabId } from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import ContentBrowser from "@/components/ContentBrowser";
import MyLearning from "@/components/MyLearning";
import SelfLearning from "@/components/SelfLearning";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [myLearningRefresh, setMyLearningRefresh] = useState(0);

  const handlePathSaved = () => {
    setMyLearningRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-hidden bg-gray-50">
        {activeTab === "home" && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
              {/* Banner */}
              <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 h-64 flex items-center justify-center">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-8 left-16 w-20 h-20 rounded-full bg-blue-400 blur-sm" />
                  <div className="absolute bottom-12 right-24 w-16 h-16 rounded-full bg-yellow-400 blur-sm" />
                  <div className="absolute top-16 right-48 w-10 h-10 rounded-full bg-pink-300 blur-sm" />
                </div>
                <h2 className="text-white text-3xl md:text-4xl font-semibold z-10 text-center px-4">
                  Let&apos;s learn something<br />new today.
                </h2>
              </div>

              {/* Quick Actions */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("self-learning")}
                  className="card hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary-100 text-primary-700 p-2 rounded-lg">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Self Learning</h4>
                  </div>
                  <p className="text-sm text-gray-500">Get a personalized learning path powered by AI</p>
                </button>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="card hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Browse Catalog</h4>
                  </div>
                  <p className="text-sm text-gray-500">Explore curated free learning resources</p>
                </button>
                <button
                  onClick={() => setActiveTab("my-learning")}
                  className="card hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">My Learning</h4>
                  </div>
                  <p className="text-sm text-gray-500">Track your saved learning paths and progress</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "self-learning" && (
          <SelfLearning onPathSaved={handlePathSaved} />
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

        {/* Placeholder views for other sidebar items */}
        {(activeTab === "social" || activeTab === "skills" || activeTab === "badges" || activeTab === "leaderboard" || activeTab === "content-hub" || activeTab === "extensions") && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm mt-1">This feature is under development</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
