# PFOS Android APK Build Guide

## Quick Start (5 steps)

### 1. Install Dependencies
```bash
npm install
npx cap sync android
```

### 2. Build Web App
```bash
npm run build
```

### 3. Verify Everything
```bash
npx tsc --noEmit
npm run build
```

### 4. Open Android Studio
```bash
npx cap open android
```

### 5. Generate APK in Android Studio
- Navigate to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Or use command line:
```bash
cd android
./gradlew assembleDebug      # Debug APK
./gradlew assembleRelease    # Release APK (requires signing keystore)
```

---

## Configuration Checklist

### Before Building
- [ ] Capacitor config correct: `capacitor.config.json`
- [ ] Web build output: `.next/standalone/public`
- [ ] Firebase config: `android/app/google-services.json` (optional for emulator)
- [ ] App version: `android/app/build.gradle`
- [ ] Signing keystore: `android/app/keystore.jks` (release builds only)

### Capacitor Config
**File:** `capacitor.config.json`
```json
{
  "appId": "com.pfos.app",
  "appName": "PFOS",
  "webDir": ".next/standalone/public",
  "plugins": {
    "SplashScreen": {
      "backgroundColor": "#080A0F"
    }
  }
}
```

---

## Build Variants

### Debug APK
```bash
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```
- **Use for:** Development, emulator testing, physical device testing
- **Signing:** Automatic
- **Size:** Larger (includes debug symbols)

### Release APK
```bash
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release-unsigned.apk
```
- **Use for:** Play Store submission
- **Signing:** Requires keystore configuration
- **Size:** Smaller, optimized

---

## Firebase Integration

### If Using Real Firebase
1. Add `google-services.json` to `android/app/`
   - Download from Firebase Console
   - Place in project root `android/app/` folder

2. Verify Firebase is initialized:
   - Check `src/firebase/firebase.ts`
   - Should use real credentials

3. Test Firestore:
   - Sign in with test account
   - Create/read transactions
   - Verify sync

### For Emulator (Local Testing)
- Firestore emulator can run locally
- See: `src/services/firestore/config.ts`

---

## Testing on Device

### Physical Device
1. Enable Developer Mode
   - Go to Settings → About → Build number (tap 7 times)
   - Enable USB Debugging in Developer Options

2. Connect via USB

3. Deploy APK:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Emulator
1. Start emulator in Android Studio
2. Build and run
3. APK installs automatically

---

## Common Issues

### "WebDir not found"
- **Issue:** `capacitor.config.json` pointing to wrong path
- **Fix:** Ensure `webDir` is `.next/standalone/public`

### Build fails with "Gradle not found"
- **Issue:** Gradle not properly installed
- **Fix:** 
```bash
cd android
chmod +x gradlew
./gradlew --version
```

### Firebase not initializing
- **Issue:** `google-services.json` missing or invalid
- **Fix:** 
  - Download correct `google-services.json` from Firebase Console
  - Place in `android/app/` 
  - Run `npx cap sync android` to rebuild

### APK too large
- **Issue:** Debug APK includes unnecessary files
- **Fix:** Use release build with ProGuard/R8 minification

---

## Performance Tips

### Reduce APK Size
- Use release variant (minified)
- Enable R8 code shrinking in `android/app/build.gradle`
- Remove unused dependencies

### Faster Builds
- Use `--daemon` for Gradle
- Enable build caching
- Skip tests: `./gradlew assembleRelease -x test`

### Faster Deployment
- Use emulator with snapshot
- Connect physical device for incremental updates

---

## Environment Variables

### `.env.local` (Next.js)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Monitoring

### View Logs on Device
```bash
adb logcat
adb logcat | grep PFOS
adb logcat | grep Firebase
```

### Debugging
- Open Chrome: `chrome://inspect`
- Connect via USB
- Debug remotely

---

## Release Checklist

Before submitting to Play Store:
- [ ] All routes tested on device
- [ ] Transactions sync correctly
- [ ] Offline mode works
- [ ] Notifications appear
- [ ] Backup/restore tested
- [ ] No console errors
- [ ] Icons display correctly
- [ ] Splash screen shows
- [ ] Login/signup work
- [ ] Firebase rules configured for production

---

## Contact & Support

For issues during build:
1. Check RELEASE_VALIDATION.md
2. Review `src/firebase/firebase.ts`
3. Check Capacitor docs: https://capacitorjs.com/
4. Check Android docs: https://developer.android.com/

---

**Happy building! 🚀**
