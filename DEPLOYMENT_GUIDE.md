# Deployment & Admin Guide (Vercel)

This guide covers deploying the Royal Drive Investors site (including the built-in `/admin-control` editor) on **Vercel**.

---

## Step 1: Push the Project to GitHub

1. Create a **private** GitHub repository.
2. Push this project source to `main`.
3. Confirm the repo contains the site source and `src/data/siteData.json`.

---

## Step 2: Connect the Repo to Vercel

1. In Vercel, choose **Add New… / Import Project**.
2. Select GitHub and choose this repository.
3. Use these defaults (or set them explicitly):
   - Build command: `npm run build`
   - Output directory: `dist`

---

## Step 3: Add Runtime Environment Variables

In Vercel, add these environment variables your site uses:

- `PUBLIC_N8N_WEBHOOK_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GITHUB_BRANCH`

Recommended values:

- `GITHUB_REPO=marketing-it/group.royaldrive`
- `GITHUB_BRANCH=main`
- `ADMIN_SESSION_SECRET=` a long random secret value used only to sign admin sessions

The `GITHUB_TOKEN` must have permission to update repository contents.

---

## Step 4: Connect the Subdomain

1. In Vercel, open **Project Settings -> Domains**.
2. Add your custom domain/subdomain.
3. Follow Vercel's DNS instructions to complete verification and SSL.

---

## Step 5: Access the Admin

After DNS and SSL are live:

1. Visit `https://your-domain/admin-control`
2. Log in with the admin username/password configured in Vercel env vars
3. Edit the site content
4. Click save to commit back to GitHub (requires `GITHUB_TOKEN` with write access)

### Success

Once the site is deployed and the admin secrets are configured, editors can log in at `/admin-control`, update the content, and trigger a normal Git-backed redeploy without any extra CMS service.
