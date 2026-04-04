#!/usr/bin/env bash
# DEPLOYMENT SCRIPT: Do not run until you have authenticated with `gcloud auth login`

# Set these variables before deploying
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="decidely-api"

echo "Deploying Decidely.ai Backend to Google Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID \
  --max-instances 2 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID"
  
echo "Deployment initiated. Once complete, copy the Service URL and update the GitHub Actions VITE_API_URL!"
