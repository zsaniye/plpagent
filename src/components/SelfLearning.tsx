"use client";

import ChatInterface from "./ChatInterface";

interface SelfLearningProps {
  onPathSaved: () => void;
}

export default function SelfLearning({ onPathSaved }: SelfLearningProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Self Learning</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Discover your learning needs and get a personalized learning path powered by AI
        </p>
      </div>
      <div className="flex-1 overflow-hidden max-w-4xl w-full mx-auto p-4">
        <ChatInterface onPathSaved={onPathSaved} />
      </div>
    </div>
  );
}
