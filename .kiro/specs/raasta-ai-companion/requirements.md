# Requirements Document

## Introduction

RAASTA is an AI companion application designed for rural Kashmir and India that provides document understanding, crop disease detection, and voice-based assistance in Urdu, Kashmiri (Latin script), and Hindi. The application serves users with limited literacy and English proficiency through voice-first interactions and visual interfaces.

The current implementation includes a functional prototype with four modes (Samjho, Zameen, Taleem, Raah) using demo/fallback data. This requirements document focuses on production-readiness features, API integrations, performance optimizations, and demo preparation needed to complete the vision.

## Glossary

- **RAASTA_System**: The complete AI companion application including all four modes
- **Samjho_Module**: Document understanding feature using OCR and LLM explanation
- **Zameen_Module**: Crop disease detection and mandi price feature using vision AI
- **Taleem_Module**: Youth-focused feature for jobs, skills, mental health, and entrepreneurship
- **Raah_Module**: Voice assistant interface using speech-to-text and text-to-speech
- **OCR_Service**: Optical Character Recognition service for extracting text from images
- **Vision_Service**: Computer vision service for analyzing crop images
- **LLM_Service**: Large Language Model service for generating explanations and responses
- **Whisper_Service**: OpenAI Whisper API for audio transcription
- **TTS_Service**: Text-to-Speech service for voice output
- **Mandi_API**: Market price data source for agricultural commodities
- **User**: Person interacting with RAASTA through voice or visual input
- **Demo_Mode**: Fallback behavior when API keys are not configured
- **Production_Mode**: Full functionality with all external services integrated

## Requirements

### Requirement 1: Production OCR Integration

**User Story:** As a user, I want accurate text extraction from photographed documents, so that I can understand government notices and forms in my language.

#### Acceptance Criteria

1. WHEN a document image is uploaded, THE OCR_Service SHALL extract text with at least 85% accuracy for printed Urdu, Hindi, and English documents
2. WHEN OCR extraction fails, THE Samjho_Module SHALL return a descriptive error message in Roman Urdu
3. THE RAASTA_System SHALL support OCR via Google Cloud Vision API or Tesseract.js
4. WHEN the OCR_Service processes an image, THE RAASTA_System SHALL complete extraction within 5 seconds for images under 5MB
5. WHERE OPENAI_API_KEY is not configured, THE Samjho_Module SHALL use demo OCR text as fallback


### Requirement 2: Production Vision AI Integration

**User Story:** As a farmer, I want to photograph my crops and receive disease diagnosis, so that I can treat problems before losing my harvest.

#### Acceptance Criteria

1. WHEN a crop image is uploaded, THE Vision_Service SHALL identify common crop diseases with at least 75% accuracy
2. THE Vision_Service SHALL support detection for apple, rice, wheat, and saffron crops
3. WHEN disease is detected, THE Zameen_Module SHALL provide treatment recommendations in Roman Urdu or Kashmiri
4. WHEN the Vision_Service processes an image, THE RAASTA_System SHALL complete analysis within 8 seconds
5. WHERE Vision_Service is not configured, THE Zameen_Module SHALL use demo disease data as fallback
6. THE RAASTA_System SHALL support vision analysis via Roboflow API or custom trained model

### Requirement 3: Real-Time Mandi Price Integration

**User Story:** As a farmer, I want current market prices for my crops, so that I can make informed selling decisions.

#### Acceptance Criteria

1. WHEN crop disease advice is generated, THE Zameen_Module SHALL include current mandi prices for the identified crop
2. THE Mandi_API SHALL provide prices for major Kashmir mandis including Sopore, Srinagar, and Anantnag
3. WHEN mndi price data is unavailable, THE Zameen_Module SHALL display the last known price with a timestamp
4. THE RAASTA_System SHALL cache mandi prices for up to 6 hours to reduce API calls
5. THE Zameen_Module SHALL display prices in Indian Rupees per kilogram format

### Requirement 4: Enhanced TTS with Natural Voices

**User Story:** As a user with limited literacy, I want natural-sounding voice output in my language, so that I can easily understand the AI responses.

#### Acceptance Criteria

1. THE TTS_Service SHALL support voice output in Urdu, Hindi, and Kashmiri languages
2. WHERE ElevenLabs or Google Cloud TTS API is configured, THE RAASTA_System SHALL use cloud-based natural voices
3. WHERE cloud TTS is not configured, THE RAASTA_System SHALL fall back to browser speechSynthesis API
4. WHEN generating voice output, THE TTS_Service SHALL complete synthesis within 3 seconds for responses under 500 characters
5. THE RAASTA_System SHALL allow users to stop voice playback at any time


### Requirement 5: Whisper Transcription Reliability

**User Story:** As a user, I want reliable voice-to-text conversion, so that I can interact with RAASTA using my voice in Urdu or Kashmiri.

#### Acceptance Criteria

1. WHEN audio is recorded and submitted, THE Whisper_Service SHALL transcribe Urdu, Hindi, and Kashmiri speech
2. WHEN transcription fails, THE Raah_Module SHALL display an error message suggesting text input as alternative
3. THE Whisper_Service SHALL complete transcription within 10 seconds for audio clips under 60 seconds
4. WHERE OPENAI_API_KEY is not configured, THE Raah_Module SHALL return empty transcription with demo flag
5. WHEN browser speech recognition is used, THE Raah_Module SHALL set language to 'hi-IN' for Hindi/Urdu recognition

### Requirement 6: Offline-First Demo Mode

**User Story:** As a hackathon presenter, I want the app to work without API keys, so that I can demonstrate functionality even without internet connectivity.

#### Acceptance Criteria

1. WHERE external API keys are not configured, THE RAASTA_System SHALL use demo responses for all features
2. THE RAASTA_System SHALL display visual indicators when operating in Demo_Mode
3. WHEN Demo_Mode is active, THE RAASTA_System SHALL simulate realistic processing delays between 500ms and 1500ms
4. THE RAASTA_System SHALL provide contextually relevant demo responses based on user input keywords
5. WHERE OPENAI_API_KEY is configured, THE RAASTA_System SHALL operate in Production_Mode

### Requirement 7: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I know what to do next.

#### Acceptance Criteria

1. WHEN any API call fails, THE RAASTA_System SHALL display an error message in Roman Urdu
2. WHEN microphone permission is denied, THE Raah_Module SHALL display a message explaining how to enable permissions
3. WHEN image upload fails, THE RAASTA_System SHALL allow the user to retry without losing context
4. WHEN network connectivity is lost, THE RAASTA_System SHALL display an offline indicator
5. THE RAASTA_System SHALL log all errors to console for debugging purposes


### Requirement 8: Language Detection and Switching

**User Story:** As a multilingual user, I want RAASTA to understand my preferred language, so that responses match how I communicate.

#### Acceptance Criteria

1. WHEN a user speaks or types in Urdu, Hindi, or Kashmiri, THE LLM_Service SHALL detect the language and respond accordingly
2. THE RAASTA_System SHALL support Roman Urdu, Devanagari Hindi, and Kashmiri Latin script
3. WHEN language cannot be detected, THE RAASTA_System SHALL default to Roman Urdu
4. THE TTS_Service SHALL match voice output language to the detected input language
5. THE RAASTA_System SHALL maintain language consistency within a single conversation session

### Requirement 9: Image Upload and Processing

**User Story:** As a user, I want to easily capture and upload photos from my mobile device, so that I can use Samjho and Zameen features.

#### Acceptance Criteria

1. THE RAASTA_System SHALL support image capture directly from device camera
2. THE RAASTA_System SHALL accept image uploads from device gallery
3. WHEN an image exceeds 10MB, THE RAASTA_System SHALL compress it before upload
4. THE RAASTA_System SHALL support JPEG, PNG, and WebP image formats
5. WHEN image upload is in progress, THE RAASTA_System SHALL display a loading indicator

### Requirement 10: Voice Recording and Playback

**User Story:** As a user, I want to record my voice questions and hear spoken responses, so that I can use RAASTA without typing or reading.

#### Acceptance Criteria

1. THE Raah_Module SHALL support audio recording in WebM format
2. WHEN recording starts, THE Raah_Module SHALL display a visual indicator showing active recording
3. THE Raah_Module SHALL allow users to stop recording manually
4. WHEN voice output is playing, THE RAASTA_System SHALL display a stop button
5. THE RAASTA_System SHALL release microphone resources when recording completes


### Requirement 11: LLM Response Quality and Context

**User Story:** As a user, I want accurate and culturally appropriate responses, so that the advice is relevant to my situation in Kashmir or rural India.

#### Acceptance Criteria

1. THE LLM_Service SHALL generate responses in Roman Urdu, Hindi, or Kashmiri Latin script based on user input
2. WHEN providing government scheme information, THE LLM_Service SHALL include disclaimers to verify on official portals
3. THE LLM_Service SHALL limit responses to 200 words for voice-friendly output
4. WHEN answering farming questions, THE LLM_Service SHALL provide region-specific advice for Kashmir climate
5. THE LLM_Service SHALL use GPT-4o-mini or equivalent model with temperature 0.4 for consistent responses

### Requirement 12: Taleem Hunarmand Business Coaching

**User Story:** As a young entrepreneur, I want feedback on my business idea and guidance on schemes, so that I can start my venture with confidence.

