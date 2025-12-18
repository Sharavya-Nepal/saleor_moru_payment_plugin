import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://master.staging.saleor.cloud/graphql/",
  documents: ["graphql/**/*.graphql"],
  generates: {
    "generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-urql",
      ],
      config: {
        skipTypename: false,
        withHooks: false,
        withComponent: false,
        withHOC: false,
      },
    },
    "generated/schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
