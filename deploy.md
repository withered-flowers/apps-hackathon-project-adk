# Deployment Checklist: Decidely.ai

> **Backend:** Google Cloud Run
> **Frontend:** GitHub Pages
> **AI:** Vertex AI
> **Budget:** $5/month hackathon tier

---

## Phase 0: Prerequisites

- [x] **Install Google Cloud SDK**
  - Download from https://cloud.google.com/sdk/docs/install
  - Run `gcloud init` to authenticate and set your project
  - Verify: `gcloud auth list` and `gcloud config get-value project`

- [x] **Install Docker**
  - Download from https://docs.docker.com/get-docker/
  - Verify: `docker --version`

- [x] **Install Bun**
  - Install from https://bun.sh/
  - Verify: `bun --version`

- [ ] **Push code to GitHub**
  - Ensure your repository contains both `backend/` and `frontend/` directories
  - Verify: `git remote -v` shows your GitHub repo

- [ ] **Google Cloud project with billing enabled**
  - Create at https://console.cloud.google.com
  - Enable billing in **Billing > Link a billing account**
  - Note your project ID (e.g., `genai-cert-apac-project`)

- [ ] **Set your project ID as the active gcloud config**
  ```bash
  gcloud config set project YOUR_PROJECT_ID
  ```

---

## Phase 1: Backend Deployment (Google Cloud Run)

### Step 1: Enable Required Google Cloud APIs

- [ ] Run the following commands to enable all necessary APIs:
  ```bash
  gcloud services enable run.googleapis.com
  gcloud services enable containerregistry.googleapis.com
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable firestore.googleapis.com
  gcloud services enable aiplatform.googleapis.com
  ```

- [ ] Verify all APIs are enabled:
  ```bash
  gcloud services list --enabled
  ```
  You should see `run.googleapis.com`, `containerregistry.googleapis.com`, `cloudbuild.googleapis.com`, `firestore.googleapis.com`, and `aiplatform.googleapis.com` in the output.

### Step 2: Create Firestore Database

- [ ] Create a Firestore database in Native mode:
  ```bash
  gcloud firestore databases create --location=us-central1
  ```

- [ ] Verify the database exists:
  ```bash
  gcloud firestore databases describe
  ```

### Step 3: Create and Configure Service Account

- [ ] Create the service account:
  ```bash
  gcloud iam service-accounts create decidely-ai-sa \
    --display-name="Decidely AI Service Account"
  ```

- [ ] Grant Vertex AI access role:
  ```bash
  gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:decidely-ai-sa@$(gcloud config get-value project).iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
  ```

- [ ] Grant Firestore access role:
  ```bash
  gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:decidely-ai-sa@$(gcloud config get-value project).iam.gserviceaccount.com" \
    --role="roles/datastore.user"
  ```

- [ ] (Optional) Verify the service account exists:
  ```bash
  gcloud iam service-accounts list --filter="decidely-ai-sa"
  ```

### Step 4: Configure Environment Variables

- [ ] Copy the example env file:
  ```bash
  cp backend/.env.example backend/.env
  ```

- [ ] Open `backend/.env` and update the values:
  ```env
  GOOGLE_CLOUD_PROJECT=your-gcp-project-id
  GOOGLE_ADK_MODEL=gemini-3.1-flash-lite-preview
  GOOGLE_GENAI_USE_VERTEXAI=True
  ENVIRONMENT=production
  CORS_ORIGINS=http://localhost:5173
  SQLITE_DB_PATH=:memory:
  ```

  **Important notes:**
  - Replace `your-gcp-project-id` with your actual GCP project ID
  - Do **not** set `GOOGLE_API_KEY` or `GEMINI_API_KEY` — Vertex AI uses the service account for authentication
  - Keep `CORS_ORIGINS=http://localhost:5173` for now; you will update it after the frontend is deployed
  - `GOOGLE_GENAI_USE_VERTEXAI=True` tells the Google ADK to use Vertex AI instead of AI Studio