#### Acceptance Criteria

1. WHEN a business idea is submitted, THE Taleem_Module SHALL provide market reality assessment in Roman Urdu
2. THE Taleem_Module SHALL suggest 2-3 actionable first steps for the business idea
3. WHEN scheme matching is requested, THE Taleem_Module SHALL recommend relevant programs like PM Mudra, Mission YUVA, or J&K startup schemes
4. THE Taleem_Module SHALL include warnings to verify scheme eligibility on official portals
5. THE Taleem_Module SHALL provide mentor contact information for District Industries Centre (DIC) and JKEDI

### Requirement 13: Taleem Sukoon Mental Health Support

**User Story:** As a stressed youth, I want anonymous emotional support and access to helplines, so that I can manage pressure and seek help when needed.

#### Acceptance Criteria

1. WHEN a user shares emotional distress, THE Taleem_Module SHALL respond with empathy and normalization in Roman Urdu
2. THE Taleem_Module SHALL provide simple grounding techniques like breathing exercises
3. THE Taleem_Module SHALL display crisis helpline numbers including Vandrevala Foundation and iCall
4. THE Taleem_Module SHALL include disclaimers that it is not medical treatment
5. WHEN self-harm keywords are detected, THE Taleem_Module SHALL prominently display helpline access


### Requirement 14: Taleem Kaam Dhundo Job Matching

**User Story:** As a job seeker, I want to map my informal skills to formal opportunities, so that I can find work that matches my abilities.

#### Acceptance Criteria

1. WHEN a user describes their skills, THE Taleem_Module SHALL map informal skills to formal job titles
2. THE Taleem_Module SHALL suggest local gig opportunities relevant to Kashmir region
3. WHEN freelance guidance is requested, THE Taleem_Module SHALL provide step-by-step Fiverr or Upwork onboarding in Roman Urdu
4. THE Taleem_Module SHALL include safety warnings about verifying employers and avoiding advance fees
5. THE Taleem_Module SHALL suggest both online and offline work opportunities

### Requirement 15: Taleem Quick Access Features

**User Story:** As a youth, I want quick access to job orientation, CV creation, exam prep, and scholarship matching, so that I can access education and employment resources efficiently.

#### Acceptance Criteria

1. WHEN qualification is provided, THE Taleem_Module SHALL suggest relevant government job categories like JKSSB
2. WHEN three voice sentences are provided, THE Taleem_Module SHALL generate a formatted English CV in plain text
3. THE Taleem_Module SHALL allow CV download as a .txt file
4. WHEN an exam answer is submitted, THE Taleem_Module SHALL provide feedback in Roman Urdu within 100 words
5. WHEN a marksheet image is uploaded, THE Taleem_Module SHALL suggest scholarship types based on marks and category

### Requirement 16: Performance Optimization

**User Story:** As a user on a slow mobile network, I want fast response times, so that I can use RAASTA without frustration.

#### Acceptance Criteria

1. THE RAASTA_System SHALL compress images to under 2MB before uploading to external services
2. THE RAASTA_System SHALL implement request caching for repeated queries within 1 hour
3. WHEN multiple API calls are needed, THE RAASTA_System SHALL execute them in parallel where possible
4. THE RAASTA_System SHALL display loading states within 100ms of user action
5. THE RAASTA_System SHALL complete full user workflows (upload → process → speak) within 15 seconds on 3G networks


### Requirement 17: Mobile Responsiveness and Accessibility

**User Story:** As a user on various devices, I want RAASTA to work smoothly on my phone, so that I can access it anywhere.

#### Acceptance Criteria

1. THE RAASTA_System SHALL render correctly on screen widths from 320px to 1920px
2. THE RAASTA_System SHALL support touch interactions for all buttons and controls
3. THE RAASTA_System SHALL use minimum touch target size of 44x44 pixels for interactive elements
4. THE RAASTA_System SHALL provide ARIA labels for screen reader compatibility
5. WHEN keyboard navigation is used, THE RAASTA_System SHALL maintain visible focus indicators

### Requirement 18: Environment Configuration Management

**User Story:** As a developer, I want clear environment configuration, so that I can deploy RAASTA with appropriate API keys.

#### Acceptance Criteria

1. THE RAASTA_System SHALL read OPENAI_API_KEY from environment variables for LLM and Whisper services
2. THE RAASTA_System SHALL support OPENAI_MODEL environment variable with default value 'gpt-4o-mini'
3. THE RAASTA_System SHALL never expose API keys to client-side code
4. THE RAASTA_System SHALL provide .env.example file documenting all required environment variables
5. WHEN required environment variables are missing, THE RAASTA_System SHALL operate in Demo_Mode

### Requirement 19: Browser Compatibility

**User Story:** As a user, I want RAASTA to work on my mobile browser, so that I don't need to install an app.

#### Acceptance Criteria

1. THE RAASTA_System SHALL function on Chrome, Safari, and Firefox mobile browsers
2. WHEN browser speech recognition is unavailable, THE Raah_Module SHALL display a message suggesting text input
3. THE RAASTA_System SHALL handle browser-specific MediaRecorder API differences
4. THE RAASTA_System SHALL support camera access via HTML5 capture attribute
5. THE RAASTA_System SHALL gracefully degrade features when browser APIs are unavailable


### Requirement 20: Security and Privacy

**User Story:** As a user, I want my documents and voice recordings to be handled securely, so that my personal information remains private.

#### Acceptance Criteria

1. THE RAASTA_System SHALL transmit all data over HTTPS connections
2. THE RAASTA_System SHALL not store user images or audio files on the server after processing
3. THE RAASTA_System SHALL not require user authentication or account creation
4. WHEN processing sensitive documents, THE RAASTA_System SHALL include privacy disclaimers
5. THE RAASTA_System SHALL not log or persist user queries containing personal information

### Requirement 21: Demo Preparation and Presentation Mode

**User Story:** As a hackathon presenter, I want reliable demo flows with pre-loaded examples, so that I can showcase RAASTA effectively.

#### Acceptance Criteria

1. THE RAASTA_System SHALL provide demo buttons for each mode with pre-filled example queries
2. WHEN demo button is clicked in Raah_Module, THE RAASTA_System SHALL auto-populate "PM Kisan yojana" question
3. THE RAASTA_System SHALL include demo copy for all Taleem sub-features
4. THE RAASTA_System SHALL complete demo workflows within 3 seconds using fallback responses
5. THE RAASTA_System SHALL work fully offline when all API keys are absent

### Requirement 22: UI Polish and Visual Design

**User Story:** As a user, I want a beautiful and intuitive interface, so that RAASTA feels professional and trustworthy.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use Chinar leaf visual motif as brand identity element
2. THE RAASTA_System SHALL implement consistent color scheme using CSS custom properties for Chinar amber, gold, and deep colors
3. THE RAASTA_System SHALL display mode cards with emoji icons for visual recognition
4. THE RAASTA_System SHALL use smooth transitions for hover and focus states
5. THE RAASTA_System SHALL maintain consistent spacing and typography across all pages


### Requirement 23: Navigation and User Flow

**User Story:** As a user, I want simple navigation between modes, so that I can easily access different RAASTA features.

#### Acceptance Criteria

1. THE RAASTA_System SHALL provide a home screen with four mode cards: Samjho, Zameen, Taleem, and Raah
2. THE RAASTA_System SHALL display back navigation buttons on all sub-pages
3. WHEN the main microphone button is pressed on home screen, THE RAASTA_System SHALL navigate to Raah_Module
4. THE RAASTA_System SHALL maintain navigation state without requiring page reloads
5. THE Taleem_Module SHALL provide hub page with three pillars and four quick access links

### Requirement 24: Content Localization

**User Story:** As a Kashmiri user, I want content that reflects my local context, so that RAASTA feels relevant to my life.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use Roman Urdu as primary language for UI labels and messages
2. THE RAASTA_System SHALL include Kashmiri Latin script phrases where culturally appropriate
3. THE LLM_Service SHALL reference Kashmir-specific locations like Sopore, Baramulla, and Srinagar in responses
4. THE RAASTA_System SHALL mention J&K-specific schemes and institutions like JKSSB, JKEDI, and JKBOSE
5. THE RAASTA_System SHALL use culturally appropriate examples in demo content

### Requirement 25: API Rate Limiting and Cost Management

**User Story:** As a system administrator, I want to control API usage costs, so that the application remains sustainable.

#### Acceptance Criteria

1. THE RAASTA_System SHALL implement rate limiting of 100 requests per hour per IP address
2. WHEN rate limit is exceeded, THE RAASTA_System SHALL return a message in Roman Urdu asking user to wait
3. THE RAASTA_System SHALL use GPT-4o-mini model by default to minimize costs
4. THE RAASTA_System SHALL cache LLM responses for identical queries within 24 hours
5. THE RAASTA_System SHALL log API usage metrics for monitoring


### Requirement 26: Production Deployment Readiness

**User Story:** As a developer, I want the application ready for production deployment, so that real users can access RAASTA.

#### Acceptance Criteria

1. THE RAASTA_System SHALL build successfully with 'npm run build' command
2. THE RAASTA_System SHALL serve production build via 'npm run start' command
3. THE RAASTA_System SHALL pass all ESLint checks without errors
4. THE RAASTA_System SHALL include proper TypeScript type definitions for all components and functions
5. THE RAASTA_System SHALL include README documentation for setup and deployment

