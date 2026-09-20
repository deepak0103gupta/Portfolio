# Deepak Gupta, portfolio

A static site with one serverless function for the contact form. No build step, no dependencies.

```
public/
  index.html                  the whole site (HTML, CSS, JS)
  Deepak_Gupta_Resume.pdf     the file behind every "Download resume" button
  og.png, favicon.svg         link-preview image and tab icon
api/
  contact.js                  POST /api/contact, emails you the form message through Resend
vercel.json                   serves /public, adds security headers
.env.example                  the two environment variables you need
```

## Deploy on Vercel

1. Put this folder's contents at the root of a GitHub repo (`api/`, `public/`, `vercel.json` at the top level).
2. In Vercel choose **Add New > Project**, import the repo and deploy. Framework Preset should say **Other**.

**Keeping your current URL (deepakgupta-portfolio.vercel.app):** replace the files in your existing portfolio repo with these, then in Vercel open the project > **Settings > Build & Development Settings**, set **Framework Preset** to **Other** and turn off any Build, Install and Output overrides. (The old project is set to Next.js, which would try to run `next build` and fail.)

## Make the contact form send email

The form posts to `/api/contact`, which sends the message to your inbox through [Resend](https://resend.com) (free tier).

1. Sign up at resend.com **with deepak0103gupta@gmail.com**.
2. Go to **API Keys > Create API Key** and copy the key.
3. In Vercel open the project > **Settings > Environment Variables** and add:
   - `RESEND_API_KEY` = the key you copied
   - `CONTACT_TO_EMAIL` = `deepak0103gupta@gmail.com`
4. **Redeploy** (Deployments > the latest one > Redeploy). Environment variables only apply to new deployments.
5. Open the live site, send yourself a message, and check the inbox (and spam the first time).

Messages arrive as "Portfolio message from <name>". Hitting Reply goes straight to the visitor.

Resend's free shared sender (`onboarding@resend.dev`) can only deliver to the email address you signed up with, which is why step 1 matters. If you later verify your own domain in Resend, set `CONTACT_FROM_EMAIL` to something like `Portfolio <contact@yourdomain.com>`.

If the variables are missing or Resend is down, visitors see a friendly error with your email address, so nobody hits a dead end.

Spam protection: a hidden honeypot field and a minimum time on page. Bots that trip either are silently dropped.

## Things you will edit later

- **New resume:** replace `public/Deepak_Gupta_Resume.pdf`, keeping the same filename.
- **EventHub repo link:** add an `<a>` in the EventHub block in `index.html`, next to the V&F Basket one.
- **Different domain:** change `https://deepakgupta-portfolio.vercel.app` in the `<head>` of `index.html` (canonical, `og:url`, `og:image`, JSON-LD) and in `og.png` if you want the URL shown there to match.
- **EventHub progress:** the service list in the Projects section marks the API Gateway as in progress. Flip it to built when it is done.

## Heads-up

Your phone number is in the page as plain text, so scrapers and spam callers can pick it up. If that becomes a nuisance, delete the Phone row in the Contact section.
