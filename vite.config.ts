import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
  },
});