### Requirement 27: Monitoring and Logging

**User Story:** As a system administrator, I want visibility into application health, so that I can troubleshoot issues quickly.

#### Acceptance Criteria

1. THE RAASTA_System SHALL log all API errors to server console with timestamps
2. THE RAASTA_System SHALL track which mode (Demo_Mode or Production_Mode) is active for each request
3. WHEN external API calls fail, THE RAASTA_System SHALL log the service name and error details
4. THE RAASTA_System SHALL log transcription results for debugging Whisper accuracy
5. THE RAASTA_System SHALL not log user personal information or sensitive content

### Requirement 28: Graceful Degradation

**User Story:** As a user with limited device capabilities, I want RAASTA to work even when some features are unavailable, so that I can still access core functionality.

#### Acceptance Criteria

1. WHEN camera access is denied, THE RAASTA_System SHALL allow file upload from gallery as alternative
2. WHEN microphone access is denied, THE RAASTA_System SHALL provide text input as alternative
3. WHEN TTS is unavailable, THE RAASTA_System SHALL display text responses visibly
4. WHEN browser speech recognition fails, THE RAASTA_System SHALL suggest using Whisper recording or text input
5. THE RAASTA_System SHALL never block user progress due to missing browser features


### Requirement 29: Data Validation and Input Sanitization

**User Story:** As a system administrator, I want robust input validation, so that the application handles malformed data safely.

#### Acceptance Criteria

1. WHEN image files are uploaded, THE RAASTA_System SHALL validate file type and size before processing
2. WHEN audio files are uploaded, THE RAASTA_System SHALL validate format is audio/webm or compatible type
3. THE RAASTA_System SHALL sanitize all user text input before passing to LLM_Service
4. WHEN API responses are malformed, THE RAASTA_System SHALL handle errors gracefully without crashing
5. THE RAASTA_System SHALL validate all environment variables are strings before use

### Requirement 30: Hackathon Demo Script Support

**User Story:** As a hackathon presenter, I want the app to support the 5-step demo script, so that I can deliver a compelling presentation.

#### Acceptance Criteria

1. THE Samjho_Module SHALL demonstrate document explanation with government notice example
2. THE Zameen_Module SHALL demonstrate crop disease detection with apple leaf fungal infection example
3. THE Raah_Module SHALL demonstrate voice interaction with PM Kisan scheme query
4. THE RAASTA_System SHALL complete each demo step within 5 seconds
5. THE RAASTA_System SHALL provide consistent demo outputs for repeatable presentations

### Requirement 31: Taleem Sub-Feature Navigation

**User Story:** As a user, I want to navigate between Taleem sub-features easily, so that I can access different youth services.

#### Acceptance Criteria

1. THE Taleem_Module SHALL display three pillar cards: Hunarmand, Sukoon, and Kaam Dhundo
2. THE Taleem_Module SHALL display four quick access cards: Naukri, CV, Exam, and Scholarship
3. WHEN a pillar card is clicked, THE RAASTA_System SHALL navigate to the pillar page with sub-tabs
4. THE Taleem_Module SHALL maintain active tab state within each pillar page
5. THE RAASTA_System SHALL provide back navigation from all Taleem pages to Taleem hub


### Requirement 32: Voice Input Dual Strategy

**User Story:** As a user, I want multiple ways to provide voice input, so that I can use the method that works best on my device.

#### Acceptance Criteria

1. THE Raah_Module SHALL provide browser speech recognition button for instant voice input
2. THE Raah_Module SHALL provide Whisper recording button for server-side transcription
3. WHEN browser speech recognition is active, THE Raah_Module SHALL disable Whisper recording
4. WHEN Whisper recording is active, THE Raah_Module SHALL disable browser speech recognition
5. THE Raah_Module SHALL display visual indicators distinguishing between the two voice input methods

### Requirement 33: Automatic Voice Output

**User Story:** As a user with limited literacy, I want responses to be spoken automatically, so that I don't need to read text.

#### Acceptance Criteria

1. WHEN Samjho_Module generates an explanation, THE RAASTA_System SHALL automatically speak the response
2. WHEN Zameen_Module generates crop advice, THE RAASTA_System SHALL automatically speak the response
3. WHEN Raah_Module generates an answer, THE RAASTA_System SHALL automatically speak the response
4. WHEN Taleem_Module generates feedback, THE RAASTA_System SHALL automatically speak the response
5. THE RAASTA_System SHALL stop any playing audio before starting new voice output

### Requirement 34: Image Capture Optimization

**User Story:** As a user, I want to capture clear photos for OCR and vision analysis, so that I get accurate results.

#### Acceptance Criteria

1. WHEN camera is opened for document capture, THE RAASTA_System SHALL use environment-facing camera by default
2. WHEN camera is opened for crop capture, THE RAASTA_System SHALL use environment-facing camera by default
3. THE RAASTA_System SHALL accept images in JPEG, PNG, HEIC, and WebP formats
4. WHEN image quality is too low, THE RAASTA_System SHALL suggest retaking the photo
5. THE RAASTA_System SHALL display image preview after capture before processing


### Requirement 35: LLM Prompt Engineering

**User Story:** As a user, I want contextually appropriate responses, so that RAASTA understands my needs accurately.

#### Acceptance Criteria

1. THE Samjho_Module SHALL use system prompt identifying as "Samjho, powered by HAQQ" for document explanations
2. THE Zameen_Module SHALL use system prompt identifying as "Zameen, powered by WADI" for crop advice
3. THE Raah_Module SHALL use system prompt identifying as "Raah" with context about Kashmir and rural India
4. THE Taleem_Module SHALL use role-specific system prompts for each pillar and sub-feature
5. THE LLM_Service SHALL include instructions for voice-friendly output format in all system prompts

### Requirement 36: Fallback Response Intelligence

**User Story:** As a user in Demo_Mode, I want contextually relevant fallback responses, so that the demo feels realistic.

#### Acceptance Criteria

1. WHEN Raah_Module receives question containing "PM Kisan" or "yojana", THE RAASTA_System SHALL return PM Kisan scheme information
2. WHEN Raah_Module receives question containing "seb" or "fasal", THE RAASTA_System SHALL suggest using Zameen_Module
3. WHEN Raah_Module receives question containing "kagaz" or "notice", THE RAASTA_System SHALL suggest using Samjho_Module
4. WHEN Raah_Module receives unrecognized question, THE RAASTA_System SHALL provide general RAASTA introduction
5. THE RAASTA_System SHALL provide unique demo responses for each Taleem pillar and sub-feature

### Requirement 37: Audio Format Handling

**User Story:** As a user, I want my voice recordings to be processed correctly, so that transcription works reliably.

#### Acceptance Criteria

1. THE Raah_Module SHALL record audio in WebM format with appropriate codec
2. THE Whisper_Service SHALL accept WebM audio format for transcription
3. WHEN audio format is incompatible, THE RAASTA_System SHALL attempt format conversion
4. THE RAASTA_System SHALL limit audio recording duration to 60 seconds
5. WHEN audio file size exceeds 25MB, THE RAASTA_System SHALL reject the upload with error message


### Requirement 38: Response Formatting for Voice

**User Story:** As a user listening to voice output, I want responses formatted for speech, so that they sound natural and are easy to understand.

#### Acceptance Criteria

1. THE LLM_Service SHALL generate responses without markdown formatting or bullet points unless explicitly requested
2. THE LLM_Service SHALL limit response length to 200 words for voice-friendly duration
3. THE LLM_Service SHALL use short paragraphs with natural speech patterns
4. THE LLM_Service SHALL avoid technical jargon and use conversational Roman Urdu
5. THE LLM_Service SHALL include pauses through punctuation for natural TTS pacing

### Requirement 39: Scheme Information Accuracy

**User Story:** As a user seeking government schemes, I want accurate information with verification guidance, so that I can access legitimate programs.

#### Acceptance Criteria

1. WHEN providing scheme information, THE RAASTA_System SHALL include disclaimer to verify on official portals
2. THE RAASTA_System SHALL mention relevant schemes including PM Kisan, PM Mudra, Mission YUVA, and J&K startup programs
3. THE RAASTA_System SHALL provide scheme eligibility criteria in simple language
4. THE RAASTA_System SHALL suggest local contact points like DIC, CSC, and tehsil offices
5. THE RAASTA_System SHALL not guarantee scheme approval or eligibility

### Requirement 40: Crop Disease Knowledge Base

**User Story:** As a farmer, I want accurate disease identification and treatment advice, so that I can save my crops.

#### Acceptance Criteria

1. THE Vision_Service SHALL detect common diseases for apple, rice, wheat, and saffron crops
2. WHEN disease is identified, THE Zameen_Module SHALL provide treatment type (fungal spray, bacterial treatment, etc.)
3. THE Zameen_Module SHALL include treatment timing guidance (within X days)
4. THE Zameen_Module SHALL provide preventive care suggestions
5. THE Zameen_Module SHALL suggest consulting agricultural extension officers for severe cases


### Requirement 41: Mental Health Safety Protocols

**User Story:** As a user in crisis, I want immediate access to professional help, so that I can get support when I need it most.

#### Acceptance Criteria

