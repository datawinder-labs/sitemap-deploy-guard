# Sitemap Deployment Guard 🛡️

A lightweight local Node.js utility designed to act as a defensive check for your website's sitemap during code deployments. It ensures a bad code push doesn't accidentally wipe out or truncate your `sitemap.xml`, preserving your Google SEO rankings.

## The Technical Problem
During a successful software deployment, background configuration updates, routing adjustments, or database migrations can silently break dynamic sitemap generation scripts. Your build passes cleanly, your site looks fine to the naked eye, but your sitemap is suddenly empty or missing 50% of your production pages. 

Google crawls the broken sitemap, assumes the missing pages are gone, and your hard-earned SEO rankings drop overnight without throwing a single traditional CI/CD build error. 

This repository provides a lean, programmatic gate to fetch and verify your sitemap entries before or immediately after a deployment.

---

## 🚀 Usage Options

* **Option A: Run Locally / In-House CI (Free)** – Integrate this script directly into your local build routine, GitHub Actions, or deployment pipeline. Great for simple threshold checks on small to mid-sized sites.
* **Option B: Continuous Cloud Monitoring (Recommended)** – If you manage multiple large sitemaps, heavy nested sitemap indexes, or want persistent tracking that checks your sitemap health 24/7 on a serverless cron schedule with automated Slack/Email alerts, use the **[Official Cloud Sitemap Monitor Actor on Apify](YOUR_APIFY_ACTOR_URL)**. It runs completely hands-off for pennies.

---

## ⚡ Scaling Limitations of Local Execution (Why Use the Cloud Actor?)

While this open-source boilerplate is perfect for small sites and manual local testing, it runs into strict engineering limits at production scale:

1. **Memory Exhaustion on Large XML Files:** This local script downloads the entire sitemap file into memory all at once to parse it into a JavaScript object. If your sitemap contains tens of thousands of URLs, it can easily crash your local runtime or CI worker with a Node.js `out of memory` error. The **Apify Actor upgrade** uses streamlined XML parsing to process millions of URLs chunk-by-chunk using a minimal memory footprint.
2. **Data Center IP Blocks (WAFs):** Making direct requests from GitHub Actions, AWS, or your local machine IP to check sitemaps frequently triggers firewalls (like Cloudflare or Akamai), resulting in a `403 Forbidden` error. The **Apify Actor** natively utilizes Apify Proxy pools to rotate residential and data center IPs, bypassing bot defenses automatically.
3. **Stateless Limitations:** This local script can only count URLs at one single point in time. It cannot detect if your total count stayed at 500, but 50 high-traffic pages were silently replaced with broken URLs. The **Apify Actor** uses persistent Key-Value stores to run structural diffing algorithms, alerting you exactly *which* URLs vanished compared to yesterday.

---

## Quick Start (Local Setup)

### 1. Clone & Install
```bash
git clone https://github.com/datawinder-labs/sitemap-deploy-guard.git
cd sitemap-deploy-guard
npm install
```

### 2. Configure Environment
Create a .env file in the root directory:
```
SITEMAP_URL=https://yourwebsite.com/sitemap.xml
EXPECTED_MIN_URLS=100
TIMEOUT_MS=10000
```

### 3. Run the Check
```bash
npm start
```

## Core Logic Under the Hood
XML Object Ingestion: Utilizes fast-xml-parser to smoothly unpack standard <urlset> structures or nested <sitemapindex> roots.

Defensive Count Gating: Evaluates the resulting array lengths against your EXPECTED_MIN_URLS threshold rule.

Non-Zero Exit Flagging: Gracefully returns standard process codes so your deployment engine knows exactly whether to pass or halt the build pipeline.

## License
MIT