### Step 5: Build the Docker Image

- [ ] Navigate to the backend directory:
  ```bash
  cd backend
  ```

- [ ] Build the Docker image tagged with your GCR path:
  ```bash
  docker build -t gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest .
  ```

- [ ] Verify the image was built successfully:
  ```bash
  docker images | grep decidely-ai-backend
  ```

### Step 6: Push the Docker Image to Google Container Registry

- [ ] Authenticate Docker with GCR:
  ```bash
  gcloud auth configure-docker
  ```

- [ ] Push the image:
  ```bash
  docker push gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest
  ```

- [ ] Verify the image is in GCR:
  ```bash
  gcloud container images list --filter="decidely-ai-backend"
  ```

### Step 7: Deploy to Cloud Run

- [ ] Run the deployment command:
  ```bash
  gcloud run deploy decidely-ai-backend \
    --image gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --service-account decidely-ai-sa@$(gcloud config get-value project).iam.gserviceaccount.com \
    --set-env-vars GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project),GOOGLE_ADK_MODEL=gemini-3.1-flash-lite-preview,GOOGLE_GENAI_USE_VERTEXAI=True,ENVIRONMENT=production,CORS_ORIGINS=http://localhost:5173,SQLITE_DB_PATH=:memory: \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 1
  ```

  **Flag explanations:**
  - `--allow-unauthenticated`: Makes the API publicly accessible (needed for frontend calls)
  - `--service-account`: Attaches the service account for Vertex AI and Firestore auth
  - `--min-instances 0`: Scales to zero when idle (saves cost)
  - `--max-instances 1`: Caps at 1 instance to stay within $5/month budget
  - `--memory 512Mi` and `--cpu 1`: Minimal resource allocation for cost control

- [ ] After deployment completes, note the **Service URL** from the output. It will look like:
  ```
  https://decidely-ai-backend-xxxxxx-uc.a.run.app
  ```

- [ ] Save this URL — you will need it in Phase 2.

### Step 8: Test the Backend

- [ ] Test the health endpoint (if available):
  ```bash
  curl https://YOUR_BACKEND_URL.a.run.app/health
  ```

- [ ] Check Cloud Run logs for any errors:
  ```bash
  gcloud run logs read decidely-ai-backend --region us-central1 --limit=50
  ```

- [ ] If you see errors, common fixes:
  - **Permission denied on Vertex AI:** Re-check the service account has `roles/aiplatform.user`
  - **Permission denied on Firestore:** Re-check the service account has `roles/datastore.user`
  - **Model not found:** Verify `gemini-3.1-flash-lite-preview` is available in your Vertex AI region

---

## Phase 2: Frontend Deployment (GitHub Pages)

### Step 1: Configure the Backend API URL

- [ ] Navigate to the frontend directory:
  ```bash
  cd frontend
  ```

- [ ] Create a `.env.production` file:
  ```bash
  echo "VITE_API_URL=https://YOUR_BACKEND_URL.a.run.app" > .env.production
  ```

  Replace `https://YOUR_BACKEND_URL.a.run.app` with the actual Cloud Run service URL from Phase 1, Step 7.

- [ ] Verify the file was created:
  ```bash
  cat .env.production
  ```

### Step 2: Configure Vite Base Path for GitHub Pages

- [ ] Open `vite.config.js`

- [ ] Add the `base` property. If your GitHub Pages URL will be `https://your-username.github.io/your-repo-name/`, set `base` to `/your-repo-name/`:

  ```js
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    base: '/your-repo-name/',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
                proxyRes.headers['cache-control'] = 'no-cache';
                proxyRes.headers['connection'] = 'keep-alive';
              }
            });
          },
        },
      },
    },
  })
  ```

  **Note:** If you are deploying to a user/organization site (`https://your-username.github.io/` without a repo name), set `base: '/'` instead.

### Step 3: Build the Frontend