1. WHEN Sukoon check-in detects self-harm or crisis keywords, THE Taleem_Module SHALL prominently display helpline numbers
2. THE Sukoon_Module SHALL provide clickable phone links for Vandrevala Foundation (9999666555) and iCall (9152987821)
3. THE Sukoon_Module SHALL include disclaimer that it is not medical treatment
4. THE Sukoon_Module SHALL suggest emergency services (112) for immediate danger
5. THE Sukoon_Module SHALL never provide medical diagnosis or treatment recommendations

### Requirement 42: CV Generation Quality

**User Story:** As a job seeker, I want a professional English CV from my Urdu descriptions, so that I can apply for formal jobs.

#### Acceptance Criteria

1. WHEN three sentences are provided, THE Taleem_Module SHALL generate CV with sections: NAME, PROFILE, EXPERIENCE, EDUCATION, SKILLS, LANGUAGES
2. THE Taleem_Module SHALL translate Urdu/Roman Urdu input faithfully into professional English
3. THE Taleem_Module SHALL output plain text format without markdown code fences
4. THE Taleem_Module SHALL include footer note "Draft — edit before use"
5. THE Taleem_Module SHALL allow CV download as .txt file

### Requirement 43: Exam Feedback Pedagogy

**User Story:** As a student, I want constructive feedback on my exam answers, so that I can improve my preparation.

#### Acceptance Criteria

1. WHEN an exam answer is submitted, THE Taleem_Module SHALL compare it to model answer intent
2. THE Taleem_Module SHALL provide feedback in three parts: what was good, what to improve, one study tip
3. THE Taleem_Module SHALL limit feedback to 120 words for voice-friendly length
4. THE Taleem_Module SHALL use encouraging and supportive tone in Roman Urdu
5. THE Taleem_Module SHALL reference JKSSB exam patterns where relevant


### Requirement 44: Scholarship Matching Intelligence

**User Story:** As a student, I want to know which scholarships I might qualify for, so that I can fund my education.

#### Acceptance Criteria

1. WHEN marksheet image is uploaded, THE Taleem_Module SHALL extract marks and class information via OCR
2. THE Taleem_Module SHALL infer percentage or grade from extracted marks
3. THE Taleem_Module SHALL suggest scholarship types including NSP, state post-matric, merit-based, and minority scholarships
4. THE Taleem_Module SHALL mention typical application windows (September-November)
5. THE Taleem_Module SHALL include disclaimer to verify eligibility on official portals

### Requirement 45: Peer Stories Content

**User Story:** As a struggling youth, I want to read stories from others like me, so that I feel less alone and find hope.

#### Acceptance Criteria

1. THE Sukoon_Module SHALL display at least 2 peer stories about unemployment and family pressure
2. THE Sukoon_Module SHALL present stories in Roman Urdu with authentic voice
3. THE Sukoon_Module SHALL include coping strategies within each story
4. THE Sukoon_Module SHALL format stories with title and body text
5. THE Sukoon_Module SHALL allow future expansion to user-submitted stories

### Requirement 46: Mentor Connection Information

**User Story:** As an entrepreneur, I want to connect with real mentors, so that I can get personalized guidance for my business.

#### Acceptance Criteria

1. THE Hunarmand_Module SHALL provide contact information for JKEDI startup cell
2. THE Hunarmand_Module SHALL provide guidance to contact District Industries Centre (DIC)
3. THE Hunarmand_Module SHALL suggest local ITI and polytechnic institutions for skill programs
4. THE Hunarmand_Module SHALL include disclaimer to verify contact numbers on official websites
5. THE Hunarmand_Module SHALL allow future integration of WhatsApp or form links for mentor desk


### Requirement 47: Freelance Platform Guidance

**User Story:** As a person with skills, I want step-by-step guidance for freelance platforms, so that I can earn income online.

#### Acceptance Criteria

1. WHEN freelance guidance is requested, THE Kaam_Module SHALL provide Fiverr and Upwork onboarding steps
2. THE Kaam_Module SHALL explain profile creation in Roman Urdu
3. THE Kaam_Module SHALL suggest starting with $5 services to build reviews
4. THE Kaam_Module SHALL provide tips for writing service descriptions
5. THE Kaam_Module SHALL recommend daily profile improvement practices

### Requirement 48: Gig Economy Safety

**User Story:** As a gig worker, I want safety guidance, so that I can avoid scams and exploitation.

#### Acceptance Criteria

1. WHEN gig opportunities are suggested, THE Kaam_Module SHALL include warning to verify employer identity
2. THE Kaam_Module SHALL warn against paying advance fees
3. THE Kaam_Module SHALL suggest checking employer reviews or references
4. THE Kaam_Module SHALL recommend meeting in public places for initial discussions
5. THE Kaam_Module SHALL provide guidance on recognizing legitimate vs fraudulent opportunities

### Requirement 49: Job Orientation Specificity

**User Story:** As a job seeker, I want guidance tailored to my qualifications, so that I focus on realistic opportunities.

#### Acceptance Criteria

1. WHEN qualification is provided, THE Naukri_Module SHALL suggest specific job categories (Class IV, Panchayat Secretary, Police, Forest, etc.)
2. THE Naukri_Module SHALL reference JKSSB and other J&K recruitment bodies
3. THE Naukri_Module SHALL explain deadline tracking culture for government jobs
4. THE Naukri_Module SHALL provide exam preparation tips
5. THE Naukri_Module SHALL direct users to official portals like jkssb.nic.in


### Requirement 50: API Response Parsing and Error Recovery

**User Story:** As a user, I want the app to handle API failures gracefully, so that I can still get value even when services are down.

#### Acceptance Criteria

1. WHEN OpenAI API returns error, THE RAASTA_System SHALL fall back to demo responses
2. WHEN API response is malformed, THE RAASTA_System SHALL parse available data and display partial results
3. WHEN network timeout occurs, THE RAASTA_System SHALL retry once before showing error
4. THE RAASTA_System SHALL validate API response structure before processing
5. WHEN API quota is exceeded, THE RAASTA_System SHALL display message in Roman Urdu explaining temporary unavailability

### Requirement 51: Loading State Management

**User Story:** As a user, I want clear feedback during processing, so that I know the app is working.

#### Acceptance Criteria

1. WHEN processing is in progress, THE RAASTA_System SHALL disable submit buttons to prevent duplicate requests
2. THE RAASTA_System SHALL display loading text in Roman Urdu (e.g., "Padh rahe hain…", "Soch rahe hain…")
3. WHEN voice is being generated, THE RAASTA_System SHALL show speaking indicator
4. THE RAASTA_System SHALL update button text to reflect current operation state
5. THE RAASTA_System SHALL clear loading states when operations complete or fail

### Requirement 52: Text Input Alternatives

**User Story:** As a user who prefers typing, I want text input options for all voice features, so that I can use RAASTA my way.

#### Acceptance Criteria

1. THE Raah_Module SHALL provide textarea for typing questions as alternative to voice
2. THE Taleem_Module SHALL provide text input for all voice-first forms
3. THE RAASTA_System SHALL process text input identically to transcribed voice input
4. WHEN text is entered, THE RAASTA_System SHALL allow submission via button click
5. THE RAASTA_System SHALL preserve entered text if processing fails


### Requirement 53: Component Reusability

**User Story:** As a developer, I want reusable UI components, so that the codebase remains maintainable.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use shared ImageUploader component for Samjho, Zameen, and Scholarship features
2. THE RAASTA_System SHALL use shared VoiceOutput component for displaying and playing responses
3. THE RAASTA_System SHALL use shared PageIntro component for consistent page headers
4. THE RAASTA_System SHALL use shared TaleemVoiceForm component for all Taleem voice input forms
5. THE RAASTA_System SHALL use shared TaleemSubTabs component for pillar navigation

### Requirement 54: Type Safety

**User Story:** As a developer, I want comprehensive TypeScript types, so that I can catch errors at compile time.

#### Acceptance Criteria

1. THE RAASTA_System SHALL define TypeScript interfaces for all API request and response payloads
2. THE RAASTA_System SHALL use strict TypeScript configuration
3. THE RAASTA_System SHALL avoid using 'any' type except for external library integrations
4. THE RAASTA_System SHALL define types for all component props
5. THE RAASTA_System SHALL pass TypeScript compilation without errors

### Requirement 55: Build and Deployment Configuration

**User Story:** As a developer, I want proper build configuration, so that RAASTA can be deployed to production.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use Next.js App Router for routing and API routes
2. THE RAASTA_System SHALL configure Tailwind CSS v4 for styling
3. THE RAASTA_System SHALL include proper next.config.ts configuration
4. THE RAASTA_System SHALL generate optimized production build under 2MB initial bundle size
5. THE RAASTA_System SHALL support deployment to Vercel, Netlify, or similar platforms


### Requirement 56: Mandi Price Data Source Integration

**User Story:** As a farmer, I want real-time market prices from reliable sources, so that I can make informed selling decisions.

#### Acceptance Criteria

1. THE RAASTA_System SHALL integrate with Agmarknet API or equivalent government mandi price source
2. WHEN mandi data is fetched, THE Zameen_Module SHALL filter prices for Kashmir region mandis
3. THE Zameen_Module SHALL display price date and mandi location with each price
4. WHEN multiple mandis have prices, THE Zameen_Module SHALL show the nearest or most relevant mandi
5. THE RAASTA_System SHALL handle mandi API authentication and rate limits

