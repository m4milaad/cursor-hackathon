# Implementation Plan: RAASTA AI Companion

## Overview

This implementation plan converts the RAASTA AI Companion from a functional prototype with demo data into a production-ready application. The focus is on integrating external APIs (OpenAI, Google Cloud Vision, Roboflow, ElevenLabs, Agmarknet), implementing performance optimizations, adding comprehensive error handling, and ensuring deployment readiness while maintaining offline-first demo capability for presentations.

The implementation follows an incremental approach where each task builds on previous work, with checkpoints to validate functionality. All tasks reference specific requirements for traceability.

## Tasks

- [x] 1. Set up environment configuration and API integration foundation
  - Create comprehensive .env.example file documenting all API keys and configuration options
  - Implement environment variable validation utility that checks for required keys
  - Add ServiceConfig type and provider selection logic based on available API keys
  - Create demo mode detection utility that returns boolean based on API key presence
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 6.5_

- [x] 2. Implement production OCR service with Google Cloud Vision
  - [x] 2.1 Create Google Cloud Vision API integration in src/lib/ocr.ts
    - Implement extractTextFromImage function with Google Cloud Vision API calls
    - Add image preprocessing and compression before API submission
    - Implement accuracy validation and confidence scoring
    - Add fallback to Tesseract.js when Google Vision fails or is unavailable
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 16.1_

  - [x] 2.2 Write property test for OCR accuracy threshold
    - **Property 1: OCR Accuracy Threshold**
    - **Validates: Requirements 1.1**

  - [x] 2.3 Implement OCR error handling with Roman Urdu messages
    - Add error message mapping for OCR failures
    - Implement retry logic with exponential backoff
    - Add user-friendly error display in Samjho page
    - _Requirements: 1.2, 7.1, 7.3_

  - [x] 2.4 Write unit tests for OCR service
    - Test image validation and size limits
    - Test demo mode fallback behavior
    - Test error handling for corrupted images
    - _Requirements: 1.2, 1.5, 9.3_


- [x] 3. Implement production Vision AI service for crop disease detection
  - [x] 3.1 Create Roboflow API integration in src/lib/vision.ts
    - Implement analyzeCropImage function with Roboflow API calls
    - Add support for apple, rice, wheat, and saffron crop detection
    - Implement confidence scoring and disease identification
    - Add custom model fallback option
    - _Requirements: 2.1, 2.2, 2.4, 2.6, 40.1_

  - [x] 3.2 Write property test for vision model accuracy
    - **Property 4: Vision Model Accuracy Threshold**
    - **Validates: Requirements 2.1**

  - [x] 3.3 Implement treatment recommendations in local languages
    - Add disease-to-treatment mapping database
    - Implement treatment timing and preventive measures logic
    - Format recommendations for voice output
    - _Requirements: 2.3, 40.2, 40.3, 40.4, 40.5_

  - [x] 3.4 Write unit tests for vision service
    - Test image preprocessing and compression
    - Test demo mode fallback with contextual responses
    - Test error handling for unsupported crops
    - _Requirements: 2.5, 16.1, 29.1_

- [x] 4. Integrate real-time Mandi price API
  - [x] 4.1 Create Agmarknet API integration in src/lib/mandi.ts
    - Implement getPriceForCrop function with Agmarknet API calls
    - Add support for Kashmir mandis (Sopore, Srinagar, Anantnag)
    - Implement price formatting in ₹/kg format
    - Add error handling for unavailable price data
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 4.2 Implement mandi price caching with 6-hour expiry
    - Create in-memory cache with timestamp tracking
    - Implement cache key generation based on crop and region
    - Add cache expiry logic (6 hours)
    - Display stale price with timestamp when fresh data unavailable
    - _Requirements: 3.3, 3.4_

  - [x] 4.3 Write property test for mandi price caching
    - **Property 8: Mandi Price Caching Duration**
    - **Validates: Requirements 3.4**

  - [x] 4.4 Write unit tests for mandi service
    - Test price format consistency
    - Test cache hit and miss scenarios
    - Test stale price display with timestamps
    - _Requirements: 3.3, 3.5_


