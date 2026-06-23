"use client";
import { usePathname, useRouter, useParams } from "next/navigation";

const LANGUAGES = [
  { code: "en", label: "🇬🇧 EN" },
  { code: "nl", label: "🇳🇱 NL" },
  { code: "fr", label: "🇫🇷 FR" },
  { code: "de", label: "🇩🇪 DE" },
  { code: "it", label: "🇮🇹 IT" },
  { code: "es", label: "🇪🇸 ES" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => switchLocale(e.target.value)}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "6px 8px",
        fontSize: 14,
        fontWeight: 500,
        background: "white",
        color: "var(--ink)",
        cursor: "pointer",
      }}
      aria-label="Select language"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}