# RAASTA

**One intelligent assistant** with four modes — [Samjho](src/app/samjho/page.tsx) (documents), [Zameen](src/app/zameen/page.tsx) (crops & mandi), [Taleem](src/app/taleem/page.tsx) (youth: Hunarmand, Sukoon, Kaam Dhundo + naukri/CV/exam/scholarship), [Raah](src/app/raah/page.tsx) (voice). Built for rural Kashmir and India: Urdu, Kashmiri (Latin), and Hindi — by voice and photo, without login or onboarding walls.

Aligned with the hackathon brief in [`5_6215080417641372068.md`](5_6215080417641372068.md).

## Stack

| Layer | Implementation |
| --- | --- |
| Frontend | **Next.js 15** (App Router) + **Tailwind CSS v4** |
| Backend | **API Routes** — [`/api/llm`](src/app/api/llm/route.ts), [`/api/transcribe`](src/app/api/transcribe/route.ts) |
| OCR / vision (demo) | Client stubs in [`src/lib/ocr.ts`](src/lib/ocr.ts), [`src/lib/vision.ts`](src/lib/vision.ts) — swap for Tesseract / Google Vision / Roboflow |
| LLM + Whisper | OpenAI when `OPENAI_API_KEY` is set; otherwise demo copy from [`src/lib/demoCopy.ts`](src/lib/demoCopy.ts) |
| TTS | Browser `speechSynthesis` in [`src/lib/tts.ts`](src/lib/tts.ts) — swap for ElevenLabs / Google TTS |

## Folder layout (spec)

```text
src/app/page.tsx           # Home: mic + four mode links
src/app/samjho/page.tsx    # Document photo → explain (+ auto speak)
src/app/zameen/page.tsx    # Crop photo → advice (+ auto speak)
src/app/taleem/page.tsx    # Taleem hub
src/app/taleem/*/page.tsx  # Hunarmand, Sukoon, Kaam, Naukri, CV, Exam, Scholarship
src/app/raah/page.tsx      # Whisper / browser STT + LLM + TTS
src/components/            # MicButton, ModeCard, VoiceOutput, ImageUploader
src/lib/                   # ocr, vision, llm (client), whisper (client), tts, demoCopy
public/assets/             # Static assets
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy [`.env.example`](.env.example) to `.env.local` and set `OPENAI_API_KEY` to enable GPT-4o-mini explanations and Whisper transcription on the server (key stays off the client).

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm run start` — serve production build  
- `npm run lint` — ESLint (Next.js + TypeScript)