- [x] 5. Enhance TTS service with natural voice providers
  - [x] 5.1 Implement ElevenLabs TTS integration in src/lib/tts.ts
    - Add ElevenLabs API integration for natural voice synthesis
    - Implement voice selection for Urdu, Hindi, and Kashmiri
    - Add Google Cloud TTS as secondary provider
    - Maintain browser speechSynthesis as fallback
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.2 Implement TTS performance optimization and controls
    - Add audio synthesis caching for repeated text
    - Implement stopSpeaking function with immediate cancellation
    - Add playback state management
    - Ensure TTS completes within 3 seconds for <500 character responses
    - _Requirements: 4.4, 4.5, 10.4_

  - [x] 5.3 Write property test for TTS performance
    - **Property 10: TTS Performance**
    - **Validates: Requirements 4.4**

  - [x] 5.3 Implement TTS language matching and session consistency
    - Add language detection from user input
    - Match TTS language to detected input language
    - Maintain language consistency within conversation sessions
    - _Requirements: 8.4, 8.5, 22.1_

  - [x] 5.4 Write unit tests for TTS service
    - Test provider fallback chain
    - Test playback control and cancellation
    - Test language selection logic
    - _Requirements: 4.3, 4.5, 8.4_

- [x] 6. Checkpoint - Ensure core API integrations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement production Whisper transcription service
  - [x] 7.1 Create OpenAI Whisper API integration in src/lib/whisper.ts
    - Implement transcribeAudio function with OpenAI Whisper API
    - Add support for Urdu, Hindi, and Kashmiri transcription
    - Implement audio format validation (WebM, MP3, WAV)
    - Add file size validation (max 25MB)
    - _Requirements: 5.1, 5.3, 37.1, 37.2, 37.5_

  - [x] 7.2 Write property test for Whisper performance
    - **Property 13: Whisper Performance**
    - **Validates: Requirements 5.3**

  - [x] 7.3 Implement Whisper error handling and fallbacks
    - Add error messages suggesting text input alternative
    - Implement demo mode with empty transcription flag
    - Add retry logic for transient failures
    - _Requirements: 5.2, 5.4, 12.1_

  - [x] 7.4 Write unit tests for Whisper service
    - Test audio format handling and conversion
    - Test demo mode behavior
    - Test error handling for oversized files
    - _Requirements: 5.4, 37.3, 37.5_


- [x] 8. Enhance LLM service with production prompts and quality controls
  - [x] 8.1 Implement production LLM prompts in src/lib/llm.ts
    - Update explainDocumentSimpleUrdu with "Samjho, powered by HAQQ" system prompt
    - Update explainCropAdvice with "Zameen, powered by WADI" system prompt
    - Update answerVoiceQuestion with "Raah" system prompt including Kashmir context
    - Add voice-friendly output formatting instructions to all prompts
    - _Requirements: 35.1, 35.2, 35.3, 35.5, 38.1, 38.3, 38.4, 38.5_

  - [x] 8.2 Implement language detection and response matching
    - Add language detection logic for Urdu, Hindi, and Kashmiri input
    - Implement response generation in matching language and script
    - Add default to Roman Urdu when language cannot be detected
    - Ensure session language consistency
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 11.1_

  - [x] 8.3 Write property test for language detection
    - **Property 21: Language Detection and Response Matching**
    - **Validates: Requirements 8.1**

  - [x] 8.4 Implement response quality controls
    - Add word count limiting to 200 words for voice output
    - Add Kashmir-specific context (locations, schemes, climate)
    - Add scheme information disclaimers
    - Remove markdown formatting from voice responses
    - _Requirements: 11.2, 11.3, 11.4, 38.1, 38.2_

  - [x] 8.5 Write property test for voice-friendly response length
    - **Property 32: Voice-Friendly Response Length**
    - **Validates: Requirements 11.3, 38.2**

  - [x] 8.6 Write unit tests for LLM service
    - Test prompt construction for each mode
    - Test language detection accuracy
    - Test response formatting and length limits
    - _Requirements: 8.1, 11.3, 35.1, 35.2, 35.3_