- [ ] Install dependencies (skip if already installed):
  ```bash
  bun install
  ```

- [ ] Run the production build:
  ```bash
  bun run build
  ```

- [ ] Verify the build output exists in `dist/`:
  ```bash
  ls dist/
  ```
  You should see `index.html`, `assets/`, and other static files.

### Step 4: Deploy to GitHub Pages

Choose **one** of the two options below:

#### Option A: Using `gh-pages` package (Manual, one-command deploy)

- [ ] Install `gh-pages` as a dev dependency:
  ```bash
  bun add -d gh-pages
  ```

- [ ] Add a `deploy` script to `frontend/package.json`:
  ```json
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
  ```

- [ ] Run the deploy command:
  ```bash
  bun run deploy
  ```

- [ ] Wait ~30 seconds, then visit `https://your-username.github.io/your-repo-name/` to verify.

#### Option B: Using GitHub Actions (Recommended, automatic on push)

- [ ] Create the workflows directory:
  ```bash
  mkdir -p .github/workflows
  ```

- [ ] Create `.github/workflows/deploy-frontend.yml` with the following content:
  ```yaml
  name: Deploy Frontend to GitHub Pages

  on:
    push:
      branches: [main]
      paths:
        - 'frontend/**'

  permissions:
    contents: read
    pages: write
    id-token: write

  concurrency:
    group: "pages"
    cancel-in-progress: false

  jobs:
    build:
      runs-on: ubuntu-latest
      defaults:
        run:
          working-directory: ./frontend
      steps:
        - uses: actions/checkout@v4

        - uses: oven-sh/setup-bun@v2
          with:
            bun-version: latest

        - name: Install dependencies
          run: bun install

        - name: Build
          run: bun run build

        - name: Upload artifact
          uses: actions/upload-pages-artifact@v3
          with:
            path: frontend/dist

    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - name: Deploy to GitHub Pages
          id: deployment
          uses: actions/deploy-pages@v4
  ```

- [ ] Commit and push the workflow file:
  ```bash
  git add .github/workflows/deploy-frontend.yml
  git commit -m "Add GitHub Actions workflow for frontend deployment"
  git push origin main
  ```

- [ ] Enable GitHub Pages in your repository:
  1. Go to your GitHub repository
  2. Click **Settings** tab
  3. Click **Pages** in the left sidebar
  4. Under **Source**, select **GitHub Actions**
  5. Click **Save**

- [ ] Wait for the workflow to complete (check the **Actions** tab in your repo)

- [ ] Visit your GitHub Pages URL to verify: `https://your-username.github.io/your-repo-name/`

### Step 5: Update Backend CORS Origins

- [ ] Now that the frontend has a live URL, update the Cloud Run service to allow it:
  ```bash
  gcloud run services update decidely-ai-backend \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS=https://your-username.github.io
  ```

  Replace `https://your-username.github.io` with your actual GitHub Pages URL (include the full path if using a subpath, e.g., `https://your-username.github.io/your-repo-name`).

- [ ] Wait ~30 seconds for the update to propagate.

- [ ] Verify the update:
  ```bash
  gcloud run services describe decidely-ai-backend --region us-central1 --format="value(spec.template.spec.containers[0].env)"
  ```

---

## Phase 3: Verification

- [ ] **Test the backend API directly:**
  ```bash
  curl https://YOUR_BACKEND_URL.a.run.app/health
  ```
  Expected: A JSON response or `200 OK` status.

- [ ] **Test the frontend loads:**
  Open `https://your-username.github.io/your-repo-name/` in your browser.
  Expected: The Decidely.ai UI renders without errors.

- [ ] **Test frontend-to-backend communication:**
  1. Open browser DevTools (F12) > **Network** tab
  2. Interact with the app (e.g., send a message)
  3. Look for API calls to your Cloud Run URL
  4. Expected: `200 OK` responses with valid JSON or SSE streams

