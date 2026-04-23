# Arth-Verse Mobile App — Play Store & App Store Release Guide

This guide walks you through converting the Arth-Verse PWA into native Android (Play Store) and iOS (App Store) apps using **Capacitor 7**. All server-side code is already wired. You just need to build the binaries on your local machine and submit them to the stores.

---

## Part 0 — Prerequisites

### 🖥️ Local machine requirements

| For | You need |
|---|---|
| **Android build** | Any machine (Windows / macOS / Linux) with 16GB+ RAM. ~15GB free disk. |
| **iOS build** | **macOS** (Intel or Apple Silicon) with 16GB+ RAM. ~50GB free disk. iOS builds cannot be done on Windows or Linux. |

### 🔧 Install tooling

**Android (any OS):**
1. Install **Node.js 20+** (LTS) — https://nodejs.org
2. Install **Yarn 1.22** — `npm i -g yarn`
3. Install **Java 17 (JDK)** — https://adoptium.net/ (pick JDK 17 LTS)
4. Install **Android Studio** — https://developer.android.com/studio (includes Android SDK + emulators). First run: let it download all default components.
5. Add these to your shell profile (`~/.bashrc`, `~/.zshrc`, or Windows env):
   ```
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home  # adjust per your install
   export ANDROID_HOME=$HOME/Library/Android/sdk                                      # macOS; Windows: C:\Users\<you>\AppData\Local\Android\Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
   ```
6. Restart terminal. Verify: `java -version` and `adb version` both work.

**iOS (macOS only):**
1. Install **Xcode 15+** from Mac App Store (takes ~1hr; ~40GB).
2. Open Xcode once, accept license, let it install command-line tools.
3. Verify: `xcode-select -p` prints a path.
4. Install **CocoaPods**: `sudo gem install cocoapods`

### 📱 Developer accounts (optional for dev, required for store listing)

| Store | Cost | Where | Time to approve |
|---|---|---|---|
| Google Play | $25 one-time | https://play.google.com/console | Few hours for new account, days for first app review |
| Apple App Store | $99/year | https://developer.apple.com/programs/ | 24-48 hrs for account; 1-7 days for first app review |

You can build & test apps locally **without** either account. Accounts are only needed when you're ready to submit.

---

## Part 1 — Get the project on your laptop

```bash
# Clone/Pull the repo via "Save to Github" button in Emergent first.
git clone git@github.com:<your-username>/<your-repo>.git arth-verse
cd arth-verse/frontend

# Install dependencies (Capacitor 7 packages are already listed in package.json)
yarn install
```

> Note: Emergent's preview runs on Node 20. Do NOT upgrade Capacitor to v8 — it requires Node 22.

---

## Part 2 — Add Android platform

First time only. From `/frontend` directory:

```bash
# 1. Build the production web bundle first (Capacitor needs build/ folder)
yarn build

# 2. Add Android platform (creates /android subfolder with Gradle project)
yarn cap:add:android

# 3. Sync web build → native project
yarn cap:sync
```

After this, you'll have a new `frontend/android/` folder. **Commit this** — it's now part of your repo.

### Open in Android Studio:

```bash
yarn cap:open:android
```

Android Studio will open. Wait for Gradle sync to finish (first time: 5-10 min, downloads SDK components).

### Test on an emulator or device:

- **Emulator**: Tools → Device Manager → create a Pixel 7 / Android 14 device → click the green play button in Android Studio.
- **Real device**: Enable USB debugging on your Android phone (Settings → About → tap Build Number 7× → go back → Developer Options → USB Debugging). Plug in via USB. Pick the device in Android Studio and hit play.

You now have ArthVyay running natively on Android! 🎉

### Change the backend URL (important!)

By default Capacitor will point the app at the bundled `build/` which uses the `REACT_APP_BACKEND_URL` baked in at build time. To set this before building:

```bash
# Edit /app/frontend/.env and set:
REACT_APP_BACKEND_URL=https://your-production-domain.com

# Then rebuild
yarn cap:sync android
```

---

## Part 3 — Add iOS platform (macOS only)

```bash
yarn cap:add:ios
yarn cap:sync
yarn cap:open:ios
```

Xcode opens with the `App.xcworkspace`. First time you'll be prompted to sign the app:

1. Click **App** (top of file tree, blue icon) → **Signing & Capabilities** tab.
2. Tick **"Automatically manage signing"**.
3. Select your **Team** (if you have Apple Dev account) or create one using your Apple ID for free (works for dev only).
4. Hit ▶️ to run on simulator or connected iPhone.

---

## Part 4 — Customize icons & splash

Capacitor ships a default generator. Install once:

```bash
cd frontend
yarn add -D @capacitor/assets
```

Put these files in `frontend/assets/`:
- `icon.png` — **1024×1024** opaque app icon
- `splash.png` — **2732×2732** opaque splash (center-safe)
- `splash-dark.png` — optional dark-mode splash

Then run:

```bash
npx capacitor-assets generate --iconBackgroundColor '#1e3a8a' --splashBackgroundColor '#1e3a8a'
```

