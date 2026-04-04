# Requirements Document

## Introduction

RAASTA Taleem Dynamic AI transforms all static/hardcoded content across the Taleem pillar modules into fully dynamic, AI-powered, and live-data-driven experiences. The existing codebase has UI shells for Hunarmand (business coaching), Sukoon (mental wellness), Kaam (career/skills), Naukri (job search), CV (voice CV), Exam (exam prep), and Scholarship (scholarship matching). Currently these modules use static mentor lists, hardcoded stories, hardcoded helplines, and LLM prompts without real-world data enrichment.

This feature wires up dynamic backends for every module: live web scraping via Firecrawl, AI-generated content via the existing `/api/llm` route (OpenRouter + Gemini fallback), persistent storage for mood tracking and job caching, and a new Goal System. Nothing is hardcoded. All outputs are either AI-generated or fetched dynamically from the web.

## Glossary

- **RAASTA_System**: The complete Next.js application including all Taleem modules
- **Hunarmand_Module**: Business idea coaching module at `/taleem/hunarmand`
- **Sukoon_Module**: Mental wellness module at `/taleem/sukoon`
- **Kaam_Module**: Career and skill mapping module at `/taleem/kaam`
- **Naukri_Module**: Job search module at `/taleem/naukri`
- **CV_Module**: Voice CV generation module at `/taleem/cv`
- **Exam_Module**: Exam preparation module at `/taleem/exam`
- **Scholarship_Module**: Scholarship matching module at `/taleem/scholarship`
- **Goal_Module**: New goal-to-roadmap system
- **LLM_Service**: The existing `/api/llm` route using OpenRouter (Llama) with Gemini fallback
- **Firecrawl_Service**: The existing `/api/firecrawl/search` and `/api/firecrawl/scrape` routes using `app.v1.search()` and `app.v1.scrapeUrl()`
- **Cache_Layer**: Server-side in-memory or database cache to avoid repeated scraping
- **Job_Store**: Persistent database (MongoDB or PostgreSQL) for scraped job listings
- **Mood_Store**: Persistent database for user mood check-in history
- **Idea_Evaluator**: AI service that scores and enriches a business idea with real-world data
- **Scheme_Fetcher**: Service that dynamically fetches government and private schemes via Firecrawl
- **Mentor_Suggester**: Service that suggests relevant mentors via web search
- **Matching_Engine**: AI service that matches a user's CV/skills to job listings with a percentage score
- **Cron_Job**: Scheduled background task that scrapes and refreshes job listings
- **User**: A person in rural Kashmir or India interacting with RAASTA via browser

## Requirements

---

### Requirement 1: Hunarmand — Dynamic Idea Evaluation

**User Story:** As a young entrepreneur in Kashmir, I want AI to evaluate my business idea with real-world market data, so that I know if my idea is viable before investing time and money.

#### Acceptance Criteria

1. WHEN a user submits a business idea, THE Idea_Evaluator SHALL return a structured JSON response containing: a quality score (0–100), market demand assessment, top 3 risks, and 3 improvement suggestions
2. WHEN evaluating a business idea, THE Idea_Evaluator SHALL use Firecrawl_Service to search for similar businesses or startups currently operating in India or Kashmir
3. WHEN similar businesses are found via Firecrawl_Service, THE Idea_Evaluator SHALL include a summary of how those businesses are performing in the response
4. WHEN Firecrawl_Service returns no results for a business idea search, THE Idea_Evaluator SHALL proceed with AI-only evaluation and indicate that no comparable businesses were found
5. THE LLM_Service SHALL generate the quality score and structured evaluation using the scraped business data as context
6. WHEN the Idea_Evaluator response is returned to the client, THE Hunarmand_Module SHALL render the score, market data, risks, and improvements in the existing UI without requiring a page reload
7. IF the LLM_Service fails, THEN THE Hunarmand_Module SHALL display a descriptive error message in Roman Urdu and allow the user to retry
8. THE Cache_Layer SHALL store Idea_Evaluator results keyed by a normalized version of the idea text for up to 2 hours to avoid redundant scraping