- [x] 9. Implement comprehensive error handling system
  - [x] 9.1 Create error handling utilities in src/lib/errors.ts
    - Define ServiceError and ValidationError types
    - Implement error message mapping to Roman Urdu
    - Create error logging utility with timestamp and service tracking
    - Add PII filtering for log entries
    - _Requirements: 7.1, 7.5, 20.5, 27.1, 27.3_

  - [x] 9.2 Write property test for error messages in Roman Urdu
    - **Property 18: Error Messages in Roman Urdu**
    - **Validates: Requirements 7.1**

  - [x] 9.3 Implement retry logic and context preservation
    - Add retry mechanism with exponential backoff for API failures
    - Preserve form data and user context on failures
    - Implement network offline detection and messaging
    - _Requirements: 7.3, 7.4, 19.1_

  - [x] 9.4 Write unit tests for error handling
    - Test error message localization
    - Test retry logic and backoff timing
    - Test context preservation on failure
    - _Requirements: 7.1, 7.3, 20.5_


- [-] 10. Implement performance optimizations
  - [ ] 10.1 Create image compression utility in src/lib/imageCompression.ts
    - Implement client-side image compression to <10MB for upload
    - Add compression to <2MB for external API submissions
    - Implement quality-based compression with fallback
    - Add image format conversion (HEIC to JPEG)
    - _Requirements: 9.3, 16.1, 34.3_

  - [ ] 10.2 Write property test for image compression
    - **Property 24: Image Compression Threshold**
    - **Validates: Requirements 9.3**

  - [ ] 10.3 Implement response caching system in src/lib/cache.ts
    - Create in-memory cache for LLM responses (1 hour expiry)
    - Implement cache key generation using request hashing
    - Add cache for OCR results (1 hour expiry)
    - Integrate mandi price cache from task 4.2
    - _Requirements: 16.2, 25.4, 35.1_

  - [ ] 10.4 Write property test for query response caching
    - **Property 35: Query Response Caching**
    - **Validates: Requirements 16.2**

  - [ ] 10.5 Implement parallel API execution and loading states
    - Refactor workflows to execute independent API calls in parallel
    - Add loading state indicators that appear within 100ms
    - Optimize critical path for <15 second end-to-end workflows
    - _Requirements: 16.3, 16.4, 16.5_

  - [ ] 10.6 Write property test for end-to-end performance
    - **Property 37: End-to-End Workflow Performance**
    - **Validates: Requirements 16.5**

  - [ ] 10.7 Write unit tests for performance optimizations
    - Test image compression quality and size
    - Test cache hit/miss scenarios
    - Test parallel execution timing
    - _Requirements: 16.1, 16.2, 16.4_

- [~] 11. Checkpoint - Ensure performance targets are met
  - Ensure all tests pass, ask the user if questions arise.


- [~] 12. Enhance demo mode with intelligent fallbacks
  - [ ] 12.1 Implement contextual demo responses in src/lib/demoLocalized.ts
    - Add keyword detection for PM Kisan, yojana, seb, fasal, kagaz, notice
    - Create contextually relevant demo responses for each keyword category
    - Implement realistic processing delays (500-1500ms)
    - Add demo mode visual indicators to UI
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 36.1, 36.2, 36.3, 36.4_

  - [ ] 12.2 Write property test for demo mode activation
    - **Property 14: Demo Mode Activation**
    - **Validates: Requirements 6.1**

  - [ ] 12.3 Implement demo mode for all Taleem features
    - Add demo responses for Hunarmand business coaching
    - Add demo responses for Sukoon mental health support
    - Add demo responses for Kaam Dhundo job matching
    - Add demo responses for quick access features (Naukri, CV, Exam, Scholarship)
    - _Requirements: 36.5, 12.1, 12.2, 13.1, 14.1, 15.1_

  - [ ] 12.4 Write unit tests for demo mode
    - Test keyword detection and routing
    - Test processing delay ranges
    - Test demo mode indicator display
    - _Requirements: 6.2, 6.3, 6.4_

