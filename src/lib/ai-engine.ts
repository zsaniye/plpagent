import { courses } from "@/data/courses";
import {
  ChatMessage,
  ConversationState,
  Course,
  LearningPath,
  LearningPathCourse,
  QuizQuestion,
  SkillProfile,
  SuggestedAction,
} from "./types";

function makeId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const TOPIC_MAP: Record<string, string> = {
  "digital-marketing": "Digital Marketing",
  "gen-ai-marketing": "AI & Generative AI for Marketing",
  "seo-sem": "SEO & Search Engine Marketing",
  "social-media-marketing": "Social Media Marketing",
  "content-marketing": "Content Marketing",
  "email-marketing": "Email Marketing",
  "marketing-analytics": "Marketing Analytics",
  "brand-management": "Brand Management",
  "marketing-strategy": "Marketing Strategy",
  "video-marketing": "Video Marketing",
};

const initialState: ConversationState = {
  stage: "discovery",
  exchangeCount: 0,
  selectedTopic: "",
  learningGoal: "",
  specificArea: "",
  timeline: "",
  motivation: "",
  assessmentMethod: null,
  skillProfile: null,
  learningPath: null,
  discoveryComplete: false,
  assessmentComplete: false,
  pathApproved: false,
};

export function getInitialState(): ConversationState {
  return { ...initialState };
}

export function getWelcomeMessage(): ChatMessage {
  return {
    id: makeId(),
    role: "assistant",
    content:
      "Welcome! I'm your Personalized Learning Path Agent for marketing professionals.\n\nTo get started, please select the topic you'd like to learn, or type your own:",
    timestamp: Date.now(),
    stage: "discovery",
    metadata: {
      suggestedActions: [
        { label: "Digital Marketing", value: "digital-marketing" },
        { label: "AI for Marketing", value: "gen-ai-marketing" },
        { label: "SEO & SEM", value: "seo-sem" },
        { label: "Social Media", value: "social-media-marketing" },
        { label: "Content Marketing", value: "content-marketing" },
      ],
    },
  };
}

// ---- Discovery Stage ----

function detectTopicFromInput(msg: string): string {
  const lower = msg.toLowerCase().trim();

  // Direct slug match (from button clicks)
  if (TOPIC_MAP[lower]) return lower;

  // Keyword matching for free-text input
  if (lower.includes("ai") || lower.includes("generative") || lower.includes("chatgpt") || lower.includes("automation")) return "gen-ai-marketing";
  if (lower.includes("seo") || lower.includes("search engine") || lower.includes("sem") || lower.includes("google ads")) return "seo-sem";
  if (lower.includes("social media") || lower.includes("instagram") || lower.includes("tiktok") || lower.includes("facebook")) return "social-media-marketing";
  if (lower.includes("content") || lower.includes("blog") || lower.includes("copywriting") || lower.includes("writing")) return "content-marketing";
  if (lower.includes("email") || lower.includes("newsletter") || lower.includes("mailchimp")) return "email-marketing";
  if (lower.includes("analytics") || lower.includes("data") || lower.includes("measurement") || lower.includes("google analytics")) return "marketing-analytics";
  if (lower.includes("brand") || lower.includes("branding") || lower.includes("positioning")) return "brand-management";
  if (lower.includes("video") || lower.includes("youtube")) return "video-marketing";
  if (lower.includes("strategy") || lower.includes("planning") || lower.includes("leadership")) return "marketing-strategy";
  if (lower.includes("digital") || lower.includes("marketing") || lower.includes("advertising")) return "digital-marketing";

  return "digital-marketing";
}

