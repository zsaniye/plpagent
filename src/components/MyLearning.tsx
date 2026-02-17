"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Award,
  Trash2,
} from "lucide-react";
import { SavedLearningPath } from "@/lib/types";
import {
  getSavedPaths,
  updatePathStatus,
  updatePathFeedback,
  updateCourseProgress,
  deleteLearningPath,
} from "@/lib/storage";
import LearningPathDisplay from "./LearningPathDisplay";

function FeedbackModal({
  path,
  onClose,
  onSubmit,
}: {
  path: SavedLearningPath;
  onClose: () => void;
  onSubmit: (rating: number, metObjective: boolean | null, comments: string) => void;
}) {
  const [rating, setRating] = useState(path.feedback?.rating || 0);
  const [metObjective, setMetObjective] = useState<boolean | null>(
    path.feedback?.metObjective ?? null
  );
  const [comments, setComments] = useState(path.feedback?.comments || "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Provide Feedback
        </h3>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate this learning path?
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 ${
                    n <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Met Objective */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Did this learning path meet your stated objective?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setMetObjective(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                metObjective === true
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setMetObjective(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                metObjective === false
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional comments (optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Share your thoughts about this learning path..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(rating, metObjective, comments)}
            disabled={rating === 0}
            className="btn-primary text-sm"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

function PathCard({
  savedPath,
  onRefresh,
}: {
  savedPath: SavedLearningPath;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const lp = savedPath.learningPath;
  const totalCourses = lp.courses.length;
  const completedCourses = Object.values(savedPath.courseProgress).filter(
    Boolean
  ).length;
  const progressPercent =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const statusColors = {
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    discontinued: "bg-gray-100 text-gray-500",
  };

  const handleToggleCourse = (courseId: string) => {
    const current = savedPath.courseProgress[courseId] || false;
    updateCourseProgress(savedPath.id, courseId, !current);
    onRefresh();
  };

  const handleStatusChange = (status: "completed" | "discontinued") => {
    updatePathStatus(savedPath.id, status);
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (
    rating: number,
    metObjective: boolean | null,
    comments: string
  ) => {
    updatePathFeedback(savedPath.id, { rating, metObjective, comments });
    setShowFeedback(false);
    onRefresh();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this learning path?")) {
      deleteLearningPath(savedPath.id);
      onRefresh();
    }
  };

  return (
    <>
      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 group text-left"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {lp.title}
              </h3>
            </button>
            <p className="text-sm text-gray-500 mt-1 ml-6">{lp.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                statusColors[savedPath.status]
              }`}
            >
              {savedPath.status.charAt(0).toUpperCase() +
                savedPath.status.slice(1)}
            </span>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Delete learning path"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="ml-6 mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>
              {completedCourses} of {totalCourses} courses completed
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap items-center gap-3 ml-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lp.totalDuration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalCourses} courses
          </span>
          <span>
            Created{" "}
            {new Date(savedPath.createdAt).toLocaleDateString()}
          </span>
          {savedPath.feedback && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {savedPath.feedback.rating}/5
            </span>
          )}
        </div>

        {/* Actions */}
        {savedPath.status === "active" && (
          <div className="flex items-center gap-2 ml-6 mt-3">
            <button
              onClick={() => handleStatusChange("completed")}
              className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Mark Complete
            </button>
            <button
              onClick={() => handleStatusChange("discontinued")}
              className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Discontinue
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat History
            </button>
          </div>
        )}

        {(savedPath.status === "completed" || savedPath.status === "discontinued") && !savedPath.feedback && (
          <div className="ml-6 mt-3">
            <button
              onClick={() => setShowFeedback(true)}
              className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <Star className="h-3.5 w-3.5" />
              Provide Feedback
            </button>
          </div>
        )}

        {/* Expanded Content - Courses with progress */}
        {expanded && (
          <div className="mt-4 ml-6 space-y-2">
            {lp.courses.map((course) => {
              const isCompleted =
                savedPath.courseProgress[course.courseId] || false;
              return (
                <div
                  key={course.courseId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => handleToggleCourse(course.courseId)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-primary-400"
                    }`}
                  >
                    {isCompleted && (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? "text-green-700 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {course.courseTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.provider} - {course.estimatedDuration}
                    </p>
                  </div>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary-600 hover:text-primary-700 p-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              );
            })}

            {/* Full learning path details */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <LearningPathDisplay path={lp} compact />
            </div>
          </div>
        )}

        {/* Chat History */}
        {showHistory && (
          <div className="mt-4 ml-6 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Chat History
            </h4>
            <div className="space-y-2">
              {savedPath.chatHistory
                .filter((m) => m.role !== "system")
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs p-2 rounded ${
                      msg.role === "user"
                        ? "bg-primary-50 text-primary-800 ml-8"
                        : "bg-white text-gray-700 mr-8 border border-gray-200"
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.role === "user" ? "You" : "Assistant"}:
                    </span>{" "}
                    {msg.content.substring(0, 200)}
                    {msg.content.length > 200 ? "..." : ""}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Feedback display */}
        {savedPath.feedback && (
          <div className="mt-3 ml-6 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Your Feedback
              </span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-3.5 w-3.5 ${
                    n <= savedPath.feedback!.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {savedPath.feedback.metObjective !== null && (
              <p className="text-xs text-amber-700">
                Met objective:{" "}
                {savedPath.feedback.metObjective ? "Yes" : "No"}
              </p>
            )}
            {savedPath.feedback.comments && (
              <p className="text-xs text-amber-700 mt-1">
                {savedPath.feedback.comments}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          path={savedPath}
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}

interface MyLearningProps {
  refreshKey?: number;
}

export default function MyLearning({ refreshKey }: MyLearningProps) {
  const [paths, setPaths] = useState<SavedLearningPath[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "discontinued">("all");

  const loadPaths = useCallback(() => {
    setPaths(getSavedPaths());
  }, []);

  useEffect(() => {
    loadPaths();
  }, [loadPaths, refreshKey]);

  const filteredPaths = paths.filter(
    (p) => filter === "all" || p.status === filter
  );

  const activePaths = paths.filter((p) => p.status === "active").length;
  const completedPaths = paths.filter((p) => p.status === "completed").length;

  if (paths.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          No Learning Paths Yet
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Start a conversation with the Learning Assistant to discover your
          learning needs and get a personalized learning path.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{paths.length}</p>
          <p className="text-xs text-gray-500">Total Paths</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{activePaths}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{completedPaths}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "active", "completed", "discontinued"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Path Cards */}
      <div className="space-y-4">
        {filteredPaths.map((savedPath) => (
          <PathCard
            key={savedPath.id}
            savedPath={savedPath}
            onRefresh={loadPaths}
          />
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No learning paths match this filter.</p>
        </div>
      )}
    </div>
  );
}
