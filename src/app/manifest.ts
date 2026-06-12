import type { MetadataRoute } from "next";

// Installable web app baseline; the dedicated mobile app (Expo) builds on
// the same API later — see ROUTINE_PROMPT.md mobile roadmap.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Procura – B2B beszerzési hálózat",
    short_name: "Procura",
    description:
      "Egy mondatból kiküldhető ajánlatkérés: intelligens pontosítás, beszállítói shortlist, strukturált ajánlat-összehasonlítás.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    lang: "hu",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