- [ ] **Check for CORS errors in the browser console:**
  1. Open browser DevTools (F12) > **Console** tab
  2. Look for red CORS-related errors
  3. If present, re-check `CORS_ORIGINS` in Cloud Run env vars

- [ ] **Check Cloud Run logs for backend errors:**
  ```bash
  gcloud run logs read decidely-ai-backend --region us-central1 --limit=20
  ```

---

## Phase 4: Cost Monitoring

- [ ] Set up a billing budget alert:
  1. Go to https://console.cloud.google.com/billing/budgets
  2. Click **Create Budget**
  3. Set budget amount to `$5.00`
  4. Set alert threshold at 50% ($2.50) and 90% ($4.50)
  5. Add your email for notifications

- [ ] Monitor Cloud Run usage:
  ```bash
  gcloud run services describe decidely-ai-backend --region us-central1 --format="table(status.latestCreatedRevisionName, status.traffic.statuses[0].percent)"
  ```

- [ ] Monitor Vertex AI usage:
  1. Go to https://console.cloud.google.com/vertex-ai
  2. Check **Model usage** for token consumption

- [ ] Monitor Firestore usage:
  1. Go to https://console.cloud.google.com/firestore
  2. Check **Usage** tab for read/write operations

---

## Phase 5: Updating Deployments

### Updating the Backend

- [ ] Make your code changes in `backend/`

- [ ] Rebuild the Docker image:
  ```bash
  cd backend
  docker build -t gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest .
  ```

- [ ] Push the updated image:
  ```bash
  docker push gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest
  ```

- [ ] Redeploy to Cloud Run:
  ```bash
  gcloud run deploy decidely-ai-backend \
    --image gcr.io/$(gcloud config get-value project)/decidely-ai-backend:latest \
    --platform managed \
    --region us-central1 \
    --service-account decidely-ai-sa@$(gcloud config get-value project).iam.gserviceaccount.com
  ```

### Updating the Frontend

- [ ] Make your code changes in `frontend/`

- [ ] If using **GitHub Actions**: Simply push to `main`:
  ```bash
  git add frontend/
  git commit -m "Update frontend"
  git push origin main
  ```
  The workflow will automatically rebuild and deploy.

- [ ] If using **gh-pages** manually:
  ```bash
  cd frontend
  bun run build
  bun run deploy
  ```

---

## Troubleshooting

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| CORS errors in browser console | `CORS_ORIGINS` doesn't match your frontend URL | Run `gcloud run services update decidely-ai-backend --region us-central1 --set-env-vars CORS_ORIGINS=https://your-username.github.io` |
| Backend returns 503 | Container crashed on startup | Check logs: `gcloud run logs read decidely-ai-backend --region us-central1 --limit=50` |
| Frontend shows 404 on refresh | Vite `base` path is wrong | Ensure `base` in `vite.config.js` matches your repo name: `/your-repo-name/` |
| Vertex AI permission denied | Service account missing role | Run: `gcloud projects add-iam-policy-binding PROJECT --member="serviceAccount:decidely-ai-sa@PROJECT.iam.gserviceaccount.com" --role="roles/aiplatform.user"` |
| Firestore permission denied | Service account missing role | Run: `gcloud projects add-iam-policy-binding PROJECT --member="serviceAccount:decidely-ai-sa@PROJECT.iam.gserviceaccount.com" --role="roles/datastore.user"` |
| Model not found in Vertex AI | Model not available in your region | Check available models: `gcloud ai models list --region=us-central1` |
| Docker build fails | Missing dependencies or wrong Dockerfile | Verify `pyproject.toml` and `Dockerfile` are in `backend/` |
| Frontend can't reach backend | `VITE_API_URL` not set or wrong | Check `frontend/.env.production` has the correct Cloud Run URL |
| GitHub Actions deploy fails | Pages not enabled or wrong artifact path | Go to **Settings > Pages** and set Source to **GitHub Actions** |
