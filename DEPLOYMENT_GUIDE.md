# Subdomain Deployment & CMS Guide

This guide covers the full process of deploying your **Royal Drive Investors Admin** portal to a live subdomain (e.g., `investors.royaldrive.com`), securing your backend, and transitioning your Keystatic CMS from Local Mode to Production (GitHub) Mode.

---

## Step 1: Push Your Code to GitHub
To deploy seamlessly, your code must live in a GitHub repository.

1. Create a free account on [GitHub](https://github.com) if you haven't already.
2. Create a new, **Private** repository (e.g., `royal-drive-investors-portal`).
3. In your local terminal, run the following commands to push your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit prior to deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```

---

## Step 2: Switch Astro for Vercel (Recommended)
You are currently using the Node standalone server adapter (`@astrojs/node`). If you use **Vercel** (the best frictionless platform for Astro), you should swap the adapter so your site runs serverless.

1. Run this command in your terminal:
   ```bash
   npx astro add vercel
   ```
2. Accept all the default prompts. This will automatically update your `astro.config.mjs` to use `@astrojs/vercel/serverless` instead of `@astrojs/node`.

> **Note:** If you choose DigitalOcean or Render, skip this step and keep the Node adapter.

---

## Step 3: Upgrade Keystatic for Production
Right now, Keystatic writes directly to your local computer (`src/data`). In a live cloud environment, local files are wiped when the server restarts. To solve this, Keystatic must interact directly with your GitHub repository.

1. Open `keystatic.config.ts`.
2. Find the top lines where `storage` is defined, and change it from `local` to `github`:

**Before:**
```typescript
export default config({
  storage: {
    kind: 'local',
  },
  // ...
```

**After:**
```typescript
export default config({
  storage: {
    kind: 'github',
    repo: 'YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME', // The exact formatting of your github repo
  },
  // ...
```
> ***Important***: Push this tiny `keystatic.config.ts` change to your GitHub repo so the cloud provider gets the latest version!

---

## Step 4: Deploy to Vercel
Now that your repo is on GitHub and configured properly for the cloud:

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account.
2. Click **"Add New Project"** and select your `royal-drive-investors-portal` repository.
3. Open the **"Environment Variables"** dropdown before you hit deploy. Add the variables from your local `.env`:
   - Name: `ADMIN_USERNAME`, Value: `your_admin_username`
   - Name: `ADMIN_PASSWORD`, Value: `your_strong_admin_password`
4. Click **Deploy**. Vercel will create a temporary URL for you (e.g., `royal-drive.vercel.app`).

---

## Step 5: Connect the Subdomain (DNS Setup)
Now to attach your custom subdomain `investors.royaldrive.com` to the Vercel site:

1. In your **Vercel Dashboard**, go to the newly deployed project and click **Settings > Domains**.
2. Type in your desired subdomain: `investors.royaldrive.com` and hit Add.
3. Vercel will display an error saying it's not verified, and give you a **CNAME** or **A Record** configuration string.
4. Open a new tab and go to your Domain Registrar (GoDaddy, Namecheap, Cloudflare, etc.) and navigate to your **DNS Management** table.
5. Create a new record:
   - **Type:** `CNAME`
   - **Name (or Host):** `investors`
   - **Value (or Target):** `cname.vercel-dns.com.` *(or whatever string Vercel provided you)*
6. Save the DNS record. Vercel will automatically detect the changes within 5 to 30 minutes.

### Success!
Once Vercel gets the DNS signal, it automatically secures your site with an SSL certificate. You can now visit `https://investors.royaldrive.com/admin-control` and log in safely!
