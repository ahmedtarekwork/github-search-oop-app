import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        commits: "./commitsPage.html",
        repo: "./repoPage.html",
        blob: "./renderBlobPage.html",
      },
    },
  },
});
