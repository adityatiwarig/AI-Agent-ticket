🚀 AI Ticket Assistant

An AI-powered smart ticket management system built by me, where support tickets are automatically analyzed, prioritized, and assigned to the most relevant moderators using AI.

I built this project while learning backend architecture and AI integrations.
I learned the core concepts from Hitesh Choudhary Sir, but the implementation, debugging, architecture fixes, AI integration issues, and production-level handling were done by me.

🧠 What This Project Does

This system:

Accepts support tickets from users

Uses AI to analyze ticket content

Determines:

Priority

Required technical skills

Helpful notes

Automatically assigns the best matching moderator

Falls back to admin if no matching skill found

Sends email notifications

Processes everything asynchronously using background jobs

⚙️ Features I Implemented
🔹 AI-Based Ticket Processing

AI generates summary

AI sets priority (low / medium / high)

AI extracts required skills

AI generates helpful notes for moderators

JSON parsing & validation from AI response

🔹 Smart Moderator Assignment Logic

Regex-based skill matching

Case-insensitive matching

Fallback to admin if no skill match

Automatic assignment update in DB

Email notification after assignment

🔹 Role-Based System

User → Can create tickets

Moderator → Gets assigned tickets based on skills

Admin → Fallback assignment & user control

🔹 Background Job Architecture

Used Inngest for event-driven processing

Triggered ticket/created event

Processed AI outside step.run to avoid retries

Used NonRetriableError for safe failure handling

🛠 Tech Stack

Backend:

Node.js

Express.js

MongoDB (Mongoose)

Authentication:

JWT

Background Jobs:

Inngest

AI:

Google Gemini API

Email:

Nodemailer

Mailtrap

💥 Real Issues I Faced & Solved

This project was NOT smooth 😅
I faced multiple real-world issues:

❌ 1. Gemini 404 Model Errors

Error:

models/gemini-1.0-pro is not found for API version v1beta


Cause:

Wrong model naming

API version mismatch

Google endpoint differences

Fix:

Switched to correct Gemini SDK

Handled response parsing manually

Added JSON extraction with regex

Added fallback handling if AI fails

❌ 2. AI Returning Null

Problem:
AI sometimes returned:

AI RESPONSE: null


Fix:

Added safe parsing logic

Multiple fallback response paths

Ensured valid JSON extraction

Added default priority fallback

❌ 3. Random Moderator Assignment

Problem:
Ticket always got assigned to admin.

Cause:
relatedSkills was empty because AI failed.

Fix:

Added logging for skills

Added regex-based skill match

Added proper skill extraction validation

❌ 4. Inngest Retry Loop Issue

Function kept triggering repeatedly.

Fix:

Moved AI call outside step.run

Used NonRetriableError

Controlled DB updates carefully

❌ 5. GitHub 403 Error

Problem:
Could not push to original repo.

Cause:
Tried pushing to someone else's repository.

Fix:

Changed remote origin

Created personal repo

Used Personal Access Token

🔄 How Ticket Processing Works (My Architecture)

User creates ticket

Ticket stored with status TODO

Event ticket/created fired

Inngest function triggers

AI analyzes ticket

DB updated to:

IN_PROGRESS

priority

helpfulNotes

relatedSkills

Moderator matched via skills

Email sent

Assignment saved

📦 Environment Setup

Create .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

MAILTRAP_SMTP_HOST=your_host
MAILTRAP_SMTP_PORT=your_port
MAILTRAP_SMTP_USER=your_user
MAILTRAP_SMTP_PASS=your_pass

GEMINI_API_KEY=your_gemini_key
APP_URL=http://localhost:3000

🚀 Running the Project

Start backend:

npm run dev


Start Inngest:

npm run inngest-dev

📚 What I Learned

Real-world AI integration debugging

Background job architecture

Handling third-party API failures

Skill-based routing systems

Regex-based dynamic matching

Safe async processing

Production-level error handling

Proper Git remote management

💪 Final Thoughts

This project helped me understand:

How AI can automate real workflows

How to debug API-level errors

How to design scalable backend systems

How to handle failure cases gracefully

This is not just a tutorial clone —
I implemented, debugged, broke, fixed, and rebuilt major parts myself.
