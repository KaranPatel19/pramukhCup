# Deployment Guide for GCP

This guide walks you through deploying your Meteor Players application to Google Cloud Platform using the free tier.

## Prerequisites
- Google Cloud Platform account
- Google Cloud SDK installed
- MongoDB Atlas account (free tier)
- Node.js and npm installed
- Meteor installed

## Step 1: Build Your Application

1. Make the build script executable:
   ```
   chmod +x build.sh
   ```

2. Run the build script:
   ```
   ./build.sh
   ```

## Step 2: Update Configuration Files

1. Edit `app.yaml` and update:
   - YOUR-PROJECT-ID with your actual GCP project ID
   - YOUR_MONGODB_CONNECTION_STRING with your MongoDB Atlas connection string

## Step 3: Deploy to Google App Engine

1. Make sure you're logged in to Google Cloud:
   ```
   gcloud auth login
   ```

2. Set your project:
   ```
   gcloud config set project YOUR-PROJECT-ID
   ```

3. Deploy your application:
   ```
   gcloud app deploy app.yaml
   ```

4. When prompted, select a region close to your target audience and confirm the deployment.

5. Wait for the deployment to complete. This may take a few minutes.

6. Once deployed, you can access your application at:
   ```
   https://YOUR-PROJECT-ID.uc.r.appspot.com
   ```

## Step 4: Setting Up MongoDB Atlas

1. In MongoDB Atlas, make sure your cluster is configured to accept connections from anywhere (for development) or specifically from Google Cloud IPs.

2. Create a database user with appropriate permissions.

3. Add your application IP to the IP whitelist in MongoDB Atlas's Network Access settings.

4. Initialize your remote database by running:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster0.mongodb.net/playersapp meteor
   ```
   This will create the necessary collections.

## Troubleshooting

1. Check application logs:
   ```
   gcloud app logs tail
   ```

2. If your app can't connect to MongoDB:
   - Verify your connection string
   - Check the Network Access settings in MongoDB Atlas
   - Make sure your database user has the correct permissions

3. To view app details:
   ```
   gcloud app describe
   ```

4. To stop your app (to avoid charges beyond free tier):
   ```
   gcloud app versions stop VERSION
   ```
   Replace VERSION with your app's version ID.

## Remember:
- Keep an eye on your GCP usage to stay within free tier limits
- The flexible environment in App Engine is not completely free after the trial period, so consider migrating to App Engine standard environment for Node.js applications later