const discoveryQuestions: {
  trigger: (state: ConversationState) => boolean;
  question: (state: ConversationState, userMsg: string) => string;
  extract: (state: ConversationState, userMsg: string) => Partial<ConversationState>;
  actions?: (state: ConversationState) => SuggestedAction[];
}[] = [
  {
    // Step 1: User selected a topic -> ask about experience level
    trigger: (s) => s.exchangeCount === 0,
    extract: (_s, msg) => {
      const topic = detectTopicFromInput(msg);
      return { selectedTopic: topic, motivation: msg };
    },
    question: (s) => {
      const topicLabel = TOPIC_MAP[s.selectedTopic] || s.selectedTopic;
      return `Great choice! You've selected **${topicLabel}**.\n\nTo help me tailor the right path for you, what's your current experience level with ${topicLabel}? And is there a particular aspect or sub-topic you'd like to focus on?`;
    },
    actions: () => [
      { label: "Complete beginner", value: "I'm a complete beginner in this area" },
      { label: "Some experience", value: "I have some basic experience but want to go deeper" },
      { label: "Intermediate", value: "I'm intermediate and want to reach an advanced level" },
    ],
  },
  {
    // Step 2: Experience level -> ask about timeline
    trigger: (s) => s.exchangeCount === 1,
    extract: (_s, msg) => ({ specificArea: msg }),
    question: () =>
      "That helps a lot! What kind of timeline are you working with, and how much time can you dedicate to learning each week? This will help me create a realistic learning path for you.",
    actions: () => [
      { label: "1-2 hours/week", value: "I can spend about 1-2 hours per week, no specific deadline" },
      { label: "3-5 hours/week", value: "I can dedicate 3-5 hours per week to learning" },
      { label: "Intensive", value: "I want to learn intensively, 10+ hours per week" },
    ],
  },
  {
    // Step 3: Timeline -> ask about learning goal
    trigger: (s) => s.exchangeCount === 2,
    extract: (_s, msg) => ({ timeline: msg }),
    question: () =>
      "What's your main goal for learning this? Are you looking to advance in your current role, transition into a new area, or pick up a specific skill for a project?",
    actions: () => [
      { label: "Advance in my role", value: "I want to advance in my current marketing role" },
      { label: "Career transition", value: "I'm looking to transition into this area of marketing" },
      { label: "Specific project", value: "I need these skills for a specific project or task" },
    ],
  },
  {
    // Step 4: Goal -> ask about assessment method, transition to assessment
    trigger: (s) => s.exchangeCount === 3,
    extract: (_s, msg) => ({
      learningGoal: msg,
      discoveryComplete: true,
      stage: "assessment" as const,
    }),
    question: (s) => {
      const topicLabel = TOPIC_MAP[s.selectedTopic] || s.selectedTopic;
      return `Thanks for sharing all of that! I now have a good understanding of your learning goals for **${topicLabel}**.\n\nBefore I create your personalized learning path, I'd like to assess your current skill level so I can recommend the right content.\n\nHow would you prefer to be assessed?\n\n1. **Quick Quiz** - Answer 5 multiple-choice questions about ${topicLabel}\n2. **Self-Rate** - Rate your proficiency in key skill areas\n3. **Describe Skills** - Tell me about your current skills in your own words`;
    },
    actions: () => [
      { label: "Quick Quiz", value: "I'd like to take a quick quiz" },
      { label: "Self-Rate", value: "I'll self-rate my skills" },
      { label: "Describe Skills", value: "Let me describe my current skills" },
    ],
  },
];

// ---- Assessment Stage ----

function detectAssessmentChoice(msg: string): "quiz" | "self-rate" | "describe" | "upload" | null {
  const lower = msg.toLowerCase();
  if (lower.includes("quiz") || lower.includes("multiple")) return "quiz";
  if (lower.includes("self") || lower.includes("rate")) return "self-rate";
  if (lower.includes("upload") || lower.includes("resume") || lower.includes("portfolio")) return "upload";
  if (lower.includes("describe") || lower.includes("tell") || lower.includes("own words")) return "describe";
  return null;
}

