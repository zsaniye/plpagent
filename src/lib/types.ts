export type CourseFormat =
  | "video"
  | "self-paced"
  | "pdf"
  | "article"
  | "audio"
  | "interactive"
  | "presentation"
  | "youtube";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseCategory =
  | "digital-marketing"
  | "gen-ai-marketing"
  | "social-media-marketing"
  | "content-marketing"
  | "seo-sem"
  | "marketing-analytics"
  | "brand-management"
  | "email-marketing"
  | "marketing-strategy"
  | "video-marketing";

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  author: string;
  authorBio: string;
  url: string;
  format: CourseFormat;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  rating: number;
  reviewCount: number;
  topics: string[];
  free: boolean;
}

export type ConversationStage = "discovery" | "assessment" | "path-generation";

export type AssessmentMethod = "quiz" | "self-rate" | "upload" | "describe";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  stage?: ConversationStage;
  metadata?: {
    assessmentMethod?: AssessmentMethod;
    learningPath?: LearningPath;
    skillProfile?: SkillProfile;
    quizQuestions?: QuizQuestion[];
    suggestedActions?: SuggestedAction[];
  };
}

export interface SuggestedAction {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export interface SkillProfile {
  area: string;
  overallLevel: CourseLevel;
  skills: {
    name: string;
    level: number; // 1-5
    description: string;
  }[];
}

export interface LearningPathLesson {
  lessonTitle: string;
  lessonDescription: string;
  estimatedDuration: string;
  resourceType: CourseFormat;
  resourceUrl: string;
}

export interface LearningPathCourse {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: string;
  provider: string;
  url: string;
  format: CourseFormat;
  lessons: LearningPathLesson[];
  assessment: {
    type: "quiz" | "exercise";
    title: string;
    description: string;
  };
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  targetLevel: CourseLevel;
  totalDuration: string;
  courses: LearningPathCourse[];
  contentGaps?: string[];
}

export interface SavedLearningPath {
  id: string;
  learningPath: LearningPath;
  chatHistory: ChatMessage[];
  discoveryNotes: string;
  skillProfile: SkillProfile | null;
  status: "active" | "completed" | "discontinued";
  createdAt: number;
  updatedAt: number;
  feedback?: {
    rating: number;
    metObjective: boolean | null;
    comments: string;
  };
  courseProgress: Record<string, boolean>;
}

export interface ConversationState {
  stage: ConversationStage;
  exchangeCount: number;
  selectedTopic: string;
  learningGoal: string;
  specificArea: string;
  timeline: string;
  motivation: string;
  assessmentMethod: AssessmentMethod | null;
  skillProfile: SkillProfile | null;
  learningPath: LearningPath | null;
  discoveryComplete: boolean;
  assessmentComplete: boolean;
  pathApproved: boolean;
}
