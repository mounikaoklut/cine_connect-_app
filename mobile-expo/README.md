# CineConnect Mobile Frontend (Expo + React Native) 🎬📱

A production-ready, highly polished cross-platform mobile frontend application featuring a **Paired 2-Option Rotary Wheel Navigation Dock**, built with React Native (Expo), TypeScript, Tailwind CSS (NativeWind), react-native-reanimated, react-native-gesture-handler, and lucide-react-native.

---

## 💎 Architecture & Features

### 1. Concept & Visual Styling
- **Theme:** Dark-mode film/entertainment industry aesthetic (`#0B0F17` background, `#F59E0B` amber/gold glowing accents, glassmorphic dark slate cards).
- **Concentric Orbital Dock:** Permanently anchored at the bottom viewport with curved concentric orbital rings, radial dark ambient glow, and safe-area clearance (`react-native-safe-area-context`).
- **Quick Action Controls:**
  - `◀ Rotate` left button (steps backward between pairs)
  - `● PAIR X/3 • SWIPE WHEEL` (live pulsing amber detent instruction)
  - `Rotate ▶` right button (steps forward between pairs)
- **Center Bottom Thumb-Dial:** Amber-bordered notch with mechanical grip lines.

### 2. Paired 2-Option Rotary Wheel Navigation (`src/components/RotaryWheelNav.tsx`)
6 destinations organized into **3 Paired Stages** (presenting 2 paired options per rotational step):
- **Pair 1:** `Home` (primary/apex) + `Opportunities` (companion)
- **Pair 2:** `My Applications` (primary/apex) + `Portfolio` (companion)
- **Pair 3:** `Profile` (primary/apex) + `Settings` (companion)

#### Visual Hierarchy:
- **Selected / Focused Option:** Sits at the top apex ($-90^\circ$). Prominent, glowing circular amber button (`#F59E0B`), dark icon inside, pill badge label beneath it, and ambient outer glow halo.
- **Companion / Secondary Option:** Visible on the orbital arc at an adjacent angle ($-45^\circ$), styled in semi-transparent dark gray glass with a smaller outline icon and text label. Tapping it promotes it to apex!
- **Inactive Background Options:** Rest on the lower portion of the wheel arc with reduced opacity ($0.15$) and scale ($0.65$), rotating into view as the dial turns.

#### Gestures & Physics:
- `Gesture.Pan()` tracks horizontal drag / swipe smoothly on the Reanimated UI thread.
- Snapping with `withSpring` physics and `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
- Step buttons (`◀ Rotate` / `Rotate ▶`) smoothly rotate by $120^\circ$ stages.

---

### 3. Screen Views (CineConnect Film & OTT Production Theme)

1. 🏠 **Home Screen (`src/screens/HomeScreen.tsx`)**:
   - Roy Kapur Films spotlight banner with *"Request Pitch Package"* CTA.
   - Live media feed with studio announcements, open casting calls (YRF), post-production crew calls (Excel Entertainment), and BTS milestones (Maddock Films).
   - Interactive likes, comment counts, share metrics, and NDA pitch package requests.

2. 🧭 **Opportunities Screen (`src/screens/OpportunitiesScreen.tsx`)**:
   - Filter chips: `All`, `Directing`, `Cinematography`, `Post-Production`, `Writing`, `Acting`.
   - Production cards showing role title, studio, director, shooting dates, compensation (`₹28,00,000`), location (`Mumbai & Berlin`), requirement tags, and *"Apply Now"* button.

3. 📄 **My Applications Screen (`src/screens/ApplicationsScreen.tsx`)**:
   - Status tabs: `All`, `Submitted`, `Under Review`, `Audition/Interview`, `Archived`.
   - 4-stage visual progress stepper (`Submitted` → `Under Review` → `Audition` → `Selected`).
   - Confirmed meeting date callouts and direct producer messaging CTA.

4. 📂 **Portfolio Screen (`src/screens/PortfolioScreen.tsx`)**:
   - Creator 4K showreel video card with timecode simulation (`TC 01:24:18:04`), 2.39:1 anamorphic ratio, and Arri Alexa 35 / Cooke specs.
   - Verified guild credentials (WICA, SWA).
   - Official film credits list (Sacred Games S2, Gangs of Wasseypur 4K, The Blue Monsoon, Darlings).
   - Downloadable pitch decks with forensic NDA watermarking (*Neon Varanasi: 2049*, *The Silent Monsoon*).

5. 👤 **Profile Screen (`src/screens/ProfileScreen.tsx`)**:
   - Verified creator hero with DPDP Act verification badge and union affiliations.
   - Expandable bio & director's statement.
   - Owned camera & lighting gear list (Arri Alexa 35, Cooke Anamorphic set, Ronin 2, Teradek Bolt 4K).
   - Official agency representation contacts (Collective Artists Network).

6. ⚙️ **Settings Screen (`src/screens/SettingsScreen.tsx`):**
   - Account & DPDP verification status.
   - Push notification toggles for audition callbacks & producer inquiries.
   - Portfolio privacy switches (Dynamic NDA Watermarking, Pitch Deck Passcode Lock, Public Showcase).
   - Red-accented Sign Out.

---

## 🚀 Running Locally

```bash
cd mobile-expo
npx expo start
```

- **In Web Browser:** Open [http://localhost:8081](http://localhost:8081)
- **On Phone Browser (Same Wi-Fi):** Open [http://192.168.29.32:8081](http://192.168.29.32:8081)
- **In Expo Go App:** Scan QR code or enter `exp://192.168.29.32:8081`
- **In Android Emulator:** Press `a` in the terminal
