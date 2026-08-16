# Deployment Guide

## Docker

### Build the Image

```bash
docker build -t notg-reader .
```

### Run Locally

```bash
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secure-random-string \
  -e ENCRYPTION_KEY=your-32-character-key-here!! \
  -e DATABASE_URL=file:./data/prod.db \
  -e RP_ID=localhost \
  -e RP_NAME=notg-reader \
  -e RP_ORIGIN=http://localhost:3001 \
  -v notg-reader-data:/app/data \
  notg-reader
```

## Azure Kubernetes Service (AKS)

### Prerequisites

- Azure CLI installed and logged in
- An AKS cluster created
- kubectl configured

### Deployment Steps

1. **Build and push the Docker image:**
   ```bash
   # Create an Azure Container Registry (if not exists)
   az acr create --resource-group myResourceGroup --name myRegistry --sku Basic
   
   # Build and push
   az acr build --registry myRegistry --image notg-reader:latest .
   ```

2. **Update Kubernetes manifests:**
   
   Edit `deploy/kubernetes/deployment.yaml`:
   - Set the image to your ACR: `myRegistry.azurecr.io/notg-reader:latest`
   
   Edit `deploy/kubernetes/configmap.yaml`:
   - Set `RP_ID` to your domain
   - Set `RP_ORIGIN` to your full URL
   
   Edit `deploy/kubernetes/secret.yaml`:
   - Base64 encode your secrets:
     ```bash
     echo -n 'your-jwt-secret' | base64
     echo -n 'your-encryption-key-32chars!!!!!' | base64
     echo -n 'file:./data/prod.db' | base64
     ```

3. **Apply manifests:**
   ```bash
   kubectl apply -f deploy/kubernetes/namespace.yaml
   kubectl apply -f deploy/kubernetes/configmap.yaml
   kubectl apply -f deploy/kubernetes/secret.yaml
   kubectl apply -f deploy/kubernetes/pvc.yaml
   kubectl apply -f deploy/kubernetes/deployment.yaml
   kubectl apply -f deploy/kubernetes/service.yaml
   kubectl apply -f deploy/kubernetes/ingress.yaml
   ```

4. **Verify deployment:**
   ```bash
   kubectl get pods -n notg-reader
   kubectl get svc -n notg-reader
   ```

### Scaling

```bash
kubectl scale deployment notg-reader -n notg-reader --replicas=3
```

## Azure App Service

### Prerequisites

- Azure CLI installed and logged in

### Deployment Steps

1. **Run the deployment script:**
   ```bash
   chmod +x deploy/azure-app-service/deploy.sh
   RESOURCE_GROUP=my-rg APP_NAME=my-notg-reader ./deploy/azure-app-service/deploy.sh
   ```

2. **Configure secrets in Azure Portal:**
   
   Go to your App Service → Configuration → Application Settings and add:
   - `JWT_SECRET`: A secure random string
   - `ENCRYPTION_KEY`: A 32-character encryption key
   - `DATABASE_URL`: `file:./data/prod.db`
   - `RP_ID`: Your App Service domain (e.g., `my-notg-reader.azurewebsites.net`)
   - `RP_NAME`: `notg-reader`
   - `RP_ORIGIN`: Full URL (e.g., `https://my-notg-reader.azurewebsites.net`)

### Using Bicep Directly

```bash
az deployment group create \
  --resource-group myResourceGroup \
  --template-file deploy/azure-app-service/app-service.bicep \
  --parameters appName=my-notg-reader
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production/test) |
| `DATABASE_URL` | Yes | Prisma database URL |
| `JWT_SECRET` | Yes | Secret for JWT signing (use a long random string) |
| `ENCRYPTION_KEY` | Yes | 32-character key for profile encryption |
| `RP_ID` | Yes | WebAuthn Relying Party ID (your domain) |
| `RP_NAME` | Yes | WebAuthn Relying Party Name |
| `RP_ORIGIN` | Yes | Full origin URL (e.g., https://example.com) |

## Security Considerations

- Generate strong random values for `JWT_SECRET` and `ENCRYPTION_KEY`
- Use HTTPS in production (enforce via `RP_ORIGIN`)
- Consider using Azure Key Vault for secret management
- Review and customize rate limiting for your traffic patterns
- Set up monitoring and alerting for the `/api/health` endpoint
