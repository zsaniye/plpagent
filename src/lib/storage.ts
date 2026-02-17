import { ChatMessage, SavedLearningPath, ConversationState } from "./types";

const SAVED_PATHS_KEY = "plp-saved-paths";
const CHAT_HISTORY_KEY = "plp-chat-history";
const CONV_STATE_KEY = "plp-conv-state";

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// Saved Learning Paths
export function getSavedPaths(): SavedLearningPath[] {
  return getItem<SavedLearningPath[]>(SAVED_PATHS_KEY, []);
}

export function saveLearningPath(path: SavedLearningPath): void {
  const paths = getSavedPaths();
  const existing = paths.findIndex((p) => p.id === path.id);
  if (existing >= 0) {
    paths[existing] = path;
  } else {
    paths.push(path);
  }
  setItem(SAVED_PATHS_KEY, paths);
}

export function deleteLearningPath(id: string): void {
  const paths = getSavedPaths().filter((p) => p.id !== id);
  setItem(SAVED_PATHS_KEY, paths);
}

export function updatePathStatus(
  id: string,
  status: "active" | "completed" | "discontinued"
): void {
  const paths = getSavedPaths();
  const path = paths.find((p) => p.id === id);
  if (path) {
    path.status = status;
    path.updatedAt = Date.now();
    setItem(SAVED_PATHS_KEY, paths);
  }
}

export function updatePathFeedback(
  id: string,
  feedback: { rating: number; metObjective: boolean | null; comments: string }
): void {
  const paths = getSavedPaths();
  const path = paths.find((p) => p.id === id);
  if (path) {
    path.feedback = feedback;
    path.updatedAt = Date.now();
    setItem(SAVED_PATHS_KEY, paths);
  }
}

export function updateCourseProgress(
  pathId: string,
  courseId: string,
  completed: boolean
): void {
  const paths = getSavedPaths();
  const path = paths.find((p) => p.id === pathId);
  if (path) {
    path.courseProgress[courseId] = completed;
    path.updatedAt = Date.now();
    setItem(SAVED_PATHS_KEY, paths);
  }
}

// Chat History
export function getChatHistory(): ChatMessage[] {
  return getItem<ChatMessage[]>(CHAT_HISTORY_KEY, []);
}

export function saveChatHistory(messages: ChatMessage[]): void {
  setItem(CHAT_HISTORY_KEY, messages);
}

export function clearChatHistory(): void {
  setItem(CHAT_HISTORY_KEY, []);
}

// Conversation State
export function getConversationState(): ConversationState | null {
  return getItem<ConversationState | null>(CONV_STATE_KEY, null);
}

export function saveConversationState(state: ConversationState): void {
  setItem(CONV_STATE_KEY, state);
}

export function clearConversationState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONV_STATE_KEY);
}
