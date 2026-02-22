import * as cheerio from "cheerio";
import fs from "fs/promises";

async function testParse() {
    const html = await fs.readFile("temp_ram46.html", "utf-8");
    const $ = cheerio.load(html);

    const results: any[] = [];
    let currentCountry = "";

    $("h2, div.observ").each((i, el: any) => {
        const tag = el.name.toLowerCase();

        if (tag === "h2") {
            const text = $(el).text().trim();
            if (!$(el).hasClass("required")) {
                currentCountry = text;
            }
        } else if (tag === "div") {
            const text = $(el).text();
            let result = "Not Seen";
            if ($(el).find(".green").length > 0) {
                result = "Seen";
            }

            const cityMatch = text.match(/من مدينة\s+(.+?)\s+في محافظة/);
            const city = cityMatch ? cityMatch[1].trim() : "Unknown";

            results.push({
                country: currentCountry,
                city,
                result
            });
        }
    });

    console.log(results.slice(0, 10));
    console.log(`Total: ${results.length}`);
}

testParse();
