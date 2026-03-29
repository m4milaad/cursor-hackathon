# RAASTA AI

<div align="center">

**One intelligent AI brain controlling four domains**

*Voice-first • Multilingual • Built for Kashmir • Accessible to All*

</div>

---

## 🌟 Overview

RAASTA AI is a voice-first, multilingual AI companion designed for underserved communities in Kashmir and similar regions. It bridges the digital divide by providing accessible technology that works in local languages (Urdu, Kashmiri, Hindi) and addresses real-world problems in agriculture, education, career development, and life guidance.

**Theme Alignment:** *Build for the Next Billion* - RAASTA AI directly addresses the needs of billions waiting for technology that works in their context, language, and for their specific problems.

---

## 🎤 Green Speak Button - Universal AI Entry Point

The **Green Speak Button** is our revolutionary central AI routing system. **One tap, speak anything in any language**, and AI automatically routes you to the right module.

### ✅ Status: FULLY WORKING

### How It Works

```
User taps button → Speaks query → AI detects intent → Auto-routes to module
```

### Example Queries

| You Say | AI Routes To | Module |
|---------|--------------|--------|
| "Meri fasal kharab hai" | 🌾 Agriculture | Zameen |
| "Mujhe naukri chahiye" | 🎓 Career | Taleem |
| "Ye notice kya kehta hai" | 📄 Documents | Samjho |
| "Main pareshan hun" | 🧭 Guidance | Raah |

Works in Urdu, Hindi, Kashmiri, or English.

---

## 🧠 The Four Domains

### 🌍 1. SAMJHO (Understanding)
Understand documents, text, and real-world information

**Features:**
- 📸 Upload or capture photos of documents, signboards, certificates  
- 🔍 OCR extracts text from images  
- 🌐 Detects language (Urdu / Kashmiri / English)  
- 📝 Translates and explains in simple language  
- 🔊 Voice output in user's language  

**Use Case:** "What does this government notice say?" → Photo → OCR → Simple explanation in Urdu

---

### 🌱 2. ZAMEEN (Crop Intelligence)
Analyze crops and get real-time farming insights

**Features:**
- 📸 Upload crop images (apple, rice, wheat, saffron)  
- 🤖 AI detects diseases using vision models  
- 💊 Provides treatment suggestions with timing guidance  
- 📊 Shows live mandi prices (Sopore, Pampore, Srinagar)  
- 📈 Price trends and best time-to-sell insights  

**Use Case:** "My apple leaves have spots" → Photo → Disease detected → Treatment + market price

---

### 🎓 3. TALEEM (Youth Services)
Support youth with skills, jobs, and well-being

**Three Pillars:**
- 🧑‍💼 **Hunarmand**: Business guidance & entrepreneurship support  
- 🧠 **Sukoon**: Mental health support & emotional guidance  
- 💼 **Kaam Dhundo**: Job matching & skill mapping  

**Quick Access Features:**
- 🎤 Voice-based CV generation  
- 📚 Exam prep feedback & performance insights  
- 🎓 Scholarship discovery & recommendations  
- 💼 Job orientation (JKSSB, government jobs)

**Use Case:** "I need a job" → CV created + jobs suggested + application guidance

---

### 🎙️ 4. RAAH (Voice Assistant)
Your AI guide for everything — hands-free

**Features:**
- 🎤 Voice-first interaction for all queries  
- ❓ Ask about schemes, farming, jobs, education, documents  
- ⚡ Instant responses via browser speech recognition  
- 🧠 High-accuracy understanding using Whisper API  
- 🔗 Smart suggestions to switch between Samjho, Zameen, Taleem  
- 💬 Structured guidance with action steps

**Use Case:** "I'm confused about my future" → Structured guidance + action steps + resources

---

## 🤖 AI & Sponsor Tools Integration

### **Cursor (Title Sponsor)** ⭐
- **Development**: 80% of codebase built with Cursor Composer
- **AI-Assisted**: Debugging, refactoring, API integration
- **Productivity**: 10+ hours saved with context-aware suggestions
- **Rapid Prototyping**: Component generation and optimization

### **OpenAI (AI Track)** ⭐
- **GPT-4o-mini**: Intent detection, document explanation, crop advice, life guidance, CV generation
- **Whisper API**: Multilingual voice transcription (Urdu, Hindi, Kashmiri)
- **Custom Prompts**: Kashmir-specific context (local crops, schemes, locations)
- **Performance**: 85%+ intent detection accuracy

### **Convex (Backend Track)** ⭐
- **Real-time Database**: User context and conversation history
- **Server Functions**: API orchestration and caching
- **File Storage**: Uploaded images (documents, crops)
- **Session Management**: Maintaining state across modules

### **v0 (Frontend Track)** ⭐
- **UI Generation**: Voice-first component designs
- **Responsive Layouts**: Mobile-optimized for low-end devices
- **Accessibility**: ARIA labels and keyboard navigation