### Requirement 57: OCR Language Support

**User Story:** As a user, I want OCR to work with Urdu, Hindi, and English documents, so that I can understand any official document.

#### Acceptance Criteria

1. THE OCR_Service SHALL support Urdu script (Nastaliq) text extraction
2. THE OCR_Service SHALL support Devanagari Hindi text extraction
3. THE OCR_Service SHALL support English text extraction
4. THE OCR_Service SHALL support mixed-language documents
5. WHEN OCR confidence is below 60%, THE Samjho_Module SHALL warn user that extraction may be inaccurate

### Requirement 58: Vision Model Training Data

**User Story:** As a system administrator, I want the vision model trained on local crops, so that disease detection is accurate for Kashmir agriculture.

#### Acceptance Criteria

1. THE Vision_Service SHALL be trained on apple disease dataset including fungal, bacterial, and pest damage
2. THE Vision_Service SHALL be trained on rice disease dataset including blast and blight
3. THE Vision_Service SHALL be trained on wheat disease dataset including rust and smut
4. THE Vision_Service SHALL be trained on saffron disease dataset including corm rot
5. THE Vision_Service SHALL return confidence score with each disease prediction


### Requirement 59: Response Caching Strategy

**User Story:** As a system administrator, I want intelligent caching, so that API costs are minimized without sacrificing freshness.

#### Acceptance Criteria

1. THE RAASTA_System SHALL cache identical LLM queries for 24 hours
2. THE RAASTA_System SHALL cache mandi prices for 6 hours
3. THE RAASTA_System SHALL cache OCR results for identical document hashes for 1 hour
4. THE RAASTA_System SHALL not cache Sukoon check-in responses to maintain personalization
5. THE RAASTA_System SHALL implement cache invalidation when user explicitly requests fresh data

### Requirement 60: Mobile Network Optimization

**User Story:** As a user on slow mobile network, I want optimized data usage, so that RAASTA works on 2G/3G connections.

#### Acceptance Criteria

1. THE RAASTA_System SHALL compress images to maximum 2MB before upload
2. THE RAASTA_System SHALL use efficient image formats (WebP where supported)
3. THE RAASTA_System SHALL minimize JavaScript bundle size through code splitting
4. THE RAASTA_System SHALL lazy-load non-critical components
5. THE RAASTA_System SHALL display progress indicators for operations taking longer than 2 seconds

### Requirement 61: Accessibility for Low-Literacy Users

**User Story:** As a user with limited literacy, I want visual and voice-first design, so that I can use RAASTA without reading complex text.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use emoji icons for all mode cards for visual recognition
2. THE RAASTA_System SHALL use large touch targets (minimum 44x44px) for all interactive elements
3. THE RAASTA_System SHALL provide voice output automatically without requiring user to click play
4. THE RAASTA_System SHALL use simple, short UI labels in Roman Urdu
5. THE RAASTA_System SHALL minimize text-heavy interfaces in favor of voice and visual interactions


### Requirement 62: Cross-Browser Audio Compatibility

**User Story:** As a user on different browsers, I want voice features to work consistently, so that I can use RAASTA on any device.

#### Acceptance Criteria

1. THE Raah_Module SHALL detect browser support for SpeechRecognition and webkitSpeechRecognition
2. WHEN browser speech recognition is unavailable, THE Raah_Module SHALL hide the browser STT button
3. THE RAASTA_System SHALL handle MediaRecorder API differences between Chrome and Safari
4. THE RAASTA_System SHALL test audio recording on iOS Safari, Android Chrome, and desktop browsers
5. WHEN audio APIs are unavailable, THE RAASTA_System SHALL provide text-only fallback

### Requirement 63: Demo Content Realism

**User Story:** As a hackathon judge, I want realistic demo content, so that I can evaluate RAASTA's potential impact.

#### Acceptance Criteria

1. THE RAASTA_System SHALL provide demo responses that reflect actual use cases in rural Kashmir
2. THE RAASTA_System SHALL use authentic Roman Urdu and Kashmiri phrases in demo content
3. THE RAASTA_System SHALL include realistic government scheme names and details in demos
4. THE RAASTA_System SHALL simulate realistic processing delays in Demo_Mode
5. THE RAASTA_System SHALL maintain consistency between demo responses and actual API responses

### Requirement 64: API Key Security

**User Story:** As a system administrator, I want secure API key management, so that credentials are never exposed.

#### Acceptance Criteria

1. THE RAASTA_System SHALL read all API keys from server-side environment variables only
2. THE RAASTA_System SHALL never include API keys in client-side JavaScript bundles
3. THE RAASTA_System SHALL never log API keys to console or files
4. THE RAASTA_System SHALL use API routes for all external service calls requiring authentication
5. THE RAASTA_System SHALL provide .env.example file without actual key values


### Requirement 65: Home Screen Voice Shortcut

**User Story:** As a user, I want to quickly access voice assistant from home, so that I can ask questions immediately.

#### Acceptance Criteria

1. THE RAASTA_System SHALL display a prominent microphone button on the home screen
2. WHEN the home screen microphone button is pressed, THE RAASTA_System SHALL navigate to Raah_Module
3. THE RAASTA_System SHALL display explanatory text that mic button leads to Raah
4. THE RAASTA_System SHALL style the microphone button distinctively with Chinar color scheme
5. THE RAASTA_System SHALL position microphone button in a visually prominent location

### Requirement 66: Consistent Visual Branding

**User Story:** As a user, I want RAASTA to have a memorable visual identity, so that it feels like a cohesive product.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use Chinar leaf watermark on home screen as brand element
2. THE RAASTA_System SHALL use consistent color palette: Chinar amber, gold, deep, mist, and glow
3. THE RAASTA_System SHALL use "Chinar · Kashmir" tag on home screen
4. THE RAASTA_System SHALL use consistent border radius and shadow styles across all cards
5. THE RAASTA_System SHALL use display font for headings and regular font for body text

### Requirement 67: Mode Card Design

**User Story:** As a user, I want clear visual distinction between modes, so that I can quickly find the feature I need.

#### Acceptance Criteria

1. THE RAASTA_System SHALL display four mode cards on home screen: Samjho, Zameen, Taleem, Raah
2. THE RAASTA_System SHALL show emoji, title, subtitle, and "powered by" label for each mode card
3. THE RAASTA_System SHALL use hover effects on mode cards for interactive feedback
4. THE RAASTA_System SHALL arrange mode cards in 2x2 grid on mobile and adapt for larger screens
5. THE RAASTA_System SHALL use consistent card styling across home and Taleem hub pages


### Requirement 68: Voice Output Display Component

**User Story:** As a user, I want to see text responses while hearing them, so that I can read along if needed.

#### Acceptance Criteria

1. THE VoiceOutput component SHALL display response text in a styled card
2. THE VoiceOutput component SHALL show label identifying the response type
3. THE VoiceOutput component SHALL only render when response text is available
4. THE VoiceOutput component SHALL use readable typography with appropriate line height
5. THE VoiceOutput component SHALL support long responses with proper text wrapping

### Requirement 69: Microphone Button Component

**User Story:** As a user, I want an intuitive microphone button, so that I know how to start voice interaction.

#### Acceptance Criteria

1. THE MicButton component SHALL display a large, circular microphone icon
2. THE MicButton component SHALL support navigation to Raah page when navigateToRaah prop is true
3. THE MicButton component SHALL support direct activation callback when onActivate prop is provided
4. THE MicButton component SHALL use gradient background with Chinar colors
5. THE MicButton component SHALL provide visual feedback on hover and press

### Requirement 70: Image Uploader Component

**User Story:** As a user, I want easy image upload, so that I can quickly capture documents and crops.

#### Acceptance Criteria