- [~] 13. Implement Taleem module features
  - [ ] 13.1 Implement Hunarmand business coaching in src/app/taleem/hunarmand/page.tsx
    - Create voice form for business idea submission
    - Implement market assessment LLM prompt
    - Add actionable first steps generation
    - Add scheme matching (PM Mudra, Mission YUVA, J&K startup)
    - Display mentor contact information (DIC, JKEDI)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 13.2 Implement Sukoon mental health support in src/app/taleem/sukoon/page.tsx
    - Create empathetic response system with normalization
    - Add grounding techniques (breathing exercises)
    - Display crisis helpline numbers (Vandrevala, iCall)
    - Add medical disclaimer
    - Implement self-harm keyword detection with prominent helpline display
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 13.3 Implement Kaam Dhundo job matching in src/app/taleem/kaam/page.tsx
    - Create skill mapping from informal to formal job titles
    - Add local gig opportunity suggestions for Kashmir
    - Implement freelance platform onboarding guide (Fiverr, Upwork)
    - Add safety warnings about employer verification
    - Suggest both online and offline opportunities
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 13.4 Write unit tests for Taleem pillars
    - Test business idea validation flow
    - Test mental health response empathy
    - Test skill mapping accuracy
    - _Requirements: 12.1, 13.1, 14.1_


- [~] 14. Implement Taleem quick access features
  - [ ] 14.1 Implement Naukri job orientation in src/app/taleem/naukri/page.tsx
    - Create qualification input form
    - Implement government job category suggestions (JKSSB)
    - Add job preparation guidance
    - _Requirements: 15.1_

  - [ ] 14.2 Implement CV generation in src/app/taleem/cv/page.tsx
    - Create three-sentence voice input form
    - Implement CV generation from voice input
    - Format CV in plain text English
    - Add download as .txt file functionality
    - _Requirements: 15.2, 15.3_

  - [ ] 14.3 Implement Exam prep feedback in src/app/taleem/exam/page.tsx
    - Create exam answer submission form
    - Implement feedback generation in Roman Urdu (<100 words)
    - Add study tips and improvement suggestions
    - _Requirements: 15.4_

  - [ ] 14.4 Implement Scholarship matching in src/app/taleem/scholarship/page.tsx
    - Create marksheet image upload
    - Implement OCR for marks extraction
    - Add scholarship type suggestions based on marks and category
    - Display application windows and eligibility notes
    - _Requirements: 15.5_

  - [ ] 14.5 Write unit tests for Taleem quick access features
    - Test CV generation formatting
    - Test exam feedback quality
    - Test scholarship matching logic
    - _Requirements: 15.2, 15.4, 15.5_

- [~] 15. Implement resource cleanup and lifecycle management
  - [ ] 15.1 Add cleanup logic to Raah page in src/app/raah/page.tsx
    - Implement useEffect cleanup for audio recording on navigation
    - Stop TTS playback on component unmount
    - Release microphone resources on recording completion
    - _Requirements: 10.5, 96.1, 96.2, 96.3_

  - [ ] 15.2 Write property test for resource cleanup
    - **Property 29: Microphone Resource Release**
    - **Validates: Requirements 10.5, 96.3**

  - [ ] 15.3 Add cleanup logic to image capture components
    - Release camera resources after image capture
    - Stop all MediaStream tracks on component unmount
    - _Requirements: 96.4, 96.5_

  - [ ] 15.4 Write property test for MediaStream cleanup
    - **Property 53: MediaStream Cleanup on Unmount**
    - **Validates: Requirements 96.5**

  - [ ] 15.5 Write unit tests for lifecycle management
    - Test microphone release on navigation
    - Test camera release after capture
    - Test TTS cancellation on unmount
    - _Requirements: 96.1, 96.2, 96.4_


