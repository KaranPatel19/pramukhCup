# Cloud Run Deployment Guide (Free Tier Optimized)

This guide is optimized for deploying your Meteor Players application to GCP's Cloud Run service, which has a more generous free tier than App Engine flexible environment.

## Prerequisites
- Google Cloud Platform account
- Google Cloud SDK installed
- Docker installed
- MongoDB Atlas account (free tier)
- Node.js and npm installed
- Meteor installed

## Step 1: Build Your Application

1. Run the build script:
   ```
   chmod +x build.sh
   ./build.sh
   ```

## Step 2: Set Up MongoDB Atlas

1. Create a free MongoDB Atlas cluster
2. Create a database user
3. Set up network access (whitelist "Allow Access from Anywhere" for development)
4. Get your connection string

## Step 3: Build and Deploy with Cloud Run

1. Update the Dockerfile.cloudrun with your MongoDB connection string

2. Build your Docker image:
   ```
   docker build -t gcr.io/YOUR-PROJECT-ID/players-app:v1 -f Dockerfile.cloudrun .
   ```

3. Login to Google Cloud:
   ```
   gcloud auth login
   gcloud config set project YOUR-PROJECT-ID
   ```

4. Configure Docker to use gcloud credentials:
   ```
   gcloud auth configure-docker
   ```

5. Push your image to Google Container Registry:
   ```
   docker push gcr.io/YOUR-PROJECT-ID/players-app:v1
   ```

6. Deploy to Cloud Run:
   ```
   gcloud run deploy players-app \
     --image gcr.io/YOUR-PROJECT-ID/players-app:v1 \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 256Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 1 \
     --set-env-vars="ROOT_URL=https://players-app-YOUR-HASH.run.app,MONGO_URL=mongodb+srv://username:password@cluster0.mongodb.net/meteor"
   ```

7. Your app will be deployed to a URL like:
   ```
   https://players-app-YOUR-HASH.run.app
   ```

## Free Tier Benefits with Cloud Run

Cloud Run offers a more generous free tier than App Engine flexible:
- 2 million requests per month free
- Instances scale to zero when not in use (no charges)
- 360,000 vCPU-seconds and 180,000 GiB-seconds of compute time per month
- Much more cost-efficient for low-traffic applications

## Important Note on Free Tier Limits

- Cloud Run: Scales to zero when not in use - perfect for development and low-traffic sites
- MongoDB Atlas: 512MB storage limit on free tier
- Container Registry: 0.5GB free storage per month

## Monitoring Usage

1. View Cloud Run services:
   ```
   gcloud run services list
   ```

2. Monitor billing and usage:
   - Go to GCP Console > Billing
   - Set up billing alerts to avoid unexpected charges

## Troubleshooting

1. View Cloud Run logs:
   ```
   gcloud run services logs read players-app
   ```

2. If you need to update your app:
   - Rebuild your Docker image with a new tag (e.g., v2)
   - Push the new image
   - Update the Cloud Run service to use the new image