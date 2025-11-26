# Tikidan SaaS Frontend - Deployment Guide

## Why Your Frontend Works Without Backend

Your frontend was working without a deployed backend because:

1. **Hardcoded API URLs**: The frontend was hardcoded to call `http://localhost:5000/api`
2. **Local Backend Access**: Your browser can access your local machine's port 5000 if both the frontend and backend are running locally
3. **No Environment Configuration**: Without proper environment variables, the frontend always tried to reach your local backend

## Solution: Environment Variables

I've updated your frontend to use environment variables for the API URL. This ensures:

- **Development**: Frontend calls `http://localhost:5000/api` (your local backend)
- **Production**: Frontend calls your actual deployed backend URL
- **Flexibility**: Easy to change API URLs without code changes

## Environment Files

Three environment files have been created:

### `.env.example`
Reference file showing all available environment variables
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### `.env.development`
Used during local development (npm run dev)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### `.env.production`
Used during production build (npm run build)
```
VITE_API_BASE_URL=https://your-deployed-backend-url.com/api
```

## Step-by-Step Deployment

### 1. Update Production Environment Variables

**Before deploying, you MUST update `.env.production` with your actual backend URL:**

```bash
# Replace with your actual backend URL
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Common backend deployment platforms:
- Railway.app: `https://your-app.railway.app/api`
- Heroku: `https://your-app.herokuapp.com/api`
- Render.com: `https://your-app.onrender.com/api`
- AWS/Azure/Google Cloud: `https://your-domain.com/api`

### 2. Build the Frontend

```bash
npm run build
```

This command:
- Compiles TypeScript
- Bundles React components
- Creates production-optimized files in `dist/` folder
- Automatically uses `.env.production` variables

### 3. Verify the Build

```bash
npm run preview
```

This previews the production build locally. Test login and client operations to ensure they work.

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy
vercel --prod
```

#### Option B: Git Push to Vercel

1. Push changes to GitHub:
```bash
git add .
git commit -m "Add environment variable support for backend API URL"
git push origin main
```

2. Connect your GitHub repo to Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Vite React project
   - Click "Deploy"

#### Option C: Vercel Environment Variables UI

1. After connecting to Vercel, go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your deployed backend URL
   - **Environments**: Production, Preview, Development

### 5. Verify Deployment

Once deployed:

1. Open your Vercel deployment URL
2. Try logging in with your credentials
3. Test client operations (add, view, transfer, delete)
4. Check browser console for any API errors

## Troubleshooting

### "API calls failing" or "Login not working"

**Problem**: Frontend can't reach backend
**Solution**: 
1. Check that `.env.production` has the correct backend URL
2. Verify your backend is deployed and running
3. Check for CORS issues - backend must allow requests from your Vercel domain

### "Cross-Origin Request Blocked" (CORS error)

**Problem**: Browser blocks requests between different origins
**Solution**: Your backend needs to include these CORS headers:
```
Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Backend URL not being used

**Problem**: Frontend still calling localhost
**Solution**:
1. Clear browser cache
2. Verify `.env.production` is saved with correct URL
3. Run `npm run build` again
4. Re-deploy to Vercel

## Files Modified

The following files were updated to use environment variables:

- `src/services/api.ts` - Added `getApiUrl()` function
- `src/pages/Login.tsx` - Uses `VITE_API_BASE_URL`
- `src/pages/Clients.tsx` - Uses `VITE_API_BASE_URL`
- `src/pages/Employees.tsx` - Uses `VITE_API_BASE_URL`
- `src/pages/Team.tsx` - Uses `VITE_API_BASE_URL`
- `src/components/AddEmployeeForm.tsx` - Uses `VITE_API_BASE_URL`
- `.gitignore` - Added `.env` files to prevent committing secrets

## Backend Deployment Checklist

Your backend also needs to be deployed. Here's a quick checklist:

- [ ] Backend is deployed to a public URL
- [ ] All environment variables are configured (.env in production)
- [ ] Database is set up and accessible
- [ ] CORS is configured to accept your Vercel domain
- [ ] JWT secrets are securely set
- [ ] All API endpoints are accessible from Vercel
- [ ] SSL/TLS certificate is valid (HTTPS)

## Next Steps

1. **Deploy Backend First**: Ensure your backend is deployed and running
2. **Get Backend URL**: Get the deployed backend's URL
3. **Update `.env.production`**: Replace `https://your-deployed-backend-url.com/api` with actual URL
4. **Build & Deploy**: Run `npm run build` and deploy to Vercel
5. **Test**: Verify login and all features work

## Questions?

If you encounter issues:
1. Check browser DevTools Network tab to see actual API calls
2. Look at the request URL to confirm it's using your backend, not localhost
3. Check backend logs for errors
4. Ensure backend is running and accessible from the internet
