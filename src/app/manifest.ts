import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PolyVault — Vocabulary Vault",
    short_name: "PolyVault",
    description: "Your private multilingual vocabulary vault — spaced repetition, AI tutoring, and beautiful focus.",
    id: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101014",
    theme_color: "#6c5ce7",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Study now", url: "/study?mode=daily", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Quick search", url: "/search", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