function getQuizQuestions(category: string): QuizQuestion[] {
  const quizzes: Record<string, QuizQuestion[]> = {
    "digital-marketing": [
      { id: "q1", question: "What does CPC stand for in digital advertising?", options: ["Cost Per Click", "Cost Per Customer", "Clicks Per Campaign", "Cost Per Conversion"], correctIndex: 0, topic: "Digital Advertising" },
      { id: "q2", question: "Which metric measures the percentage of visitors who leave after viewing only one page?", options: ["Exit rate", "Click-through rate", "Bounce rate", "Conversion rate"], correctIndex: 2, topic: "Web Analytics" },
      { id: "q3", question: "What is A/B testing primarily used for?", options: ["Comparing two versions to see which performs better", "Budget allocation", "Keyword research", "Competitor analysis"], correctIndex: 0, topic: "Optimization" },
      { id: "q4", question: "What is a marketing funnel?", options: ["A type of ad format", "A social media strategy", "An email template", "The customer journey from awareness to purchase"], correctIndex: 3, topic: "Strategy" },
      { id: "q5", question: "Which platform is primarily used for B2B marketing?", options: ["TikTok", "Snapchat", "LinkedIn", "Pinterest"], correctIndex: 2, topic: "Platforms" },
    ],
    "gen-ai-marketing": [
      { id: "q1", question: "What does 'prompt engineering' refer to in AI marketing?", options: ["Building AI hardware", "Crafting effective inputs for AI models", "Programming chatbots", "Designing AI interfaces"], correctIndex: 1, topic: "AI Fundamentals" },
      { id: "q2", question: "Which of these is a common use of generative AI in marketing?", options: ["Content creation and copywriting", "Physical product design", "Supply chain management", "HR recruitment"], correctIndex: 0, topic: "AI Applications" },
      { id: "q3", question: "What is a key concern when using AI-generated content?", options: ["It's always perfect", "It costs more than human writers", "Accuracy and potential for hallucinations", "It only works in English"], correctIndex: 2, topic: "AI Ethics" },
      { id: "q4", question: "What type of AI model is commonly used for image generation?", options: ["Linear regression", "Decision tree", "K-means clustering", "Diffusion model"], correctIndex: 3, topic: "AI Technology" },
      { id: "q5", question: "How can AI help with marketing personalization?", options: ["By analyzing customer data to deliver tailored content", "By removing all targeting", "By making all messages identical", "By eliminating customer segments"], correctIndex: 0, topic: "Personalization" },
    ],
    "seo-sem": [
      { id: "q1", question: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Engagement Outreach", "Site Enhancement Operations", "Search Evaluation Overview"], correctIndex: 0, topic: "SEO Basics" },
      { id: "q2", question: "What is a 'backlink' in SEO?", options: ["A broken link on your site", "An internal page link", "A link from another website to yours", "A social media link"], correctIndex: 2, topic: "Link Building" },
      { id: "q3", question: "What does 'keyword cannibalization' mean?", options: ["Using too many keywords", "Removing keywords from content", "Blocking keywords in robots.txt", "Multiple pages competing for the same keyword"], correctIndex: 3, topic: "Keyword Strategy" },
      { id: "q4", question: "What is the purpose of a meta description?", options: ["To improve page load speed", "To provide a brief summary for search results", "To structure HTML content", "To encode images"], correctIndex: 1, topic: "On-Page SEO" },
      { id: "q5", question: "What does Quality Score affect in Google Ads?", options: ["Ad position and cost per click", "Organic rankings", "Social media reach", "Email deliverability"], correctIndex: 0, topic: "SEM" },
    ],
    "content-marketing": [
      { id: "q1", question: "What is the primary goal of content marketing?", options: ["Direct sales only", "Generating backlinks", "Attracting and engaging a target audience with valuable content", "Filling web pages"], correctIndex: 2, topic: "Strategy" },
      { id: "q2", question: "What is an 'editorial calendar'?", options: ["A schedule for planning content publication", "A type of blog post", "A social media tool", "An ad format"], correctIndex: 0, topic: "Planning" },
      { id: "q3", question: "What does 'evergreen content' mean?", options: ["Content about nature", "Content published in spring", "Content about sustainability", "Content that remains relevant over time"], correctIndex: 3, topic: "Content Types" },
      { id: "q4", question: "Which metric best measures content engagement?", options: ["Impressions only", "Time on page and shares", "Server uptime", "Domain authority"], correctIndex: 1, topic: "Measurement" },
      { id: "q5", question: "What is a content pillar?", options: ["A website column", "A type of infographic", "A core topic that anchors a content strategy", "An email template"], correctIndex: 2, topic: "Strategy" },
    ],
    "social-media-marketing": [
      { id: "q1", question: "What is 'organic reach' on social media?", options: ["Paid advertising reach", "Influencer reach", "Bot-generated views", "The number of people who see your content without paid promotion"], correctIndex: 3, topic: "Fundamentals" },
      { id: "q2", question: "What does 'engagement rate' typically include?", options: ["Likes, comments, shares, and saves", "Only likes", "Only followers count", "Only impressions"], correctIndex: 0, topic: "Metrics" },
      { id: "q3", question: "What is a 'content calendar' for social media?", options: ["An advertising budget", "A follower tracking tool", "A plan for scheduling social media posts", "A competitor analysis"], correctIndex: 2, topic: "Planning" },
      { id: "q4", question: "Which platform is best for short-form video content?", options: ["LinkedIn", "TikTok/Instagram Reels", "Twitter/X", "Pinterest"], correctIndex: 1, topic: "Platforms" },
      { id: "q5", question: "What is 'social listening'?", options: ["Listening to podcasts", "Creating audio content", "Recording meetings", "Monitoring social media for brand mentions and trends"], correctIndex: 3, topic: "Strategy" },
    ],
    "email-marketing": [
      { id: "q1", question: "What is a good open rate for email marketing?", options: ["1-5%", "50-60%", "15-25%", "90-100%"], correctIndex: 2, topic: "Metrics" },
      { id: "q2", question: "What is 'email segmentation'?", options: ["Dividing your email list into targeted groups", "Splitting emails into paragraphs", "Deleting inactive subscribers", "A spam filter technique"], correctIndex: 0, topic: "Strategy" },
      { id: "q3", question: "What does CAN-SPAM require?", options: ["Encryption of all emails", "Daily email limits", "Government approval", "An unsubscribe option in commercial emails"], correctIndex: 3, topic: "Compliance" },
      { id: "q4", question: "What is a 'drip campaign'?", options: ["A one-time email blast", "A series of automated emails sent on a schedule", "A leak in your email list", "A spam technique"], correctIndex: 1, topic: "Automation" },
      { id: "q5", question: "What is the purpose of A/B testing in email marketing?", options: ["Comparing different versions to optimize performance", "Testing email server speed", "Checking for spam", "Verifying email addresses"], correctIndex: 0, topic: "Optimization" },
    ],
    "marketing-analytics": [
      { id: "q1", question: "What is a KPI in marketing?", options: ["Key Performance Indicator", "Key Payment Invoice", "Keyword Performance Index", "Key Product Information"], correctIndex: 0, topic: "Fundamentals" },
      { id: "q2", question: "What does 'attribution modeling' help you understand?", options: ["Employee performance", "Website design preferences", "Which marketing channels drive conversions", "Competitor strategies"], correctIndex: 2, topic: "Attribution" },
      { id: "q3", question: "What is 'customer lifetime value' (CLV)?", options: ["How long a customer lives", "The cost to acquire a customer", "Annual customer spending", "The total revenue expected from a customer over their relationship"], correctIndex: 3, topic: "Metrics" },
      { id: "q4", question: "Which tool is commonly used for web analytics?", options: ["Photoshop", "Google Analytics", "Slack", "Trello"], correctIndex: 1, topic: "Tools" },
      { id: "q5", question: "What is a 'cohort analysis'?", options: ["Grouping users by shared characteristics over time", "Analyzing individual users", "Comparing competitors", "Testing advertisements"], correctIndex: 0, topic: "Analysis" },
    ],
    "brand-management": [
      { id: "q1", question: "What is 'brand equity'?", options: ["The financial value of the brand's stock", "The cost of brand registration", "The number of products a brand has", "The value a brand adds to a product beyond its functional benefits"], correctIndex: 3, topic: "Fundamentals" },
      { id: "q2", question: "What is a 'brand positioning statement'?", options: ["A description of how a brand differentiates in the market", "A legal trademark filing", "A tagline for advertisements", "A company mission statement"], correctIndex: 0, topic: "Strategy" },
      { id: "q3", question: "What does 'brand consistency' mean?", options: ["Never changing anything", "Using the same ad everywhere", "Ensuring all brand touchpoints deliver a unified message and experience", "Having one product"], correctIndex: 2, topic: "Implementation" },
      { id: "q4", question: "What is a 'brand audit'?", options: ["A financial review", "A comprehensive analysis of a brand's market position and perception", "A logo redesign", "A customer survey"], correctIndex: 1, topic: "Analysis" },
      { id: "q5", question: "What role does 'brand storytelling' play?", options: ["Writing fiction", "Documenting company history", "Writing press releases", "Creating emotional connections with audiences through narrative"], correctIndex: 3, topic: "Communication" },
    ],
    "marketing-strategy": [
      { id: "q1", question: "What is a SWOT analysis?", options: ["A type of ad campaign", "A social media strategy", "Analysis of Strengths, Weaknesses, Opportunities, and Threats", "A pricing model"], correctIndex: 2, topic: "Planning" },
      { id: "q2", question: "What are the '4 Ps' of marketing?", options: ["Product, Price, Place, Promotion", "Plan, Prepare, Perform, Perfect", "People, Process, Platform, Performance", "Pitch, Publish, Promote, Profit"], correctIndex: 0, topic: "Fundamentals" },
      { id: "q3", question: "What is 'market segmentation'?", options: ["Splitting a company into divisions", "Separating products into categories", "Geographic mapping", "Dividing a market into distinct groups of buyers"], correctIndex: 3, topic: "Segmentation" },
      { id: "q4", question: "What is a 'unique value proposition' (UVP)?", options: ["A discount offer", "A clear statement of what makes a product uniquely valuable to customers", "A patent filing", "A competitor comparison"], correctIndex: 1, topic: "Positioning" },
      { id: "q5", question: "What does 'go-to-market strategy' involve?", options: ["The plan for launching a product to reach target customers", "Only product pricing", "Hiring sales staff", "Building a website"], correctIndex: 0, topic: "Launch" },
    ],
    "video-marketing": [
      { id: "q1", question: "What is the ideal length for a social media video ad?", options: ["15-60 seconds", "5-10 minutes", "30+ minutes", "Exactly 2 minutes"], correctIndex: 0, topic: "Best Practices" },
      { id: "q2", question: "What does 'video SEO' involve?", options: ["Editing video quality", "Only uploading to YouTube", "Optimizing video titles, descriptions, and tags for search", "Adding subtitles"], correctIndex: 2, topic: "Optimization" },
      { id: "q3", question: "What is a 'call to action' (CTA) in video marketing?", options: ["The video title", "The video thumbnail", "Background music", "A prompt encouraging the viewer to take a specific action"], correctIndex: 3, topic: "Strategy" },
      { id: "q4", question: "What is 'video retention rate'?", options: ["How long the video file is stored", "The percentage of a video that viewers watch", "The number of video uploads", "Video file size"], correctIndex: 1, topic: "Metrics" },
      { id: "q5", question: "Which metric is most important for measuring video engagement?", options: ["Watch time and completion rate", "File size", "Upload speed", "Resolution"], correctIndex: 0, topic: "Analytics" },
    ],
  };

  return quizzes[category] || quizzes["digital-marketing"];
}

function buildSkillProfileFromQuiz(
  category: string,
  answers: number[],
  questions: QuizQuestion[]
): SkillProfile {
  let correct = 0;
  const skillResults: { name: string; level: number; description: string }[] = [];

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correct++;
    skillResults.push({
      name: q.topic,
      level: isCorrect ? 3 : 1,
      description: isCorrect
        ? `Demonstrated understanding of ${q.topic}`
        : `Needs development in ${q.topic}`,
    });
  });

  const overallLevel =
    correct >= 4 ? "advanced" : correct >= 2 ? "intermediate" : "beginner";

  const categoryLabel = TOPIC_MAP[category] || category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    area: categoryLabel,
    overallLevel,
    skills: skillResults,
  };
}

