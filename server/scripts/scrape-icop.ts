// @ts-ignore
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ICOP URLs follow a pattern: astronomycenter.net/icop/{month_short}{year}.html
// e.g. ram45.html (Ramadan 1445), shw45.html (Shawwal 1445)
const MONTHS = ["ram", "shw"];
const START_YEAR = 40; // 1440 AH
const END_YEAR = 46;   // 1446 AH

interface SightResult {
    city: string;
    country: string;
    opticalAid: string;
    result: "Seen" | "Not Seen";
}

interface MonthData {
    hijriYear: number;
    hijriMonth: number;
    observations: SightResult[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapePage(monthStr: string, yearStr: string): Promise<SightResult[]> {
    const url = `https://www.astronomycenter.net/icop/${monthStr}${yearStr}.html`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[WARN] Page not found: ${url}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const results: SightResult[] = [];

        // ICOP uses `div.observ` and `h2` tags for countries and sightings.
        let currentCountry = "";

        $("h2, div.observ").each((i: number, el: any) => {
            const tag = el.name.toLowerCase();

            if (tag === "h2") {
                const text = $(el).text().trim();
                // Avoid capturing the section headers which have class "required" ("السبت 01 مارس 2025 ")
                if (!$(el).hasClass("required")) {
                    currentCountry = text;
                }
            } else if (tag === "div") {
                const text = $(el).text();
                let result: "Seen" | "Not Seen" = "Not Seen";

                // ICOP uses a green span for seen and red for not seen
                if ($(el).find(".green").length > 0) {
                    result = "Seen";
                }

                // Extract city
                const cityMatch = text.match(/من مدينة\s+(.+?)\s+في محافظة/);
                const city = cityMatch ? cityMatch[1].trim() : "Unknown";

                if (currentCountry && city) {
                    results.push({
                        country: currentCountry,
                        city: city,
                        opticalAid: "Unknown (Parsed)", // Deep parsing of optical aid is complex across their unstructured text
                        result: result
                    });
                }
            }
        });

        return results;
    } catch (err: any) {
        console.error(`Error fetching ${url}:`, err.message);
        return [];
    }
}

async function main() {
    const allData: MonthData[] = [];

    for (let y = START_YEAR; y <= END_YEAR; y++) {
        for (let m = 0; m < MONTHS.length; m++) {
            const monthStr = MONTHS[m];
            const yearStr = y.toString();

            const observations = await scrapePage(monthStr, yearStr);

            if (observations.length > 0) {
                allData.push({
                    hijriYear: 1400 + y,
                    hijriMonth: monthStr === "ram" ? 9 : 10,
                    observations
                });
            }

            // Be nice to their server
            await delay(1000);
        }
    }

    const outDir = path.join(__dirname, "..", "data");
    await fs.mkdir(outDir, { recursive: true });

    const outFile = path.join(outDir, "icop-history.json");
    await fs.writeFile(outFile, JSON.stringify(allData, null, 2), "utf-8");

    console.log(`\n✅ Saved ${allData.length} months of ICOP data to ${outFile}`);
    console.log(`Total observations parsed: ${allData.reduce((acc, m) => acc + m.observations.length, 0)}`);
}

main().catch(console.error);
