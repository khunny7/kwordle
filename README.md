# K-Wordle (React + Vite)

This is a lightweight web app built with React and Vite.

## Getting Started

1. Install dependencies: `npm install`
2. Start in development: `npm run dev`
3. Build for production: `npm run build`
4. Preview the built app locally: `npm run preview`

## Structure
- `src/` - React source code
- `public/` - Static assets

## Notes
- No Electron dependencies are used. The app runs in the browser.

## Word list
- The app loads `public/allowed.json` for guess validation and uses curated answers in `src/wordlist.js`.
- To regenerate `allowed.json`, you can edit your source and run `npm run generate:wordlist`.

Notes:
- The generator decomposes Hangul to compatibility jamo and expands jongseong clusters.
- It filters to exactly 6 jamo and to characters supported by the on-screen keyboard.
- The app unions `allowed.json` with curated 6-jamo answers so all answers are always valid guesses.

## Deploy to Firebase Hosting
1. Install Firebase CLI (globally or via npx):
	- Global (optional): `npm install -g firebase-tools`
	- Or use npx per run.
2. Login and set your project:
	- `firebase login`
	- Update `.firebaserc` default to your project ID.
3. Deploy:
	- `npm run deploy`
	- This runs a production build (Vite outputs to `dist`) and then `firebase deploy` using `firebase.json`.