- [~] 16. Implement input validation and sanitization
  - [ ] 16.1 Create validation utilities in src/lib/validation.ts
    - Implement image file type and size validation
    - Implement audio file format validation
    - Add text input sanitization for LLM queries
    - Add environment variable validation
    - _Requirements: 29.1, 29.2, 29.3, 29.5, 42.1, 43.1_

  - [ ] 16.2 Write property test for image upload validation
    - **Property 42: Image Upload Validation**
    - **Validates: Requirements 29.1**

  - [ ] 16.3 Implement malformed response handling
    - Add try-catch blocks around all API response parsing
    - Implement graceful error display for malformed responses
    - Add response schema validation
    - _Requirements: 29.4, 45.1_

  - [ ] 16.4 Write unit tests for validation
    - Test file type validation
    - Test size limit enforcement
    - Test text sanitization
    - _Requirements: 29.1, 29.2, 29.3_

- [~] 17. Implement automatic TTS activation across all modules
  - [ ] 17.1 Add automatic TTS to Samjho module
    - Call speakForLocale automatically after explanation generation
    - Implement TTS interruption for new requests
    - _Requirements: 33.1, 33.5_

  - [ ] 17.2 Add automatic TTS to Zameen module
    - Call speakForLocale automatically after crop advice generation
    - Implement TTS interruption for new requests
    - _Requirements: 33.2, 33.5_

  - [ ] 17.3 Add automatic TTS to Raah module
    - Call speakForLocale automatically after answer generation
    - Implement TTS interruption for new requests
    - _Requirements: 33.3, 33.5_

  - [ ] 17.4 Add automatic TTS to Taleem module
    - Call speakForLocale automatically after feedback generation
    - Implement TTS interruption for new requests
    - _Requirements: 33.4, 33.5_

  - [ ] 17.5 Write property test for automatic TTS activation
    - **Property 46: Automatic TTS Activation**
    - **Validates: Requirements 33.1, 33.2, 33.3, 33.4**

  - [ ] 17.6 Write unit tests for TTS integration
    - Test automatic activation in each module
    - Test TTS interruption behavior
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5_

- [~] 18. Checkpoint - Ensure all modules are integrated
  - Ensure all tests pass, ask the user if questions arise.


- [~] 19. Implement security and privacy measures
  - [ ] 19.1 Add HTTPS enforcement in next.config.ts
    - Configure security headers
    - Enforce HTTPS in production
    - _Requirements: 20.1, 38.1_

  - [ ] 19.2 Write property test for HTTPS protocol enforcement
    - **Property 38: HTTPS Protocol Enforcement**
    - **Validates: Requirements 20.1**

  - [ ] 19.3 Implement server-side file cleanup
    - Add automatic file deletion after processing in API routes
    - Ensure no user files persist on server
    - _Requirements: 20.2_

  - [ ] 19.4 Write property test for no server-side file persistence
    - **Property 39: No Server-Side File Persistence**
    - **Validates: Requirements 20.2**

  - [ ] 19.5 Add privacy disclaimers
    - Add privacy disclaimer to Samjho document processing
    - Add data handling notice to all upload forms
    - _Requirements: 20.4_

  - [ ] 19.6 Write property test for no PII in logs
    - **Property 41: No PII in Logs**
    - **Validates: Requirements 20.5**

  - [ ] 19.7 Write unit tests for security measures
    - Test file cleanup after processing
    - Test PII filtering in logs
    - _Requirements: 20.2, 20.5_