**Correctness Properties:**
- FOR ALL business idea inputs, the Idea_Evaluator response SHALL be parseable as valid JSON with the fields: `score` (number 0–100), `demand` (string), `risks` (array of 3 strings), `improvements` (array of 3 strings)
- FOR ALL cached idea evaluations, retrieving the same normalized idea text SHALL return the same structured result within the cache TTL

---

### Requirement 2: Hunarmand — Dynamic Government and Private Schemes

**User Story:** As an entrepreneur, I want to see government and private schemes that match my specific business idea and location, so that I can access funding and support I actually qualify for.

#### Acceptance Criteria

1. WHEN a user requests scheme matching for their business idea, THE Scheme_Fetcher SHALL use Firecrawl_Service to search for relevant government and private schemes using the idea keywords and user-provided location
2. THE Scheme_Fetcher SHALL search across sources including government portals (schemes.gov.in, jkgov.in), startup India, PM Mudra, Mission YUVA, and J&K-specific programs
3. WHEN schemes are fetched, THE LLM_Service SHALL filter and rank them by relevance to the user's idea and location, returning the top 5 most relevant schemes
4. WHEN a scheme is returned, THE Hunarmand_Module SHALL display the scheme name, eligibility summary, and a link to the official source URL
5. IF Firecrawl_Service returns no scheme results, THEN THE Scheme_Fetcher SHALL fall back to LLM_Service-generated scheme suggestions based on the idea category, clearly labeling them as AI-suggested rather than live data
6. THE Cache_Layer SHALL cache scheme results per idea-category and location pair for up to 6 hours

---

### Requirement 3: Hunarmand — Dynamic Mentor Suggestions

**User Story:** As an entrepreneur, I want to be connected with relevant mentors who have domain expertise matching my business idea, so that I can get real guidance.

#### Acceptance Criteria

1. WHEN a user requests mentor suggestions, THE Mentor_Suggester SHALL use Firecrawl_Service to search for mentors, startup advisors, and domain experts relevant to the business idea category
2. THE Mentor_Suggester SHALL search LinkedIn profiles, startup communities, and J&K entrepreneurship networks (JKEDI, DIC) via Firecrawl_Service
3. WHEN mentor data is found, THE LLM_Service SHALL extract and structure each mentor's name, domain, organization, and any available contact or profile URL
4. THE Hunarmand_Module SHALL display at least 3 mentor suggestions with name, domain, and contact/profile link
5. IF Firecrawl_Service cannot find mentor data, THEN THE Mentor_Suggester SHALL return AI-generated mentor archetypes (e.g., "Seek a mentor with experience in handicraft exports") with links to JKEDI and DIC contact pages
6. THE Cache_Layer SHALL cache mentor suggestions per business category for up to 24 hours

---

### Requirement 4: Sukoon — AI-Powered Emotional Check-In with Memory

**User Story:** As a user dealing with stress or anxiety, I want the AI to remember my previous check-ins and track my mood over time, so that support feels continuous and personalized.

#### Acceptance Criteria

1. WHEN a user submits a check-in message, THE Sukoon_Module SHALL send the message along with the user's last 5 check-in messages (retrieved from Mood_Store) as conversation context to LLM_Service
2. THE LLM_Service SHALL generate an empathetic, contextually aware response that acknowledges patterns in the user's mood history if available
3. WHEN a check-in is submitted, THE Mood_Store SHALL persist the message text, AI response, and a timestamp associated with the user's session or device identifier
4. THE Sukoon_Module SHALL display a mood trend indicator (e.g., improving, stable, declining) derived from the last 7 check-in entries stored in Mood_Store
5. WHEN self-harm or crisis keywords are detected in the check-in message, THE Sukoon_Module SHALL immediately display crisis helpline numbers prominently before showing the AI response
6. IF Mood_Store is unavailable, THEN THE Sukoon_Module SHALL proceed with a stateless check-in and display a notice that mood history is temporarily unavailable