### Additional AI Technologies
- **Google Cloud Vision API**: Production OCR for documents
- **Roboflow**: Crop disease detection models
- **ElevenLabs/Google TTS**: Natural voice synthesis
- **Browser SpeechRecognition**: Instant voice input

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                                │
│              Voice / Photo / Text                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              INTENT DETECTION ENGINE                         │
│         (OpenAI GPT-4o-mini / Keyword Matching)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SMART ROUTER                                │
│         Context-aware navigation to modules                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                MODULE PROCESSING                             │
│  Samjho: OCR → Translation → Explanation                    │
│  Zameen: Vision AI → Disease → Market Data                  │
│  Taleem: Skill Mapping → Job Matching → CV                  │
│  Raah: Emotion Analysis → Guidance → Resources              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              RESPONSE GENERATION                             │
│            Voice + Text in User's Language                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CONTEXT MEMORY                                  │
│         (Convex Database - User History)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### Voice-First Design
- ✅ One-tap voice input
- ✅ Multilingual support (Urdu, Hindi, Kashmiri, English)
- ✅ Automatic TTS output
- ✅ Works for users with low literacy

### Intelligent Routing
- ✅ AI-powered intent detection
- ✅ Context-aware navigation
- ✅ 85%+ accuracy (production mode)
- ✅ Keyword fallback (demo mode)

### Kashmir-Specific Context
- ✅ Local crops (apple, saffron, rice)
- ✅ Regional mandis (Sopore, Srinagar)
- ✅ J&K schemes (PM Kisan, Mudra, Mission YUVA)
- ✅ Local job markets and opportunities

### Offline-Capable
- ✅ Demo mode works without API keys
- ✅ Perfect for presentations
- ✅ Graceful degradation
- ✅ Browser-based fallbacks

### Mobile-Optimized
- ✅ Responsive design (320px - 1920px)
- ✅ Touch-friendly interface
- ✅ Works on 2G/3G networks
- ✅ Low-end device support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome, Edge, Safari)

### Installation

```bash
# Clone repository
git clone [https://github.com/m4milaad/cursor-hackathon.git]
cd raasta-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

```env
# OpenAI (optional - for production mode)
OPENAI_API_KEY=your_openai_api_key

# Optional: Override default model
OPENAI_MODEL=gpt-4o-mini
```

**Note:** App works in demo mode without API keys for presentations.

---

## 📁 Project Structure

```text
raasta-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home with Green Speak Button
│   │   ├── demo/page.tsx               # Demo page with examples
│   │   ├── samjho/page.tsx             # Document understanding
│   │   ├── zameen/page.tsx             # Agriculture intelligence
│   │   ├── taleem/
│   │   │   ├── page.tsx                # Taleem hub
│   │   │   ├── hunarmand/page.tsx      # Business coaching
│   │   │   ├── sukoon/page.tsx         # Mental health
│   │   │   ├── kaam/page.tsx           # Job matching
│   │   │   ├── naukri/page.tsx         # Job orientation
│   │   │   ├── cv/page.tsx             # CV generation
│   │   │   ├── exam/page.tsx           # Exam prep
│   │   │   └── scholarship/page.tsx    # Scholarship matching
│   │   ├── raah/page.tsx               # Life guidance
│   │   └── api/
│   │       ├── intent-detection/       # AI routing endpoint
│   │       ├── llm/                    # LLM processing
│   │       ├── ocr/                    # OCR service
│   │       ├── vision/                 # Crop detection
│   │       └── transcribe/             # Whisper transcription
│   ├── components/
│   │   ├── GreenSpeakButton.tsx        # Universal AI entry
│   │   ├── MicButton.tsx               # Voice input
│   │   ├── VoiceOutput.tsx             # TTS output
│   │   └── ImageUploader.tsx           # Photo capture
│   └── lib/
│       ├── ocr.ts                      # OCR service
│       ├── vision.ts                   # Crop detection
│       ├── llm.ts                      # LLM client
│       ├── whisper.ts                  # Transcription
│       ├── tts.ts                      # Text-to-speech
│       └── demoCopy.ts                 # Demo mode data
├── public/
│   └── assets/                         # Static assets
└── convex/                             # Convex backend
```

---

## 📊 Impact & Scale

### Target Users
- **10M+** in Kashmir
- **1B+** globally in similar contexts
- **500M+** Urdu/Kashmiri speakers worldwide

### Real-World Impact
- **Farmers**: Detect diseases early, optimize sales → 20% more income
- **Youth**: Create CVs, find jobs, access scholarships → Break unemployment cycle
- **Citizens**: Understand documents, access schemes → Empowerment through information

### Scalability
- Architecture supports multiple languages
- Can expand to other regions
- Modular design for new features
- Cloud-ready for millions of users

---

## 🏆 Hackathon Tracks

### Open Track ⭐
- **Theme**: Build for the Next Billion
- **Impact**: Addresses language barriers, literacy issues, context mismatch
- **Scale**: 10M in Kashmir, 1B globally

### Convex Track ⭐
- Real-time database for user context
- Server functions for API orchestration
- File storage and session management

### v0 Track ⭐
- Voice-first UI components
- Mobile-optimized layouts
- Accessible design patterns

---


