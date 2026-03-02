/**
 * AI Translation Script — Hilal Vision
 *
 * Reads en/common.json, diffs against ar/common.json and ur/common.json,
 * then calls the Anthropic API to translate only the missing keys.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/translate.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, "../client/src/locales");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Flatten / unflatten helpers ───────────────────────────────────────────────

type NestedObject = { [key: string]: string | NestedObject };

function flatten(obj: NestedObject, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "object" && v !== null) {
            Object.assign(result, flatten(v as NestedObject, key));
        } else if (v !== null && v !== undefined) {
            result[key] = v as string;
        }
    }
    return result;
}

function unflatten(flat: Record<string, string>): NestedObject {
    const result: NestedObject = {};
    for (const [dotKey, value] of Object.entries(flat)) {
        const parts = dotKey.split(".");
        let node: NestedObject = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in node) || typeof node[parts[i]] !== "object") {
                node[parts[i]] = {};
            }
            node = node[parts[i]] as NestedObject;
        }
        node[parts[parts.length - 1]] = value;
    }
    return result;
}

// ── Merge translated keys back into the original nested structure ─────────────

function mergeTranslations(original: NestedObject, translations: Record<string, string>): NestedObject {
    const originalFlat = flatten(original);
    const merged = { ...originalFlat, ...translations };
    return unflatten(merged);
}

// ── Call Claude API to translate a batch of key-value pairs ──────────────────

async function translateBatch(
    keys: Record<string, string>,
    targetLanguage: string,
    targetCode: string
): Promise<Record<string, string>> {
    if (Object.keys(keys).length === 0) return {};

    const input = JSON.stringify(keys, null, 2);

    const prompt = `You are translating a JSON file for "Hilal Vision", an Islamic crescent moon visibility app used by Muslims worldwide.

Translate all string VALUES from English to ${targetLanguage}.

CRITICAL rules:
- Translate string VALUES only — never translate keys
- Preserve {{placeholder}} interpolation syntax exactly as-is (e.g., {{location}}, {{count}}, {{plan}}, {{price}}, {{period}}, {{percent}})
- Preserve emoji positions relative to surrounding text (🟢, 🔵, ⚪, 🌙, 🤲, 🔒, etc.)
- Arabic text fragments in English strings (e.g., "صدقة جارية", "جزاك الله خيراً") must be kept exactly as-is
- Use proper Islamic terminology: Ramadan, Muharram, Dhul-Hijja, Hijri, Yallop, Odeh, Hilal, ICOP, AH
- Use standard astronomical vocabulary for moon/sun/visibility terms
- Do NOT translate: currency symbols ($), prices ($2.99), coordinates, code snippets, brand names (Stripe, Clerk, Firebase, RevenueCat, Google Play, App Store)
- "Hilal Vision" and "Hilal Vision Pro" are brand names — do not translate
- "ICOP" is an acronym — keep as-is
- Return ONLY valid JSON with the same keys, no explanation, no markdown fences

Input JSON to translate:
${input}`;

    const message = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error(`JSON parse error for ${targetCode}:`, cleaned.slice(0, 500));
        throw new Error(`Failed to parse translation response for ${targetCode}`);
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log("🌙 Hilal Vision — AI Translation Script\n");

    const en: NestedObject = JSON.parse(readFileSync(`${localesDir}/en/common.json`, "utf8"));
    const enFlat = flatten(en);
    console.log(`📖 English keys: ${Object.keys(enFlat).length}`);

    const targets: Array<{ code: string; name: string }> = [
        { code: "ar", name: "Arabic" },
        { code: "ur", name: "Urdu" },
    ];

    for (const { code, name } of targets) {
        console.log(`\n🔄 Processing ${name} (${code})…`);

        const existing: NestedObject = JSON.parse(
            readFileSync(`${localesDir}/${code}/common.json`, "utf8")
        );
        const existingFlat = flatten(existing);

        // Find keys present in English but missing in target
        const missing: Record<string, string> = {};
        for (const [key, value] of Object.entries(enFlat)) {
            if (!(key in existingFlat)) {
                missing[key] = value;
            }
        }

        const missingCount = Object.keys(missing).length;
        console.log(`   Existing: ${Object.keys(existingFlat).length} keys`);
        console.log(`   Missing:  ${missingCount} keys`);

        if (missingCount === 0) {
            console.log(`   ✅ Already up to date`);
            continue;
        }

        // Translate in batches of 80 keys to stay within token limits
        const BATCH_SIZE = 80;
        const missingEntries = Object.entries(missing);
        const translated: Record<string, string> = {};

        for (let i = 0; i < missingEntries.length; i += BATCH_SIZE) {
            const batch = Object.fromEntries(missingEntries.slice(i, i + BATCH_SIZE));
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(missingEntries.length / BATCH_SIZE);
            console.log(`   Batch ${batchNum}/${totalBatches} (${Object.keys(batch).length} keys)…`);

            const result = await translateBatch(batch, name, code);
            Object.assign(translated, result);
        }

        console.log(`   ✅ Translated ${Object.keys(translated).length} keys`);

        // Merge translations into the existing file structure
        const merged = mergeTranslations(existing, translated);

        // Write back with 4-space indent to match existing style
        writeFileSync(
            `${localesDir}/${code}/common.json`,
            JSON.stringify(merged, null, 4) + "\n",
            "utf8"
        );

        console.log(`   💾 Saved ${localesDir}/${code}/common.json`);
    }

    console.log("\n✅ Translation complete!\n");
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