**Correctness Properties:**
- FOR ALL check-in submissions, the mood trend indicator SHALL be derived solely from stored Mood_Store entries and SHALL NOT be hardcoded
- WHEN the same check-in message is submitted twice in the same session, THE Mood_Store SHALL store two separate entries with distinct timestamps (idempotence does NOT apply — each check-in is a unique event)

---

### Requirement 5: Sukoon — AI-Generated Peer Stories

**User Story:** As a user seeking emotional support, I want to read peer stories that feel relevant to my situation, so that I feel less alone.

#### Acceptance Criteria

1. WHEN the stories tab is opened, THE Sukoon_Module SHALL request AI-generated stories from LLM_Service rather than rendering hardcoded story text
2. THE LLM_Service SHALL generate 2–3 short peer stories (150–200 words each) based on common stressors for rural Kashmir youth (exam pressure, unemployment, family expectations, migration)
3. WHEN a user has submitted a recent check-in, THE Sukoon_Module SHALL pass the check-in topic as context to LLM_Service so that generated stories are thematically relevant to the user's situation
4. THE Sukoon_Module SHALL cache generated stories per session so that navigating away and back does not trigger a new LLM call
5. IF LLM_Service fails to generate stories, THEN THE Sukoon_Module SHALL display a fallback message in Roman Urdu indicating stories are temporarily unavailable

---

### Requirement 6: Sukoon — Dynamic Helpline Database

**User Story:** As a user in crisis, I want to see helplines and mental health professionals filtered by my location, so that I can reach someone who can actually help me.

#### Acceptance Criteria

1. WHEN the helpline tab is opened, THE Sukoon_Module SHALL fetch helpline data from a dynamic source rather than rendering hardcoded phone numbers
2. THE Scheme_Fetcher SHALL use Firecrawl_Service to search for psychiatrists, NGOs, and mental health helplines in J&K and India, refreshing the data at most once every 24 hours via Cache_Layer
3. THE Sukoon_Module SHALL display each helpline entry with: organization name, phone number, coverage area, and type (NGO, government, private)
4. WHEN a user provides their district or location, THE Sukoon_Module SHALL filter displayed helplines to show location-relevant entries first
5. IF Firecrawl_Service returns no helpline data, THEN THE Sukoon_Module SHALL fall back to a hardcoded minimum set of national crisis lines (Vandrevala Foundation: 9999666555, iCall: 9152987821) clearly labeled as fallback data

---

### Requirement 7: Kaam — Dynamic Skill Map

**User Story:** As a job seeker, I want to input my skills or upload my CV and receive a map of matching job roles, skill gaps, and a learning roadmap, so that I know exactly what to do next.

#### Acceptance Criteria

1. WHEN a user submits their skills or CV text, THE Kaam_Module SHALL send the input to LLM_Service with a prompt that returns: matched formal job titles, missing skills for each role, and a prioritized learning roadmap
2. THE LLM_Service SHALL return the skill map as structured data with fields: `roles` (array), `gaps` (object mapping role to missing skills array), `roadmap` (ordered list of learning steps)
3. WHEN generating the roadmap, THE LLM_Service SHALL include free online resources (Coursera, YouTube, PMKVY) relevant to each missing skill
4. THE Kaam_Module SHALL render the skill map visually, showing matched roles and gap indicators without requiring a page reload
5. IF LLM_Service fails, THEN THE Kaam_Module SHALL display an error in Roman Urdu and preserve the user's input for retry

**Correctness Properties:**
- FOR ALL skill map responses, the `roles` array SHALL contain at least 1 entry when the user provides at least 1 recognizable skill
- FOR ALL skill map responses, every role listed in `gaps` SHALL also appear in the `roles` array (referential consistency)

---

### Requirement 8: Kaam — Dynamic Gig Generator