- [~] 20. Implement API rate limiting and cost management
  - [ ] 20.1 Create rate limiting middleware in src/lib/rateLimit.ts
    - Implement IP-based rate limiting (100 requests/hour)
    - Add rate limit exceeded message in Roman Urdu
    - Track API usage metrics
    - _Requirements: 25.1, 25.2, 25.5_

  - [ ] 20.2 Configure cost optimization settings
    - Set default model to gpt-4o-mini
    - Implement 24-hour cache for identical LLM queries
    - Add usage logging for monitoring
    - _Requirements: 25.3, 25.4, 27.2_

  - [ ] 20.3 Write unit tests for rate limiting
    - Test rate limit enforcement
    - Test rate limit reset timing
    - Test usage metric tracking
    - _Requirements: 25.1, 25.2, 25.5_


- [~] 21. Implement monitoring and logging system
  - [ ] 21.1 Create logging utilities in src/lib/logger.ts
    - Implement structured logging with timestamps
    - Add service name and mode tracking (demo/production)
    - Add error logging with stack traces
    - Implement PII filtering for all log entries
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

  - [ ] 21.2 Add logging to all API routes
    - Log all API errors with service context
    - Log transcription results for debugging
    - Track demo vs production mode usage
    - Never log user personal information
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

  - [ ] 21.3 Write unit tests for logging system
    - Test PII filtering effectiveness
    - Test log format consistency
    - Test error context capture
    - _Requirements: 27.1, 27.5_

- [~] 22. Enhance mobile responsiveness and accessibility
  - [ ] 22.1 Implement responsive design improvements
    - Test and fix layouts for 320px to 1920px widths
    - Ensure minimum 44x44px touch targets for all interactive elements
    - Add proper touch event handling
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ] 22.2 Add accessibility features
    - Add ARIA labels to all interactive components
    - Implement visible focus indicators for keyboard navigation
    - Add screen reader support
    - _Requirements: 17.4, 17.5_

  - [ ] 22.3 Write unit tests for accessibility
    - Test ARIA label presence
    - Test keyboard navigation
    - Test touch target sizes
    - _Requirements: 17.3, 17.4, 17.5_

- [~] 23. Implement browser compatibility and graceful degradation
  - [ ] 23.1 Add feature detection in src/lib/browserCompat.ts
    - Detect MediaRecorder API availability
    - Detect SpeechRecognition API availability
    - Detect camera/microphone permission status
    - Add fallback suggestions for unavailable features
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 28.1, 28.2, 28.3, 28.4, 28.5_

  - [ ] 23.2 Implement graceful degradation UI
    - Show text input when microphone unavailable
    - Show gallery upload when camera unavailable
    - Display text prominently when TTS unavailable
    - Add browser compatibility messages
    - _Requirements: 28.1, 28.2, 28.3, 28.4_

  - [ ] 23.3 Write unit tests for browser compatibility
    - Test feature detection logic
    - Test fallback UI rendering
    - Test alternative input methods
    - _Requirements: 19.2, 28.1, 28.2_


- [~] 24. Polish UI and enhance visual design
  - [ ] 24.1 Refine Chinar branding elements
    - Enhance ChinarLeafMark component styling
    - Ensure consistent color scheme using CSS custom properties
    - Add smooth transitions for hover and focus states
    - Maintain consistent spacing and typography
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 24.2 Optimize mode card design
    - Ensure emoji icons are clearly visible
    - Add visual feedback for card interactions
    - Implement responsive grid layout
    - _Requirements: 22.3, 23.1_

  - [ ] 24.3 Write unit tests for UI components
    - Test component rendering
    - Test interaction states
    - Test responsive behavior
    - _Requirements: 22.1, 22.2, 22.3_

- [~] 25. Implement navigation and user flow enhancements
  - [ ] 25.1 Enhance home screen navigation
    - Ensure four mode cards are prominently displayed
    - Verify microphone button navigates to Raah
    - Test navigation state persistence
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ] 25.2 Implement Taleem hub navigation
    - Create Taleem hub page with three pillars and four quick access links
    - Add back navigation from all Taleem sub-pages
    - Maintain active tab state within pillar pages
    - _Requirements: 23.5, 31.1, 31.2, 31.3, 31.4, 31.5_

  - [ ] 25.3 Write unit tests for navigation
    - Test route transitions
    - Test back navigation
    - Test state persistence
    - _Requirements: 23.3, 23.4, 31.4_

