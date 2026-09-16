import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KARTESIA — Belajar SPLDV",
    short_name: "KARTESIA",
    description:
      "Media pembelajaran SPLDV bertahap untuk siswa Fase E Kelas X.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#18181b",
    orientation: "portrait",
    lang: "id-ID",
    icons: [
      {
        src: "/kartesia-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/kartesia-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
