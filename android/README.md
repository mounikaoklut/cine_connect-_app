# CineConnect — Android (Talent Portal)

Native Android port of the CineConnect talent web app (`frontend/src/app/page.tsx` +
`frontend/src/app/profile-setup/page.tsx`), rebuilt with **Kotlin + Jetpack Compose**
and the same *"Cinematic Noir & Amber Gold"* design tokens taken from
`frontend/src/app/globals.css`.

| | |
|---|---|
| Package | `com.cineconnect.talent` |
| Min SDK | 24 (Android 7.0) |
| Compile / target SDK | 35 |
| JDK | 17 |
| AGP / Gradle / Kotlin | 8.7.3 / 8.9 / 2.0.21 |
| Compose BOM | 2024.12.01 |

---

## 1. What is in the app

* **Auth** — email sign-in / sign-up, plus phone + OTP. Tokens are stored in
  `EncryptedSharedPreferences` (falls back to plain prefs on devices without a
  keystore).
* **Talent profile page** (the `My Profile` tab) — hero card with headshot,
  craft badges and availability; profile-strength meter with server-side
  completion suggestions; about, skills, languages and personal details.
  * **Full profile editor** — headshot upload (photo picker → presigned S3 `PUT`
    → `PATCH /users/me`), name, primary + secondary crafts, city/state, travel
    radius slider, gender, date of birth, languages and availability.
  * **Public profile preview** — renders `GET /users/{id}/public`, i.e. exactly
    what a casting director sees.
* **Profile setup wizard** — the 4-step flow from the web app
  (Basic information → Professional details → Skills and about you →
  Portfolio & showreel) with the live completion meter and step checklist.
* **Portfolio** — photo / video / audio cards with Coil previews, open-in-browser,
  delete, and an upload sheet backed by the backend's presigned-upload flow.
* **Credits** — vertical timeline of your experience / credits.
* **ID verification** — email, phone and government-ID verification status.
* **Demo mode** — signed-out users see the same demo talent (`Kabir Mehra`) the
  web portal falls back to, so the whole UI is visible before signing in.

## 2. Pointing the app at your backend

The API base URL is a Gradle property and is baked into `BuildConfig.API_BASE_URL`.
It **must end with a `/`**.

```bash
# Android emulator (10.0.2.2 is the host loopback)
./gradlew assembleDebug -PCINECONNECT_API_BASE_URL=http://10.0.2.2:8000/api/v1/

# Physical device on the same Wi-Fi
./gradlew assembleDebug -PCINECONNECT_API_BASE_URL=http://192.168.1.10:8000/api/v1/
```

Default value: `http://10.0.2.2:8000/api/v1/`.

Cleartext HTTP to `10.0.2.2`, `10.0.3.2`, `localhost` and `127.0.0.1` is allowed
through `res/xml/network_security_config.xml`. For any other host (e.g. your LAN
IP) add it to the same file, or serve the API over HTTPS.

## 3. Building

### Option A — Android Studio (recommended)

1. Install **Android Studio Ladybug (2024.2.1) or newer** and the **Android SDK 35**.
2. `File ▸ Open` → select the `android/` folder → let Gradle sync.
3. Press ▶ **Run** on the `app` configuration.

### Option B — command line

The Gradle **wrapper JAR is not committed** (binary files are not created by the
agent), so generate it once with a locally installed Gradle 8.9+:

```bash
cd android
gradle wrapper --gradle-version 8.9
```

Then:

```bash
./gradlew assembleDebug        # debug APK -> android/app/build/outputs/apk/debug/
./gradlew installDebug         # install on a running device/emulator
```

### Running the backend locally

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The emulator reaches it at `http://10.0.2.2:8000/api/v1/`; a physical device needs
your machine's LAN IP (and the backend bound to `0.0.0.0`).

## 4. Project layout

```
android/
├── build.gradle.kts                 root plugin/dependency declarations
├── settings.gradle.kts              module + plugin repos
├── gradle.properties
└── app/
    ├── build.gradle.kts             API_BASE_URL property, Compose, Retrofit, Coil
    └── src/main/
        ├── AndroidManifest.xml
        ├── res/
        │   ├── font/                Plus Jakarta Sans + Space Grotesk (TTF)
        │   ├── mipmap-*/            launcher icon (adaptive + PNG fallbacks)
        │   ├── values/              colors, strings, theme
        │   └── xml/                 network_security_config.xml
        └── java/com/cineconnect/talent/
            ├── CineConnectApp.kt    DI-lite: SessionManager + CineRepository
            ├── MainActivity.kt
            ├── data/
            │   ├── api/             Retrofit interface + factory (auth interceptor)
            │   ├── model/           @Serializable DTOs, demo content
            │   ├── repository/      CineRepository (ApiResult, error parsing)
            │   └── session/         SessionManager (EncryptedSharedPreferences)
            └── ui/
                ├── auth/            AuthViewModel, AuthScreen
                ├── components/      shared glass / gold component library
                ├── navigation/      CineNavHost
                ├── portal/          portal shell, 4 tabs, edit + upload sheets
                ├── setup/           4-step profile setup wizard
                └── theme/           Color, Type, Shape, Theme
```

## 5. Design tokens

Ported 1:1 from `frontend/src/app/globals.css`:

| Token | Value |
|---|---|
| `--bg-primary` | `#080A0F` |
| `--bg-secondary` | `#0F131C` |
| `--bg-tertiary` | `#161C28` |
| glass | `rgba(16,20,30,0.75)` |
| `--accent-gold` | `#F59E0B` (hover `#D97706`) |
| `--accent-cyan` | `#06B6D4` |
| `--accent-purple` | `#8B5CF6` |
| `--accent-emerald` | `#10B981` |
| `--accent-rose` | `#F43F5E` |
| text | `#F8FAFC` / `#94A3B8` / `#64748B` |
| radii | 8 / 12 / 18 / 9999 dp |
| fonts | Plus Jakarta Sans (body), Space Grotesk (display) |

## 6. Known limitations

* The Gradle wrapper JAR is not in the repo — run `gradle wrapper` once (see 3.B).
* Release builds are not minified (`isMinifyEnabled = false`); enable R8 and add
  Retrofit/kotlinx-serialization keep rules before shipping.
* Uploads are capped at 12 MB in the app and streamed through a presigned
  `PUT`; the backend's own limits still apply.
* **Stack note:** the project architecture document lists *Flutter* for mobile,
  but this app is **native Android (Kotlin + Jetpack Compose)** per the team
  decision for the Android build. If iOS is later added, either port the same
  screens to Flutter or build a separate SwiftUI client — both talk to the same
  FastAPI backend, so no API changes are needed.
