#!/bin/bash
set -euo pipefail

# Configuration
RESOURCE_GROUP="${RESOURCE_GROUP:-notg-reader-rg}"
APP_NAME="${APP_NAME:-notg-reader}"
LOCATION="${LOCATION:-eastus}"

echo "Deploying notg-reader to Azure App Service..."

# Create resource group
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

# Deploy Bicep template
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file deploy/azure-app-service/app-service.bicep \
  --parameters appName="$APP_NAME" location="$LOCATION" \
  --output none

# Build and deploy
npm run build

# Create deployment package
cd packages/backend
zip -r ../../deploy.zip dist/ prisma/ package.json
cd ../frontend
zip -r ../../deploy.zip dist/
cd ../..

# Deploy to App Service
az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --src-path deploy.zip \
  --type zip

# Configure app settings (secrets should be set manually or via Key Vault)
echo "Deployment complete!"
echo "Configure the following app settings in Azure Portal:"
echo "  - JWT_SECRET"
echo "  - ENCRYPTION_KEY"
echo "  - DATABASE_URL"
echo "  - RP_ID"
echo "  - RP_NAME"
echo "  - RP_ORIGIN"

rm -f deploy.zip
