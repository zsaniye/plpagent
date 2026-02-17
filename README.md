# PLP Agent - Personalized Learning Path Agent for Marketing Professionals

An AI-powered web application that helps marketing professionals discover their learning needs and generates personalized learning paths from a curated library of 100 free courses.

## Features

### 1. Learning Assistant (Conversational AI)
A 3-stage guided conversation:
- **Discovery** - Understands your motivation, area of interest, experience level, and timeline
- **Skills Assessment** - Choose from Quiz, Self-Rate, or Describe Skills to assess your current level
- **Learning Path Generation** - Generates a personalized path with courses, lessons, and assessments from the content library

### 2. Content Library
100 curated free learning resources across 10 marketing categories:
- Digital Marketing, Gen AI for Marketing, Social Media Marketing
- Content Marketing, SEO & SEM, Marketing Analytics
- Brand Management, Email Marketing, Marketing Strategy, Video Marketing

Resources from: Google Digital Garage, HubSpot Academy, Semrush Academy, Meta Blueprint, Coursera, Moz, and more.

### 3. My Learning
- View and manage saved learning paths
- Track course completion progress
- Mark paths as completed or discontinued
- Provide feedback (rating, objective met, comments)
- View chat history from discovery sessions

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **React** with client-side state management
- **localStorage** for data persistence