- [~] 26. Implement content localization and cultural context
  - [ ] 26.1 Enhance localization in src/lib/i18n/catalog.ts
    - Ensure Roman Urdu is primary UI language
    - Add Kashmiri Latin script phrases where appropriate
    - Reference Kashmir-specific locations in responses
    - Mention J&K-specific schemes and institutions
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

  - [ ] 26.2 Add culturally appropriate demo content
    - Use Kashmir-relevant examples in demo responses
    - Reference local crops (apple, saffron, rice)
    - Mention local mandis (Sopore, Baramulla, Srinagar)
    - _Requirements: 24.5, 30.1, 30.2_

  - [ ] 26.3 Write unit tests for localization
    - Test language selection
    - Test cultural context inclusion
    - Test scheme reference accuracy
    - _Requirements: 24.1, 24.3, 24.4_


- [~] 27. Prepare hackathon demo capabilities
  - [ ] 27.1 Implement demo buttons and pre-filled examples
    - Add demo button to Raah with "PM Kisan yojana" auto-populate
    - Create demo copy for all Taleem sub-features
    - Ensure demo workflows complete within 3 seconds
    - Verify full offline functionality when API keys absent
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 30.3, 30.4, 30.5_

  - [ ] 27.2 Create demo script support materials
    - Prepare government notice example for Samjho demo
    - Prepare apple leaf fungal infection example for Zameen demo
    - Prepare PM Kisan scheme query for Raah demo
    - Ensure consistent demo outputs for repeatable presentations
    - _Requirements: 30.1, 30.2, 30.3, 30.5_

  - [ ] 27.3 Write unit tests for demo capabilities
    - Test demo button functionality
    - Test demo response consistency
    - Test offline mode completeness
    - _Requirements: 21.1, 21.4, 21.5_

- [~] 28. Checkpoint - Ensure demo mode is presentation-ready
  - Ensure all tests pass, ask the user if questions arise.

- [~] 29. Prepare production deployment
  - [ ] 29.1 Create comprehensive .env.example file
    - Document all required API keys
    - Add configuration options with descriptions
    - Include example values and setup instructions
    - _Requirements: 18.4_

  - [ ] 29.2 Verify build and deployment readiness
    - Test 'npm run build' succeeds without errors
    - Test 'npm run start' serves production build correctly
    - Ensure all ESLint checks pass
    - Verify TypeScript type definitions are complete
    - _Requirements: 26.1, 26.2, 26.3, 26.4_

  - [ ] 29.3 Create deployment documentation in README.md
    - Add setup instructions
    - Document environment variables
    - Add deployment guide for Vercel/Netlify
    - Include troubleshooting section
    - _Requirements: 26.5_

  - [ ] 29.4 Write unit tests for build process
    - Test environment variable loading
    - Test production configuration
    - _Requirements: 18.1, 18.2_


- [~] 30. Implement dual voice input strategy for Raah
  - [ ] 30.1 Enhance browser speech recognition in src/app/raah/page.tsx
    - Ensure browser SpeechRecognition button provides instant voice input
    - Disable Whisper recording when browser recognition is active
    - Add visual indicators distinguishing the two methods
    - _Requirements: 32.1, 32.3, 32.5_

  - [ ] 30.2 Enhance Whisper recording integration
    - Ensure Whisper recording button provides server-side transcription
    - Disable browser recognition when Whisper recording is active
    - Add recording duration limit (60 seconds)
    - _Requirements: 32.2, 32.4, 37.4_

  - [ ] 30.3 Write unit tests for dual voice input
    - Test mutual exclusion of voice input methods
    - Test visual indicator display
    - Test recording duration limits
    - _Requirements: 32.3, 32.4, 32.5_

