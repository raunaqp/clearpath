#!/bin/bash
set -e
DEPLOY_URL=$(vercel --prod --yes 2>&1 | grep "^Production:" | awk '{print $2}')
vercel alias set "$DEPLOY_URL" clearpath-medtech.vercel.app
echo "Live at https://clearpath-medtech.vercel.app"
