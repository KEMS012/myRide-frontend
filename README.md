# MyRyde

MyRyde is a role-based ride-sharing and transport platform built with React, Vite, Firebase, and Firestore.

## Features

- Landing page for public users
- Authentication and role-based dashboards for riders, drivers, partners, and admins
- Ride booking, schedules, trip history, and profile management
- Firebase-backed user and ride data

## Local development

1. Copy `.env.example` to `.env` and fill in your Firebase and Paystack credentials:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

This project uses GitHub Actions to build and deploy to GitHub Pages. Your secrets (Firebase keys, Paystack key) are stored as GitHub Secrets and are **never** committed to the repository.

### One-time setup

1. **Push this project to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/myRyde.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo on GitHub → **Settings** → **Pages**
   - Under **Build and deployment** → **Source**, select **GitHub Actions**

3. **Add your secrets to GitHub:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret** and add each of the following:

   | Secret name | Value |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | Your Firebase API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `myryde-ab054.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | e.g. `myryde-ab054` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `myryde-ab054.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | e.g. `839830544305` |
   | `VITE_FIREBASE_APP_ID` | e.g. `1:839830544305:web:b6a033f088619a6f0e2790` |
   | `VITE_FIREBASE_MEASUREMENT_ID` | e.g. `G-GV996BCRR6` |
   | `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack public key |

### How deployment works

- Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`).
- The workflow installs dependencies, builds the app with Vite (injecting your secrets as environment variables), and deploys the `dist/` folder to GitHub Pages.
- Your `.env` file is listed in `.gitignore` and is **never** committed or pushed.

### Manual deployment

You can also trigger the workflow manually:
- Go to **Actions** → **Build and Deploy to GitHub Pages** → **Run workflow**