- [~] 31. Implement scheme information accuracy and safety protocols
  - [ ] 31.1 Add scheme information with disclaimers
    - Include PM Kisan, PM Mudra, Mission YUVA, J&K startup programs
    - Add eligibility criteria in simple language
    - Include verification disclaimers for official portals
    - Suggest local contact points (DIC, CSC, tehsil offices)
    - Never guarantee scheme approval or eligibility
    - _Requirements: 39.1, 39.2, 39.3, 39.4, 39.5_

  - [ ] 31.2 Implement mental health safety protocols
    - Add crisis helpline numbers (Vandrevala, iCall, KIRAN)
    - Include medical disclaimer for mental health support
    - Implement self-harm keyword detection
    - Display prominent helpline access for crisis situations
    - Never provide medical advice or diagnosis
    - _Requirements: 13.3, 13.4, 13.5_

  - [ ] 31.3 Write unit tests for safety protocols
    - Test disclaimer inclusion
    - Test self-harm keyword detection
    - Test helpline display logic
    - _Requirements: 13.5, 39.1_

- [~] 32. Final integration and end-to-end testing
  - [ ] 32.1 Test complete Samjho workflow
    - Upload document → OCR → LLM explanation → TTS output
    - Verify error handling and retry logic
    - Test demo mode fallback
    - _Requirements: 1.1, 1.2, 1.4, 33.1_

  - [ ] 32.2 Test complete Zameen workflow
    - Upload crop image → Vision analysis → Mandi price → LLM advice → TTS output
    - Verify disease detection accuracy
    - Test demo mode fallback
    - _Requirements: 2.1, 2.3, 3.1, 33.2_

  - [ ] 32.3 Test complete Raah workflow
    - Voice input → Whisper transcription → LLM answer → TTS output
    - Test browser speech recognition alternative
    - Test text input fallback
    - _Requirements: 5.1, 5.3, 33.3_

  - [ ] 32.4 Test complete Taleem workflows
    - Test all three pillars (Hunarmand, Sukoon, Kaam)
    - Test all four quick access features (Naukri, CV, Exam, Scholarship)
    - Verify TTS integration
    - _Requirements: 12.1, 13.1, 14.1, 15.1, 33.4_

  - [ ] 32.5 Write integration tests for all workflows
    - Test end-to-end Samjho flow
    - Test end-to-end Zameen flow
    - Test end-to-end Raah flow
    - Test end-to-end Taleem flows
    - _Requirements: 16.5, 30.4_

- [~] 33. Final checkpoint - Production readiness verification
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation maintains offline-first demo capability while adding production API integrations
- All external API integrations include fallback to demo mode when keys are unavailable
- Performance targets: OCR <5s, Vision <8s, Whisper <10s, TTS <3s, End-to-end <15s
- Security: HTTPS only, no server-side file persistence, PII filtering in logs
- Accessibility: ARIA labels, keyboard navigation, 44x44px touch targets, screen reader support
- Browser compatibility: Chrome, Safari, Firefox on mobile and desktop with graceful degradation
- Cultural context: Kashmir-specific locations, schemes, crops, and Roman Urdu primary language

## Implementation Strategy

The tasks are organized into logical phases:

1. **Foundation (Tasks 1-6)**: API integrations for core services (OCR, Vision, Mandi, TTS, Whisper, LLM)
2. **Optimization (Tasks 7-11)**: Performance improvements, caching, error handling
3. **Features (Tasks 12-18)**: Demo mode, Taleem modules, resource cleanup, validation, TTS integration
4. **Production Readiness (Tasks 19-29)**: Security, rate limiting, monitoring, accessibility, deployment
5. **Final Polish (Tasks 30-33)**: Voice input, safety protocols, end-to-end testing, verification

Each phase builds on the previous, with checkpoints to validate progress before moving forward. The optional test tasks allow for faster iteration during development while maintaining the ability to add comprehensive test coverage later.
