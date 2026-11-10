import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taylor & Alexander · Engagement Photos",
    short_name: "T & A",
    description:
      "Raise a glass and share your photos from Taylor & Alexander's engagement party.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0506",
    theme_color: "#0E0506",
    icons: [
      { src: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