This generates all the sizes both Android and iOS need, and drops them into the native projects.

---

## Part 5 — Building release artifacts

### 🤖 Android APK / AAB (for Play Store)

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Pick **Android App Bundle** (`.aab`) — Play Store prefers this
3. Create a keystore (first time only). **SAVE THIS FILE AND PASSWORD FOREVER** — if you lose it, you can never update your app.
   - Keystore path: store somewhere safe like `~/arth-verse-keystore.jks`
   - Key alias: `arthverse`
4. Pick **release** build variant → Finish.
5. `.aab` file is in `frontend/android/app/build/outputs/bundle/release/app-release.aab`

### 🍎 iOS IPA (for App Store)

In Xcode:
1. Top menu: **Any iOS Device (arm64)** as target.
2. Product → Archive (waits 1-3 min).
3. Archives window opens → **Distribute App** → **App Store Connect** → **Upload**.
4. Follow signing wizard.

---

## Part 6 — Play Store submission

1. Go to https://play.google.com/console → Create app
2. Fill app details (name: ArthVyay, category: Finance, content rating: Everyone).
3. Upload screenshots (you need: 2+ phone screenshots at min 320px, 1 feature graphic 1024×500).
4. Complete the **Data Safety** form (critical — your app handles financial data).
5. Upload your `.aab` under **Production** → **Create new release**.
6. Click **Review release** → **Start rollout**. First review: 1-7 days.

---

## Part 7 — App Store submission

1. Go to https://appstoreconnect.apple.com → My Apps → ➕ → New App.
2. Fill SKU, bundle ID (must match `appId` in capacitor.config.ts = `com.arthverse.app`).
3. Upload screenshots (6.7" iPhone + 6.5" iPhone at minimum).
4. Under **TestFlight** tab you'll see your uploaded build. Add it to a test group to test via TestFlight link.
5. When ready for store: **App Store** tab → fill description, keywords, privacy URL → **Submit for Review**.

---

## Part 8 — Ongoing workflow

After adding both platforms once, your daily loop is:

```bash
# Make web changes, then:
yarn cap:sync          # rebuilds web + copies to native shells
yarn cap:run:android   # or cap:run:ios to test
```

OR for hot-reload development on device, edit `capacitor.config.ts`:

```ts
server: {
  url: 'http://<your-laptop-local-ip>:3000',  // e.g. http://192.168.1.5:3000
  cleartext: true,
}
```

Then run `yarn start` in one terminal and `yarn cap:run:android` in another. Changes hot-reload live on the device.

---

## Part 9 — Security checklist before release

- [ ] Set `REACT_APP_BACKEND_URL` to your production backend (not the Emergent preview URL).
- [ ] Remove `?demo=true` bypasses in code (currently in PeerComparison, reports).
- [ ] Review data safety form for Play Store (covers: collects PAN, gmail reads, financial data).
- [ ] Add a **Privacy Policy URL** — mandatory for both stores when collecting user data.
- [ ] Rotate all API keys baked into the build (if any in `.env`, they're visible to anyone who decompiles the APK).
- [ ] Enable ProGuard/R8 obfuscation in `android/app/build.gradle` (`minifyEnabled true`).

---

## ✅ What's already done for you

- ✅ Capacitor 7 packages added to `package.json`
- ✅ `capacitor.config.ts` configured with brand colors + iOS/Android tuning
- ✅ `src/lib/capacitor.js` bridge helpers — auto-hides splash, styles status bar, wires Android back button
- ✅ `initCapacitor()` called on App mount — no-op on web, activates plugins on native
- ✅ Build scripts in package.json: `yarn cap:sync`, `yarn cap:run:android`, etc.
- ✅ Triggerhaptic helper ready to use on key actions (Auto-Apply, Save, etc.)
- ✅ PWA manifest + service worker already shipped
- ✅ Mobile-optimized UI (bottom nav, safe-area insets, responsive snapshot grid)

## ⏳ What you need to do on your machine

1. Follow Part 0 tooling install (30-60 min).
2. Follow Part 2 → Android setup (~15 min).
3. (Optional) Follow Part 3 → iOS setup on macOS.
4. Follow Part 4 → custom icon/splash.
5. Get dev accounts + submit (few hours spread over a week).

Total realistic timeline from zero → live on Play Store: **3-5 days** (most of that is waiting for Google's review).

---

## Troubleshooting quick-hits

| Problem | Fix |
|---|---|
| `npx cap sync` says "could not find web assets" | Run `yarn build` first |
| Gradle sync fails with "SDK not found" | Check `ANDROID_HOME` env var |
| App shows blank white screen | Check `REACT_APP_BACKEND_URL` is HTTPS (Android blocks HTTP by default) |
| iOS build fails with "No signing certificate" | Sign in with Apple ID in Xcode → Preferences → Accounts |
| Android back button exits app instead of going back | Already fixed — `initCapacitor()` wires it to `window.history.back()` |

---

**Questions? Ping me and I'll help debug any specific step.**