function buildSkillProfileFromSelfRate(category: string, msg: string): SkillProfile {
  const categoryLabel = TOPIC_MAP[category] || category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const lower = msg.toLowerCase();

  let overallLevel: "beginner" | "intermediate" | "advanced" = "intermediate";
  if (lower.includes("beginner") || lower.includes("new") || lower.includes("starting") || lower.includes("basic") || lower.includes("1") || lower.includes("2")) {
    overallLevel = "beginner";
  } else if (lower.includes("advanced") || lower.includes("expert") || lower.includes("5") || lower.includes("extensive")) {
    overallLevel = "advanced";
  }

  return {
    area: categoryLabel,
    overallLevel,
    skills: [
      { name: "Core Concepts", level: overallLevel === "beginner" ? 1 : overallLevel === "intermediate" ? 3 : 5, description: `${overallLevel} level understanding of core concepts` },
      { name: "Practical Application", level: overallLevel === "beginner" ? 1 : overallLevel === "intermediate" ? 2 : 4, description: `${overallLevel} level practical experience` },
      { name: "Tools & Platforms", level: overallLevel === "beginner" ? 1 : overallLevel === "intermediate" ? 3 : 4, description: `${overallLevel} level familiarity with tools` },
      { name: "Strategy", level: overallLevel === "beginner" ? 1 : overallLevel === "intermediate" ? 2 : 5, description: `${overallLevel} level strategic thinking` },
    ],
  };
}

