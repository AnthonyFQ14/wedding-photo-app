import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wedding Photo Vault",
    short_name: "WeddingVault",
    description: "Share a moment. Reveal the gallery after the celebration.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFCF8",
    theme_color: "#FDFCF8",
    icons: [
      {
        src: "/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}

