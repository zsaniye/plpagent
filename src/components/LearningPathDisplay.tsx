"use client";

import {
  BookOpen,
  Clock,
  ExternalLink,
  Target,
  AlertTriangle,
  FileText,
  Video,
  Headphones,
  Monitor,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { LearningPath, LearningPathCourse, CourseFormat } from "@/lib/types";

function FormatIcon({ format }: { format: CourseFormat }) {
  switch (format) {
    case "video":
    case "youtube":
      return <Video className="h-4 w-4" />;
    case "audio":
      return <Headphones className="h-4 w-4" />;
    case "pdf":
    case "article":
    case "presentation":
      return <FileText className="h-4 w-4" />;
    case "self-paced":
    case "interactive":
      return <Monitor className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function formatLabel(format: CourseFormat): string {
  const labels: Record<CourseFormat, string> = {
    video: "Video",
    youtube: "YouTube",
    "self-paced": "Self-paced Learning",
    pdf: "PDF",
    article: "Article",
    audio: "Audio",
    interactive: "Interactive",
    presentation: "Presentation",
  };
  return labels[format] || format;
}

function CourseCard({
  course,
  index,
}: {
  course: LearningPathCourse;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {course.courseTitle}
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
            <span>{course.provider}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.estimatedDuration}
            </span>
            <span className="flex items-center gap-1">
              <FormatIcon format={course.format} />
              {formatLabel(course.format)}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <p className="text-sm text-gray-600 mt-3 mb-4">
            {course.courseDescription}
          </p>

          {/* Lessons */}
          <div className="space-y-2 mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Lessons
            </h5>
            {course.lessons.map((lesson, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pl-2 py-2 border-l-2 border-primary-100"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {lesson.lessonTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lesson.lessonDescription}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.estimatedDuration}
                    </span>
                    <span className="flex items-center gap-1">
                      <FormatIcon format={lesson.resourceType} />
                      {formatLabel(lesson.resourceType)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
              <h5 className="text-sm font-semibold text-amber-800">
                Assessment: {course.assessment.title}
              </h5>
            </div>
            <p className="text-xs text-amber-700">
              {course.assessment.description}
            </p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
              {course.assessment.type === "quiz"
                ? "Quiz"
                : "Exercise (Upload)"}
            </span>
          </div>

          {/* Link */}
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Open Course
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

interface LearningPathDisplayProps {
  path: LearningPath;
  compact?: boolean;
}

export default function LearningPathDisplay({
  path,
  compact = false,
}: LearningPathDisplayProps) {
  return (
    <div className={`${compact ? "" : "card"}`}>
      {/* Path Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{path.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{path.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
            <Target className="h-3 w-3" />
            {path.targetRole}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-medium">
            Target: {path.targetLevel.charAt(0).toUpperCase() + path.targetLevel.slice(1)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
            <Clock className="h-3 w-3" />
            {path.totalDuration}
          </span>
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-3">
        {path.courses.map((course, i) => (
          <CourseCard key={course.courseId} course={course} index={i} />
        ))}
      </div>

      {/* Content Gaps */}
      {path.contentGaps && path.contentGaps.length > 0 && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="font-semibold text-orange-800 text-sm">
              Content Gaps Identified
            </h4>
          </div>
          <ul className="space-y-1">
            {path.contentGaps.map((gap, i) => (
              <li key={i} className="text-xs text-orange-700 flex items-start gap-1.5">
                <span className="mt-1">-</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
