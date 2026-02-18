"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ExternalLink,
  Clock,
  Video,
  FileText,
  Headphones,
  Monitor,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import { courses } from "@/data/courses";
import { Course, CourseCategory, CourseFormat, CourseLevel } from "@/lib/types";

const categoryLabels: Record<CourseCategory, string> = {
  "digital-marketing": "Digital Marketing",
  "gen-ai-marketing": "Gen AI for Marketing",
  "social-media-marketing": "Social Media Marketing",
  "content-marketing": "Content Marketing",
  "seo-sem": "SEO & SEM",
  "marketing-analytics": "Marketing Analytics",
  "brand-management": "Brand Management",
  "email-marketing": "Email Marketing",
  "marketing-strategy": "Marketing Strategy",
  "video-marketing": "Video Marketing",
};

const levelColors: Record<CourseLevel, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

function FormatIcon({ format }: { format: CourseFormat }) {
  switch (format) {
    case "video":
    case "youtube":
      return <Video className="h-3.5 w-3.5" />;
    case "audio":
      return <Headphones className="h-3.5 w-3.5" />;
    case "pdf":
    case "article":
    case "presentation":
      return <FileText className="h-3.5 w-3.5" />;
    case "self-paced":
    case "interactive":
      return <Monitor className="h-3.5 w-3.5" />;
    default:
      return <BookOpen className="h-3.5 w-3.5" />;
  }
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {course.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <span className="font-medium text-gray-700">{course.provider}</span>
        <span>-</span>
        <span>{course.author}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            levelColors[course.level]
          }`}
        >
          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <FormatIcon format={course.format} />
          {course.format}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {course.duration}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">Free</span>
        <div className="flex gap-1">
          {course.topics.slice(0, 2).map((topic) => (
            <span
              key={topic}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseListItem({ course }: { course: Course }) {
  return (
    <div className="card hover:shadow-md transition-shadow group flex items-center gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors truncate">
            {course.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              levelColors[course.level]
            }`}
          >
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mb-1">
          {course.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{course.provider}</span>
          <span className="flex items-center gap-1">
            <FormatIcon format={course.format} />
            {course.format}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
          {course.topics.slice(0, 2).map((topic) => (
            <span
              key={topic}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hidden sm:inline"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
      <a
        href={course.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export default function ContentBrowser() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }

    if (selectedFormat !== "all") {
      filtered = filtered.filter((c) => c.format === selectedFormat);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower) ||
          c.topics.some((t) => t.toLowerCase().includes(lower)) ||
          c.provider.toLowerCase().includes(lower) ||
          c.author.toLowerCase().includes(lower)
      );
    }

    return filtered;
  }, [search, selectedCategory, selectedLevel, selectedFormat]);

  const categories = Object.entries(categoryLabels);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, topic, provider..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <Filter className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Formats</option>
            <option value="self-paced">Self-paced</option>
            <option value="video">Video</option>
            <option value="youtube">YouTube</option>
            <option value="article">Article</option>
            <option value="pdf">PDF</option>
            <option value="interactive">Interactive</option>
            <option value="audio">Audio</option>
          </select>
        </div>
      </div>

      {/* Results Count & View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{filteredCourses.length}</span> courses
          found
        </p>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Course Grid or List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
