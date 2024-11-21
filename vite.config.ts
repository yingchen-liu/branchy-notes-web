import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      /* enable sw on development */
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff2}"],
        navigateFallback: "/index.html", // Ensures navigation requests fallback to your SPA's entry point
        navigateFallbackAllowlist: [/^\/u\/.*$/],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Set the limit to 10 MB
        runtimeCaching: [
          {
            // Match API requests
            urlPattern:
              /(https:\/\/api.branchynotes\.com\/api\/.*|http:\/\/localhost:8080\/api\/.*)/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100, // Limit number of cached requests
                maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
              },
              cacheableResponse: {
                statuses: [0, 200], // Cache valid responses (200) and opaque responses (0)
              },
            },
          },
          // {
          //   // Match API requests
          //   urlPattern:
          //     /(https:\/\/api.branchynotes\.com\/api\/users\/login|http:\/\/localhost:8080\/api\/users\/login)/,
          //   method: "POST",
          //   handler: async ({ event }) => {
          //     const cache = await caches.open("custom-post-cache");
          //     const cacheKey = `${event.request.url}-${JSON.stringify(
          //       event.request.clone()
          //     )}`;

          //     // Try to fetch from the network
          //     try {
          //       const networkResponse = await fetch(event.request.clone());
          //       if (networkResponse.ok) {
          //         // Cache the response
          //         cache.put(cacheKey, networkResponse.clone());
          //       }
          //       return networkResponse;
          //     } catch (err) {
          //       // Fallback to cache
          //       const cachedResponse = await cache.match(cacheKey);
          //       if (cachedResponse) {
          //         return cachedResponse;
          //       }
          //       throw err; // Let the error propagate
          //     }
          //   },
          //   options: {
          //     cacheName: "api-cache",
          //     expiration: {
          //       maxEntries: 100, // Limit number of cached requests
          //       maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
          //     },
          //     cacheableResponse: {
          //       statuses: [0, 200], // Cache valid responses (200) and opaque responses (0)
          //     },
          //   },
          // },
        ],
      },
      manifest: {
        name: "BranchyNotes",
        short_name: "BranchyNotes",
        description: "Organise Your Notes the Smart Way",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/images/logo-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/logo-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
