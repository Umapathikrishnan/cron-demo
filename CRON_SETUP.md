# Cron Job Setup Guide

This guide explains how to set up the automated cron job system for your Next.js Todo app.

## Overview

The cron system uses **GitHub Actions** to periodically hit a Next.js API endpoint (`/api/cron`) deployed on **Vercel**. This approach is optimal because:

- ✅ No need to checkout code or install dependencies in GitHub Actions
- ✅ Fast execution (just a simple HTTP request)
- ✅ Secure (uses secret authentication)
- ✅ Easy to test and monitor
- ✅ Works seamlessly with Vercel's serverless architecture

## Architecture

```
GitHub Actions (every 3 mins)
    ↓
    curl request with secret header
    ↓
Vercel App: /api/cron endpoint
    ↓
    Validates secret
    ↓
    Runs maintenance tasks (Prisma queries)
    ↓
    Returns success/failure response
```

## Setup Instructions

### 1. Deploy to Vercel

Deploy your Next.js app to Vercel:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel through their dashboard.

### 2. Set Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your database connection string | PostgreSQL/MySQL connection URL |
| `CRON_SECRET` | A random secret string | Used to authenticate cron requests |

**Generate a secure `CRON_SECRET`:**

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random string generator
```

> [!IMPORTANT]
> Make sure to add these variables to **all environments** (Production, Preview, Development) if needed.

### 3. Add GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CRON_SECRET` | Same value as Vercel's `CRON_SECRET` | Must match exactly |
| `VERCEL_APP_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

> [!WARNING]
> The `CRON_SECRET` in GitHub **must match exactly** with the one in Vercel, otherwise requests will be rejected with 401 Unauthorized.

### 4. Verify the Workflow File

The workflow file is already created at `.github/workflows/cron-job.yml`. It will:

- Run every 3 minutes (for testing)
- Make a GET request to `/api/cron` with the secret header
- Log the response and status

### 5. Test the Setup

#### Test Locally

```bash
# Make sure your .env file has CRON_SECRET defined
echo "CRON_SECRET=your-secret-here" >> .env

# Start the dev server
npm run dev

# In another terminal, test the endpoint
curl -X GET "http://localhost:3000/api/cron" \
  -H "x-cron-secret: your-secret-here"
```

You should see a JSON response with `success: true`.

#### Test on Vercel

After deploying:

```bash
curl -X GET "https://your-app.vercel.app/api/cron" \
  -H "x-cron-secret: your-secret-here"
```

#### Test GitHub Actions

1. Go to your GitHub repo → **Actions** tab
2. Click on **Cron Job (Hit API)** workflow
3. Click **Run workflow** → **Run workflow** (manual trigger)
4. Watch the execution logs

### 6. Customize the Maintenance Logic

Edit `app/api/cron/route.ts` to add your maintenance tasks:

```typescript
// Example: Delete completed todos older than 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const deletedTodos = await prisma.todo.deleteMany({
  where: {
    completed: true,
    updatedAt: {
      lt: thirtyDaysAgo
    }
  }
});

console.log(`Deleted ${deletedTodos.count} old todos`);
```

### 7. Adjust the Schedule

Once you've tested and verified everything works, you may want to change the frequency:

Edit `.github/workflows/cron-job.yml`:

```yaml
schedule:
  # Every 6 hours
  - cron: "0 */6 * * *"
  
  # Every day at midnight UTC
  # - cron: "0 0 * * *"
  
  # Every Monday at 9 AM UTC
  # - cron: "0 9 * * 1"
```

## Monitoring

### View Logs in GitHub Actions

1. Go to **Actions** tab in your GitHub repo
2. Click on any workflow run
3. View the execution logs and summary

### View Logs in Vercel

1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Click on your deployment → **Functions** tab
4. Find `/api/cron` and view the logs

## Troubleshooting

### 401 Unauthorized Error

- **Cause**: `CRON_SECRET` mismatch between GitHub and Vercel
- **Solution**: Verify both secrets are identical

### 500 Internal Server Error

- **Cause**: Database connection issue or code error
- **Solution**: Check Vercel function logs for detailed error messages

### Workflow Not Running

- **Cause**: GitHub Actions disabled or workflow file syntax error
- **Solution**: Check Actions tab for errors, verify YAML syntax

### Database Connection Issues

- **Cause**: `DATABASE_URL` not set or incorrect
- **Solution**: Verify the environment variable in Vercel settings

## Security Best Practices

> [!CAUTION]
> Never commit secrets to your repository. Always use environment variables and GitHub Secrets.

- ✅ Use strong, random `CRON_SECRET` (at least 32 characters)
- ✅ Rotate secrets periodically
- ✅ Monitor failed authentication attempts in logs
- ✅ Use HTTPS only (Vercel provides this by default)

## Cost Considerations

- **GitHub Actions**: Free for public repos, 2000 minutes/month for private repos
- **Vercel**: Generous free tier, serverless functions are billed per invocation
- **Database**: Depends on your provider

Running every 3 minutes = ~20,000 invocations/month, which should fit within free tiers for testing.

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Add GitHub secrets
4. ✅ Test the endpoint
5. ✅ Customize maintenance logic
6. ✅ Adjust schedule as needed
7. ✅ Monitor logs regularly

---

**Need help?** Check the logs in GitHub Actions and Vercel for detailed error messages.