**User Story:** As a freelancer, I want AI to suggest gig ideas based on my skills along with recommended platforms and realistic pricing, so that I can start earning quickly.

#### Acceptance Criteria

1. WHEN a user submits their skills for gig generation, THE Kaam_Module SHALL send the skills to LLM_Service and receive at least 5 gig ideas
2. FOR EACH gig idea, THE LLM_Service SHALL return: gig title, recommended platform (Fiverr, Upwork, local), suggested price range in INR, and a one-line pitch
3. WHEN generating gig suggestions, THE LLM_Service SHALL use Firecrawl_Service to search for current demand and pricing for similar gigs on Fiverr or Upwork to ground the suggestions in real market data
4. IF Firecrawl_Service returns no gig market data, THEN THE LLM_Service SHALL generate gig suggestions based on general knowledge and label them as estimated pricing
5. THE Kaam_Module SHALL display gig suggestions in a card layout with platform badge, price range, and pitch text

---

### Requirement 9: Kaam — AI Freelancing Guide

**User Story:** As someone new to freelancing, I want to ask questions about Fiverr, Upwork, and freelancing basics and get clear answers in Roman Urdu, so that I can get started without confusion.

#### Acceptance Criteria

1. WHEN a user submits a freelancing question, THE Kaam_Module SHALL send it to LLM_Service with a system prompt specialized for freelancing guidance for rural Indian users
2. THE LLM_Service SHALL answer in Roman Urdu (or the user's selected locale) with step-by-step guidance relevant to Fiverr, Upwork, or general freelancing
3. WHEN the question involves platform-specific steps (e.g., "how to create a Fiverr account"), THE LLM_Service SHALL use Firecrawl_Service to fetch the current onboarding steps from the platform's help pages
4. THE LLM_Service SHALL include safety warnings about verifying clients and avoiding advance fee scams in all freelancing responses
5. IF Firecrawl_Service fails to fetch platform help content, THEN THE LLM_Service SHALL answer from general knowledge and note that steps may have changed

---

### Requirement 10: Naukri — Dynamic Job Scraping and Storage

**User Story:** As a job seeker, I want to see real, current job listings from LinkedIn, Indeed, Naukri, and remote job boards, so that I'm not looking at outdated or fake listings.

#### Acceptance Criteria

1. THE Cron_Job SHALL run on a configurable schedule (default: every 6 hours) and use Firecrawl_Service to scrape job listings from LinkedIn Jobs, Indeed India, Naukri.com, and remote job APIs (RemoteOK, We Work Remotely)
2. THE Cron_Job SHALL store scraped job listings in Job_Store with fields: title, company, location, skills_required, experience_level, source_url, scraped_at timestamp, and is_active flag
3. WHEN a job listing is older than 7 days, THE Cron_Job SHALL mark it as inactive (is_active: false) in Job_Store
4. THE Job_Store SHALL support filtering by: location (Kashmir, India, Remote), skills array (partial match), and experience level
5. WHEN Job_Store contains no active listings for a given filter combination, THE Naukri_Module SHALL trigger an on-demand Firecrawl_Service search and display results directly without waiting for the next Cron_Job run
6. THE RAASTA_System SHALL expose a `/api/taleem/jobs` endpoint that accepts filter parameters and returns paginated job listings from Job_Store

**Correctness Properties:**
- FOR ALL job listings in Job_Store, the `scraped_at` timestamp SHALL be less than or equal to the current time (no future-dated entries)
- FOR ALL job listings marked is_active: true, the `scraped_at` timestamp SHALL be within the last 7 days
- WHEN the same job URL is scraped twice, Job_Store SHALL update the existing record rather than creating a duplicate (upsert by source_url)

---

### Requirement 11: Naukri — AI Job Matching Engine

**User Story:** As a job seeker, I want to input my CV or skills and get matched to the best available jobs with a match percentage and reasoning, so that I apply to jobs I'm actually qualified for.

#### Acceptance Criteria

1. WHEN a user submits their CV text or skills list, THE Matching_Engine SHALL retrieve active job listings from Job_Store filtered by the user's preferred location
2. THE LLM_Service SHALL compare the user's skills and experience against each retrieved job listing and return a match percentage (0–100) and a one-sentence reasoning for each job
3. THE Naukri_Module SHALL display matched jobs sorted by match percentage in descending order
4. WHEN a job has a match percentage below 40%, THE Naukri_Module SHALL display it in a separate "stretch goals" section rather than the main results
5. THE Matching_Engine SHALL return results within 10 seconds for a batch of up to 20 job listings
6. IF Job_Store returns no listings, THEN THE Matching_Engine SHALL fall back to a Firecrawl_Service live search and run matching against those results

**Correctness Properties:**
- FOR ALL match results, the match percentage SHALL be a number between 0 and 100 inclusive
- FOR ALL match result sets, jobs SHALL be sorted such that match_percentage[i] >= match_percentage[i+1] (descending order invariant)

---

### Requirement 12: CV — AI-Structured Voice CV

**User Story:** As a job seeker with limited writing skills, I want to speak three sentences about myself and receive a properly formatted CV, so that I can apply for jobs without needing to write.

#### Acceptance Criteria

1. WHEN three voice or text inputs are submitted, THE CV_Module SHALL send them to LLM_Service with a prompt that generates a structured CV in English
2. THE LLM_Service SHALL return the CV with standard sections: Name/Contact (inferred or placeholder), Objective, Skills, Experience, and Education
3. WHEN the CV is generated, THE CV_Module SHALL allow the user to download it as a `.txt` file (existing behavior) AND as a `.pdf` file
4. THE LLM_Service SHALL infer missing CV fields from context (e.g., if the user mentions "I studied at JKBOSE", infer Education section) rather than leaving sections blank
5. IF LLM_Service fails, THEN THE CV_Module SHALL display an error in Roman Urdu and preserve all three input sentences for retry

---

### Requirement 13: Exam — Dynamic Question Generation via Scraping

**User Story:** As a student preparing for JKSSB, JKBOSE, or competitive exams, I want practice questions generated from real previous papers, so that I'm practicing on actual exam-style content.

#### Acceptance Criteria

1. WHEN a user selects an exam type (JKSSB, JKBOSE, SSC, UPSC), THE Exam_Module SHALL use Firecrawl_Service to search for previous year question papers for that exam
2. THE LLM_Service SHALL generate 5 practice questions in the style of the scraped papers, covering the topics found in the scraped content
3. WHEN a user submits an answer to a practice question, THE LLM_Service SHALL evaluate the answer and return feedback within 100 words in the user's selected locale
4. THE Exam_Module SHALL allow users to request a new set of questions without reloading the page
5. THE Cache_Layer SHALL cache scraped question paper content per exam type for up to 24 hours to avoid repeated scraping
6. IF Firecrawl_Service returns no question paper content, THEN THE LLM_Service SHALL generate questions from general knowledge about the selected exam and label them as AI-generated

**Correctness Properties:**
- FOR ALL generated question sets, the number of questions SHALL equal exactly 5
- FOR ALL answer evaluations, the feedback text length SHALL be 100 words or fewer

---

### Requirement 14: Scholarship — Dynamic Scholarship Matching

**User Story:** As a student, I want to upload my marksheet and have the system find real, current scholarships I qualify for, so that I don't miss funding opportunities.

#### Acceptance Criteria

1. WHEN a marksheet image is uploaded, THE Scholarship_Module SHALL extract text via OCR and parse the marks, grade, and institution name
2. THE Scheme_Fetcher SHALL use Firecrawl_Service to search for current scholarships from NSP (National Scholarship Portal), J&K scholarship schemes, and private foundations, filtered by the extracted marks and category
3. THE LLM_Service SHALL rank the fetched scholarships by eligibility match and return the top 5 with: scholarship name, eligibility criteria, amount, deadline, and application URL
4. WHEN scholarship data is fetched, THE Scholarship_Module SHALL display each result as a card with a direct link to the application portal
5. THE Cache_Layer SHALL cache scholarship search results per marks-range and category for up to 12 hours
6. IF Firecrawl_Service returns no scholarship data, THEN THE LLM_Service SHALL suggest scholarship categories based on the extracted marks and provide links to NSP and J&K scholarship portals

---

### Requirement 15: Goal System — Roadmap Generator

**User Story:** As a user who knows what they want to become, I want to input a career goal and receive a complete roadmap with skills, timeline, and resources, so that I have a clear path forward.

#### Acceptance Criteria

1. THE RAASTA_System SHALL provide a Goal_Module accessible from the Taleem hub that accepts a free-text career goal input (e.g., "I want to become a software developer")
2. WHEN a career goal is submitted, THE LLM_Service SHALL return a structured roadmap containing: required skills list, recommended timeline (in months), phase-by-phase milestones, and free learning resources for each phase
3. WHEN generating the roadmap, THE LLM_Service SHALL use Firecrawl_Service to search for current job market demand for the stated career goal to ground the roadmap in real hiring trends
4. THE Goal_Module SHALL render the roadmap as a visual timeline with phases, milestones, and resource links
5. THE LLM_Service SHALL tailor the roadmap to the Kashmir/rural India context, prioritizing remote-friendly careers and locally accessible resources
6. IF Firecrawl_Service returns no job market data, THEN THE LLM_Service SHALL generate the roadmap from general knowledge and note that market data was unavailable
7. THE Goal_Module SHALL allow the user to download the roadmap as a `.txt` file

**Correctness Properties:**
- FOR ALL roadmap responses, the `timeline_months` value SHALL be a positive integer
- FOR ALL roadmap responses, the `phases` array SHALL contain at least 2 entries
- FOR ALL roadmap responses, every phase SHALL contain at least 1 resource link

---

### Requirement 16: Caching and Performance

**User Story:** As a user on a slow mobile network, I want fast responses even when the system needs to fetch live data, so that I'm not waiting more than a few seconds.

#### Acceptance Criteria

1. THE Cache_Layer SHALL implement server-side caching with configurable TTL per data type: idea evaluations (2 hours), schemes (6 hours), mentors (24 hours), helplines (24 hours), exam papers (24 hours), scholarships (12 hours), job listings (6 hours)
2. WHEN a cached result exists for a request, THE RAASTA_System SHALL return it without calling Firecrawl_Service or LLM_Service
3. WHEN a cache miss occurs, THE RAASTA_System SHALL call Firecrawl_Service and LLM_Service in parallel where both are needed, rather than sequentially
4. THE RAASTA_System SHALL display a loading state within 100ms of user action while background fetching is in progress
5. WHEN Firecrawl_Service takes longer than 15 seconds to respond, THE RAASTA_System SHALL time out the scraping call and proceed with LLM_Service-only response, labeling the result as AI-only

**Correctness Properties:**
- FOR ALL cached responses, the cache key SHALL be deterministically derived from the input parameters such that the same inputs always produce the same cache key (determinism property)
- WHEN a cache entry is retrieved, the returned data SHALL be structurally identical to the data that was stored (round-trip property: store then retrieve produces equivalent object)

---

### Requirement 17: API Modularity

**User Story:** As a developer, I want each Taleem feature to have its own dedicated API endpoint, so that modules are independently maintainable and testable.

#### Acceptance Criteria

1. THE RAASTA_System SHALL expose the following new API routes, each handling only its domain:
   - `/api/taleem/idea-check` — Hunarmand idea evaluation
   - `/api/taleem/schemes` — scheme fetching and filtering
   - `/api/taleem/mentors` — mentor suggestions
   - `/api/taleem/mood` — Sukoon check-in and mood history (GET and POST)
   - `/api/taleem/stories` — AI-generated peer stories
   - `/api/taleem/helplines` — dynamic helpline data
   - `/api/taleem/skill-map` — Kaam skill mapping
   - `/api/taleem/gigs` — gig generation
   - `/api/taleem/jobs` — job listings with filters
   - `/api/taleem/match-jobs` — CV-to-job matching
   - `/api/taleem/exam-questions` — dynamic question generation
   - `/api/taleem/scholarships` — scholarship matching
   - `/api/taleem/goal` — goal roadmap generation
2. EACH API route SHALL validate its request body and return a 400 status with a descriptive error message for invalid inputs
3. EACH API route SHALL return a consistent response envelope: `{ ok: boolean, data: T, source: "live" | "cache" | "ai-only" | "fallback", error?: string }`
4. THE RAASTA_System SHALL not expose API keys or internal service credentials in any API response

**Correctness Properties:**
- FOR ALL API responses, the `ok` field SHALL be `true` if and only if the HTTP status code is 2xx
- FOR ALL API responses, when `ok` is `false`, the `error` field SHALL be present and non-empty (error completeness property)

---

### Requirement 18: Data Persistence

**User Story:** As a returning user, I want my mood history and saved job searches to persist across sessions, so that the system remembers me.

#### Acceptance Criteria

1. THE Mood_Store SHALL persist check-in entries with: session_id or device_id, message, ai_response, mood_label (positive/neutral/negative, AI-inferred), and created_at timestamp
2. THE Job_Store SHALL persist job listings with: title, company, location, skills_required (array), experience_level, source_url (unique), scraped_at, and is_active
3. WHEN a user returns to the Sukoon check-in tab, THE Sukoon_Module SHALL retrieve and display the last 3 check-in summaries from Mood_Store for the current session
4. THE RAASTA_System SHALL use MongoDB or PostgreSQL as the persistence layer, configurable via environment variable `DATABASE_URL`
5. IF the database is unavailable, THEN THE RAASTA_System SHALL operate in stateless mode and display a notice that history features are temporarily unavailable

---

### Requirement 19: Error Handling and Fallback Consistency

**User Story:** As a user, I want the system to always give me something useful even when live data is unavailable, so that I'm never left with a blank screen.

#### Acceptance Criteria

1. WHEN any Firecrawl_Service call fails or times out, THE RAASTA_System SHALL fall back to LLM_Service-only response and label the result with `source: "ai-only"`
2. WHEN both Firecrawl_Service and LLM_Service fail, THE RAASTA_System SHALL return a pre-written fallback response in Roman Urdu appropriate to the module and label it with `source: "fallback"`
3. IF a module-specific API route returns an error, THEN THE corresponding frontend module SHALL display the error message in Roman Urdu without crashing the page
4. THE RAASTA_System SHALL log all service failures to the server console with: timestamp, route, service name, and error message
5. THE RAASTA_System SHALL never expose raw error stack traces or internal service URLs in client-facing responses

---

### Requirement 20: Locale and Language Consistency

**User Story:** As a Kashmiri user, I want all dynamically generated content to be in my selected language, so that AI responses feel native and not translated.

#### Acceptance Criteria

1. WHEN a dynamic API route is called, THE RAASTA_System SHALL accept a `locale` parameter (en, ur, hi, ks) and pass it to LLM_Service
2. THE LLM_Service SHALL generate all dynamic content (idea evaluations, stories, roadmaps, skill maps, gig suggestions) in the requested locale
3. WHEN locale is `ur` or `ks`, THE LLM_Service SHALL use Roman Urdu or Kashmiri Latin script respectively, consistent with the existing locale behavior in `/api/llm`
4. THE RAASTA_System SHALL default to Roman Urdu (`ur`) for all Taleem module responses when no locale is specified
5. WHEN scraped content from Firecrawl_Service is in English, THE LLM_Service SHALL summarize and present it in the requested locale rather than passing raw English text to the user
