import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../saleor-app";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

export default createAppRegisterHandler({
  apl: saleorApp.apl,
  allowedSaleorUrls: [
    (url) => {
      if (allowedUrlsPattern) {
        const regex = new RegExp(allowedUrlsPattern);
        return regex.test(url);
      }
      return true;
    },
  ],
});
