// Central data for all marker brands/sets.
// Both the markers page and the sitemap read from here — add a new
// brand or set size here once, and it shows up in both automatically.

export const MARKER_DATA: Record<
  string,
  { displayName: string; sets: Record<string, { code: string; label: string }> }
> = {
  guangna: {
    displayName: "Guangna",
    sets: {
      "12":  { code: "GN-8101-12",  label: "Classic brush-12" },
      "24":  { code: "GN-8101-24",  label: "Classic brush-24" },
      "36":  { code: "GN-8101-36",  label: "Classic brush-36" },
      "48":  { code: "GN-8101-48",  label: "Classic brush-48" },
      "60":  { code: "GN-8101-60",  label: "Classic brush-60" },
      "72":  { code: "GN-8101-72",  label: "Classic brush-72" },
      "100": { code: "GN-8101-100", label: "Classic brush-100" },
      "120": { code: "GN-8101-120", label: "Classic brush-120" },
      "168": { code: "GN-8101-168", label: "Classic brush-168" },
      "240": { code: "GN-8101-240", label: "Classic brush-240" },
      "288": { code: "GN-8101-288", label: "Classic brush-288" },
      "360": { code: "GN-8101-360", label: "Classic brush-360" },
      "366": { code: "GN-8101-366", label: "Classic brush-366" },
      "408": { code: "GN-8101-408", label: "Classic brush-408" },
    },
  },
};