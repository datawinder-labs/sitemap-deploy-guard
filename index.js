import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';

dotenv.config();

const parser = new XMLParser();

async function auditSitemap(sitemapUrl) {
    try {
        console.log(`[+] Fetching sitemap for deployment check: ${sitemapUrl}`);
        
        const response = await axios.get(sitemapUrl, {
            headers: { 'User-Agent': 'SitemapDeployGuard/1.0.0 (Local CI Check)' },
            timeout: parseInt(process.env.TIMEOUT_MS) || 10000
        });

        // Parse the XML structure cleanly
        const jsonObj = parser.parse(response.data);
        
        // Handle both standard sitemaps and sitemap indexes
        let urls = [];
        if (jsonObj.urlset && jsonObj.urlset.url) {
            urls = Array.isArray(jsonObj.urlset.url) ? jsonObj.urlset.url : [jsonObj.urlset.url];
        } else if (jsonObj.sitemapindex && jsonObj.sitemapindex.sitemap) {
            urls = Array.isArray(jsonObj.sitemapindex.sitemap) ? jsonObj.sitemapindex.sitemap : [jsonObj.sitemapindex.sitemap];
        }

        const urlCount = urls.length;
        console.log(`[+] Audit complete. Found ${urlCount} entries in the sitemap.`);

        const expectedMin = parseInt(process.env.EXPECTED_MIN_URLS) || 1;
        
        // The core CI/CD gate logic
        if (urlCount < expectedMin) {
            throw new Error(`CRITICAL SEO ALERT: Sitemap URL count (${urlCount}) fell below the safety threshold of ${expectedMin}. Build should be investigated!`);
        }

        return {
            status: "PASS",
            total_urls: urlCount,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`[-] DEPLOYMENT GUARD FAILED: ${error.message}`);
        return {
            status: "FAIL",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

const SITEMAP_URL = process.env.SITEMAP_URL || 'https://example.com/sitemap.xml';
const result = await auditSitemap(SITEMAP_URL);
console.log("\n[★] CI Gate Result:\n", JSON.stringify(result, null, 2));