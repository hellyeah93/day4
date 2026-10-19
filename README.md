# DAYZERO — Mission Planner

A dark, responsive planning dashboard with a task editor, horizontal date timeline, countdowns, local notifications, backup import/export, optional Firebase authentication/sync, and GitHub Actions build workflows for Windows and Android.

## What's implemented

- Two primary tabs: Plan Editor and Calendar Timeline.
- Date-based task creation/editing/deletion, date ranges, priority, deadline, recurrence metadata, and completion tracking per date.
- Bulk import format: `YYYY-MM-DD: Task title` or `YYYY-MM-DD to YYYY-MM-DD: Task title`.
- Configurable visible date range, month slider, date tiles, task completion progress, consistency map, upcoming deadlines.
- Multiple countdowns with calculated remaining days and an animated progress ring.
- Local browser/app storage so the planner can be used before Firebase is configured.
- JSON backup export/import.
- Electron desktop notifications and Capacitor local notification integration.
- Firebase email/password and Google sign-in, per-user Firestore storage, and storage/firestore rules.
- Separate GitHub Actions workflows for Windows installer and Android debug APK.
- Responsive UI, mobile safe-area padding, reduced-motion support, and date utility tests.

## Requirements

- Node.js 22 or later
- npm
- For Android local builds: Java 21 and Android SDK
- A Firebase project for cross-device sync/authentication

## Run locally

```bash
npm install
npm run dev
```

## Windows desktop

Development:

```bash
npm run electron:dev
```

Build installer:

```bash
npm run electron:build
```

The installer is created in `release/`. Windows notifications use Electron's native Notification API. A scheduled briefing is scheduled while the app process is running; a fully closed app cannot execute JavaScript timers. If you need reminders while the desktop app is closed, add a Windows startup/background scheduling service in a later iteration.

## Android APK

First create the native Android project, then build/sync:

```bash
npx cap add android
npm run android:sync
cd android
./gradlew assembleDebug
```

APK path: `android/app/build/outputs/apk/debug/app-debug.apk`.

Android notifications require runtime permission on supported Android versions. OEM battery-management settings may affect exact delivery times. For reliable recurring reminders, use Android's native scheduling mechanisms and verify on a physical device. The current app schedules an immediate local notification for the notification test and uses an in-process timer for the daily briefing while the web app remains active; it does not yet guarantee background delivery when the app is force-stopped.

## Firebase setup (for phone ↔ PC sync)

1. Create a project in the Firebase console.
2. Register a Web app and copy its Firebase web config.
3. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values.
4. Enable Email/Password and Google providers under Authentication.
5. Create a Cloud Firestore database.
6. Deploy `firestore.rules` and `storage.rules` using the Firebase CLI or console.
7. Enable Cloud Storage if you want file backups/attachments.
8. Rebuild/restart the app after changing `.env`.
9. Sign in with the same account on both devices.

Example:

```bash
cp .env.example .env
npm run dev
```

The Firebase web config is client configuration, not an admin credential. Never commit service-account keys or private signing keys. Firestore and Storage security rules are mandatory; do not rely on obscuring project configuration.

Cloud Storage is configured for optional files, while structured tasks/countdowns are stored in Firestore. JSON export/import works independently of Firebase.

## GitHub Actions: build EXE and APK

1. Create an empty GitHub repository.
2. Upload/push all files from this folder, including the hidden `.github` directory.
3. Commit `package-lock.json` after running `npm install` locally. (The workflow uses `npm install` so it can still install without a lockfile, but a committed lockfile is recommended for reproducible builds.)
4. Open **Actions** in GitHub.
5. Run **Build Windows EXE** or **Build Android APK**, or push to `main`/`master`.
6. Download the artifact at the bottom of the successful workflow run.

The Windows workflow uploads `DayZero-Setup.exe` (the exact generated filename may include version/architecture depending on electron-builder). The Android workflow uploads a debug APK. A debug APK is suitable for device testing but is not a signed store release. Keep Android signing keys in GitHub Secrets if you later configure a release workflow.

## Bulk plan examples

```text
2026-10-20: Complete EMI PYQs
2026-10-21 to 2026-10-23: Finish differential equations
2026-10-24: Revise chemical kinetics
```

Dates must use `YYYY-MM-DD`. Ambiguous lines are reported rather than silently imported.

## Known limitations to verify on device

- The app currently supports local-first data and optional cloud sync. Concurrent multi-device edits use a simple last-write save of the app document; this should be upgraded to per-task documents/transactions before relying on heavy simultaneous editing.
- Recurrence definitions are stored and displayed; weekly/monthly occurrence matching is implemented for calendar display. Recurring completion records are tracked by date.
- Background notifications are platform-sensitive. The current in-app daily timer does not guarantee delivery after force-close or process termination. Reliable Android delivery while closed requires native scheduled notifications (and device testing); reliable Windows delivery while the app is closed requires a Windows scheduled/background component.
- Google popup sign-in may require additional configuration depending on Electron/Android packaging. Test the selected provider on target devices.
- This project has source/configuration and workflows, but it must be built and tested on real Windows and Android devices before calling it release-ready.

## Tests

```bash
npm test
npm run typecheck
npm run build
```