// ---- Learning Path Generation ----

function selectCoursesForPath(
  category: string,
  level: "beginner" | "intermediate" | "advanced"
): Course[] {
  const categoryCourses = courses.filter((c) => c.category === category);
  const relatedCourses = courses.filter(
    (c) => c.category !== category && c.topics.some((t) => {
      const catWords = category.split("-");
      return catWords.some((w) => t.toLowerCase().includes(w));
    })
  );

  const pool = [...categoryCourses, ...relatedCourses];

  let filtered: Course[];
  if (level === "beginner") {
    filtered = pool.filter((c) => c.level === "beginner" || c.level === "intermediate");
  } else if (level === "intermediate") {
    filtered = pool.filter((c) => c.level === "intermediate" || c.level === "advanced");
  } else {
    filtered = pool.filter((c) => c.level === "advanced" || c.level === "intermediate");
  }

  if (filtered.length < 3) filtered = pool;
  filtered.sort((a, b) => b.rating - a.rating);
  return filtered.slice(0, 3);
}

function generateLearningPath(
  state: ConversationState,
  profile: SkillProfile
): LearningPath {
  const category = state.selectedTopic || "digital-marketing";
  const selectedCourses = selectCoursesForPath(category, profile.overallLevel);
  const categoryLabel = TOPIC_MAP[category] || category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const levelLabel =
    profile.overallLevel === "beginner"
      ? "Beginner to Intermediate"
      : profile.overallLevel === "intermediate"
      ? "Intermediate to Advanced"
      : "Advanced Mastery";

  const pathCourses: LearningPathCourse[] = selectedCourses.map((course, i) => ({
    courseId: course.id,
    courseTitle: course.title,
    courseDescription: course.description,
    estimatedDuration: course.duration,
    provider: course.provider,
    url: course.url,
    format: course.format,
    lessons: [
      {
        lessonTitle: `Introduction to ${course.topics[0] || course.title}`,
        lessonDescription: `Get started with the foundational concepts of ${course.topics[0] || course.title}.`,
        estimatedDuration: "30 minutes",
        resourceType: course.format,
        resourceUrl: course.url,
      },
      {
        lessonTitle: `Deep Dive: ${course.topics[1] || "Core Skills"}`,
        lessonDescription: `Explore the key techniques and strategies covered in this course.`,
        estimatedDuration: "45 minutes",
        resourceType: course.format,
        resourceUrl: course.url,
      },
      {
        lessonTitle: `Practical Application & Case Studies`,
        lessonDescription: `Apply what you've learned through real-world examples and exercises.`,
        estimatedDuration: "30 minutes",
        resourceType: course.format,
        resourceUrl: course.url,
      },
    ],
    assessment: {
      type: i % 2 === 0 ? "quiz" : "exercise",
      title:
        i % 2 === 0
          ? `${course.topics[0] || "Knowledge"} Assessment Quiz`
          : `Practical Exercise: Apply ${course.topics[0] || "Skills"}`,
      description:
        i % 2 === 0
          ? `Test your understanding of ${course.topics[0] || "the course material"} with a short quiz.`
          : `Complete a hands-on exercise to demonstrate your ability to apply ${course.topics[0] || "skills learned"} in a real scenario. Upload your work when complete.`,
    },
  }));

  let totalHours = 0;
  selectedCourses.forEach((c) => {
    const match = c.duration.match(/(\d+)/);
    if (match) totalHours += parseInt(match[1]);
  });

  const contentGaps: string[] = [];
  const weakSkills = profile.skills.filter((s) => s.level <= 2);
  if (weakSkills.length > 0 && selectedCourses.length < 5) {
    weakSkills.forEach((s) => {
      const hasCoverage = selectedCourses.some(
        (c) =>
          c.topics.some((t) => t.toLowerCase().includes(s.name.toLowerCase())) ||
          c.title.toLowerCase().includes(s.name.toLowerCase())
      );
      if (!hasCoverage) {
        contentGaps.push(
          `Your "${s.name}" skills could benefit from additional specialized resources beyond our current library.`
        );
      }
    });
  }

  return {
    id: makeId(),
    title: `${categoryLabel} ${levelLabel} Learning Path`,
    description: `A personalized learning path designed to take you from your current ${profile.overallLevel} level to the next stage in ${categoryLabel}. This path focuses on the specific areas identified during your skills assessment.`,
    targetRole: `${categoryLabel} Professional`,
    targetLevel: profile.overallLevel === "beginner" ? "intermediate" : "advanced",
    totalDuration: `${totalHours} hours`,
    courses: pathCourses,
    contentGaps: contentGaps.length > 0 ? contentGaps : undefined,
  };
}

