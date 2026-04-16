# Subdomain Deployment & Admin Guide

This guide covers the Netlify deployment flow for the Royal Drive Investors site and its built-in content admin.

---

## Step 1: Push the Project to GitHub

1. Create a **private** GitHub repository.
2. Push this project source to `main`.
3. Confirm the repo contains the site source and `src/data/siteData.json`.

---

## Step 2: Import the Repo into Netlify

1. In Netlify, choose **Add new project**.
2. Select **Import an existing project**.
3. Choose GitHub and select your repository.
4. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: leave blank

---

## Step 3: Add Runtime Environment Variables

In Netlify, add the environment variables your site uses:

- `PUBLIC_N8N_WEBHOOK_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GITHUB_BRANCH`

Recommended values:

- `GITHUB_REPO=marketing-it/group.royaldrive`
- `GITHUB_BRANCH=main`

The `GITHUB_TOKEN` must have permission to update repository contents.

---

## Step 4: Connect the Subdomain

To attach your subdomain (for example `group.royaldrive.in`) to the Netlify site:

1. Open **Domain management** in Netlify.
2. Add the custom domain or subdomain.
3. If Netlify asks you to verify ownership, add the TXT record it provides in your DNS host.
4. Add or update the final DNS record Netlify provides, usually a `CNAME` for the subdomain.

---

## Step 5: Access the Admin

After DNS and SSL are live:

1. Visit `https://your-domain/admin-control`
2. Log in with the admin username and password you configured
3. Edit the site content stored in `src/data/siteData.json`
4. Save the changes to commit them back to GitHub and trigger a redeploy

### Success

Once the site is deployed and the admin secrets are configured, editors can log in at `/admin-control`, update the content, and trigger a normal Git-backed redeploy without any extra CMS service.
