# 🎨 Visual Guide - Global Guide Assistant

## 📍 Location in UI

```
┌─────────────────────────────────────────────────────────────┐
│  RAASTA AI    [Samjho] [Zameen] [Taleem] [Raah]  [🌐] [🤖] [👤] │
│                                                    ↑    ↑    ↑  │
│                                              Lang Guide User  │
└─────────────────────────────────────────────────────────────┘
```

The assistant icon (🤖) is positioned between the language toggle and user account icon.

## 🎯 Icon Design

```
     ┌─────────┐
     │    🤖   │  ← Material icon: "assistant"
     │    ●    │  ← Pulsing red indicator (animated)
     └─────────┘
     
Hover State:
     ┌─────────┐
     │    🤖   │  ← Changes to #885207 (amber)
     │    ●    │  ← Pulse continues
     └─────────┘
```

## 📱 Floating Panel Layout

```
┌────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════╗  │
│  ║  🤖 AI Guide                              [X]    ║  │ ← Gradient Header
│  ║  Kya madad chahiye? Main batata hoon            ║  │   (#885207 → #b8751e)
│  ╚══════════════════════════════════════════════════╝  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  QUICK ACTIONS                                  │  │
│  │  ┌──────────┐  ┌──────────┐                    │  │
│  │  │ 📄 Doc   │  │ 🌾 Crop  │                    │  │
│  │  └──────────┘  └──────────┘                    │  │
│  │  ┌──────────┐  ┌──────────┐                    │  │
│  │  │ 💼 Job   │  │ 🧭 Help  │                    │  │
│  │  └──────────┘  └──────────┘                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Apna sawal yahan likhein                       │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ Example: Meri fasal kharab hai...       │   │  │ ← Textarea
│  │  │                                         │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │  [🧭 Guide Karein]                             │  │ ← Submit Button
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  💡 Examples:                                          │
│  • "Ye notice kya kehta hai" → Samjho                 │
│  • "Meri fasal kharab hai" → Zameen                   │
│  • "Mujhe job chahiye" → Taleem                       │
│  • "Main pareshan hoon" → Raah                        │
└────────────────────────────────────────────────────────┘
```

## 🎨 Guidance Result Card

```
┌────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════╗  │
│  ║  [📄 SAMJHO] scan_document                      ║  │ ← Module Badge
│  ╚══════════════════════════════════════════════════╝  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Main aapki madad karta hoon.                   │  │ ← Message
│  │  Bas yeh steps follow karein.                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  Steps to Follow                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ① Step 1: Camera open karein                   │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ② Step 2: Document ki photo lein               │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ③ Step 3: Analysis ka wait karein              │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ④ Step 4: Main aapko simple mein samjha dunga  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ╔══════════════════════════════════════════════════╗  │
│  ║  SAMJHO mein jayen →                            ║  │ ← Navigation Button
│  ╚══════════════════════════════════════════════════╝  │   (Gradient)
│                                                        │
│  ← Doosra sawal puchein                               │ ← Reset Link
└────────────────────────────────────────────────────────┘
```

## 🎬 Animation Sequence

### 1. Panel Opening
```
Frame 1:  [Icon clicked]
          ↓
Frame 2:  Panel starts sliding from top
          Opacity: 0 → 0.5
          Transform: translateY(-1rem) → translateY(-0.5rem)
          ↓
Frame 3:  Panel fully visible
          Opacity: 1
          Transform: translateY(0)
          Duration: 0.3s ease-out
```

### 2. Loading State
```
[🧭 Guide Karein]
       ↓
[⏳ Samajh raha hoon...]  ← Spinner animation
       ↓
[Result appears with fade-in]
```

### 3. Navigation
```
[SAMJHO mein jayen →]  ← Button clicked
       ↓
Panel fades out (0.2s)
       ↓
Page navigates (Next.js)
       ↓
Panel state resets
```

