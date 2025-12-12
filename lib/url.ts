"use server";

import axios from "axios";
import { extractOpenGraph } from "@devmehq/open-graph-extractor";

export async function extractMetadataFromUrl(url: string) {
  try {
    const res = await axios.get(url, {
      timeout: 5000,
      responseType: "text",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
      },
    });
    const html = res.data as string;

    // Regex to find currency amounts starting with the peso sign ₱
    // Matches examples like: ₱400.00, ₱123, ₱ 1,234.56
    const priceRegex = /₱\s*[\d,]+(?:\.\d+)?/g;
    const match = html.match(priceRegex);

    let priceRaw: string | null = null;
    let priceNumber: number | null = null;

    if (match && match.length > 0) {
      // take the first match
      priceRaw = match[0];
      // normalize by removing the currency symbol, spaces and commas
      const numeric = priceRaw.replace(/₱|\s|,/g, "");
      const parsed = parseFloat(numeric);
      if (!Number.isNaN(parsed)) {
        priceNumber = parsed;
      }
    }

    // Also include Open Graph extraction (if useful)
    const og = extractOpenGraph(html);

    return {
      success: true,
      url,
      html,
      priceRaw,
      priceNumber,
      og,
    };
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return {
      success: false,
      html: null,
      url,
      priceRaw: null,
      priceNumber: null,
      og: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
