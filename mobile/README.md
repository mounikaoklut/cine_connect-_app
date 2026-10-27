# CineConnect Mobile App 🎬📱

The official cross-platform mobile application for **CineConnect**, connecting film and media talent with top production opportunities, casting calls, and screenplay pitch funding.

---

## 🛠 Mobile Architecture

* **Framework:** Flutter 3.20+ (Dart 3.x)
* **Platforms:** Android & iOS (Single unified codebase)
* **Design System:** Cinematic Noir & Amber Gold dark mode (Tailored Material 3 with Plus Jakarta Sans & Space Grotesk fonts)
* **Backend:** FastAPI async REST endpoints (`http://localhost:8000` / `http://10.0.2.2:8000`)

---

## 📱 Features Included

1. **Public Showcase Landing Screen (`landing_screen.dart`)**:
   * Dynamic hero headline with live season badges.
   * Real-time metrics bar (15,400+ artists, 480+ OTT projects, ₹45Cr+ cast budgets).
   * 4K Showreel preview teaser with anamorphic ratio tags.
   * Horizontal audition notices and talent cards with 1-click apply.

2. **Studio Stream & Live Feed (`home_feed_screen.dart`)**:
   * Creator updates, showreel drops, casting calls, and behind-the-scenes milestones.
   * Interactive like, comment, and share metrics.
   * Post filter chips (`All`, `🎭 Castings`, `🎬 Reels`, `📜 Pitches`, `📸 BTS`).
   * Floating Action Button (FAB) to publish updates directly to the community.

3. **Casting & Audition Board (`auditions_screen.dart`)**:
   * Filterable casting calls with role requirements, shooting dates, and compensation.
   * **Audition Bottom Sheet (`audition_sheet.dart`)**: Headshot selector, self-tape video link, director note, and 1-click submission.

4. **Curated Talent Directory (`talent_directory_screen.dart`)**:
   * Filter artists by craft: Actors, Directors of Photography (DOPs), Sound Designers, Screenwriters.
   * Instant **4K Showreel Dialog (`showreel_dialog.dart`)**: 2.39:1 video player simulation, live timecodes (`TC: 01:24:18:04`), and camera packages (Arri Alexa 35, Cooke Anamorphic).

5. **Screenplay & Pitch Vault (`pitch_vault_screen.dart`)**:
   * Screenplays seeking co-producers & distribution (*The Silent Monsoon*, *Neon Varanasi: 2049*).
   * **Forensic Digital NDA Dialog (`pitch_dialog.dart`)**: Dynamic tamper-proof watermarking agreement.

6. **Audition Application Pipeline (`pipeline_screen.dart`)**:
   * Multi-stage pipeline tracker (`Applied` → `Under Review` → `Tape Shortlisted` → `Callback Scheduled`).
   * One-tap launch into Google Meet / Zoom screen test meetings.

7. **Talent Profile & Media Manager (`profile_screen.dart`)**:
   * 85% completeness meter.
   * Verified credentials and Government ID (Aadhaar & Passport under DPDP Act).
   * Experience timeline across Netflix, Prime Video, and Prithvi Theatre.

---

## 🚀 Running Locally

### 1. Prerequisites
* [Flutter SDK](https://docs.flutter.dev/get-started/install) installed and added to `PATH`.
* Android Studio (with Android SDK & Emulator) or Xcode (for iOS).

### 2. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 3. Run on Connected Device or Emulator
```bash
# Run on default connected device / emulator:
flutter run

# Run specifically on Android:
flutter run -d android

# Run specifically on iOS simulator:
flutter run -d ios
```

### 4. Build Release APK / App Bundle
```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Google Play Store)
flutter build appbundle --release

# iOS Bundle (for App Store)
flutter build ipa --release
```
