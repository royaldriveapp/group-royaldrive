# Subdomain Deployment & CMS Guide

This guide covers the clean Netlify deployment flow for the Royal Drive Investors site and its Decap CMS admin.

---

## Step 1: Push the Project to GitHub

1. Create a **private** GitHub repository.
2. Push this project source to `main`.
3. Confirm the repo contains the site source, `public/admin`, and `src/data/siteData.json`.

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

If you are using a custom contact webhook, make sure the value is the full HTTPS URL.

---

## Step 4: Enable the CMS Auth Services

This project now uses **Decap CMS** with the **Git Gateway** backend.

In Netlify:

1. Open **Identity** and enable Netlify Identity.
2. Set registration to **Invite only** for a private editorial workflow.
3. Under **Services**, enable **Git Gateway**.
4. Invite the people who should be allowed to log into the CMS.

Once enabled, Decap CMS will authenticate editors through Netlify Identity and commit content changes back to the Git repository.

---

## Step 5: Connect the Subdomain

To attach your subdomain (for example `group.royaldrive.in`) to the Netlify site:

1. Open **Domain management** in Netlify.
2. Add the custom domain or subdomain.
3. If Netlify asks you to verify ownership, add the TXT record it provides in your DNS host.
4. Add or update the final DNS record Netlify provides, usually a `CNAME` for the subdomain.

---

## Step 6: Access the Admin

After DNS and SSL are live:

1. Visit `https://your-domain/admin-control`
2. Click **Open CMS**
3. Log in with the Netlify Identity invite you configured
4. Edit the site content stored in `src/data/siteData.json`

### Success

Once the site is deployed and Identity + Git Gateway are enabled, the CMS will provide a friendlier editing experience without the extra GitHub App setup.
