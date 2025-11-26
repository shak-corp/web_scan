import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import RobotsParser from "robots-parser";
import { URL } from "url";

type CrawlConfig = {
  startUrl: string;
  maxDepth?: number;
  maxPages?: number;
  concurrency?: number;
  userAgent?: string;
  allowedHostOnly?: boolean;
};

export async function crawlSite(config: CrawlConfig, onPage?: (result: any) => Promise<void> | void) {
  const {
    startUrl,
    maxDepth = 3,
    maxPages = 500,
    concurrency = 5,
    userAgent = "SecScan-Crawler/1.0 (+https://yourdomain.example)",
    allowedHostOnly = true,
  } = config;

  const seen = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const limit = pLimit(concurrency);
  let pagesCrawled = 0;

  let robots;
  try {
    const parsedUrl = new URL(startUrl);
    const robotsUrl = `${parsedUrl.origin}/robots.txt`;
    const rtxt = (await axios.get(robotsUrl, { timeout: 5000 })).data;
    robots = RobotsParser(robotsUrl, rtxt);
  } catch {
    robots = RobotsParser("", "");
  }

  async function processUrl(u: string, depth: number) {
    if (pagesCrawled >= maxPages) return;
    if (seen.has(u)) return;
    seen.add(u);

    if (!robots.isAllowed(u, userAgent)) return;
    const delay = robots.getCrawlDelay(userAgent) || 0;
    if (delay > 0) await new Promise(res => setTimeout(res, delay * 1000));

    try {
      const res = await axios.get(u, {
        headers: { "User-Agent": userAgent },
        timeout: 15000,
        maxRedirects: 5
      });
      pagesCrawled += 1;
      const html = res.data;
      const $ = cheerio.load(html);
      const title = $("title").text().trim();
      const links: string[] = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        try {
          if (href) {
            const absolute = new URL(href, u).toString();
            links.push(absolute);
          }
        } catch {}
      });
      await onPage?.({
        url: u,
        depth,
        title,
        links,
        headers: res.headers,
        status: res.status,
      });

      if (depth < maxDepth) {
        for (const l of links) {
          try {
            const parsed = new URL(l);
            const startHost = new URL(startUrl).host;
            if (allowedHostOnly && parsed.host !== startHost) continue;
            if (!seen.has(l) && queue.length + 1 + pagesCrawled < maxPages) {
              queue.push({ url: l, depth: depth + 1 });
            }
          } catch {}
        }
      }
    } catch (err) {
      await onPage?.({ url: u, depth, error: String(err) });
    }
  }

  while (queue.length > 0 && pagesCrawled < maxPages) {
    const batch = queue.splice(0, concurrency);
    await Promise.all(batch.map(item => limit(() => processUrl(item.url, item.depth))));
  }

  return { pagesCrawled, seenCount: seen.size };
}