1. THE ImageUploader component SHALL support both camera capture and file selection
2. THE ImageUploader component SHALL use environment-facing camera when capture="environment" prop is set
3. THE ImageUploader component SHALL display selected filename after upload
4. THE ImageUploader component SHALL accept image/* file types
5. THE ImageUploader component SHALL call onFile callback with selected File object


### Requirement 71: Taleem Voice Form Component

**User Story:** As a developer, I want a reusable voice form component, so that all Taleem features have consistent interaction patterns.

#### Acceptance Criteria

1. THE TaleemVoiceForm component SHALL provide textarea for text input
2. THE TaleemVoiceForm component SHALL provide submit button with customizable label
3. THE TaleemVoiceForm component SHALL display VoiceOutput component for responses
4. THE TaleemVoiceForm component SHALL handle loading states during API calls
5. THE TaleemVoiceForm component SHALL automatically speak responses using TTS_Service

### Requirement 72: Production API Endpoint Configuration

**User Story:** As a developer, I want configurable API endpoints, so that I can switch between development and production services.

#### Acceptance Criteria

1. THE RAASTA_System SHALL support environment variable for OCR service endpoint
2. THE RAASTA_System SHALL support environment variable for Vision service endpoint
3. THE RAASTA_System SHALL support environment variable for Mandi API endpoint
4. THE RAASTA_System SHALL support environment variable for TTS service endpoint
5. WHERE service endpoints are not configured, THE RAASTA_System SHALL use demo implementations

### Requirement 73: Comprehensive Error Messages

**User Story:** As a user, I want helpful error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN OCR fails, THE Samjho_Module SHALL suggest retaking photo with better lighting
2. WHEN vision analysis fails, THE Zameen_Module SHALL suggest taking clearer crop photo
3. WHEN transcription returns empty, THE Raah_Module SHALL suggest speaking louder or using text input
4. WHEN API key is missing, THE RAASTA_System SHALL explain that demo mode is active
5. THE RAASTA_System SHALL provide actionable next steps in all error messages


### Requirement 74: Taleem Hub Organization

**User Story:** As a youth user, I want clear organization of Taleem features, so that I can find the service I need.

#### Acceptance Criteria

1. THE Taleem_Module SHALL display three main pillars: Hunarmand, Sukoon, and Kaam Dhundo
2. THE Taleem_Module SHALL display four quick access shortcuts: Naukri, CV, Exam, Scholarship
3. THE Taleem_Module SHALL use card-based layout for visual hierarchy
4. THE Taleem_Module SHALL provide descriptive subtitles for each pillar and shortcut
5. THE Taleem_Module SHALL use consistent navigation patterns across all sub-features

### Requirement 75: Sub-Tab Navigation in Pillars

**User Story:** As a user, I want to explore different aspects of each Taleem pillar, so that I can access specific services.

#### Acceptance Criteria

1. THE Hunarmand_Module SHALL provide three tabs: Idea check, Schemes, Mentor
2. THE Sukoon_Module SHALL provide three tabs: Check-in, Peer stories, Helpline
3. THE Kaam_Module SHALL provide three tabs: Skill map, Gig board, Freelance
4. THE TaleemSubTabs component SHALL highlight the active tab
5. THE RAASTA_System SHALL maintain tab state when navigating within a pillar page

### Requirement 76: Voice-First Form Design

**User Story:** As a user, I want forms optimized for voice input, so that I can speak my responses naturally.

#### Acceptance Criteria

1. THE Taleem_Module SHALL provide placeholder examples in Roman Urdu for all input fields
2. THE Taleem_Module SHALL use textarea inputs to accommodate voice-transcribed text
3. THE Taleem_Module SHALL display field labels explaining what to say
4. THE Taleem_Module SHALL allow multi-line input for natural speech patterns
5. THE Taleem_Module SHALL provide submit buttons with action-oriented labels


### Requirement 77: CV Download Functionality

**User Story:** As a job seeker, I want to download my generated CV, so that I can edit and submit it to employers.

#### Acceptance Criteria

1. WHEN CV is generated, THE Taleem_Module SHALL display download button
2. WHEN download button is clicked, THE RAASTA_System SHALL create .txt file with CV content
3. THE RAASTA_System SHALL name downloaded file 'raasta-cv-en.txt'
4. THE RAASTA_System SHALL trigger browser download without requiring server storage
5. THE RAASTA_System SHALL use UTF-8 encoding for downloaded file

### Requirement 78: Exam Practice Question Bank

**User Story:** As a student, I want practice questions for exam preparation, so that I can test my knowledge.

#### Acceptance Criteria

1. THE Exam_Module SHALL display at least one demo question for JKSSB General Knowledge
2. THE Exam_Module SHALL format questions with multiple choice options
3. THE Exam_Module SHALL accept answers in Urdu, English, or mixed language
4. THE Exam_Module SHALL provide feedback comparing answer to correct response
5. THE Exam_Module SHALL allow future expansion to question bank with multiple questions

### Requirement 79: Scholarship OCR Specialization

**User Story:** As a student, I want accurate marksheet reading, so that scholarship matching is based on correct information.

#### Acceptance Criteria

1. THE OCR_Service SHALL extract marks, subjects, class, board, and year from marksheet images
2. THE OCR_Service SHALL handle JKBOSE, CBSE, and other Indian board marksheet formats
3. WHEN marks are in tabular format, THE OCR_Service SHALL preserve structure
4. THE Scholarship_Module SHALL calculate aggregate percentage from extracted marks
5. THE Scholarship_Module SHALL infer stream (Science, Arts, Commerce) from subject names


### Requirement 80: Skill Mapping Intelligence

**User Story:** As a person with informal skills, I want to understand how my abilities translate to job opportunities, so that I can find work.

#### Acceptance Criteria

1. WHEN informal skill is described, THE Kaam_Module SHALL map it to formal job title
2. THE Kaam_Module SHALL suggest local opportunities in Kashmir region
3. THE Kaam_Module SHALL suggest online opportunities on platforms like Fiverr
4. THE Kaam_Module SHALL provide guidance on how to present skills professionally
5. THE Kaam_Module SHALL reference other Taleem features (Freelance guide) for next steps

### Requirement 81: Gig Board Recommendations

**User Story:** As a gig worker, I want current gig opportunities, so that I can find flexible work.

#### Acceptance Criteria

1. THE Kaam_Module SHALL suggest delivery partner opportunities with app-based platforms
2. THE Kaam_Module SHALL suggest tourism-related gigs during season
3. THE Kaam_Module SHALL suggest remote data entry and transcription opportunities
4. THE Kaam_Module SHALL mention trusted job portals and Facebook groups
5. THE Kaam_Module SHALL include safety guidance with each gig type

### Requirement 82: Business Idea Validation

**User Story:** As an aspiring entrepreneur, I want honest feedback on my business idea, so that I can assess viability.

#### Acceptance Criteria

1. WHEN business idea is submitted, THE Hunarmand_Module SHALL assess market reality
2. THE Hunarmand_Module SHALL identify potential competition
3. THE Hunarmand_Module SHALL suggest 2-3 concrete first steps
4. THE Hunarmand_Module SHALL mention relevant regulations (FSSAI, licensing) where applicable
5. THE Hunarmand_Module SHALL use encouraging but realistic tone in Roman Urdu


### Requirement 83: Scheme Matching Logic

**User Story:** As a user seeking government support, I want relevant scheme recommendations, so that I can access programs I'm eligible for.

#### Acceptance Criteria

1. WHEN age and location are provided, THE Hunarmand_Module SHALL filter schemes by eligibility
2. THE Hunarmand_Module SHALL suggest central schemes (PM Mudra, Mission YUVA) and state schemes (J&K startup)
3. THE Hunarmand_Module SHALL explain basic eligibility criteria for each scheme
4. THE Hunarmand_Module SHALL provide next steps for application process
5. THE Hunarmand_Module SHALL direct users to DIC or CSC for application assistance

### Requirement 84: Emotional Support Quality

**User Story:** As a user sharing feelings, I want empathetic responses, so that I feel heard and supported.

#### Acceptance Criteria

1. WHEN emotional distress is shared, THE Sukoon_Module SHALL acknowledge feelings without judgment
2. THE Sukoon_Module SHALL normalize common youth struggles (unemployment, family pressure)
3. THE Sukoon_Module SHALL provide one simple coping technique per response
4. THE Sukoon_Module SHALL suggest actionable next steps (using Kaam module, talking to friend)
5. THE Sukoon_Module SHALL maintain warm, supportive tone while avoiding clinical language

### Requirement 85: Peer Story Authenticity

**User Story:** As a user reading peer stories, I want authentic narratives, so that I can relate to others' experiences.

#### Acceptance Criteria

1. THE Sukoon_Module SHALL display stories written in first-person voice
2. THE Sukoon_Module SHALL include specific struggles (job search, family expectations)
3. THE Sukoon_Module SHALL include coping strategies that worked for the storyteller
4. THE Sukoon_Module SHALL use conversational Roman Urdu in stories
5. THE Sukoon_Module SHALL format stories with title and body for easy reading


### Requirement 86: Helpline Information Accuracy

**User Story:** As a user in crisis, I want accurate helpline numbers, so that I can reach professional support.

#### Acceptance Criteria

1. THE Sukoon_Module SHALL display Vandrevala Foundation helpline: 9999666555
2. THE Sukoon_Module SHALL display iCall (TISS) helpline: 9152987821
3. THE Sukoon_Module SHALL provide clickable phone links for one-tap calling
4. THE Sukoon_Module SHALL mention emergency services (112) for immediate danger
5. THE Sukoon_Module SHALL include disclaimer to verify numbers on official websites

### Requirement 87: Job Orientation Realism

**User Story:** As a job seeker, I want realistic guidance, so that I have appropriate expectations.

#### Acceptance Criteria

1. THE Naukri_Module SHALL explain competitive nature of government jobs
2. THE Naukri_Module SHALL mention typical recruitment cycles and timelines
3. THE Naukri_Module SHALL suggest exam preparation strategies
4. THE Naukri_Module SHALL reference official portals as source of truth
5. THE Naukri_Module SHALL encourage using Exam prep feature for practice

### Requirement 88: Freelance Platform Specificity

**User Story:** As a new freelancer, I want platform-specific guidance, so that I can succeed on Fiverr or Upwork.

#### Acceptance Criteria

1. THE Kaam_Module SHALL explain differences between Fiverr and Upwork
2. THE Kaam_Module SHALL recommend starting with Fiverr for beginners
3. THE Kaam_Module SHALL provide profile creation steps in order
4. THE Kaam_Module SHALL suggest pricing strategy for first gigs
5. THE Kaam_Module SHALL explain importance of reviews and ratings


### Requirement 89: Document Type Recognition

**User Story:** As a user, I want RAASTA to recognize different document types, so that explanations are contextually appropriate.

#### Acceptance Criteria

1. THE Samjho_Module SHALL identify government notices, forms, letters, and legal documents
2. WHEN document type is identified, THE LLM_Service SHALL tailor explanation style accordingly
3. THE Samjho_Module SHALL extract and highlight deadlines from time-sensitive documents
4. THE Samjho_Module SHALL identify required actions and next steps
5. THE Samjho_Module SHALL suggest which office or authority to contact

### Requirement 90: Crop Type Recognition

**User Story:** As a farmer, I want RAASTA to identify my crop type, so that advice is specific to what I'm growing.

#### Acceptance Criteria

1. THE Vision_Service SHALL identify crop type (apple, rice, wheat, saffron) from image
2. WHEN crop type is identified, THE Zameen_Module SHALL provide crop-specific disease information
3. THE Zameen_Module SHALL provide crop-specific treatment recommendations
4. THE Zameen_Module SHALL fetch mandi prices for the identified crop type
5. WHEN crop type cannot be determined, THE Zameen_Module SHALL ask user to specify crop

### Requirement 91: Treatment Timing Guidance

**User Story:** As a farmer, I want to know when to apply treatments, so that I can act before it's too late.

#### Acceptance Criteria

1. WHEN disease is detected, THE Zameen_Module SHALL specify treatment urgency (within X days)
2. THE Zameen_Module SHALL explain consequences of delayed treatment
3. THE Zameen_Module SHALL suggest preventive measures for future seasons
4. THE Zameen_Module SHALL mention weather considerations for treatment application
5. THE Zameen_Module SHALL suggest consulting agricultural extension officer for severe cases


### Requirement 92: Mandi Price Display Format

**User Story:** As a farmer, I want clear price information, so that I can quickly understand market rates.

#### Acceptance Criteria

1. THE Zameen_Module SHALL display mandi name with price (e.g., "Sopore mandi — apple ~₹42/kg")
2. THE Zameen_Module SHALL use Indian Rupee symbol (₹) for all prices
3. THE Zameen_Module SHALL display price per kilogram as standard unit
4. WHEN price is approximate or cached, THE Zameen_Module SHALL use tilde (~) indicator
5. THE Zameen_Module SHALL include price timestamp when displaying cached data

### Requirement 93: Voice Recording Duration Limits

**User Story:** As a user, I want appropriate recording limits, so that I can express complete thoughts without hitting arbitrary cutoffs.

#### Acceptance Criteria

1. THE Raah_Module SHALL allow audio recording up to 60 seconds duration
2. WHEN recording approaches 60 seconds, THE Raah_Module SHALL display warning
3. WHEN 60 seconds is reached, THE Raah_Module SHALL automatically stop recording
4. THE RAAH_Module SHALL display elapsed time during recording
5. THE Raah_Module SHALL allow manual stop before time limit

### Requirement 94: Browser Speech Recognition Configuration

**User Story:** As a user, I want browser voice recognition optimized for my language, so that transcription is accurate.

#### Acceptance Criteria

1. THE Raah_Module SHALL configure browser speech recognition with 'hi-IN' language code
2. THE Raah_Module SHALL set continuous to false for single-utterance capture
3. THE Raah_Module SHALL set interimResults to false for final transcription only
4. WHEN recognition completes, THE Raah_Module SHALL automatically submit transcribed text
5. THE Raah_Module SHALL handle recognition errors by suggesting retry or text input


### Requirement 95: TTS Voice Configuration

**User Story:** As a user, I want natural-sounding voice output, so that listening to responses is pleasant.

#### Acceptance Criteria

1. THE TTS_Service SHALL configure speech rate to 0.92 for natural pacing
2. THE TTS_Service SHALL use 'hi-IN' language code for Urdu/Hindi content
3. THE TTS_Service SHALL cancel any playing speech before starting new output
4. THE TTS_Service SHALL handle TTS errors gracefully without blocking user interface
5. WHERE cloud TTS is available, THE TTS_Service SHALL use higher quality voices than browser default

### Requirement 96: Resource Cleanup

**User Story:** As a user, I want the app to manage device resources properly, so that it doesn't drain battery or memory.

#### Acceptance Criteria

1. WHEN user navigates away from Raah page, THE RAASTA_System SHALL stop any active audio recording
2. WHEN user navigates away from any page, THE RAASTA_System SHALL cancel any playing TTS
3. THE RAASTA_System SHALL release microphone access when recording completes
4. THE RAASTA_System SHALL release camera access after image capture
5. THE RAASTA_System SHALL clean up MediaStream tracks when components unmount

### Requirement 97: API Route Structure

**User Story:** As a developer, I want well-organized API routes, so that backend logic is maintainable.

#### Acceptance Criteria

1. THE RAASTA_System SHALL implement /api/llm route for all LLM requests
2. THE RAASTA_System SHALL implement /api/transcribe route for Whisper transcription
3. THE RAASTA_System SHALL use POST method for all API routes
4. THE RAASTA_System SHALL validate request payloads and return 400 for invalid requests
5. THE RAASTA_System SHALL return JSON responses with consistent structure


### Requirement 98: LLM Request Routing

**User Story:** As a developer, I want centralized LLM routing, so that all AI requests go through a single endpoint.

#### Acceptance Criteria

1. THE /api/llm route SHALL handle mode parameter to route requests (samjho, zameen, raah, taleem)
2. THE /api/llm route SHALL construct appropriate system and user prompts based on mode
3. THE /api/llm route SHALL return demo responses when OPENAI_API_KEY is not configured
4. THE /api/llm route SHALL include usedModel flag in response indicating Production_Mode or Demo_Mode
5. THE /api/llm route SHALL handle Taleem sub-routing based on pillar and sub parameters

### Requirement 99: Whisper API Integration

**User Story:** As a user, I want accurate voice transcription, so that my spoken questions are understood correctly.

#### Acceptance Criteria

1. THE /api/transcribe route SHALL accept audio file via multipart form data
2. THE /api/transcribe route SHALL forward audio to OpenAI Whisper API with model 'whisper-1'
3. THE /api/transcribe route SHALL return transcribed text in response
4. WHEN OPENAI_API_KEY is not configured, THE /api/transcribe route SHALL return empty text with demo flag
5. THE /api/transcribe route SHALL handle Whisper API errors and return 502 status

### Requirement 100: Client-Side API Wrappers

**User Story:** As a developer, I want clean client-side API functions, so that components can easily call backend services.

#### Acceptance Criteria

1. THE RAASTA_System SHALL provide explainDocumentSimpleUrdu function in llm.ts for Samjho
2. THE RAASTA_System SHALL provide explainCropAdvice function in llm.ts for Zameen
3. THE RAASTA_System SHALL provide answerVoiceQuestion function in llm.ts for Raah
4. THE RAASTA_System SHALL provide taleemLlm function in taleemApi.ts for Taleem
5. THE RAASTA_System SHALL provide transcribeAudio function in whisper.ts for voice input


### Requirement 101: Production OCR Service Selection

**User Story:** As a system administrator, I want to choose between OCR providers, so that I can optimize for cost and accuracy.

#### Acceptance Criteria

1. THE RAASTA_System SHALL support Google Cloud Vision API for high-accuracy OCR
2. THE RAASTA_System SHALL support Tesseract.js for client-side OCR without API costs
3. THE RAASTA_System SHALL support environment variable to select OCR provider
4. WHEN Google Cloud Vision is used, THE OCR_Service SHALL handle authentication via service account
5. WHEN Tesseract.js is used, THE OCR_Service SHALL load language data for Urdu, Hindi, and English

### Requirement 102: Production Vision Service Selection

**User Story:** As a system administrator, I want to choose between vision providers, so that I can optimize for accuracy and cost.

#### Acceptance Criteria

1. THE RAASTA_System SHALL support Roboflow API for crop disease detection
2. THE RAASTA_System SHALL support custom trained model deployment
3. THE RAASTA_System SHALL support environment variable to select vision provider
4. WHEN Roboflow is used, THE Vision_Service SHALL handle API authentication
5. WHEN custom model is used, THE Vision_Service SHALL support model endpoint configuration

### Requirement 103: Production TTS Service Selection

**User Story:** As a system administrator, I want to choose between TTS providers, so that I can balance quality and cost.

#### Acceptance Criteria

1. THE RAASTA_System SHALL support ElevenLabs API for high-quality natural voices
2. THE RAASTA_System SHALL support Google Cloud TTS for multilingual support
3. THE RAASTA_System SHALL support browser speechSynthesis as free fallback
4. THE RAASTA_System SHALL support environment variable to select TTS provider
5. WHEN cloud TTS is used, THE TTS_Service SHALL handle API authentication and voice selection


### Requirement 104: Image Compression Implementation

**User Story:** As a user on slow network, I want images compressed before upload, so that uploads complete quickly.

#### Acceptance Criteria

1. WHEN image exceeds 2MB, THE RAASTA_System SHALL compress it using canvas API
2. THE RAASTA_System SHALL maintain aspect ratio during compression
3. THE RAASTA_System SHALL target 80% JPEG quality for compressed images
4. THE RAASTA_System SHALL preserve sufficient quality for OCR and vision analysis
5. THE RAASTA_System SHALL display compression progress for large images

### Requirement 105: Mandi API Integration Strategy

**User Story:** As a developer, I want clear mandi API integration, so that price data is reliable and current.

#### Acceptance Criteria

1. THE RAASTA_System SHALL integrate with Agmarknet API or data.gov.in agricultural APIs
2. THE RAASTA_System SHALL filter mandi data for Jammu & Kashmir state
3. THE RAASTA_System SHALL map crop names from vision output to mandi commodity codes
4. THE RAASTA_System SHALL handle API authentication for government data portals
5. WHERE mandi API is unavailable, THE Zameen_Module SHALL use demo price data

### Requirement 106: Language Detection Logic

**User Story:** As a multilingual user, I want RAASTA to detect my language automatically, so that I don't need to configure settings.

#### Acceptance Criteria

1. THE LLM_Service SHALL detect language from user input text patterns
2. WHEN input contains Urdu/Hindi words, THE LLM_Service SHALL respond in Roman Urdu
3. WHEN input contains Kashmiri phrases, THE LLM_Service SHALL include Kashmiri Latin script in response
4. WHEN input is in English, THE LLM_Service SHALL respond in Roman Urdu by default for consistency
5. THE RAASTA_System SHALL maintain detected language for TTS voice selection


### Requirement 107: Demo Mode Indicators

**User Story:** As a hackathon presenter, I want clear indication of demo mode, so that judges understand when real APIs are active.

#### Acceptance Criteria

1. WHERE Demo_Mode is active, THE RAASTA_System SHALL display subtle indicator on home screen
2. THE RAASTA_System SHALL include demo mode status in API responses
3. THE RAASTA_System SHALL log to console when operating in Demo_Mode
4. THE RAASTA_System SHALL not display intrusive demo warnings that disrupt user experience
5. THE RAASTA_System SHALL allow seamless switching to Production_Mode by adding API keys

### Requirement 108: Consistent Loading Messages

**User Story:** As a user, I want to understand what's happening during processing, so that I know the app is working.

#### Acceptance Criteria

1. THE Samjho_Module SHALL display "Padh rahe hain…" during OCR and explanation
2. THE Zameen_Module SHALL display "Dekh rahe hain…" during vision analysis
3. THE Raah_Module SHALL display "Soch rahe hain…" during LLM processing
4. THE Taleem_Module SHALL display context-appropriate loading messages for each feature
5. THE RAASTA_System SHALL use consistent Roman Urdu terminology across all loading states

### Requirement 109: Button State Management

**User Story:** As a user, I want buttons to clearly show when they're disabled, so that I understand when I can interact.

#### Acceptance Criteria

1. THE RAASTA_System SHALL disable submit buttons when required input is missing
2. THE RAASTA_System SHALL disable submit buttons during processing
3. THE RAASTA_System SHALL use visual styling to indicate disabled state
4. THE RAASTA_System SHALL re-enable buttons when processing completes
5. THE RAASTA_System SHALL prevent double-submission through button state management


### Requirement 110: Responsive Grid Layouts

**User Story:** As a user on different screen sizes, I want layouts that adapt to my device, so that RAASTA looks good everywhere.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use 2-column grid for mode cards on mobile screens
2. THE RAASTA_System SHALL adapt grid layouts for tablet and desktop screens
3. THE RAASTA_System SHALL use responsive spacing (sm: variants) for different breakpoints
4. THE RAASTA_System SHALL maintain readability at all screen sizes
5. THE RAASTA_System SHALL test layouts on screens from 320px to 1920px width

### Requirement 111: CSS Custom Properties

**User Story:** As a developer, I want centralized color management, so that visual consistency is easy to maintain.

#### Acceptance Criteria

1. THE RAASTA_System SHALL define CSS custom properties for all Chinar colors
2. THE RAASTA_System SHALL define custom properties for text colors (ink, muted)
3. THE RAASTA_System SHALL define custom properties for border radius values
4. THE RAASTA_System SHALL use custom properties consistently across all components
5. THE RAASTA_System SHALL define custom properties in globals.css

### Requirement 112: Tailwind Utility Classes

**User Story:** As a developer, I want consistent styling utilities, so that UI development is efficient.

#### Acceptance Criteria

1. THE RAASTA_System SHALL define .raasta-btn-primary class for primary action buttons
2. THE RAASTA_System SHALL define .raasta-btn-secondary class for secondary buttons
3. THE RAASTA_System SHALL define .raasta-card class for content cards
4. THE RAASTA_System SHALL define .raasta-input class for form inputs
5. THE RAASTA_System SHALL define .raasta-section-label class for section headers


### Requirement 113: Font Configuration

**User Story:** As a user, I want readable typography, so that text is easy to read on mobile screens.

#### Acceptance Criteria

1. THE RAASTA_System SHALL use display font for headings and titles
2. THE RAASTA_System SHALL use regular font for body text and UI labels
3. THE RAASTA_System SHALL configure appropriate font weights (regular, medium, semibold)
4. THE RAASTA_System SHALL use appropriate line heights for readability
5. THE RAASTA_System SHALL ensure fonts load efficiently without blocking render

### Requirement 114: Icon and Asset Management

**User Story:** As a developer, I want organized assets, so that icons and images are easy to manage.

#### Acceptance Criteria

1. THE RAASTA_System SHALL store SVG icons in public/icons.svg sprite
2. THE RAASTA_System SHALL use emoji for mode and feature icons
3. THE RAASTA_System SHALL include Chinar leaf SVG component for branding
4. THE RAASTA_System SHALL optimize all images for web delivery
5. THE RAASTA_System SHALL use appropriate image formats (SVG for icons, PNG/WebP for photos)

### Requirement 115: Next.js Configuration

**User Story:** As a developer, I want proper Next.js configuration, so that the app builds and deploys correctly.

#### Acceptance Criteria

1. THE RAASTA_System SHALL configure TypeScript in next.config.ts
2. THE RAASTA_System SHALL configure image optimization settings
3. THE RAASTA_System SHALL configure API route handling
4. THE RAASTA_System SHALL configure environment variable access
5. THE RAASTA_System SHALL configure production build optimizations


### Requirement 116: ESLint Configuration

**User Story:** As a developer, I want code quality checks, so that the codebase maintains high standards.

#### Acceptance Criteria

1. THE RAASTA_System SHALL configure ESLint with Next.js recommended rules
2. THE RAASTA_System SHALL configure TypeScript ESLint rules
3. THE RAASTA_System SHALL configure React Hooks ESLint rules
4. THE RAASTA_System SHALL pass 'npm run lint' without errors
5. THE RAASTA_System SHALL enforce consistent code style across all files

### Requirement 117: TypeScript Configuration

**User Story:** As a developer, I want strict TypeScript settings, so that type errors are caught early.

#### Acceptance Criteria

1. THE RAASTA_System SHALL enable strict mode in tsconfig.json
2. THE RAASTA_System SHALL configure path aliases for clean imports
3. THE RAASTA_System SHALL configure JSX support for React
4. THE RAASTA_System SHALL configure module resolution for Next.js
5. THE RAASTA_System SHALL compile without TypeScript errors

### Requirement 118: Git Configuration

**User Story:** As a developer, I want proper version control setup, so that collaboration is smooth.

#### Acceptance Criteria

1. THE RAASTA_System SHALL include .gitignore for node_modules, .next, and .env files
2. THE RAASTA_System SHALL not commit API keys or sensitive data
3. THE RAASTA_System SHALL include .env.example in repository
4. THE RAASTA_System SHALL organize code in logical directory structure
5. THE RAASTA_System SHALL include README with setup instructions


### Requirement 119: README Documentation

**User Story:** As a new developer, I want clear documentation, so that I can set up and run RAASTA quickly.

#### Acceptance Criteria

1. THE README SHALL explain the project purpose and target users
2. THE README SHALL document all four modes (Samjho, Zameen, Taleem, Raah)
3. THE README SHALL provide setup instructions including npm install and environment variables
4. THE README SHALL document the tech stack and folder structure
5. THE README SHALL include commands for development, build, and production

### Requirement 120: Hackathon Presentation Readiness

**User Story:** As a hackathon presenter, I want the app ready for live demo, so that I can deliver a compelling presentation.

#### Acceptance Criteria

1. THE RAASTA_System SHALL complete all demo workflows within 5 seconds each
2. THE RAASTA_System SHALL work reliably without internet when in Demo_Mode
3. THE RAASTA_System SHALL provide consistent demo outputs for repeatable presentations
4. THE RAASTA_System SHALL support the 5-step demo script from specification document
5. THE RAASTA_System SHALL display polished UI worthy of design track consideration

---

## Implementation Priority

The requirements are organized to support incremental development:

**Phase 1 - Core Functionality (Complete):**
- Requirements 9, 10, 23, 33, 53, 65-70, 74-76, 97-100, 108-118

**Phase 2 - Production API Integration (High Priority):**
- Requirements 1-6, 56, 58, 72, 101-103, 105

**Phase 3 - Enhanced Features (Medium Priority):**
- Requirements 8, 11-15, 35-49, 77-95

**Phase 4 - Optimization & Polish (Lower Priority):**
- Requirements 7, 16-22, 24-34, 50-52, 59-64, 73, 96, 104, 106-107, 119-120

