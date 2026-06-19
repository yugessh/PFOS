# Emulator Setup

## Starting Emulators

- **All emulators (Firestore & Auth)**
  ```bash
  npm run emulators:start
  ```

- **Only Firestore**
  ```bash
  npm run emulators:firestore
  ```

- **Only Auth**
  ```bash
  npm run emulators:auth
  ```

The emulators will be available at:
- Firestore: `http://127.0.0.1:8080`
- Auth: `http://127.0.0.1:9099`
- Emulator UI: `http://127.0.0.1:4000`

## Using Emulators in Development

Firebase is automatically initialized by the app. When running locally, the Firebase SDK detects the emulator configuration from `firebase.json`. No code changes are required.
