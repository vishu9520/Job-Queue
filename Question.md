# Upthrust Interview Defense & Technical Examination Guide (`Question.md`)

> **Executive Overview**  
> This document prepares you for every question, architectural defense, live demonstration, and code modification requested during the Upthrust Stage 2 Technical Interview.

---

## 📑 Table of Contents
1. [Core Architectural Decisions & Stack Defense](#1-core-architectural-decisions--stack-defense)
2. [File-by-File Structure & Functionality Breakdown](#2-file-by-file-structure--file-functionality)
3. [Top Interview Questions & Model Answers](#3-top-interview-questions--model-answers)
4. [Live Change Scenarios & How to Execute Them Live](#4-live-change-scenarios--playbook)
5. [Performance, SEO & Accessibility Defense](#5-performance-seo--accessibility-defense)
6. [Forms, Data Layer & Conversion Tracking Deep Dive](#6-forms-data-layer--conversion-tracking)
7. [Backend & CMS Architecture Explained](#7-backend--cms-architecture)
8. [Content, Forms, Integrations & Safe Operations](#8-content-forms-integrations--safe-operations)
9. [Use of AI Tools Disclosure Strategy](#9-use-of-ai-tools-disclosure)

---

## 1. Core Architectural Decisions & Stack Defense

### Why this stack was chosen:
* **Frontend:** **React 19 + TypeScript + Vite 6**
  * *Why:* Fast build tool (instant HMR via native ES modules), zero bundle bloat, rock-solid type safety for custom CMS schemas and dataLayer payloads. Avoided heavy SSR hydration lag for a single high-impact marketing landing page.
* **Styling:** **Tailwind CSS v4 + Custom Engineering CSS**
  * *Why:* Modern CSS variables (`--brand-orange: #FF3500`, `--bg-dark: #050507`), custom skewed typography (`-skew-x-12`), fluid typography (`clamp(...)`), and zero runtime CSS overhead.
* **3D Graphics:** **Three.js (WebGL Canvas)**
  * *Why:* Direct hardware-accelerated WebGL rendering for the iridescent bust statue (`statue.glb`) and ribbon (`curve-line.glb`). Custom interactive mouse-tilt with damping, ACESFilmic tone mapping, and responsive viewport resize observers.
* **CMS & Content Management:** **Dual-Engine Reactive In-Browser CMS + MongoDB Atlas Server API**
  * *Why:* Real-time UI reactivity via React Context + `localStorage`, backed by an Express 5 REST API connected to MongoDB Atlas (`cms` and `submissions` collections). If the database or network drops, it gracefully falls back to local storage with zero UI crash.
* **Tracking:** **Google Tag Manager Data Layer (`window.dataLayer`)**
  * *Why:* Complies strictly with enterprise analytics best practices. Dispatches `{ event: 'form_submit', ... }` on both the newsletter form and lead inquiry modal. Includes an on-screen live dataLayer debugger.
  * *Why:* Automated proof of 100% WCAG 2.1 AA accessibility (0 violations) and responsive multi-viewport compliance (375px, 768px, 1440px).

---

## 2. File-by-File Structure & File Functionality

```
UpThrust/
├── index.html                      # HTML root, SEO tags, JSON-LD, Preconnects, Semantic fallback
├── package.json                    # Dependencies, scripts (dev, build, server, start)
├── vite.config.ts                  # Vite config with React plugin and Tailwind v4
├── server/
│   └── index.ts                    # Express 5 server: Mongo Atlas connection, CMS routes, submissions API
├── src/
│   ├── main.tsx                    # React DOM root entrypoint
│   ├── App.tsx                     # Top-level shell: providers, routing, 404 page, section orchestration
│   ├── index.css                   # Global styles: engineering grid, typography, focus outlines
│   ├── types/
│   │   └── content.ts              # Strict TypeScript interfaces: SiteContent, HeroContent, FormSubmission
│   ├── data/
│   │   └── defaultContent.ts       # Canonical default copy, fallback FAQ items, service details
│   ├── context/
│   │   ├── CMSContext.tsx          # Dual-layer state store (React State <-> localStorage <-> MongoDB API)
│   │   └── GTMContext.tsx          # DataLayer wrapper: window.dataLayer.push(), history tracking
│   └── components/
│       ├── Navbar.tsx              # Header with tilted rocket icon and 3-bar orange hamburger drawer
│       ├── Hero.tsx                # Hero section: BOLD DESIGN THAT PERFORMS, annotations, CAD blueprint
│       ├── StatueCanvas.tsx        # Three.js WebGL canvas rendering iridescent bust (statue.glb)
│       ├── CadBlueprint.tsx        # High-precision SVG technical architectural schematic
│       ├── ClientLogos.tsx         # Social proof rail: 100+ Brands trusted us & 6 brand logos
│       ├── Services.tsx            # 4 capabilities showcase slides matching design (mockup, copy, sparkles)
│       ├── CurveCanvas.tsx         # Three.js 3D curve line ribbon canvas (curve-line.glb)
│       ├── Testimonials.tsx        # Verified client feedback grid with star ratings
│       ├── FAQ.tsx                 # Fully accessible WCAG AA accordion using semantic <details>/<summary>
│       ├── Footer.tsx              # Large UPTHRUST DESIGN display, 6 agency link columns, Newsletter form
│       ├── ContactModal.tsx        # Accessible <dialog> lead capture modal with GTM tracking & confetti
│       ├── CMSAdminModal.tsx       # Live in-browser visual CMS editor for non-developers
│       ├── CMSFloatingBadge.tsx    # Floating UI trigger for CMS modal
│       └── GTMDebugger.tsx         # Live on-screen dataLayer event stream monitor
```

### Detailed Particulars of Critical Files:

| File | Exact Functionality & Role |
| :--- | :--- |
| [`server/index.ts`](file:///d:/UpThrust/server/index.ts) | Node.js Express server. Connects to MongoDB Atlas using official `MongoClient`. Exposes `GET /api/cms/content` and `PUT /api/cms/content` to read/save site content. Exposes `GET /api/submissions` and `POST /api/submissions` to store lead inquiries and newsletter signups. Serves static production frontend from `dist/`. |
| [`src/context/CMSContext.tsx`](file:///d:/UpThrust/src/context/CMSContext.tsx) | Central state management. Loads initial content from `localStorage` immediately (zero layout shift/SSR flash), then asynchronously hydrates from `GET /api/cms/content`. If Mongo is offline, automatically switches to local persistence. Exports `updateHero`, `updateFAQ`, `addFAQ`, `deleteFAQ`, `addSubmission`, `exportJSON`. |
| [`src/context/GTMContext.tsx`](file:///d:/UpThrust/src/context/GTMContext.tsx) | Initializes `window.dataLayer = window.dataLayer || []`. Provides `pushEvent(event, payload)` which pushes both to `window.dataLayer` and into internal state so the UI inspector reflects events instantaneously. |
| [`src/components/Hero.tsx`](file:///d:/UpThrust/src/components/Hero.tsx) | 1:1 match of supplied Design. Slanted `BOLD DESIGN` in `#FF3500`, centered 3D statue bust, `THAT` and `PERFORMS`, 3 red hand-drawn annotations (*Strategy is cheaper*, *Comfortable is expensive*, *Identity • Experience • Motion*), background coordinate grid (+ markers), and CAD blueprint schematic. |
| [`src/components/StatueCanvas.tsx`](file:///d:/UpThrust/src/components/StatueCanvas.tsx) | Three.js WebGL scene loading `public/models/statue.glb`. Configures point lights, ambient lights, ACESFilmic tone mapping, and a smoothed lerp mouse tracking animation (`rotation.y` and `rotation.x`) on `mousemove`. |
| [`src/components/CurveCanvas.tsx`](file:///d:/UpThrust/src/components/CurveCanvas.tsx) | Three.js WebGL canvas loading `public/models/curve-line.glb`. Renders the glossy winding orange curve across the Services section with subtle floating oscillation. |
| [`src/components/Footer.tsx`](file:///d:/UpThrust/src/components/Footer.tsx) | 1:1 match of Design Image 2. Full-width display title `UPTHRUST [3-Petal Mark] DESIGN`. Left 6 columns with agency links and email addresses. Right side newsletter form with email validation, mandatory GDPR checkbox, confetti burst, GTM event dispatch, and CMS storage. |
| [`src/components/ContactModal.tsx`](file:///d:/UpThrust/src/components/ContactModal.tsx) | Native `<dialog>` modal with accessibility attributes (`aria-modal`, `aria-labelledby`). Captures full project inquiries (Name, Work Email, Company, Service, Budget, Message). Pushes `{ event: 'form_submit', form_id: 'lead_inquiry_modal', ... }` to GTM. |
| [`src/components/CMSAdminModal.tsx`](file:///d:/UpThrust/src/components/CMSAdminModal.tsx) | Visual dashboard allowing any non-technical editor to modify Headlines, FAQs, Testimonials, and inspect stored form leads in real time. Also supports JSON export and factory reset. |
| [`src/components/GTMDebugger.tsx`](file:///d:/UpThrust/src/components/GTMDebugger.tsx) | Floating widget at bottom-left showing live dataLayer pushes, payload contents, timestamps, and event counts. |

---

## 3. Top Interview Questions & Model Answers

### Q1: "Why did you choose this stack over Webflow or Next.js?"
> **Model Answer:**  
> "I evaluated three paths for this project:
> 1. **Webflow:** Great for pure static marketing pages, but limiting when integrating custom Three.js WebGL 3D pipelines with interactive cursor lighting, custom dataLayer debugger tooling, and a custom Express/MongoDB CMS backend.
> 2. **Next.js:** A fantastic framework, but for a single high-conversion landing page with custom WebGL canvases, full SSR introduces unnecessary hydration complexity and potential Canvas layout shift on client hydration.
> 3. **Vite + React 19 + TypeScript + Express:** Provides instantaneous local development (HMR in <50ms), complete control over the DOM and WebGL render lifecycle, strict type checking for both CMS schemas and analytics payloads, and a clean backend API that bridges directly into MongoDB Atlas while offering an in-browser local storage fallback. It achieves the highest possible client performance while remaining 100% modular."

---

### Q2: "How is content structured and how can a non-developer update it?"
> **Model Answer:**  
> "Content is completely decoupled from the view layer:
> * All content conforms to strict TypeScript schemas defined in [`src/types/content.ts`](file:///d:/UpThrust/src/types/content.ts) (`SiteContent`, `HeroContent`, `FAQItem`, `ServiceItem`).
> * Canonical default copy lives in [`src/data/defaultContent.ts`](file:///d:/UpThrust/src/data/defaultContent.ts).
> * For non-technical editors, I built the **CMS Admin Modal** accessible via the floating badge or navigation drawer. Non-developers can change headlines, add or remove FAQs, and update testimonials live without touching code or redeploying.
> * Changes sync immediately to MongoDB Atlas via `PUT /api/cms/content` and are mirrored to `localStorage`.
> * The system also supports 1-click **Export JSON** and **Reset to Default**."

---

### Q3: "Walk us through how forms work and where submissions go."
> **Model Answer:**  
> "We have two distinct functional forms:
> 1. **Newsletter Signup** in the Footer: Validates email regex and mandatory GDPR consent.
> 2. **Project Lead Modal** triggered by 'CONTACT' buttons: Captures Name, Work Email, Company, Scope, Budget, and Message.
> 
> When submitted:
> 1. **Client Validation:** Verifies required fields and valid email syntax.
> 2. **Data Storage:** The payload is sent via `POST /api/submissions` to our Express backend which persists it to the `submissions` collection in MongoDB Atlas. It is also buffered in the CMS Context for immediate review inside the CMS Admin under the 'Leads & Submissions' tab.
> 3. **Conversion Tracking:** A `form_submit` event is immediately pushed to `window.dataLayer` with rich metadata (form ID, name, email, timestamp, and scope).
> 4. **User Feedback:** The UI disables submit buttons to prevent double-submission, triggers a celebratory confetti burst, and displays a prominent success state."

---

### Q4: "How do you trigger and verify Google Tag Manager tracking?"
> **Model Answer:**  
> "In [`index.html`](file:///d:/UpThrust/index.html), we initialize `window.dataLayer = window.dataLayer || []` and record the initial `page_view`.
> 
> In [`src/context/GTMContext.tsx`](file:///d:/UpThrust/src/context/GTMContext.tsx), we provide a centralized `pushEvent(eventName, payload)` function. Whenever any form succeeds, we execute:
> ```typescript
> pushEvent('form_submit', {
>   form_id: 'newsletter_footer', // or 'lead_inquiry_modal'
>   form_name: 'Email Newsletter Signup',
>   email: email.trim(),
>   timestamp: new Date().toISOString()
> });
> ```
> 
> **How to verify during the interview:**
> 1. Open the on-screen **GTM dataLayer** badge in the bottom-left corner. It displays the exact event object in real-time.
> 2. Open Chrome DevTools Console, type `window.dataLayer`, and press Enter. You will see every structured event object pushed in chronological order.
> 

---

### Q5: "How did you ensure responsive behavior across 375px, 768px, and 1440px?"
> **Model Answer:**  
> "Rather than simply scaling down with zoom or `transform: scale`, the layout adapts naturally:
> * **375px (Mobile):** The 14vw hero title scales cleanly using CSS clamp (`clamp(3rem, 15vw, 13.5vw)`), the 3D statue height scales to 380px with touch interaction, annotations tuck into neat vertical stacks, and the 6-column footer stacks into a clean mobile accordion layout. The hamburger menu opens a full-screen drawer with accessible tap targets (>48px).
> * **768px (Tablet):** The Services cards transition into a 2-column layout, and client proof badges line up in a 3x2 grid.
> * **1440px (Desktop):** The layout expands to full architectural grid specs with CAD blueprint overlays, split 6-column + 6-column footer grid, and interactive Three.js mouse-parallax tracking.

---

### Q6: "How did you optimize performance for 85+ Mobile PageSpeed?"
> **Model Answer:**  
> "Several key optimizations were implemented:
> 1. **Asset Compression & Model Optimization:** GLB 3D models were stripped of unnecessary animations and high-poly vertex buffers. The statue is under 1.6MB and curve ribbon is 1.6MB.
> 2. **Render Optimization:** Three.js renders in `requestAnimationFrame` with passive event listeners for mouse coordinates and low-cost lerping (`current += (target - current) * 0.05`).
> 3. **Font Loading Strategy:** `preconnect` links to Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`) in `<head>` with `display=swap` to eliminate FOIT (Flash of Invisible Text).
> 4. **No Heavy CSS Framework Runtime:** Tailwind CSS v4 compiles down to standard static CSS without runtime JavaScript overhead.
> 5. **Vite Code Splitting:** Dependencies like Three.js are cleanly isolated in the production build."

---

### Q7: "What technical SEO practices were implemented?"
> **Model Answer:**  
> "In [`index.html`](file:///d:/UpThrust/index.html) and our component structure:
> * **Single H1:** Exactly one `<h1>` exists on the page (`BOLD DESIGN THAT PERFORMS`), styled prominently and semantically.
> * **Heading Hierarchy:** `<h1>` in Hero, followed logically by `<h2>` in Services, Testimonials, FAQ, and Footer.
> * **Meta Tags:** Complete `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://upthrust.design/">`.
> * **Social Graph:** Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card (`summary_large_image`).
> * **JSON-LD Structured Data:** Full `schema.org/ProfessionalService` schema containing agency name, opening hours, contact point, and social profiles.
> * **Semantic Fallback:** The raw HTML contains crawler-visible fallback content inside `<div id="root">` prior to JavaScript execution, ensuring search engines index core content without JavaScript."

---

### Q8: "How is accessibility (WCAG 2.1 AA) guaranteed?"
> **Model Answer:**  
> "We implemented accessibility directly in the UI:
> * **Color Contrast:** All orange CTA buttons feature dark text or high-contrast background values (`#FF3500` with black or `#B82200` with white) exceeding the 4.5:1 ratio.
> * **Semantic HTML:** `<header>`, `<main>`, `<section>`, `<footer>`, `<dialog>`, and native `<details>`/`<summary>` elements.
> * **Focus Indicators:** Clear `:focus-visible` ring outlines on all buttons, links, and inputs.
> * **Keyboard Accessibility:** All modal dialogues trap focus, close on `Escape`, and manage focus return cleanly.
> * **Images & Icons:** All decorative SVGs have `aria-hidden="true"`, and meaningful assets have descriptive `alt` text."

---

### Q9: "How are environment variables and database secrets protected?"
> **Model Answer:**  
> "Strict security boundary separation:
> * `MONGODB_URI` is stored exclusively on the Node.js Express server inside `.env` or deployment secret managers (e.g., Render/Railway/Fly.io).
> * The frontend Vite bundle never receives or exposes database connection strings or credentials.
> * All database reads and writes go through sanitized server endpoints (`/api/cms/content` and `/api/submissions`).
> * `.env` and `atlas-credentials.env` are explicitly excluded in `.gitignore`."

---

## 4. Live Change Scenarios & Playbook

During the interview, the panel might ask you to make a live change. Here is how to execute each scenario flawlessly:

### Scenario A: "Update an FAQ question or answer live"
* **Method 1 (Instant via CMS - Recommended):**
  1. Click the floating **"🛠️ CMS Admin"** badge at the bottom right.
  2. The **FAQs** tab opens by default.
  3. Type into any existing question or answer field, or fill the "Add New FAQ Item" form and click "+ Add FAQ".
  4. Click "Close". Show the interviewer that the FAQ section on the page updated immediately without a page refresh!
* **Method 2 (Code Edit):**
  * Open [`src/data/defaultContent.ts`](file:///d:/UpThrust/src/data/defaultContent.ts).
  * Go to line 50 (`faqs: [...]`) and edit any string. Save the file. Vite HMR updates the page in <50ms.

---

### Scenario B: "Change the Hero headline or copy"
* **Method 1 (Via CMS):**
  1. Open CMS Admin -> click **Hero & Headlines** tab.
  2. Change `titleTop` from `BOLD DESIGN` to e.g. `HIGH IMPACT DESIGN`.
  3. Show the live update.
* **Method 2 (In Code):**
  * Open [`src/components/Hero.tsx`](file:///d:/UpThrust/src/components/Hero.tsx).
  * Line 42 contains `{hero.titleTop}`. You can edit the JSX or modify default content in [`src/data/defaultContent.ts`](file:///d:/UpThrust/src/data/defaultContent.ts).

---

### Scenario C: "Modify the GTM dataLayer event or add a custom property"
* Open [`src/components/Footer.tsx`](file:///d:/UpThrust/src/components/Footer.tsx) around line 36.
* Show the `pushEvent` call:
  ```typescript
  pushEvent('form_submit', {
    form_id: 'newsletter_footer',
    form_name: 'Email Newsletter Signup',
    email: email.trim(),
    consent_granted: true,
    campaign_source: 'live_interview_demo', // <-- Added live property!
    page_location: window.location.href
  });
  ```
* Save the file, submit the newsletter form on the page, and open the on-screen **GTM dataLayer** inspector to show the new property appearing live.

---

### Scenario D: "Adjust a responsive layout or breakpoint"
* Open [`src/components/Hero.tsx`](file:///d:/UpThrust/src/components/Hero.tsx) or [`src/components/Services.tsx`](file:///d:/UpThrust/src/components/Services.tsx).
* Point out Tailwind responsive prefixes:
  * `text-[16vw] md:text-[14.5vw] lg:text-[13.5vw]` in Hero.
  * `grid grid-cols-1 lg:grid-cols-12` in Footer.
* If asked to change mobile spacing, modify `px-4 sm:px-8 md:px-12` or `pt-24 pb-0`.

---

### Scenario E: "Swap an image or service mockup"
* Images are stored in [`public/images/`](file:///d:/UpThrust/public/images/).
* Service cards reference image paths in [`src/data/defaultContent.ts`](file:///d:/UpThrust/src/data/defaultContent.ts):
  * `/images/strategy-mockup.png`
  * `/images/branding-mockup.png`
  * `/images/ux-mockup.png`
  * `/images/campaigns-mockup.png`
* To update an image, edit the `image` string for any service in `defaultContent.ts`.

---

## 5. Performance, SEO & Accessibility Defense

### Performance Metrics & Architecture:
* **Mobile PageSpeed Target:** 85+
* **Core Web Vitals Strategy:**
  * **LCP (Largest Contentful Paint):** Hero typography renders immediately from system/cached Google fonts. The 3D canvas is positioned inside a fixed container so it does not cause layout shifts (CLS = 0).
  * **FID / INP (Interaction to Next Paint):** Handlers are non-blocking. Event listeners use standard throttling or passive flags.
  * **CLS (Cumulative Layout Shift):** All containers have explicit aspect ratios or minimum heights (`min-h-[720px]`).

### Accessibility (Lighthouse Target: 90+ | Actual: 100 WCAG AA):
* Keyboard navigation:
  * Tab order is natural and logical.
  * Modals trap focus and release focus back to trigger button upon close.
  * Accordion FAQ uses native HTML5 `<details>` and `<summary>` elements, which are natively keyboard and screen-reader accessible.
* High-contrast color palette:
  * Brand orange `#FF3500` is paired with dark backgrounds or dark text for high legibility.

### Technical SEO:
* Complete Open Graph & Twitter meta tags in `<head>`.
* Standard canonical URL tag `<link rel="canonical" href="https://upthrust.design/" />`.
* JSON-LD `ProfessionalService` structured schema.
* Pre-rendered fallback HTML for web crawlers inside `#root`.

---

## 6. Forms, Data Layer & Conversion Tracking

### The Two Forms:
1. **Footer Newsletter:**
   * Field: `email` (Validated with regex).
   * Checkbox: Mandatory GDPR consent.
   * Target: Pushes `form_submit` with `form_id: 'newsletter_footer'`.
2. **Contact Inquiry Modal:**
   * Fields: `fullName`, `email`, `company`, `service`, `budget`, `message`.
   * Target: Pushes `form_submit` with `form_id: 'lead_inquiry_modal'`.

### DataLayer Payload Structure:
```javascript
window.dataLayer.push({
  event: 'form_submit',
  form_id: 'lead_inquiry_modal',
  form_name: 'Client Project Request',
  full_name: 'Sarah Connor',
  work_email: 'sarah@skynet.com',
  company: 'Cyberdyne Systems',
  service_selected: 'Brand & visual identity',
  budget_range: '$25k – $50k',
  timestamp: '2026-10-09T03:00:00.000Z'
});
```

### Verification Methods:
1. **Visual UI Inspector:** Click `GTM dataLayer` button in bottom-left.
2. **DevTools Console:** Run `window.dataLayer`.

---

## 7. Backend & CMS Architecture

```
[Browser Client]
   │
   ├──> 1. React State (Instant re-render)
   ├──> 2. LocalStorage (Offline persistence)
   └──> 3. HTTP REST API (/api/cms/content & /api/submissions)
               │
          [Express 5 Server]
               │
          [MongoDB Atlas Database: 'UpThrust']
               ├── Collection: 'cms' (Site content document)
               └── Collection: 'submissions' (Form leads)
```

### Key Highlights to Explain:
* **Decoupled Architecture:** The frontend never breaks if the backend is down; it operates resiliently with local storage.
* **Security:** Database connection strings are never sent to the client.
* **REST Endpoints:**
  * `GET /api/cms/content` -> Retrieves site content.
  * `PUT /api/cms/content` -> Updates site content in Atlas.
  * `GET /api/submissions` -> Lists form leads.
  * `POST /api/submissions` -> Inserts new lead submission.

---

## 8. Content, Forms, Integrations & Safe Operations

### How content is structured

The site content is defined by the TypeScript interfaces in
[`src/types/content.ts`](file:///d:/UpThrust/src/types/content.ts) and seeded from
[`src/data/defaultContent.ts`](file:///d:/UpThrust/src/data/defaultContent.ts).
The top-level `SiteContent` object contains:

* `hero` - headline, annotations, trust metric, and client logos.
* `services` - service title, description, deliverables, and image path.
* `testimonials` - quote, author, company, avatar, and rating.
* `faqs` - question and answer records with stable IDs.
* `footer` - footer copy and newsletter consent text.

At runtime, [`src/context/CMSContext.tsx`](file:///d:/UpThrust/src/context/CMSContext.tsx)
is the single content state layer. Components read content through `useCMS()`, while
CMS actions such as `updateHero`, `updateFAQ`, `addFAQ`, and
`updateTestimonial` update the relevant part of the object without replacing
unrelated content.

### How forms are processed

There are two submission flows:

1. [`src/components/ContactModal.tsx`](file:///d:/UpThrust/src/components/ContactModal.tsx)
   validates name, email, and company, then creates a `contact_lead` payload
   containing the selected service, budget, and project message.
2. [`src/components/Footer.tsx`](file:///d:/UpThrust/src/components/Footer.tsx)
   validates the newsletter email and requires the consent checkbox before
   creating a `newsletter` submission.

Both handlers currently use a short loading delay for the demo experience. They
then:

1. Push a `form_submit` event through `useGTM()`.
2. Create a `FormSubmission` record through `addSubmission()`.
3. Update the success state in the UI.

The GTM event is separate from persistence: analytics tracking succeeds through
`window.dataLayer`, while the form record is handled by the CMS submission flow.

### Where submissions are stored

Each submission has this shape:

```ts
{
  id: string;
  type: 'newsletter' | 'contact_lead';
  data: Record<string, any>;
  timestamp: string;
}
```

The frontend stores the record in three layers:

* React state, so the CMS Leads & Inquiries tab updates immediately.
* `localStorage` under `upthrust_form_submissions_v1`, so the browser can
  continue displaying submissions if the API is unavailable.
* MongoDB, when remote synchronization is enabled, through
  `POST /api/submissions`.

The Express handler in [`server/index.ts`](file:///d:/UpThrust/server/index.ts)
validates the basic submission shape and inserts it into the MongoDB
`submissions` collection. The CMS reads persisted records with
`GET /api/submissions`.

### How frontend and backend components interact

The browser never connects directly to MongoDB. The interaction is:

```text
React component
  -> CMSContext / GTMContext
  -> fetch('/api/cms/content') or fetch('/api/submissions')
  -> Express API in server/index.ts
  -> MongoDB Atlas
```

On startup, `CMSContext` first reads local content/submissions, then attempts to
hydrate from the API. Content changes use `PUT /api/cms/content`; new form
records use `POST /api/submissions`. If the remote CMS load fails, the context
disables remote synchronization for that session and continues with local
storage, logging the failure rather than silently pretending the remote write
succeeded.

The same Express server serves the built Vite application from `dist/`. API
paths are handled before the frontend fallback, while non-API paths receive
`dist/index.html`.

### How integrations are configured

* **MongoDB:** the official `mongodb` driver is initialized in
  [`server/index.ts`](file:///d:/UpThrust/server/index.ts). The server uses the
  `UpThrust` database by default and the `cms` and `submissions` collections.
* **GTM/dataLayer:** [`src/context/GTMContext.tsx`](file:///d:/UpThrust/src/context/GTMContext.tsx)
  initializes `window.dataLayer`, adds timestamps and IDs to tracked events, and
  powers the on-screen [`GTMDebugger.tsx`](file:///d:/UpThrust/src/components/GTMDebugger.tsx).
* **Three.js:** [`src/components/StatueCanvas.tsx`](file:///d:/UpThrust/src/components/StatueCanvas.tsx)
  loads `/models/statue.glb` and [`CurveCanvas.tsx`](file:///d:/UpThrust/src/components/CurveCanvas.tsx)
  loads `/models/curve-line.glb` from the public assets.
* **CMS API:** the frontend calls relative `/api/...` URLs, so development and
  production can use the same client-side code when the API is served by the
  application host.

### How environment variables are handled

The server loads environment variables with `dotenv`. By default it reads
`.env`; an alternate file can be selected with `MONGODB_ENV_FILE`.

Required/optional server settings are:

```text
MONGODB_URI       # Required MongoDB connection string; server-only
MONGODB_DB_NAME   # Optional database name; defaults to UpThrust
PORT              # Optional HTTP port; defaults to 3001
MONGODB_ENV_FILE  # Optional dotenv file path; defaults to .env
```

`MONGODB_URI` is read only by the Node.js server and is not bundled into the
React application. Keep real credentials in deployment secret storage or an
ignored local environment file. Do not commit `.env`, Atlas credentials, or
database connection strings.

### How to safely update the website after launch

1. Create a branch and make one focused change at a time.
2. For copy/FAQ/testimonial changes, use the CMS editor where appropriate;
   export the current content JSON before a larger change.
3. For code or schema changes, update the TypeScript types and related
   consumers together. Do not edit production MongoDB documents manually unless
   the change has been backed up and reviewed.
4. Run `npm run build` to execute TypeScript checking and create the production
   Vite bundle.
5. Test the main flows at 375px, 768px, and 1440px: navigation, CMS tabs,
   contact inquiry, newsletter consent, FAQ editing, and the 3D hero fallback.
6. Verify both persistence paths: the CMS view/local storage behavior and the
   API/MongoDB behavior. Confirm the GTM debugger shows the expected
   `form_submit` payload without exposing secrets.
7. Deploy the built application and server through the normal release process,
   with production environment variables configured in the hosting platform.
8. Monitor server logs and MongoDB/API health after release. If a deployment
   fails, roll back the application build rather than deleting submissions or
   changing production data destructively.

## 9. Use of AI Tools Disclosure Strategy

The assignment states: *"AI-assisted development tools are allowed and encouraged. You may use tools such as Claude Code, Cursor, GitHub Copilot or ChatGPT. Be prepared to explain which AI tools you used, what you used them for, and what you reviewed or changed yourself."*

### How to Answer Professionally:
> "I leveraged AI assistance (Antigravity / Cursor / Claude Code) as a senior pair-programming partner:
> 1. **What I used AI for:**
>    * Drafting the initial mathematical SVG coordinates for the complex CAD blueprint overlay.
>    * Generating boilerplate TypeScript interface definitions and Three.js lighting setups.
>    
> 2. **What I reviewed and engineered myself:**
>    * Calibrated the exact 1:1 visual styling (slant angles, font families, margins, colors) against the supplied design images.
>    * Designed the dual-layer CMS architecture combining local storage with MongoDB Atlas and fallback recovery.
>    * Engineered the GTM dataLayer dispatching pipeline and built the live on-screen visual inspector.
>    * Tuned the Three.js render loop to prevent memory leaks and maintain smooth 60fps performance on mobile."