// ---- Main Response Engine ----

export interface EngineResponse {
  message: ChatMessage;
  updatedState: ConversationState;
}

export function processMessage(
  userMessage: string,
  state: ConversationState,
  history: ChatMessage[]
): EngineResponse {
  const newState = { ...state };

  // --- Discovery Stage ---
  if (newState.stage === "discovery") {
    const questionDef = discoveryQuestions[newState.exchangeCount];
    if (questionDef) {
      const extracted = questionDef.extract(newState, userMessage);
      Object.assign(newState, extracted);
      newState.exchangeCount++;

      const responseText = questionDef.question(newState, userMessage);
      const actions = questionDef.actions ? questionDef.actions(newState) : undefined;

      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: responseText,
          timestamp: Date.now(),
          stage: newState.stage,
          metadata: actions ? { suggestedActions: actions } : undefined,
        },
        updatedState: newState,
      };
    }
  }

  // --- Assessment Stage ---
  if (newState.stage === "assessment") {
    const category = newState.selectedTopic || "digital-marketing";
    const categoryLabel = TOPIC_MAP[category] || category;

    // First message in assessment - detect method choice
    if (!newState.assessmentMethod) {
      const method = detectAssessmentChoice(userMessage);
      if (method === "quiz") {
        newState.assessmentMethod = "quiz";
        const questions = getQuizQuestions(category);
        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `Great choice! Let's assess your current knowledge of **${categoryLabel}** with a quick 5-question quiz.\n\nFor each question, reply with the number of your answer (1, 2, 3, or 4).\n\n**Question 1 of 5:**\n${questions[0].question}\n\n1. ${questions[0].options[0]}\n2. ${questions[0].options[1]}\n3. ${questions[0].options[2]}\n4. ${questions[0].options[3]}`,
            timestamp: Date.now(),
            stage: "assessment",
            metadata: {
              quizQuestions: questions,
              suggestedActions: questions[0].options.map((o, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              })),
            },
          },
          updatedState: newState,
        };
      } else if (method === "self-rate") {
        newState.assessmentMethod = "self-rate";
        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `Let's do a quick self-assessment for **${categoryLabel}**!\n\nOn a scale of 1-5 (1 = complete beginner, 5 = expert), how would you rate yourself overall?\n\nAlso, if you can, briefly describe what you've done in this area so far.`,
            timestamp: Date.now(),
            stage: "assessment",
            metadata: {
              suggestedActions: [
                { label: "1 - Beginner", value: "1 - I'm a complete beginner with no hands-on experience" },
                { label: "2 - Basic", value: "2 - I have basic theoretical knowledge but limited practice" },
                { label: "3 - Intermediate", value: "3 - I have moderate experience with some practical work" },
                { label: "4 - Advanced", value: "4 - I have strong skills and significant experience" },
                { label: "5 - Expert", value: "5 - I'm an expert with extensive professional experience" },
              ],
            },
          },
          updatedState: newState,
        };
      } else if (method === "upload") {
        newState.assessmentMethod = "describe";
        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `Document upload isn't available in this demo, but you can describe your experience instead.\n\nPlease tell me about your background and experience in **${categoryLabel}** - any courses you've taken, projects you've worked on, or tools you've used.`,
            timestamp: Date.now(),
            stage: "assessment",
          },
          updatedState: newState,
        };
      } else if (method === "describe") {
        newState.assessmentMethod = "describe";
        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `Please describe your current skills and experience in **${categoryLabel}**. Tell me about:\n\n- Any relevant courses, certifications, or training you've completed\n- Projects or campaigns you've worked on\n- Tools and platforms you're comfortable with\n- What you feel confident about and where you feel gaps`,
            timestamp: Date.now(),
            stage: "assessment",
          },
          updatedState: newState,
        };
      }

      // Default if we couldn't detect
      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `I'd like to assess your skills in **${categoryLabel}**. Please choose one of these methods:\n\n1. **Quick Quiz** - Answer 5 multiple-choice questions\n2. **Self-Rate** - Rate your proficiency level\n3. **Describe Skills** - Tell me about your current skills`,
          timestamp: Date.now(),
          stage: "assessment",
          metadata: {
            suggestedActions: [
              { label: "Quick Quiz", value: "I'd like to take a quick quiz" },
              { label: "Self-Rate", value: "I'll self-rate my skills" },
              { label: "Describe Skills", value: "Let me describe my current skills" },
            ],
          },
        },
        updatedState: newState,
      };
    }

    // Handle quiz answers
    if (newState.assessmentMethod === "quiz") {
      const questions = getQuizQuestions(category);

      // Count how many quiz answers we have so far
      const quizAnswers: number[] = [];
      const assessmentMessages = history.filter(
        (m) => m.stage === "assessment" && m.role === "user"
      );
      // Skip first message (the method choice)
      const answerMessages = assessmentMessages.slice(1);
      answerMessages.forEach((m) => {
        const num = parseInt(m.content.trim().charAt(0));
        if (num >= 1 && num <= 4) quizAnswers.push(num - 1);
      });

      const questionIndex = quizAnswers.length;

      if (questionIndex < 5) {
        const q = questions[questionIndex];
        const prevQ = questions[questionIndex - 1];
        const wasCorrect = quizAnswers[quizAnswers.length - 1] === prevQ.correctIndex;

        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `${wasCorrect ? "Correct!" : `The correct answer was: ${prevQ.options[prevQ.correctIndex]}.`} \n\n**Question ${questionIndex + 1} of 5:**\n${q.question}\n\n1. ${q.options[0]}\n2. ${q.options[1]}\n3. ${q.options[2]}\n4. ${q.options[3]}`,
            timestamp: Date.now(),
            stage: "assessment",
            metadata: {
              suggestedActions: q.options.map((o, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              })),
            },
          },
          updatedState: newState,
        };
      } else {
        // Quiz complete
        const profile = buildSkillProfileFromQuiz(category, quizAnswers, questions);
        const prevQ = questions[4];
        const wasCorrect = quizAnswers[4] === prevQ.correctIndex;

        newState.skillProfile = profile;
        newState.assessmentComplete = true;
        newState.stage = "path-generation";

        const skillSummary = profile.skills
          .map((s) => `- **${s.name}**: ${s.description}`)
          .join("\n");

        return {
          message: {
            id: makeId(),
            role: "assistant",
            content: `${wasCorrect ? "Correct!" : `The correct answer was: ${prevQ.options[prevQ.correctIndex]}.`}\n\nQuiz complete! Here's your skill profile:\n\n**Overall Level:** ${profile.overallLevel.charAt(0).toUpperCase() + profile.overallLevel.slice(1)}\n**Area:** ${profile.area}\n\n${skillSummary}\n\nI'll now generate your personalized learning path. One moment...`,
            timestamp: Date.now(),
            stage: "assessment",
            metadata: { skillProfile: profile },
          },
          updatedState: newState,
        };
      }
    }

    // Handle self-rate / describe answers
    if (newState.assessmentMethod === "self-rate" || newState.assessmentMethod === "describe") {
      const profile = buildSkillProfileFromSelfRate(category, userMessage);

      newState.skillProfile = profile;
      newState.assessmentComplete = true;
      newState.stage = "path-generation";

      const skillSummary = profile.skills
        .map((s) => `- **${s.name}**: ${s.description}`)
        .join("\n");

      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `Thank you! Here's your skill profile for **${categoryLabel}**:\n\n**Overall Level:** ${profile.overallLevel.charAt(0).toUpperCase() + profile.overallLevel.slice(1)}\n**Area:** ${profile.area}\n\n${skillSummary}\n\nI'll now generate your personalized learning path. One moment...`,
          timestamp: Date.now(),
          stage: "assessment",
          metadata: { skillProfile: profile },
        },
        updatedState: newState,
      };
    }
  }

  // --- Path Generation Stage ---
  if (newState.stage === "path-generation") {
    if (!newState.learningPath && newState.skillProfile) {
      const path = generateLearningPath(newState, newState.skillProfile);
      newState.learningPath = path;

      let gapsText = "";
      if (path.contentGaps && path.contentGaps.length > 0) {
        gapsText = `\n\n**Content Gaps Identified:**\n${path.contentGaps.map((g) => `- ${g}`).join("\n")}\n\nI've noted these gaps so you're aware of areas where additional external resources might be helpful.`;
      }

      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `Here's your personalized learning path! I've curated this based on your goals and current skill level.\n\nWould you like to make any changes, or shall I save this to your "My Learning" dashboard?${gapsText}`,
          timestamp: Date.now(),
          stage: "path-generation",
          metadata: {
            learningPath: path,
            suggestedActions: [
              { label: "Save this path", value: "This looks great! Please save it to My Learning." },
              { label: "Make changes", value: "I'd like to make some changes to this path" },
              { label: "Regenerate", value: "Can you generate a different learning path?" },
            ],
          },
        },
        updatedState: newState,
      };
    }

    // Handle approval / modification
    const lower = userMessage.toLowerCase();
    if (
      lower.includes("save") ||
      lower.includes("approve") ||
      lower.includes("looks great") ||
      lower.includes("yes") ||
      lower.includes("perfect") ||
      lower.includes("good")
    ) {
      newState.pathApproved = true;
      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `Excellent! Your learning path has been saved to **My Learning**. You can access it anytime from the navigation menu.\n\nHere's what to do next:\n1. Head to the **My Learning** tab to view your saved path\n2. Start with the first course and work through the lessons\n3. Complete the assessments for each course\n4. Mark your path as complete when you're done, and share your feedback!\n\nGood luck on your learning journey! Feel free to start a new conversation anytime to create another learning path.`,
          timestamp: Date.now(),
          stage: "path-generation",
        },
        updatedState: newState,
      };
    }

    if (lower.includes("change") || lower.includes("different") || lower.includes("regenerate") || lower.includes("modify")) {
      newState.learningPath = null;
      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `Of course! What changes would you like to make? For example:\n- Focus on different topics\n- Adjust the difficulty level\n- Change the learning format preferences (more videos, more reading, etc.)\n- Adjust the time commitment\n\nTell me what you'd like to adjust and I'll regenerate your path.`,
          timestamp: Date.now(),
          stage: "path-generation",
          metadata: {
            suggestedActions: [
              { label: "More beginner content", value: "I'd like more beginner-friendly content" },
              { label: "More advanced", value: "I'd like more advanced, challenging content" },
              { label: "More videos", value: "I prefer more video-based learning" },
            ],
          },
        },
        updatedState: newState,
      };
    }

    // Re-generate with modifications
    if (newState.skillProfile && !newState.learningPath) {
      if (lower.includes("beginner")) {
        newState.skillProfile = { ...newState.skillProfile, overallLevel: "beginner" };
      } else if (lower.includes("advanced")) {
        newState.skillProfile = { ...newState.skillProfile, overallLevel: "advanced" };
      }
      const path = generateLearningPath(newState, newState.skillProfile);
      newState.learningPath = path;

      return {
        message: {
          id: makeId(),
          role: "assistant",
          content: `I've regenerated your learning path based on your feedback! Take a look and let me know if this works for you, or if you'd like any further adjustments.`,
          timestamp: Date.now(),
          stage: "path-generation",
          metadata: {
            learningPath: path,
            suggestedActions: [
              { label: "Save this path", value: "This looks great! Please save it to My Learning." },
              { label: "Make more changes", value: "I'd like to make more changes" },
            ],
          },
        },
        updatedState: newState,
      };
    }
  }

  // Fallback
  return {
    message: {
      id: makeId(),
      role: "assistant",
      content: "I'm here to help you create a personalized learning path. Could you tell me more about what you'd like to learn?",
      timestamp: Date.now(),
      stage: newState.stage,
    },
    updatedState: newState,
  };
}
