# Railway Deployment Setup Guide

This guide will help you set up Railway to automatically deploy your Word Cloud Voting App from GitHub.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. GitHub repository: `https://github.com/thebucur/2026_01_WORDCLOUD.git`

## Step 1: Login to Railway CLI

Open your terminal and run:
```bash
railway login
```

This will open your browser to authenticate with Railway.

## Step 2: Create Railway Project from GitHub

### Option A: Using Railway Web Dashboard (Recommended)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account if prompted
5. Select the repository: `thebucur/2026_01_WORDCLOUD`
6. Railway will automatically detect the project and start deploying

### Option B: Using Railway CLI

After logging in, run:
```bash
cd "d:\Dropbox\CURSOR\2026 01 UL APP CUVINTE"
railway link
```

Then create a new project:
```bash
railway init
```

## Step 3: Configure Build Settings

Railway will automatically detect your Node.js project. The configuration in `railway.toml` will:
- Use Nixpacks builder
- Build the backend service
- Start the backend server
- Use `/health` endpoint for health checks

## Step 4: Set Up Environment Variables (if needed)

If you need any environment variables, you can set them in Railway dashboard:
1. Go to your project in Railway
2. Click on your service
3. Go to "Variables" tab
4. Add any required environment variables

## Step 5: Enable Auto-Deploy

Auto-deploy is enabled by default when connecting a GitHub repository. Railway will:
- Automatically deploy on every push to the main/master branch
- Run builds automatically
- Deploy previews for pull requests (if enabled)

## Step 6: Get Your Deployment URL

1. In Railway dashboard, go to your service
2. Click "Settings"
3. Click "Generate Domain" to get a public URL
4. Your app will be available at the generated domain

## Project Structure

This is a monorepo with:
- **Backend**: Node.js/Express server with WebSocket support (runs on Railway's PORT)
- **Frontend**: React/Vite app (currently configured for local development)

## Notes

- The backend server is configured to use Railway's PORT environment variable
- Health check endpoint is available at `/health`
- WebSocket support is included for real-time updates
- For production, you may want to set up a separate frontend service or serve static files from the backend

## Troubleshooting

- Check Railway logs: `railway logs` or view in dashboard
- Verify build is successful in Railway dashboard
- Ensure all dependencies are in package.json
- Check that PORT environment variable is being used correctly