## 🎨 Color Palette

```
Primary Gradient:
┌─────────────────────────────────┐
│ #885207 ────────────→ #b8751e  │
│ (Chinar Amber)    (Chinar Gold) │
└─────────────────────────────────┘

Module Badges:
📄 SAMJHO  → #885207 background
🌾 ZAMEEN  → #885207 background
🎓 TALEEM  → #885207 background
🧭 RAAH    → #885207 background

Backgrounds:
Light Mode: #fbf9f4 (cream)
Dark Mode:  #000d08 (dark green)

Borders:
Active:  #885207 (2px solid)
Default: #c1c8c3 (outline-variant)
```

## 📐 Spacing & Sizing

```
Panel:
- Width: max-w-2xl (672px)
- Height: max-h-[70vh] (scrollable)
- Padding: p-6 (24px)
- Border: 2px solid #885207
- Border Radius: rounded-lg (8px)

Icon:
- Size: text-2xl (24px)
- Pulse: h-3 w-3 (12px)
- Spacing: space-x-4 (16px)

Buttons:
- Height: py-3 (12px vertical)
- Padding: px-6 (24px horizontal)
- Font: text-xs uppercase tracking-widest

Steps:
- Number Circle: w-7 h-7 (28px)
- Gap: gap-3 (12px)
- Padding: p-3 (12px)
```

## 🎯 Interactive States

### Button States
```
Default:
┌─────────────────────┐
│  🧭 Guide Karein   │  bg-[#885207]
└─────────────────────┘

Hover:
┌─────────────────────┐
│  🧭 Guide Karein   │  bg-[#b8751e]
└─────────────────────┘  scale-[1.02]

Disabled:
┌─────────────────────┐
│  🧭 Guide Karein   │  opacity-50
└─────────────────────┘  cursor-not-allowed

Loading:
┌─────────────────────┐
│  ⏳ Samajh raha... │  spinner animation
└─────────────────────┘
```

### Quick Action States
```
Default:
┌──────────┐
│ 📄 Doc   │  bg-surface-container-low
└──────────┘  border-outline-variant

Hover:
┌──────────┐
│ 📄 Doc   │  bg-surface-container
└──────────┘  border-outline-variant
```

## 📱 Responsive Breakpoints

```
Mobile (< 768px):
┌─────────────────┐
│  Full Width     │
│  Padding: 16px  │
│  Font: Smaller  │
└─────────────────┘

Tablet (768px - 1024px):
┌──────────────────────┐
│  Max Width: 672px    │
│  Padding: 24px       │
│  Font: Normal        │
└──────────────────────┘

Desktop (> 1024px):
┌──────────────────────┐
│  Max Width: 672px    │
│  Padding: 24px       │
│  Font: Normal        │
│  Centered            │
└──────────────────────┘
```

## 🎭 Accessibility

```
Keyboard Navigation:
- Tab: Focus next element
- Shift+Tab: Focus previous element
- Enter: Submit form
- Escape: Close panel

Screen Reader:
- aria-label="Open AI Guide"
- aria-expanded={isOpen}
- Semantic HTML structure
- Alt text for icons

Focus Management:
- Focus trapped in panel when open
- Focus returns to trigger on close
- Visible focus indicators
```

## 🎨 Typography

```
Header:
- Font: font-headline (Noto Serif)
- Size: text-2xl (24px)
- Weight: font-bold (700)
- Color: white

Body:
- Font: font-body (Manrope)
- Size: text-sm (14px)
- Weight: normal (400)
- Color: on-surface

Labels:
- Font: font-label (Manrope)
- Size: text-[10px]
- Weight: normal (400)
- Transform: uppercase
- Tracking: tracking-widest
- Color: #885207

Steps:
- Font: font-body (Manrope)
- Size: text-sm (14px)
- Weight: normal (400)
- Color: on-surface
```

---

**Visual Design Complete** ✨
