import { APL, FileAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

/**
 * Determine which APL to use based on environment variable
 */
const aplType = process.env.APL || "file";

let apl: APL;


switch (aplType) {
  case "upstash":
    if (!process.env.UPSTASH_URL || !process.env.UPSTASH_TOKEN) {
      throw new Error("Upstash APL requires UPSTASH_URL and UPSTASH_TOKEN environment variables");
    }
    console.log("Using Upstash APL with URL:", process.env.UPSTASH_URL, "and Token:", process.env.UPSTASH_TOKEN);
    apl = new UpstashAPL({
      restURL: process.env.UPSTASH_URL,
      restToken: process.env.UPSTASH_TOKEN,
    });
    break;
  case "file":
  default:
    apl = new FileAPL();
    break;
}

export const saleorApp = new SaleorApp({
  apl,
});
