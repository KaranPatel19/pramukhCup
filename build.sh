#!/bin/bash
# build.sh - Script to build Meteor app for deployment

# Exit on error
set -e

echo "Building Meteor application for production..."

# 1. Build the Meteor application
meteor build --directory ../build --server-only

# 2. Navigate to the server build directory
cd ../build/bundle

# 3. Install production dependencies
cd programs/server
npm install --production

echo "Build complete! The app bundle is in ../build/bundle"